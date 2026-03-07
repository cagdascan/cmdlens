import { describe, expect, it, vi } from "vitest";
import { withStatusMessage } from "../../src/cli/status.js";

describe("withStatusMessage", () => {
  it("reports start and completion around async work", async () => {
    const reporter = {
      fail: vi.fn(),
      start: vi.fn(),
      succeed: vi.fn(),
    };

    const result = await withStatusMessage("Asking Codex...", () => Promise.resolve("done"), reporter);

    expect(result).toBe("done");
    expect(reporter.start).toHaveBeenCalledWith("Asking Codex...");
    expect(reporter.succeed).toHaveBeenCalledWith("Codex response received.");
    expect(reporter.fail).not.toHaveBeenCalled();
  });

  it("reports failure before rethrowing", async () => {
    const reporter = {
      fail: vi.fn(),
      start: vi.fn(),
      succeed: vi.fn(),
    };

    await expect(
      withStatusMessage("Asking Codex...", async () => {
        throw new Error("boom");
      }, reporter),
    ).rejects.toThrow("boom");

    expect(reporter.start).toHaveBeenCalledWith("Asking Codex...");
    expect(reporter.fail).toHaveBeenCalledWith("Codex request failed.");
    expect(reporter.succeed).not.toHaveBeenCalled();
  });
});
