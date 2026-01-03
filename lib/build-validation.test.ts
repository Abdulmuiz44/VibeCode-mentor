/**
 * Build System Validation Tests
 * Comprehensive test suite for error handling and edge cases
 * 
 * NOTE: Test file - will be executed by jest during test runs
 * Not included in production build
 */

// @ts-expect-error - Jest is only available in test environment
import { describe, it, expect, beforeEach } from "@jest/globals";
import { BuildErrorHandler, ErrorDefinitions } from "./build-error-handler";

describe("BuildErrorHandler", () => {
  let handler: BuildErrorHandler;

  beforeEach(() => {
    handler = new BuildErrorHandler();
  });

  describe("Blueprint Validation", () => {
    it("should validate correct blueprint", () => {
      const blueprint = {
        name: "Test Blueprint",
        structure: {
          type: "folder",
          children: [
            { type: "file", name: "test.ts" },
            { type: "file", name: "index.ts" },
          ],
        },
      };

      const result = handler.validateBlueprint(blueprint);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject blueprint without name", () => {
      const blueprint = {
        structure: { type: "folder" },
      };

      const result = handler.validateBlueprint(blueprint);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Blueprint name is required");
    });

    it("should reject blueprint without structure", () => {
      const blueprint = {
        name: "Test",
      };

      const result = handler.validateBlueprint(blueprint);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Blueprint structure is required");
    });

    it("should reject blueprint exceeding file limit", () => {
      const structure: any = { type: "folder", children: [] };

      // Add 501 files to exceed limit
      for (let i = 0; i < 501; i++) {
        structure.children.push({ type: "file", name: `file${i}.ts` });
      }

      const blueprint = {
        name: "Large Blueprint",
        structure,
      };

      const result = handler.validateBlueprint(blueprint);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("exceeds limit"))).toBe(true);
    });

    it("should detect circular dependencies", () => {
      const blueprint = {
        name: "Circular",
        structure: { type: "folder" },
        dependencies: {
          A: ["B"],
          B: ["C"],
          C: ["A"], // Creates cycle: A -> B -> C -> A
        },
      };

      const result = handler.validateBlueprint(blueprint);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Circular dependencies detected");
    });

    it("should allow self-dependencies that don't form cycles", () => {
      const blueprint = {
        name: "Valid",
        structure: { type: "folder" },
        dependencies: {
          A: ["B"],
          B: ["C"],
          C: [],
        },
      };

      const result = handler.validateBlueprint(blueprint);
      expect(result.valid).toBe(true);
    });
  });

  describe("Checksum Calculation", () => {
    it("should calculate consistent checksum for same blueprint", () => {
      const blueprint = {
        name: "Test",
        structure: { type: "folder" },
      };

      const checksum1 = handler.calculateChecksum(blueprint);
      const checksum2 = handler.calculateChecksum(blueprint);

      expect(checksum1).toBe(checksum2);
    });

    it("should calculate different checksum for different blueprints", () => {
      const blueprint1 = { name: "Test1", structure: { type: "folder" } };
      const blueprint2 = { name: "Test2", structure: { type: "folder" } };

      const checksum1 = handler.calculateChecksum(blueprint1);
      const checksum2 = handler.calculateChecksum(blueprint2);

      expect(checksum1).not.toBe(checksum2);
    });

    it("should calculate SHA256 format checksum", () => {
      const blueprint = {
        name: "Test",
        structure: { type: "folder" },
      };

      const checksum = handler.calculateChecksum(blueprint);

      // SHA256 produces 64 character hex string
      expect(checksum).toMatch(/^[a-f0-9]{64}$/i);
    });
  });

  describe("File Counting", () => {
    it("should count files in nested structure", () => {
      const blueprint = {
        name: "Test",
        structure: {
          type: "folder",
          name: "root",
          children: [
            { type: "file", name: "a.ts" },
            {
              type: "folder",
              name: "src",
              children: [
                { type: "file", name: "b.ts" },
                { type: "file", name: "c.ts" },
              ],
            },
            { type: "file", name: "d.ts" },
          ],
        },
      };

      const result = handler.validateBlueprint(blueprint);
      // Should count 4 files (a.ts, b.ts, c.ts, d.ts)
      expect(result.valid).toBe(true);
    });

    it("should handle empty blueprint", () => {
      const blueprint = {
        name: "Empty",
        structure: {
          type: "folder",
          children: [],
        },
      };

      const result = handler.validateBlueprint(blueprint);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Circular Dependency Detection", () => {
    it("should detect simple cycle A -> B -> A", () => {
      const blueprint = {
        name: "Test",
        structure: { type: "folder" },
        dependencies: {
          A: ["B"],
          B: ["A"],
        },
      };

      const result = handler.validateBlueprint(blueprint);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Circular dependencies detected");
    });

    it("should detect self-cycle A -> A", () => {
      const blueprint = {
        name: "Test",
        structure: { type: "folder" },
        dependencies: {
          A: ["A"],
        },
      };

      const result = handler.validateBlueprint(blueprint);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Circular dependencies detected");
    });

    it("should detect deep cycle A -> B -> C -> D -> B", () => {
      const blueprint = {
        name: "Test",
        structure: { type: "folder" },
        dependencies: {
          A: ["B"],
          B: ["C"],
          C: ["D"],
          D: ["B"], // Creates cycle
        },
      };

      const result = handler.validateBlueprint(blueprint);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Circular dependencies detected");
    });

    it("should allow complex non-circular graph", () => {
      const blueprint = {
        name: "Test",
        structure: { type: "folder" },
        dependencies: {
          A: ["B", "C"],
          B: ["D"],
          C: ["D"],
          D: [],
        },
      };

      const result = handler.validateBlueprint(blueprint);
      expect(result.valid).toBe(true);
    });
  });

  describe("Error Definitions", () => {
    it("should have all required error types", () => {
      expect(ErrorDefinitions.VALIDATION_ERROR).toBeDefined();
      expect(ErrorDefinitions.GITHUB_API_ERROR).toBeDefined();
      expect(ErrorDefinitions.GENERATION_FAILED).toBeDefined();
      expect(ErrorDefinitions.DEPLOYMENT_FAILED).toBeDefined();
      expect(ErrorDefinitions.QUOTA_EXCEEDED).toBeDefined();
      expect(ErrorDefinitions.RATE_LIMIT_EXCEEDED).toBeDefined();
    });

    it("should have correct retryable flags", () => {
      expect(ErrorDefinitions.VALIDATION_ERROR.retryable).toBe(false);
      expect(ErrorDefinitions.GITHUB_API_ERROR.retryable).toBe(true);
      expect(ErrorDefinitions.GENERATION_TIMEOUT.retryable).toBe(true);
      expect(ErrorDefinitions.QUOTA_EXCEEDED.retryable).toBe(false);
    });

    it("should have unique error codes", () => {
      const codes = Object.values(ErrorDefinitions).map((def) => def.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large blueprint with many files", () => {
      const children = Array.from({ length: 100 }, (_, i) => ({
        type: "folder",
        name: `dir${i}`,
        children: Array.from({ length: 5 }, (_, j) => ({
          type: "file",
          name: `file${j}.ts`,
        })),
      }));

      const blueprint = {
        name: "Large",
        structure: {
          type: "folder",
          children,
        },
      };

      const result = handler.validateBlueprint(blueprint);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("exceeds limit"))).toBe(true);
    });

    it("should handle blueprint with special characters", () => {
      const blueprint = {
        name: 'Test "Blueprint" with <special> & chars',
        structure: {
          type: "folder",
          children: [{ type: "file", name: "file-with-dash.ts" }],
        },
      };

      const result = handler.validateBlueprint(blueprint);
      expect(result.valid).toBe(true);
    });

    it("should handle null/undefined values gracefully", () => {
      const blueprint = {
        name: "Test",
        structure: { type: "folder", children: null },
        dependencies: undefined,
      };

      const result = handler.validateBlueprint(blueprint);
      // Should not throw, should validate based on what's present
      expect(result.errors).toBeDefined();
    });

    it("should handle deeply nested structure", () => {
      let structure: any = { type: "file", name: "deep.ts" };

      // Create 50 levels of nesting
      for (let i = 0; i < 50; i++) {
        structure = {
          type: "folder",
          name: `level${i}`,
          children: [structure],
        };
      }

      const blueprint = {
        name: "Deep",
        structure,
      };

      const result = handler.validateBlueprint(blueprint);
      // Should handle deep nesting without stack overflow
      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
    });
  });
});

/**
 * Integration test examples for API
 */
describe("Build API Integration", () => {
  it("should validate request without required fields", async () => {
    const response = await fetch("/api/builds/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer invalid",
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(401);
  });

  it("should enforce rate limiting", async () => {
    const token = "valid_token";
    const requests = 35; // Exceed default limit of 30

    const promises = Array.from({ length: requests }, () =>
      fetch("/api/builds/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blueprint_id: "test-id" }),
      })
    );

    const responses = await Promise.all(promises);
    const rateLimitedCount = responses.filter((r) => r.status === 429).length;

    expect(rateLimitedCount).toBeGreaterThan(0);
  });

  it("should detect duplicate builds", async () => {
    const token = "valid_token";
    const blueprintId = "test-id";

    // First request
    const response1 = await fetch("/api/builds/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ blueprint_id: blueprintId }),
    });

    expect(response1.status).toBe(202);

    // Second request (should be duplicate)
    const response2 = await fetch("/api/builds/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ blueprint_id: blueprintId }),
    });

    expect(response2.status).toBe(409); // Conflict
  });
});
