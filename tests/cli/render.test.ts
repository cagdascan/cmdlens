import { describe, expect, it, vi } from "vitest";
import { createSpinnerReporter } from "../../src/cli/status.js";
import { renderExecutionResult, renderLensResult } from "../../src/cli/render.js";

describe("renderLensResult", () => {
  it("renders colorful section-style output with spacing", () => {
    const stdoutWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    renderLensResult({
      alternativeSafety: [],
      alternatives: ["ls -1", "find . -maxdepth 1 -type f -print"],
      confidence: 0.91,
      explanation: "Lists regular files in the current directory.",
      mode: "explain",
      primaryCommand: "printf '%s\\n' *",
      risks: ["Globs depend on shell expansion."],
      safety: {
        level: "low",
        warnings: [],
      },
    });

    expect(stdoutWrite).toHaveBeenCalledWith(expect.stringContaining("▶ Command"));
    expect(stdoutWrite).toHaveBeenCalledWith(expect.stringContaining("🧠 Explanation"));
    expect(stdoutWrite).toHaveBeenCalledWith(expect.stringContaining("✨ Alternatives"));
    expect(stdoutWrite).toHaveBeenCalledWith(expect.stringContaining("\n\n"));

    stdoutWrite.mockRestore();
  });
});

describe("renderExecutionResult", () => {
  it("renders a dedicated execution section and output block", () => {
    const stdoutWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    renderExecutionResult({
      exitCode: 0,
      stderr: "",
      stdout: "hello",
    });

    expect(stdoutWrite).toHaveBeenCalledWith(expect.stringContaining("✅ Execution"));
    expect(stdoutWrite).toHaveBeenCalledWith(expect.stringContaining("📤 Output"));

    stdoutWrite.mockRestore();
  });
});

describe("createSpinnerReporter", () => {
  it("clears the full spinner line before writing success text", () => {
    const stream = {
      write: vi.fn(),
    } as unknown as NodeJS.WriteStream;
    const reporter = createSpinnerReporter(stream);

    reporter.start("Asking Codex to explain the command...");
    reporter.succeed("Codex response received.");

    expect(stream.write).toHaveBeenCalledWith(expect.stringContaining("\u001b[2K"));
  });
});
