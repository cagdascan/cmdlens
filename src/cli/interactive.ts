import { confirm, input, select } from "@inquirer/prompts";
import type { executeWithConfirmation } from "../core/execute.js";
import type { explainCommand } from "../core/explain.js";
import type { makeCommand } from "../core/make.js";
import { detectIntent } from "../core/intent.js";
import { renderExecutionResult, renderLensResult } from "./render.js";
import { withStatusMessage } from "./status.js";

interface InteractiveDependencies {
  explainCommand: typeof explainCommand;
  makeCommand: typeof makeCommand;
  executeWithConfirmation: typeof executeWithConfirmation;
}

interface CommandChoice {
  name: string;
  value: string;
}

export function buildCommandChoices(primaryCommand: string, alternatives: string[]): CommandChoice[] {
  return [
    {
      name: `Primary command\n  ${primaryCommand}`,
      value: primaryCommand,
    },
    ...alternatives.map((alternative: string, index: number) => ({
      name: `Alternative ${index + 1}\n  ${alternative}`,
      value: alternative,
    })),
    {
      name: "Cancel",
      value: "",
    },
  ];
}

export async function startInteractiveSession(dependencies: InteractiveDependencies): Promise<void> {
  while (true) {
    const userInput = (await input({
      message: "Describe a task or paste a command (leave blank to exit)",
    })).trim();

    if (userInput.length === 0) {
      return;
    }

    const intent = detectIntent(userInput);
    const result =
      intent === "command"
        ? await withStatusMessage("Asking Codex to explain the command...", () =>
            dependencies.explainCommand(userInput),
          )
        : await withStatusMessage("Asking Codex to generate a command...", () =>
            dependencies.makeCommand(userInput),
          );

    renderLensResult(result);

    const commandToRun =
      result.alternatives.length > 0
        ? await select({
            message: "Choose a command",
            choices: buildCommandChoices(result.primaryCommand, result.alternatives),
          })
        : result.primaryCommand;

    if (!commandToRun) {
      continue;
    }

    const executionResult = await dependencies.executeWithConfirmation(commandToRun, {
      confirm: async (message: string) => confirm({ message }),
      riskLevel: commandToRun === result.primaryCommand ? result.safety.level : "medium",
    });

    if (executionResult) {
      renderExecutionResult(executionResult);
    }
  }
}
