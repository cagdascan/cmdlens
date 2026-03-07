# cmdlens CLI Polish Design

**Date:** 2026-03-07

## Goal

Make `cmdlens` output easier to scan and friendlier to use by improving spacing, color, and section formatting while keeping the CLI copyable and script-safe.

## Approved Direction

- Use some color and some spacing.
- Add light visual personality with a few emoji/symbol headers.
- Keep the UI text-based and compact rather than building a full-screen terminal interface.

## Visual Shape

- Major sections get visual headers such as:
  - `🧠 Explanation`
  - `▶ Command`
  - `⚠️ Risk`
  - `✨ Alternatives`
  - `✅ Execution`
- Commands and execution output render as their own blocks instead of single inline label/value lines.
- Add blank lines between major sections so command, explanation, risks, and execution output do not run together.
- Keep `--json` unchanged.

## Supporting Fix

The status reporter should fully clear the spinner line before writing success/failure text so stale spinner text does not bleed into the next line.
