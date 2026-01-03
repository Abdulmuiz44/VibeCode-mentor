/**
 * API Route: Execute Build with Error Handling
 * POST /api/builds/execute
 * Handles blueprint code generation with full error handling and edge cases
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  BuildErrorHandler,
  ErrorDefinitions,
} from "@/lib/build-error-handler";
import crypto from "crypto";

interface ExecuteBuildRequest {
  blueprint_id: string;
  blueprint_version?: number;
  force?: boolean;
}

interface ExecuteBuildResponse {
  success: boolean;
  build_id?: string;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  remaining_quota?: number;
}

// Initialize Supabase and error handler
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);
const errorHandler = new BuildErrorHandler();

// Constants
const BUILD_TIMEOUT_MS = 600000; // 10 minutes
const MAX_RETRIES = 3;

/**
 * Validate request and user authorization
 */
async function validateRequest(
  req: NextRequest
): Promise<
  | { valid: true; userId: string }
  | { valid: false; error: ExecuteBuildResponse }
> {
  // Get auth header
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      valid: false,
      error: {
        success: false,
        error: {
          code: "AUTH_001",
          message: "Missing or invalid authorization header",
          retryable: false,
        },
      },
    };
  }

  // Verify token and get user
  const token = authHeader.slice(7);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return {
      valid: false,
      error: {
        success: false,
        error: {
          code: "AUTH_002",
          message: "Invalid authentication token",
          retryable: false,
        },
      },
    };
  }

  return { valid: true, userId: user.id };
}

/**
 * Validate blueprint and fetch from database
 */
async function validateAndFetchBlueprint(
  blueprintId: string,
  userId: string
): Promise<
  | { valid: true; blueprint: Record<string, any> }
  | { valid: false; error: ExecuteBuildResponse }
> {
  // Fetch blueprint
  const { data: blueprint, error: fetchError } = await supabase
    .from("blueprints")
    .select("*")
    .eq("id", blueprintId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !blueprint) {
    return {
      valid: false,
      error: {
        success: false,
        error: {
          code: "VAL_001",
          message: "Blueprint not found",
          retryable: false,
        },
      },
    };
  }

  // Validate blueprint structure
  const validation = errorHandler.validateBlueprint(blueprint);
  if (!validation.valid) {
    return {
      valid: false,
      error: {
        success: false,
        error: {
          code: "VAL_004",
          message: `Validation failed: ${validation.errors.join(", ")}`,
          retryable: false,
        },
      },
    };
  }

  return { valid: true, blueprint };
}

/**
 * Check user quotas and rate limits
 */
async function checkUserLimits(
  userId: string,
  endpoint: string
): Promise<
  | { allowed: true }
  | { allowed: false; error: ExecuteBuildResponse }
> {
  // Check quota
  const quotaResult = await errorHandler.checkUserQuota(userId);
  if (!quotaResult.can_build) {
    const errorDef =
      quotaResult.reason === "No active subscription"
        ? ErrorDefinitions.NO_SUBSCRIPTION
        : ErrorDefinitions.QUOTA_EXCEEDED;

    return {
      allowed: false,
      error: {
        success: false,
        error: {
          code: errorDef.code,
          message: errorDef.message,
          retryable: false,
        },
        remaining_quota: 0,
      },
    };
  }

  // Check rate limit
  const rateLimitResult = await errorHandler.checkRateLimit(userId, endpoint);
  if (!rateLimitResult.allowed) {
    return {
      allowed: false,
      error: {
        success: false,
        error: {
          code: ErrorDefinitions.RATE_LIMIT_EXCEEDED.code,
          message: ErrorDefinitions.RATE_LIMIT_EXCEEDED.message,
          retryable: false,
        },
      },
    };
  }

  return {
    allowed: true,
  };
}

/**
 * Check for duplicate builds
 */
async function checkDuplicate(
  userId: string,
  blueprint: Record<string, any>,
  force?: boolean
): Promise<
  | { isDuplicate: false }
  | { isDuplicate: true; error: ExecuteBuildResponse }
> {
  if (force) {
    return { isDuplicate: false };
  }

  const checksum = errorHandler.calculateChecksum(blueprint);
  const duplicate = await errorHandler.checkDuplicateBuild(userId, checksum);

  if (duplicate.isDuplicate) {
    return {
      isDuplicate: true,
      error: {
        success: false,
        error: {
          code: ErrorDefinitions.DUPLICATE_BUILD.code,
          message: ErrorDefinitions.DUPLICATE_BUILD.message,
          retryable: false,
        },
      },
    };
  }

  return { isDuplicate: false };
}

/**
 * Create build execution record
 */
async function createBuildExecution(
  blueprintId: string,
  userId: string,
  blueprintVersion: number = 1
): Promise<
  | { success: true; buildId: string }
  | { success: false; error: ExecuteBuildResponse }
> {
  const { data: build, error } = await supabase
    .from("build_executions")
    .insert({
      blueprint_id: blueprintId,
      blueprint_version: blueprintVersion,
      user_id: userId,
      status: "pending",
      total_files_generated: 0,
      logs: [],
    })
    .select()
    .single();

  if (error || !build) {
    return {
      success: false,
      error: {
        success: false,
        error: {
          code: "GEN_003",
          message: "Failed to create build execution record",
          retryable: true,
        },
      },
    };
  }

  return { success: true, buildId: build.id };
}

/**
 * Execute the build (placeholder - will be implemented by build service)
 */
async function executeBuild(
  buildId: string,
  blueprint: Record<string, any>,
  userId: string
): Promise<{
  success: boolean;
  error?: { code: string; message: string; retryable: boolean };
}> {
  // TODO: Implement actual build execution
  // This would call your code generation service
  // For now, return a placeholder success

  try {
    // Update build status to in_progress
    await supabase
      .from("build_executions")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", buildId);

    // Simulate build execution
    // In production, this would call your actual code generation service
    // with timeout handling, error catching, etc.

    // On success, update build status
    await supabase
      .from("build_executions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        execution_time_ms: Math.random() * 60000, // Simulated duration
      })
      .eq("id", buildId);

    return { success: true };
  } catch (error) {
    // Record error
    await errorHandler.recordError(
      buildId,
      error instanceof Error ? error : new Error(String(error)),
      ErrorDefinitions.GENERATION_FAILED,
      { blueprint_name: blueprint.name }
    );

    return {
      success: false,
      error: {
        code: ErrorDefinitions.GENERATION_FAILED.code,
        message: ErrorDefinitions.GENERATION_FAILED.message,
        retryable: true,
      },
    };
  }
}

/**
 * Main POST handler
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<ExecuteBuildResponse>> {
  try {
    // 1. Validate request
    const authValidation = await validateRequest(req);
    if (!authValidation.valid) {
      return NextResponse.json(authValidation.error, { status: 401 });
    }
    const userId = authValidation.userId!;

    // 2. Parse request body
    let body: ExecuteBuildRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REQ_001",
            message: "Invalid request body",
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    if (!body.blueprint_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REQ_002",
            message: "blueprint_id is required",
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // 3. Fetch and validate blueprint
    const blueprintValidation = await validateAndFetchBlueprint(
      body.blueprint_id,
      userId
    );
    if (!blueprintValidation.valid) {
      return NextResponse.json(blueprintValidation.error, { status: 400 });
    }
    const blueprint = blueprintValidation.blueprint!;

    // 4. Check user limits
    const limitsCheck = await checkUserLimits(
      userId,
      "/api/builds/execute"
    );
    if (!limitsCheck.allowed) {
      return NextResponse.json(limitsCheck.error, { status: 429 });
    }

    // 5. Check for duplicates
    const duplicateCheck = await checkDuplicate(userId, blueprint, body.force);
    if (duplicateCheck.isDuplicate) {
      return NextResponse.json(duplicateCheck.error, { status: 409 });
    }

    // 6. Create build execution
    const execResult = await createBuildExecution(
      body.blueprint_id,
      userId,
      body.blueprint_version
    );
    if (!execResult.success) {
      return NextResponse.json(execResult.error, { status: 500 });
    }

    const buildId = execResult.buildId;

    // 7. Execute build (async, no need to wait)
    executeBuild(buildId, blueprint, userId).catch((error) => {
      console.error(`Build ${buildId} execution failed:`, error);
    });

    // 8. Return success response
    return NextResponse.json(
      {
        success: true,
        build_id: buildId,
        remaining_quota: 9, // TODO: Get actual value
      },
      { status: 202 } // 202 Accepted - async operation
    );
  } catch (error) {
    console.error("Build execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_500",
          message: "Internal server error",
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS for CORS
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
