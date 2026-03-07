# cmdlens

`cmdlens` is a POSIX-focused command line assistant that works in two directions:

- explain an existing shell command in plain English
- turn a natural-language request into a shell command

Before `cmdlens` executes anything, it shows the exact command, highlights risks, and asks for confirmation.
While `cmdlens` is waiting on Codex, it shows progress on stderr. If Codex stalls or fails, `cmdlens` stops waiting and prints retry guidance such as `codex login status`.

## Requirements

- Node.js 22+
- A local `codex` CLI installation
- An active Codex/ChatGPT login in the local `codex` client

If you have not signed in yet, run:

```bash
codex login
```

`cmdlens` uses the local `codex` client for model-backed explanation and command generation, so the primary setup path does not require manually creating an API key.

## Install

```bash
npm install
```

## Usage

Explain a command:

```bash
npm run dev -- explain "tar -czf backup.tgz ~/Documents"
```

Generate a command from plain English:

```bash
npm run dev -- make "archive my Documents folder into backup.tgz"
```

Auto-detect command vs natural language:

```bash
npm run dev -- run "find all jpg files modified today"
```

Start interactive mode:

```bash
npm run dev
```

## Flags

- `--json` prints the structured result as JSON
- `--yes` skips the execution confirmation prompt

## Verification

Run the full test suite with:

```bash
npm run check
```
