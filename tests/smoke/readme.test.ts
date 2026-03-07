import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("README", () => {
  it("documents the required codex login setup", () => {
    const readme = readFileSync("README.md", "utf8");
    expect(readme).toMatch(/codex/i);
    expect(readme).toMatch(/login|sign in/i);
  });
});
