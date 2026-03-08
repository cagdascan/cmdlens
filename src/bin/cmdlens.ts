#!/usr/bin/env node

import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { explainCommand as defaultExplainCommand } from "../core/explain.js";
import { makeCommand as defaultMakeCommand } from "../core/make.js";
import { executeWithConfirmation as defaultExecuteWithConfirmation } from "../core/execute.js";
import { detectIntent } from "../core/intent.js";
import { renderExecutionResult, renderLensResult } from "../cli/render.js";
import { startInteractiveSession } from "../cli/interactive.js";
import { formatCliError } from "../cli/errors.js";
import { withStatusMessage } from "../cli/status.js";
import type { LensResult } from "../types.js";

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
  const executionResult = await dependencies.executeWithConfirmation(result.primaryCommand, {
    confirm: async (message: string) => confirm({ message }),
    riskLevel: result.safety.level,
    yes: options.yes,
  });

  if (executionResult) {
    renderExecutionResult(executionResult);
  }
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
      const result = await withStatusMessage("Asking Codex to explain the command...", () =>
        resolvedDependencies.explainCommand(command),
      );
      await handleResult(result, resolvedDependencies, options);
    });

  program
    .command("make")
    .argument("<request>")
    .option("--json", "Print machine-readable output.")
    .option("--yes", "Skip the confirmation prompt before execution.")
    .action(async (request: string, options: CliOptions) => {
      const result = await withStatusMessage("Asking Codex to generate a command...", () =>
        resolvedDependencies.makeCommand(request),
      );
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
          ? await withStatusMessage("Asking Codex to explain the command...", () =>
              resolvedDependencies.explainCommand(input),
            )
          : await withStatusMessage("Asking Codex to generate a command...", () =>
              resolvedDependencies.makeCommand(input),
            );

      await handleResult(result, resolvedDependencies, options);
    });

  program.action(async () => {
    await startInteractiveSession(resolvedDependencies);
  });

  return program;
}

interface MainOptions {
  createCli?: () => { parseAsync(argv: string[]): Promise<unknown> };
}

function isPromptCancellation(error: unknown): boolean {
  return error instanceof Error && error.name === "ExitPromptError";
}

export async function main(argv: string[] = process.argv, options: MainOptions = {}): Promise<void> {
  const cli = options.createCli?.() ?? buildCli();

  try {
    await cli.parseAsync(argv);
  } catch (error) {
    if (isPromptCancellation(error)) {
      process.exitCode = 0;
      return;
    }

    process.stderr.write(`${formatCliError(error)}\n`);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
