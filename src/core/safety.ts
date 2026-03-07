import type { RiskLevel, SafetyAnalysis } from "../types.js";

interface SafetyRule {
  level: RiskLevel;
  pattern: RegExp;
  warning: string;
}

const SAFETY_RULES: SafetyRule[] = [
  {
    level: "high",
    pattern: /\brm\s+-[^\n]*r[^\n]*f\b|\brm\s+-[^\n]*f[^\n]*r\b/i,
    warning: "Deletes files or directories recursively without prompting.",
  },
  {
    level: "high",
    pattern: /\bsudo\b/i,
    warning: "Runs with elevated privileges.",
  },
  {
    level: "high",
    pattern: /\b(curl|wget)\b[^\n]*\|\s*(sh|bash|zsh)\b/i,
    warning: "Pipes downloaded content directly into a shell.",
  },
  {
    level: "medium",
    pattern: />\s*[^>]/,
    warning: "Overwrites a file via shell redirection.",
  },
  {
    level: "medium",
    pattern: /\bchmod\s+-R\b/i,
    warning: "Recursively changes file permissions.",
  },
];

const RISK_ORDER: Record<RiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export function analyzeSafety(command: string): SafetyAnalysis {
  const warnings = SAFETY_RULES.filter((rule) => rule.pattern.test(command)).map((rule) => rule.warning);
  const level = SAFETY_RULES.filter((rule) => rule.pattern.test(command)).reduce<RiskLevel>(
    (currentLevel, rule) => (RISK_ORDER[rule.level] > RISK_ORDER[currentLevel] ? rule.level : currentLevel),
    "low",
  );

  return {
    level,
    warnings,
  };
}
