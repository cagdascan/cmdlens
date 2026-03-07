import { describe, expect, it, vi } from "vitest";
import { main } from "../../src/bin/cmdlens.js";

describe("main", () => {
  it("exits quietly on prompt cancellation", async () => {
    const stderrWrite = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    process.exitCode = undefined;

    await expect(main(["node", "cmdlens"], {
      createCli: () => ({
        parseAsync: vi.fn().mockRejectedValue(Object.assign(new Error("cancelled"), { name: "ExitPromptError" })),
      }),
    })).resolves.toBeUndefined();

    expect(stderrWrite).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(0);

    stderrWrite.mockRestore();
    process.exitCode = undefined;
  });
});
