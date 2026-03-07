import { describe, expect, it, vi } from "vitest";
import { executeWithConfirmation } from "../../src/core/execute";

describe("executeWithConfirmation", () => {
  it("does not run commands when confirmation is denied", async () => {
    const confirm = vi.fn().mockResolvedValue(false);
    const runner = vi.fn();

    await executeWithConfirmation("pwd", { confirm, runner, riskLevel: "low" });

    expect(runner).not.toHaveBeenCalled();
  });
});
