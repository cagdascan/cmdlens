import { describe, expect, it, vi } from "vitest";
import { buildCommandChoices } from "../../src/cli/interactive.js";

describe("buildCommandChoices", () => {
  it("renders labels with the real command on the next line", () => {
    const choices = buildCommandChoices("echo hello", ["printf 'hello\\n'"]);

    expect(choices[0]?.name).toContain("Primary command\n  echo hello");
    expect(choices[1]?.name).toContain("Alternative 1\n  printf 'hello\\n'");
    expect(choices[2]).toEqual({ name: "Cancel", value: "" });
  });
});
