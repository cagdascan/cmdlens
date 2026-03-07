import { invokeCodex } from "./codex";
import { buildMakePrompt } from "./prompts";
import { analyzeSafety } from "./safety";
import type { LensResponse, LensResult } from "../types";

type CodexInvoker = (prompt: string) => Promise<LensResponse>;

export async function makeCommand(
  request: string,
  codexInvoker: CodexInvoker = invokeCodex,
): Promise<LensResult> {
  const response = await codexInvoker(buildMakePrompt(request));

  return {
    ...response,
    safety: analyzeSafety(response.primaryCommand),
    alternativeSafety: response.alternatives.map((alternative) => analyzeSafety(alternative)),
  };
}
