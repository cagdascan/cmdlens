export type CodexErrorCode =
  | "CODEX_AUTH"
  | "CODEX_MALFORMED"
  | "CODEX_MISSING"
  | "CODEX_NETWORK"
  | "CODEX_TIMEOUT"
  | "CODEX_UNKNOWN";

export class CodexError extends Error {
  code: CodexErrorCode;
  cause?: unknown;

  constructor(code: CodexErrorCode, message: string, options: { cause?: unknown } = {}) {
    super(message);
    this.name = "CodexError";
    this.code = code;
    this.cause = options.cause;
  }
}

export function toCodexError(error: unknown): CodexError {
  if (error instanceof CodexError) {
    return error;
  }

  const message = extractErrorText(error);

  if (isNodeError(error, "ENOENT")) {
    return new CodexError("CODEX_MISSING", "The local `codex` CLI is not installed or not available on PATH.", {
      cause: error,
    });
  }

  if (hasBooleanFlag(error, "timedOut")) {
    return new CodexError("CODEX_TIMEOUT", "Codex took too long to respond.", { cause: error });
  }

  if (/(login|logged in|authentication|unauthorized|forbidden|token)/i.test(message)) {
    return new CodexError("CODEX_AUTH", "Codex is not logged in.", { cause: error });
  }

  if (/(websocket|lookup address|dns|network|reconnecting|stream disconnected|connect)/i.test(message)) {
    return new CodexError("CODEX_NETWORK", "Codex could not reach the service.", { cause: error });
  }

  if (/(json|schema|unexpected token|parse)/i.test(message)) {
    return new CodexError("CODEX_MALFORMED", "Codex returned an unreadable response.", { cause: error });
  }

  return new CodexError("CODEX_UNKNOWN", "Codex request failed.", { cause: error });
}

function extractErrorText(error: unknown): string {
  if (error instanceof Error) {
    const extras = ["stderr", "stdout"]
      .map((key) => (key in error && typeof error[key as keyof Error] === "string" ? error[key as keyof Error] : ""))
      .filter(Boolean);

    return [error.message, ...extras].join("\n");
  }

  return String(error);
}

function hasBooleanFlag(error: unknown, key: string): boolean {
  return typeof error === "object" && error !== null && key in error && error[key as keyof typeof error] === true;
}

function isNodeError(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
