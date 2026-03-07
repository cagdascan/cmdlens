const RESPONSE_FORMAT_DESCRIPTION = `Return only JSON with these fields:
- mode: "explain" or "make"
- primary_command: string
- explanation: string
- risks: string[]
- alternatives: string[]
- confidence: number between 0 and 1`;

export function buildExplainPrompt(command: string): string {
  return [
    "You explain POSIX shell commands in clear, concise language.",
    RESPONSE_FORMAT_DESCRIPTION,
    `Explain this command: ${command}`,
  ].join("\n\n");
}

export function buildMakePrompt(request: string): string {
  return [
    "You translate natural-language requests into safe POSIX shell commands.",
    RESPONSE_FORMAT_DESCRIPTION,
    `Generate a command for this request: ${request}`,
  ].join("\n\n");
}
