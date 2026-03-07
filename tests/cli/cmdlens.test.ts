import { describe, expect, it, vi } from "vitest";
import { buildCli } from "../../src/bin/cmdlens";

describe("cmdlens cli", () => {
  it("registers explain, make, and run commands", () => {
    const program = buildCli({
      explainCommand: vi.fn(),
      makeCommand: vi.fn(),
      executeWithConfirmation: vi.fn(),
    });

    expect(program.commands.map((command) => command.name())).toEqual(
      expect.arrayContaining(["explain", "make", "run"]),
    );
  });

  it("renders command output after confirmed execution", async () => {
    const stdoutWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const stderrWrite = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    const explainCommand = vi.fn().mockResolvedValue({
      alternativeSafety: [],
      alternatives: [],
      confidence: 0.9,
      explanation: "Prints a greeting.",
      mode: "explain",
      primaryCommand: "echo hello",
      risks: [],
      safety: {
        level: "low",
        warnings: [],
      },
    });
    const executeWithConfirmation = vi.fn().mockResolvedValue({
      exitCode: 0,
      stderr: "",
      stdout: "hello",
    });
    const program = buildCli({
      executeWithConfirmation,
      explainCommand,
      makeCommand: vi.fn(),
    });

    await program.parseAsync(["node", "cmdlens", "explain", "echo hello", "--yes"]);

    expect(executeWithConfirmation).toHaveBeenCalled();
    expect(stdoutWrite).toHaveBeenCalledWith(expect.stringContaining("✅ Execution"));
    expect(stdoutWrite).toHaveBeenCalledWith(expect.stringContaining("📤 Output"));

    stdoutWrite.mockRestore();
    stderrWrite.mockRestore();
  });
});
