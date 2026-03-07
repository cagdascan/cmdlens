import { describe, expect, it } from "vitest";
import { analyzeSafety } from "../../src/core/safety";

describe("analyzeSafety", () => {
  it("flags destructive recursive delete commands", () => {
    const result = analyzeSafety("rm -rf tmp");
    expect(result.level).toBe("high");
    expect(result.warnings[0]).toMatch(/delete/i);
  });

  it("leaves harmless commands as low risk", () => {
    expect(analyzeSafety("pwd").level).toBe("low");
  });
});
