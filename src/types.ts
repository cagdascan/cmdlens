export type LensMode = "explain" | "make";

export interface LensResponse {
  mode: LensMode;
  primaryCommand: string;
  explanation: string;
  risks: string[];
  alternatives: string[];
  confidence: number;
}
