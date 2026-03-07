import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { explainCommand as defaultExplainCommand } from "../core/explain";
import { makeCommand as defaultMakeCommand } from "../core/make";
import { executeWithConfirmation as defaultExecuteWithConfirmation } from "../core/execute";
import { detectIntent } from "../core/intent";
import { renderLensResult } from "../cli/render";
import { startInteractiveSession } from "../cli/interactive";
import type { LensResult } from "../types";

interface CliOptions {
  json?: boolean;
  yes?: boolean;
}

interface CliDependencies {
  explainCommand: typeof defaultExplainCommand;
  makeCommand: typeof defaultMakeCommand;
  executeWithConfirmation: typeof defaultExecuteWithConfirmation;
}

const defaultDependencies: CliDependencies = {
  explainCommand: defaultExplainCommand,
  makeCommand: defaultMakeCommand,
  executeWithConfirmation: defaultExecuteWithConfirmation,
};

async function handleResult(
  result: LensResult,
  dependencies: CliDependencies,
  options: CliOptions,
): Promise<void> {
  renderLensResult(result, { json: options.json === true });
  await dependencies.executeWithConfirmation(result.primaryCommand, {
    confirm: async (message) => confirm({ message }),
    riskLevel: result.safety.level,
    yes: options.yes,
  });
}

export function buildCli(dependencies: Partial<CliDependencies> = {}): Command {
  const resolvedDependencies = { ...defaultDependencies, ...dependencies };
  const program = new Command();

  program.name("cmdlens").description("Explain shell commands and generate them from plain English.");

  program
    .command("explain")
    .argument("<command>")
    .option("--json", "Print machine-readable output.")
    .option("--yes", "Skip the confirmation prompt before execution.")
    .action(async (command: string, options: CliOptions) => {
      const result = await resolvedDependencies.explainCommand(command);
      await handleResult(result, resolvedDependencies, options);
    });

  program
    .command("make")
    .argument("<request>")
    .option("--json", "Print machine-readable output.")
    .option("--yes", "Skip the confirmation prompt before execution.")
    .action(async (request: string, options: CliOptions) => {
      const result = await resolvedDependencies.makeCommand(request);
      await handleResult(result, resolvedDependencies, options);
    });

  program
    .command("run")
    .argument("<input>")
    .option("--json", "Print machine-readable output.")
    .option("--yes", "Skip the confirmation prompt before execution.")
    .action(async (input: string, options: CliOptions) => {
      const intent = detectIntent(input);
      const result =
        intent === "command"
          ? await resolvedDependencies.explainCommand(input)
          : await resolvedDependencies.makeCommand(input);

      await handleResult(result, resolvedDependencies, options);
    });

  program.action(async () => {
    await startInteractiveSession(resolvedDependencies);
  });

  return program;
}

export async function main(argv: string[] = process.argv): Promise<void> {
  await buildCli().parseAsync(argv);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
