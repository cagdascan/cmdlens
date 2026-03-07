import { z } from "zod";
import type { LensResponse } from "../types";

const lensResponseSchema = z.object({
  mode: z.enum(["explain", "make"]),
  primary_command: z.string().min(1),
  explanation: z.string().min(1),
  risks: z.array(z.string()),
  alternatives: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export function parseLensResponse(input: unknown): LensResponse {
  const parsed = lensResponseSchema.parse(input);

  return {
    mode: parsed.mode,
    primaryCommand: parsed.primary_command,
    explanation: parsed.explanation,
    risks: parsed.risks,
    alternatives: parsed.alternatives,
    confidence: parsed.confidence,
  };
}
