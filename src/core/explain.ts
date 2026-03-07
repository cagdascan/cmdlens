import { invokeCodex } from "./codex";
import { buildExplainPrompt } from "./prompts";
import { analyzeSafety } from "./safety";
import type { LensResponse, LensResult } from "../types";

type CodexInvoker = (prompt: string) => Promise<LensResponse>;

export async function explainCommand(
  command: string,
  codexInvoker: CodexInvoker = invokeCodex,
): Promise<LensResult> {
  const response = await codexInvoker(buildExplainPrompt(command));

  return {
    ...response,
    safety: analyzeSafety(response.primaryCommand),
    alternativeSafety: response.alternatives.map((alternative) => analyzeSafety(alternative)),
  };
}
