import pc from "picocolors";
import type { LensResult } from "../types";

interface RenderOptions {
  json?: boolean;
}

export function renderLensResult(result: LensResult, options: RenderOptions = {}): void {
  if (options.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const sections = [
    `${pc.bold("Command")}: ${result.primaryCommand}`,
    `${pc.bold("Explanation")}: ${result.explanation}`,
    `${pc.bold("Risk")}: ${result.safety.level}`,
  ];

  if (result.risks.length > 0) {
    sections.push(`${pc.bold("Model Risks")}: ${result.risks.join("; ")}`);
  }

  if (result.safety.warnings.length > 0) {
    sections.push(`${pc.bold("Safety Warnings")}: ${result.safety.warnings.join("; ")}`);
  }

  if (result.alternatives.length > 0) {
    sections.push(`${pc.bold("Alternatives")}: ${result.alternatives.join(" | ")}`);
  }

  process.stdout.write(`${sections.join("\n")}\n`);
}
