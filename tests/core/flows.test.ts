import { describe, expect, it, vi } from "vitest";
import { explainCommand } from "../../src/core/explain";
import { makeCommand } from "../../src/core/make";

describe("core flows", () => {
  it("combines Codex output and local safety data for explain", async () => {
    const codex = vi.fn().mockResolvedValue({
      mode: "explain",
      primaryCommand: "rm -rf tmp",
      explanation: "Deletes the tmp directory recursively.",
      risks: [],
      alternatives: [],
      confidence: 0.8,
    });

    const result = await explainCommand("rm -rf tmp", codex);
    expect(result.safety.level).toBe("high");
  });

  it("returns a generated command for natural language input", async () => {
    const codex = vi.fn().mockResolvedValue({
      mode: "make",
      primaryCommand: "find . -name '*.jpg'",
      explanation: "Searches recursively for jpg files.",
      risks: [],
      alternatives: [],
      confidence: 0.9,
    });

    const result = await makeCommand("find jpg files", codex);
    expect(result.primaryCommand).toContain("find");
  });
});
