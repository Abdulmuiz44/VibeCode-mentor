/**
 * Build System Error Handler and Edge Case Management
 * Handles all error scenarios, retries, validation, and production safety
 */

import { createClient } from "@supabase/supabase-js";

interface BuildError {
  id: string;
  build_id: string;
  step_id?: string;
  error_type: ErrorType;
  error_code?: string;
  error_message: string;
  stack_trace?: string;
  context?: Record<string, any>;
  is_retryable: boolean;
  retry_count: number;
  max_retries: number;
  created_at: string;
}

interface QuotaCheckResult {
  can_build: boolean;
  remaining_builds: number;
  reason: string;
}

interface RateLimitResult {
  allowed: boolean;
  requests_made: number;
  limit: number;
}

type ErrorType =
  | "validation"
  | "github_api"
  | "generation"
  | "deployment"
  | "timeout"
  | "quota";

// Error definitions for different scenarios
const ErrorDefinitions = {
  VALIDATION_ERROR: {
    type: "validation" as const,
    code: "VAL_001",
    retryable: false,
    message: "Blueprint validation failed",
  },
  DUPLICATE_BUILD: {
    type: "validation" as const,
    code: "VAL_002",
    retryable: false,
    message: "Duplicate build detected within 1 hour",
  },
  GITHUB_API_ERROR: {
    type: "github_api" as const,
    code: "GH_001",
    retryable: true,
    message: "GitHub API request failed",
  },
  GITHUB_RATE_LIMIT: {
    type: "github_api" as const,
    code: "GH_002",
    retryable: true,
    message: "GitHub API rate limit exceeded",
  },
  GITHUB_AUTH_FAILED: {
    type: "github_api" as const,
    code: "GH_003",
    retryable: false,
    message: "GitHub authentication failed",
  },
  GENERATION_TIMEOUT: {
    type: "timeout" as const,
    code: "GEN_001",
    retryable: true,
    message: "Code generation exceeded time limit",
  },
  GENERATION_FAILED: {
    type: "generation" as const,
    code: "GEN_002",
    retryable: true,
    message: "Code generation failed",
  },
  DEPLOYMENT_FAILED: {
    type: "deployment" as const,
    code: "DEP_001",
    retryable: true,
    message: "Deployment to GitHub failed",
  },
  DEPLOYMENT_TIMEOUT: {
    type: "deployment" as const,
    code: "DEP_002",
    retryable: true,
    message: "Deployment operation timed out",
  },
  QUOTA_EXCEEDED: {
    type: "quota" as const,
    code: "QTA_001",
    retryable: false,
    message: "User quota exceeded",
  },
  RATE_LIMIT_EXCEEDED: {
    type: "quota" as const,
    code: "QTA_002",
    retryable: false,
    message: "Rate limit exceeded",
  },
  NO_SUBSCRIPTION: {
    type: "quota" as const,
    code: "QTA_003",
    retryable: false,
    message: "No active subscription",
  },
  FILE_LIMIT_EXCEEDED: {
    type: "validation" as const,
    code: "VAL_003",
    retryable: false,
    message: "File limit exceeded",
  },
};

export class BuildErrorHandler {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  /**
   * Record an error in the database
   */
  async recordError(
    buildId: string,
    error: Error | string,
    errorDef: (typeof ErrorDefinitions)[keyof typeof ErrorDefinitions],
    context?: Record<string, any>
  ): Promise<BuildError> {
    const message = typeof error === "string" ? error : error.message;
    const stackTrace = error instanceof Error ? error.stack : undefined;

    const { data, error: dbError } = await this.supabase
      .from("build_errors")
      .insert({
        build_id: buildId,
        error_type: errorDef.type,
        error_code: errorDef.code,
        error_message: message,
        stack_trace: stackTrace,
        context,
        is_retryable: errorDef.retryable,
        retry_count: 0,
        max_retries: 3,
      })
      .select()
      .single();

    if (dbError) throw dbError;
    return data as BuildError;
  }

  /**
   * Check if user can perform a build
   */
  async checkUserQuota(userId: string): Promise<QuotaCheckResult> {
    const { data, error } = await this.supabase
      .rpc("check_user_quota", {
        p_user_id: userId,
      })
      .single();

    if (error) {
      console.error("Quota check failed:", error);
      return {
        can_build: false,
        remaining_builds: 0,
        reason: "Failed to check quota",
      };
    }

    const typedData = data as QuotaCheckResult;
    return {
      can_build: typedData.can_build,
      remaining_builds: typedData.remaining_builds,
      reason: typedData.reason,
    };
  }

  /**
   * Check rate limit for user endpoint
   */
  async checkRateLimit(
    userId: string,
    endpoint: string
  ): Promise<RateLimitResult> {
    try {
      const { data } = await this.supabase
        .rpc("record_rate_limit_event", {
          p_user_id: userId,
          p_endpoint: endpoint,
        })
        .single();

      const typedData = data as boolean;
      return {
        allowed: typedData || false,
        requests_made: 0,
        limit: 30,
      };
    } catch (error) {
      console.error("Rate limit check failed:", error);
      return {
        allowed: false,
        requests_made: 0,
        limit: 0,
      };
    }
  }

  /**
   * Check for duplicate builds within last hour
   */
  async checkDuplicateBuild(
    userId: string,
    checksum: string
  ): Promise<{ isDuplicate: boolean; previousBuildId?: string }> {
    const { data, error } = await this.supabase
      .rpc("check_duplicate_build", {
        p_user_id: userId,
        p_checksum: checksum,
      })
      .single();

    if (error) {
      console.error("Duplicate check failed:", error);
      return { isDuplicate: false };
    }

    const typedData = data as { is_duplicate: boolean; previous_build_id?: string };
    if (typedData?.is_duplicate) {
      return {
        isDuplicate: true,
        previousBuildId: typedData.previous_build_id,
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Retry a failed build error
   */
  async retryBuildError(
    errorId: string,
    maxRetries: number = 3
  ): Promise<{ canRetry: boolean; reason?: string }> {
    // Get current error
    const { data: error, error: fetchError } = await this.supabase
      .from("build_errors")
      .select("*")
      .eq("id", errorId)
      .single();

    if (fetchError) {
      return { canRetry: false, reason: "Error not found" };
    }

    if (!error.is_retryable) {
      return {
        canRetry: false,
        reason: "Error is not retryable",
      };
    }

    if (error.retry_count >= maxRetries) {
      return {
        canRetry: false,
        reason: "Max retries exceeded",
      };
    }

    // Increment retry count
    await this.supabase
      .from("build_errors")
      .update({ retry_count: error.retry_count + 1 })
      .eq("id", errorId);

    return { canRetry: true };
  }

  /**
   * Validate blueprint structure and content
   */
  validateBlueprint(blueprint: Record<string, any>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required fields
    if (!blueprint.name) {
      errors.push("Blueprint name is required");
    }

    if (!blueprint.structure) {
      errors.push("Blueprint structure is required");
    }

    // Check structure validity
    if (blueprint.structure) {
      if (typeof blueprint.structure !== "object") {
        errors.push("Blueprint structure must be an object");
      }

      // Count files
      const fileCount = this.countFiles(blueprint.structure);
      if (fileCount > 500) {
        errors.push(`File count (${fileCount}) exceeds limit of 500`);
      }
    }

    // Check for circular dependencies
    if (blueprint.dependencies) {
      if (this.hasCircularDependencies(blueprint.dependencies)) {
        errors.push("Circular dependencies detected");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Count total files in blueprint structure
   */
  private countFiles(obj: any): number {
    let count = 0;

    const traverse = (node: any) => {
      if (Array.isArray(node)) {
        node.forEach(traverse);
      } else if (typeof node === "object" && node !== null) {
        if (node.type === "file") {
          count++;
        }
        Object.values(node).forEach((val: any) => {
          if (typeof val === "object") {
            traverse(val);
          }
        });
      }
    };

    traverse(obj);
    return count;
  }

  /**
   * Check for circular dependencies
   */
  private hasCircularDependencies(deps: Record<string, string[]>): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);

      const neighbors = deps[node] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    for (const node of Object.keys(deps)) {
      if (!visited.has(node)) {
        if (hasCycle(node)) return true;
      }
    }

    return false;
  }

  /**
   * Calculate build checksum
   */
  calculateChecksum(blueprint: Record<string, any>): string {
    const crypto = require("crypto");
    const blueprintString = JSON.stringify(blueprint);
    return crypto.createHash("sha256").update(blueprintString).digest("hex");
  }

  /**
   * Update user quota after successful build
   */
  async incrementBuildQuota(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("user_quotas")
      .update({
        monthly_builds_used: this.supabase.rpc("monthly_builds_used + 1"),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to update quota:", error);
    }
  }

  /**
   * Get detailed error information
   */
  async getErrorDetails(
    buildId: string
  ): Promise<{ errors: BuildError[]; summary: Record<string, number> }> {
    const { data: errors, error } = await this.supabase
      .from("build_errors")
      .select("*")
      .eq("build_id", buildId);

    if (error) {
      console.error("Failed to fetch errors:", error);
      return { errors: [], summary: {} };
    }

    // Calculate summary
    const summary = {} as Record<string, number>;
    (errors || []).forEach((err: BuildError) => {
      summary[err.error_type] = (summary[err.error_type] || 0) + 1;
    });

    return {
      errors: errors || [],
      summary,
    };
  }

  /**
   * Clean up old rate limit events
   */
  async cleanupOldEvents(): Promise<number> {
    const { data, error } = await this.supabase
      .rpc("cleanup_old_rate_limit_events")
      .single();

    if (error) {
      console.error("Cleanup failed:", error);
      return 0;
    }

    const typedData = data as number;
    return typedData || 0;
  }
}

// Export error definitions for use in other modules
export { ErrorDefinitions };
