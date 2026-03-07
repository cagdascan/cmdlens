const COMMAND_STARTERS = new Set([
  "cat",
  "cd",
  "cp",
  "curl",
  "docker",
  "find",
  "git",
  "grep",
  "ls",
  "mkdir",
  "mv",
  "npm",
  "pnpm",
  "pwd",
  "rm",
  "rsync",
  "sed",
  "tar",
  "yarn",
]);

const NATURAL_LANGUAGE_HINTS = /\b(all|files?|folders?|directories?|today|yesterday|please|show|list|delete|archive|create)\b/i;
const COMMAND_SYNTAX = /[|&;<>()$`]/;

export function detectIntent(input: string): "command" | "natural_language" {
  const text = input.trim();

  if (text.length === 0) {
    return "natural_language";
  }

  if (COMMAND_SYNTAX.test(text)) {
    return "command";
  }

  const [firstToken = ""] = text.split(/\s+/, 1);
  const normalizedFirstToken = firstToken.toLowerCase();

  if (!COMMAND_STARTERS.has(normalizedFirstToken)) {
    return "natural_language";
  }

  if (NATURAL_LANGUAGE_HINTS.test(text)) {
    return "natural_language";
  }

  return "command";
}
