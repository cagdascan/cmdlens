import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execa } from "execa";
import { parseLensResponse } from "./schema.js";
import type { LensResponse } from "../types.js";

interface FileSystem {
  mkdtemp(prefix: string): Promise<string>;
  writeFile(path: string, contents: string): Promise<void>;
  readFile(path: string): Promise<string>;
  rm(path: string, options: { force?: boolean; recursive?: boolean }): Promise<void>;
}

type CommandRunner = (command: string, args: string[]) => Promise<unknown>;

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

const defaultRunner: CommandRunner = async (command, args) => {
  await execa(command, args);
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
    ]);

    const response = await filesystem.readFile(responsePath);
    return parseLensResponse(JSON.parse(response));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error("The local `codex` CLI is not installed or not available on PATH.");
    }

    throw error;
  } finally {
    await filesystem.rm(tempDir, { force: true, recursive: true });
  }
}
