import { describe, expect, it } from "vitest";

describe("project bootstrap", () => {
  it("loads the CLI entry module", async () => {
    const mod = await import("../../src/bin/cmdlens");
    expect(mod).toBeDefined();
  });
});
