import { afterEach, describe, expect, it, vi } from "vitest";
import { buildExplainPrompt, buildMakePrompt } from "../../src/core/prompts";
import { invokeCodex } from "../../src/core/codex";

describe("Codex prompts", () => {
  it("includes the input command in explain prompts", () => {
    const prompt = buildExplainPrompt("git status");
    expect(prompt).toMatch(/git status/);
    expect(prompt).toMatch(/JSON/i);
  });

  it("includes the natural-language request in make prompts", () => {
    const prompt = buildMakePrompt("find jpg files");
    expect(prompt).toMatch(/find jpg files/);
    expect(prompt).toMatch(/primary_command/);
  });
});

describe("invokeCodex", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses JSON returned by the local codex client", async () => {
    const runner = vi.fn().mockResolvedValue(undefined);
    const fileStore = new Map<string, string>();
    const writeFile = vi.fn(async (path: string, contents: string) => {
      fileStore.set(path, contents);
    });
    const readFile = vi.fn(async (path: string) => {
      if (path.endsWith("response.json")) {
        return JSON.stringify({
          mode: "explain",
          primary_command: "git status",
          explanation: "Shows repository status.",
          risks: [],
          alternatives: [],
          confidence: 0.99,
        });
      }

      return fileStore.get(path) ?? "";
    });
    const mkdtemp = vi.fn(async () => "/tmp/cmdlens-test");
    const rm = vi.fn(async () => undefined);

    const result = await invokeCodex("prompt", {
      runner,
      filesystem: { writeFile, readFile, mkdtemp, rm },
    });

    expect(result.mode).toBe("explain");
    expect(result.primaryCommand).toBe("git status");
    expect(runner).toHaveBeenCalledWith(
      "codex",
      expect.arrayContaining(["exec", "--skip-git-repo-check", "--output-schema"]),
    );
  });
});
