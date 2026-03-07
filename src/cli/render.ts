import pc from "picocolors";
import type { CommandResult } from "../core/execute.js";
import type { LensResult } from "../types.js";

interface RenderOptions {
  json?: boolean;
}

export function renderLensResult(result: LensResult, options: RenderOptions = {}): void {
  if (options.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const sections = [
    formatSection("▶ Command", result.primaryCommand, pc.cyan),
    formatSection("🧠 Explanation", result.explanation, pc.blue),
    formatSection("⚠️ Risk", formatRisk(result.safety.level), pc.yellow),
  ];

  if (result.risks.length > 0) {
    sections.push(formatSection("⚠️ Model Risks", result.risks.map((risk) => `- ${risk}`).join("\n"), pc.yellow));
  }

  if (result.safety.warnings.length > 0) {
    sections.push(
      formatSection("🚧 Safety Warnings", result.safety.warnings.map((warning) => `- ${warning}`).join("\n"), pc.red),
    );
  }

  if (result.alternatives.length > 0) {
    sections.push(
      formatSection(
        "✨ Alternatives",
        result.alternatives.map((alternative, index) => `${index + 1}. ${alternative}`).join("\n"),
        pc.magenta,
      ),
    );
  }

  process.stdout.write(`${sections.join("\n\n")}\n`);
}

export function renderExecutionResult(result: CommandResult): void {
  const statusHeading =
    result.exitCode === 0 ? pc.green(pc.bold("✅ Execution")) : pc.red(pc.bold("❌ Execution"));
  const sections = [`${statusHeading}\n  Exit code: ${result.exitCode}`];

  if (result.stdout.trim().length > 0) {
    sections.push(formatSection("📤 Output", result.stdout.trimEnd(), pc.green));
  }

  if (result.stderr.trim().length > 0) {
    sections.push(formatSection("📥 Errors", result.stderr.trimEnd(), pc.red));
  }

  if (result.stdout.trim().length === 0 && result.stderr.trim().length === 0 && result.exitCode === 0) {
    sections.push(formatSection("✅ Result", "Command completed successfully.", pc.green));
  }

  process.stdout.write(`${sections.join("\n\n")}\n`);
}

function formatRisk(level: string): string {
  if (level === "high") {
    return pc.red("High");
  }

  if (level === "medium") {
    return pc.yellow("Medium");
  }

  return pc.green("Low");
}

function formatSection(title: string, body: string, color: (value: string) => string): string {
  const indentedBody = body
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");

  return `${color(pc.bold(title))}\n${indentedBody}`;
}
