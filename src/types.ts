export type LensMode = "explain" | "make";

export interface LensResponse {
  mode: LensMode;
  primaryCommand: string;
  explanation: string;
  risks: string[];
  alternatives: string[];
  confidence: number;
}

export type RiskLevel = "low" | "medium" | "high";

export interface SafetyAnalysis {
  level: RiskLevel;
  warnings: string[];
}
