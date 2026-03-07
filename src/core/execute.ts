import { execa } from "execa";
import type { RiskLevel } from "../types";

interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

type ConfirmFn = (message: string) => Promise<boolean>;
type RunnerFn = (command: string) => Promise<CommandResult>;

interface ExecuteOptions {
  confirm: ConfirmFn;
  runner?: RunnerFn;
  riskLevel: RiskLevel;
  yes?: boolean;
}

const defaultRunner: RunnerFn = async (command) => {
  const result = await execa("/bin/sh", ["-lc", command], { reject: false });

  return {
    exitCode: result.exitCode ?? 0,
    stdout: result.stdout,
    stderr: result.stderr,
  };
};

function buildConfirmationMessage(command: string, riskLevel: RiskLevel): string {
  if (riskLevel === "high") {
    return `High-risk command detected. Execute this command?\n${command}`;
  }

  if (riskLevel === "medium") {
    return `Potentially destructive command detected. Execute this command?\n${command}`;
  }

  return `Execute this command?\n${command}`;
}

export async function executeWithConfirmation(
  command: string,
  options: ExecuteOptions,
): Promise<CommandResult | null> {
  const runner = options.runner ?? defaultRunner;
  const shouldRun =
    options.yes === true
      ? true
      : await options.confirm(buildConfirmationMessage(command, options.riskLevel));

  if (!shouldRun) {
    return null;
  }

  return runner(command);
}
