import { describe, expect, it } from "vitest";
import { formatCliError } from "../../src/cli/errors.js";
import { CodexError } from "../../src/core/errors.js";

describe("formatCliError", () => {
  it("renders a short message with detail guidance for timeout errors", () => {
    const error = new CodexError("CODEX_TIMEOUT", "Codex took too long to respond.");

    expect(formatCliError(error)).toContain("Codex took too long to respond.");
    expect(formatCliError(error)).toContain("codex login status");
    expect(formatCliError(error)).toContain("Likely causes");
  });

  it("renders login guidance for authentication errors", () => {
    const error = new CodexError("CODEX_AUTH", "Codex is not logged in.");

    expect(formatCliError(error)).toContain("Codex is not logged in.");
    expect(formatCliError(error)).toContain("codex login");
  });
});
