# cmdlens UX Design

**Date:** 2026-03-07

## Goal

Improve `cmdlens` user experience while Codex is working by showing active progress, timing out stalled requests, and translating common Codex failures into friendly guidance.

## Approved Behavior

- Show a spinner and status text immediately when `cmdlens` sends a request to Codex.
- Stop the spinner when a response arrives and render the normal result.
- If Codex takes too long, stop waiting after a fixed timeout and show:
  - a short practical error
  - a detail block with likely causes
  - retry guidance including `codex login status`
- Keep `--json` output machine-readable on stdout while still allowing spinner and status feedback on stderr.

## Approach

Use a minimal local wrapper around the existing Codex invocation flow:

- Add a small CLI feedback utility for spinner/status lifecycle.
- Add a fixed timeout around `codex exec`.
- Introduce typed Codex-facing errors for timeout, missing binary, auth/login problems, network/service failures, and malformed output.
- Render friendly user-facing errors in the CLI instead of raw stack traces.

## Scope

Included:

- spinner on stderr
- human-friendly status lines
- fixed timeout
- friendly error mapping
- JSON-safe stderr/stdout split

Excluded:

- automatic retry
- event-stream progress from `codex --json`
- configurable timeout values
