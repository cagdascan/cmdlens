import { describe, expect, it } from "vitest";
import { parseLensResponse } from "../../src/core/schema";

describe("parseLensResponse", () => {
  it("accepts valid structured Codex output", () => {
    const parsed = parseLensResponse({
      mode: "make",
      primary_command: "find . -name '*.log'",
      explanation: "Searches recursively for log files.",
      risks: ["May scan large trees."],
      alternatives: [],
      confidence: 0.9,
    });

    expect(parsed.primaryCommand).toBe("find . -name '*.log'");
  });
});
