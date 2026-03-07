import { confirm, input, select } from "@inquirer/prompts";
import type { executeWithConfirmation } from "../core/execute.js";
import type { explainCommand } from "../core/explain.js";
import type { makeCommand } from "../core/make.js";
import { detectIntent } from "../core/intent.js";
import { renderLensResult } from "./render.js";

interface InteractiveDependencies {
  explainCommand: typeof explainCommand;
  makeCommand: typeof makeCommand;
  executeWithConfirmation: typeof executeWithConfirmation;
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
        ? await dependencies.explainCommand(userInput)
        : await dependencies.makeCommand(userInput);

    renderLensResult(result);

    const commandToRun =
      result.alternatives.length > 0
        ? await select({
            message: "Choose a command",
            choices: [
              { name: "Primary command", value: result.primaryCommand },
              ...result.alternatives.map((alternative: string, index: number) => ({
                name: `Alternative ${index + 1}`,
                value: alternative,
              })),
              { name: "Cancel", value: "" },
            ],
          })
        : result.primaryCommand;

    if (!commandToRun) {
      continue;
    }

    await dependencies.executeWithConfirmation(commandToRun, {
      confirm: async (message: string) => confirm({ message }),
      riskLevel: commandToRun === result.primaryCommand ? result.safety.level : "medium",
    });
  }
}
