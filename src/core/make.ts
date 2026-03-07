import { invokeCodex } from "./codex.js";
import { buildMakePrompt } from "./prompts.js";
import { analyzeSafety } from "./safety.js";
import type { LensResponse, LensResult } from "../types.js";

type CodexInvoker = (prompt: string) => Promise<LensResponse>;

export async function makeCommand(
  request: string,
  codexInvoker: CodexInvoker = invokeCodex,
): Promise<LensResult> {
  const response = await codexInvoker(buildMakePrompt(request));

  return {
    ...response,
    safety: analyzeSafety(response.primaryCommand),
    alternativeSafety: response.alternatives.map((alternative: string) => analyzeSafety(alternative)),
  };
}
