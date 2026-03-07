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
});
