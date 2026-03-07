import { CodexError, type CodexErrorCode } from "../core/errors.js";

const ERROR_GUIDANCE: Record<CodexErrorCode, { details: string[]; short: string }> = {
  CODEX_AUTH: {
    short: "Codex is not logged in.",
    details: [
      "Likely causes: expired local login, missing credentials, or a different shell environment.",
      "Try: codex login status",
      "If needed: codex login",
    ],
  },
  CODEX_MALFORMED: {
    short: "Codex returned an unreadable response.",
    details: [
      "Likely causes: Codex output format changed or the response was interrupted.",
      "Try again once. If it keeps happening, verify the local codex CLI still works with: codex exec \"say hello\"",
    ],
  },
  CODEX_MISSING: {
    short: "The local codex CLI is not installed or not available on PATH.",
    details: [
      "Likely causes: codex is not installed or your shell PATH is different from the one running cmdlens.",
      "Check: which codex",
    ],
  },
  CODEX_NETWORK: {
    short: "Codex could not reach the service.",
    details: [
      "Likely causes: network/DNS problems, temporary Codex service issues, or local websocket failures.",
      "Check: codex exec \"say hello\"",
      "Also verify login state with: codex login status",
    ],
  },
  CODEX_TIMEOUT: {
    short: "Codex took too long to respond.",
    details: [
      "Likely causes: network latency, Codex service delay, or the local codex CLI getting stuck.",
      "Check: codex login status",
      "Then retry. If it still hangs, try: codex exec \"say hello\"",
    ],
  },
  CODEX_UNKNOWN: {
    short: "Codex request failed.",
    details: [
      "Try: codex login status",
      "If login looks fine, try: codex exec \"say hello\"",
    ],
  },
};

export function formatCliError(error: unknown): string {
  const codexError = error instanceof CodexError ? error : new CodexError("CODEX_UNKNOWN", "Command failed.", { cause: error });
  const guidance = ERROR_GUIDANCE[codexError.code];

  return [guidance.short, "", ...guidance.details].join("\n");
}
