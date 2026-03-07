# cmdlens Design

**Date:** 2026-03-07

## Goal

Build a POSIX-focused CLI tool that translates between shell commands and human language in both directions. `cmdlens` should explain commands in plain English, generate commands from natural-language requests, suggest alternatives when useful, and require explicit confirmation before executing anything.

## Product Shape

`cmdlens` supports both explicit subcommands and an interactive mode:

- `cmdlens explain "<command>"`
- `cmdlens make "<natural language request>"`
- `cmdlens run "<command or request>"`
- `cmdlens` with no args starts an interactive prompt

Behavior:

- If the input looks like a shell command, `cmdlens` explains it in plain language, lists notable risks, and may show alternatives.
- If the input looks like natural language, `cmdlens` generates a shell command, explains what it will do, lists risks, may show alternatives, and asks for confirmation before execution.
- `run` auto-detects the input type, renders the same structured explanation, and only executes after confirmation.

## Recommended Approach

Use a rule-assisted CLI:

- Codex handles command explanation and command generation.
- `cmdlens` owns deterministic behavior locally: input classification, prompt orchestration, safety checks, confirmation, and command execution.

This keeps the LLM responsible for interpretation and translation while preserving predictable local control over risky actions.

## Target Environment

Version 1 targets POSIX shells on macOS and Linux:

- Primary shells: `zsh` and `bash`
- Execution behavior should remain compatible with `/bin/sh -lc` style shell invocation
- Windows and PowerShell are out of scope for v1

## Technology Choices

Implementation stack:

- Runtime: Node.js 22+
- Language: TypeScript
- CLI parsing: `commander`
- Interactive prompts: `@inquirer/prompts`
- Terminal formatting: `picocolors`
- Process execution: `execa`
- Testing: `vitest`
- Package distribution: npm package with a `cmdlens` bin entry

Suggested module layout:

- `src/cli/*` for argument parsing and interactive flows
- `src/core/intent.ts` for input classification
- `src/core/prompts.ts` for Codex prompt definitions
- `src/core/codex.ts` for Codex client/process integration
- `src/core/safety.ts` for deterministic risk heuristics
- `src/core/explain.ts` for command-to-language behavior
- `src/core/make.ts` for language-to-command behavior
- `src/core/execute.ts` for confirmation and shell execution
- `src/types.ts` for shared result types

## Codex Integration and Auth

Default auth model:

- `cmdlens` depends on a locally installed `codex` client that is already signed in through ChatGPT/Codex.
- `cmdlens` shells out to the local `codex` client for model-backed explanation and command generation.
- Users should not need to manually create or paste an API key for the primary setup path.

Optional later fallback:

- Direct OpenAI API integration via `OPENAI_API_KEY` can be added later for CI, power users, or environments without the local `codex` client.

This design aligns the product with "active Codex subscription" as the primary requirement rather than requiring manual API credential setup.

## Model Contract

`cmdlens` should require structured JSON from Codex instead of free-form prose. The result schema should include:

- `mode`
- `primary_command`
- `explanation`
- `risks`
- `alternatives`
- `confidence`

The CLI renders this structure and uses it to drive confirmation and execution.

## Runtime Flow

### `explain`

1. Accept a shell command string.
2. Ask Codex for a structured explanation.
3. Render:
   - detected mode
   - exact command
   - plain-English explanation
   - risks
   - alternatives
4. Optionally ask whether to execute the displayed command.

### `make`

1. Accept a natural-language request.
2. Ask Codex for a structured command proposal.
3. Render the proposed command plus explanation, risks, and alternatives.
4. Ask whether to execute the primary command, choose an alternative, revise, or cancel.

### `run`

1. Detect whether the input is likely a command or natural language.
2. Route to the appropriate explanation/generation flow.
3. Always require explicit confirmation before execution.

### Interactive mode

1. Open a prompt loop when the binary is run without arguments.
2. Accept either a command or a natural-language request.
3. Render the same structured result as the explicit commands.
4. Allow execute, choose alternative, revise, or cancel.

## Safety Model

Local safety checks always run before execution, regardless of what Codex returns. Risk heuristics should flag patterns such as:

- `rm` with recursive or broad targets
- `sudo`
- destructive `mv` or overwrite patterns
- shell redirections that clobber files
- `chmod -R`
- network fetches piped into a shell
- high-impact wildcard usage

Risk checks do not necessarily block execution, but they must:

- visibly warn the user
- strengthen the confirmation language for high-risk commands
- never allow silent execution

## Execution Model

- Execute via `execa` using a POSIX shell invocation compatible with macOS/Linux behavior.
- Always show the exact command string before execution.
- Never auto-run model output.
- If alternatives exist, let the user choose the primary command, an alternative, or cancel.

## Error Handling

- If the local `codex` client is missing or not authenticated, fail with a clear setup message and do not execute anything.
- If Codex output is malformed, reject it and report the parsing problem instead of guessing.
- If command execution fails, show exit code and command output without hiding errors behind model summarization.

## Version 1 Scope

Included:

- command explanation
- natural-language command generation
- confirmation before execution
- optional alternatives
- interactive mode
- machine-readable `--json` output

Excluded:

- shell plugin or alias integration
- command history
- autonomous retries or repair
- Windows/PowerShell support
- persistent local config beyond basic environment/config discovery

## Testing Strategy

- Unit tests for intent detection
- Unit tests for safety heuristics
- Unit tests for Codex response parsing
- Mocked integration tests for `explain`, `make`, and `run`
- Harmless shell execution tests using commands such as `echo`, `pwd`, and `printf`

## Success Criteria

`cmdlens` v1 is successful if a user can:

- paste an unfamiliar shell command and get a clear plain-English explanation
- describe a terminal task in natural language and receive a usable POSIX command
- review visible risks and alternatives before running anything
- explicitly confirm execution instead of trusting silent model behavior
