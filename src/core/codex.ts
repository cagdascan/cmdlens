import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execa } from "execa";
import { CodexError, toCodexError } from "./errors.js";
import { parseLensResponse } from "./schema.js";
import type { LensResponse } from "../types.js";

interface FileSystem {
  mkdtemp(prefix: string): Promise<string>;
  writeFile(path: string, contents: string): Promise<void>;
  readFile(path: string): Promise<string>;
  rm(path: string, options: { force?: boolean; recursive?: boolean }): Promise<void>;
}

interface CommandRunnerOptions {
  timeoutMs: number;
}

type CommandRunner = (command: string, args: string[], options: CommandRunnerOptions) => Promise<unknown>;

interface InvokeCodexOptions {
  runner?: CommandRunner;
  filesystem?: FileSystem;
}

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["mode", "primary_command", "explanation", "risks", "alternatives", "confidence"],
  properties: {
    mode: {
      type: "string",
      enum: ["explain", "make"],
    },
    primary_command: {
      type: "string",
      minLength: 1,
    },
    explanation: {
      type: "string",
      minLength: 1,
    },
    risks: {
      type: "array",
      items: {
        type: "string",
      },
    },
    alternatives: {
      type: "array",
      items: {
        type: "string",
      },
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
  },
} as const;

const CODEX_TIMEOUT_MS = 30_000;

const defaultRunner: CommandRunner = async (command, args, options) => {
  await execa(command, args, { reject: true, timeout: options.timeoutMs });
};

const defaultFileSystem: FileSystem = {
  mkdtemp,
  writeFile,
  readFile: async (path) => readFile(path, "utf8"),
  rm,
};

export async function invokeCodex(
  prompt: string,
  options: InvokeCodexOptions = {},
): Promise<LensResponse> {
  const runner = options.runner ?? defaultRunner;
  const filesystem = options.filesystem ?? defaultFileSystem;
  const tempDir = await filesystem.mkdtemp(join(tmpdir(), "cmdlens-"));
  const schemaPath = join(tempDir, "schema.json");
  const responsePath = join(tempDir, "response.json");

  try {
    await filesystem.writeFile(schemaPath, JSON.stringify(OUTPUT_SCHEMA));
    await runner("codex", [
      "exec",
      "--skip-git-repo-check",
      "--ephemeral",
      "--output-schema",
      schemaPath,
      "--output-last-message",
      responsePath,
      prompt,
    ], { timeoutMs: CODEX_TIMEOUT_MS });

    const response = await filesystem.readFile(responsePath);
    try {
      return parseLensResponse(JSON.parse(response));
    } catch (error) {
      throw new CodexError("CODEX_MALFORMED", "Codex returned an unreadable response.", { cause: error });
    }
  } catch (error) {
    throw toCodexError(error);
  } finally {
    await filesystem.rm(tempDir, { force: true, recursive: true });
  }
}
