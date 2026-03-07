import { describe, expect, it } from "vitest";
import { detectIntent } from "../../src/core/intent";

describe("detectIntent", () => {
  it("classifies likely shell commands", () => {
    expect(detectIntent("git status")).toBe("command");
  });

  it("classifies natural language requests", () => {
    expect(detectIntent("find all jpg files modified today")).toBe("natural_language");
  });
});
