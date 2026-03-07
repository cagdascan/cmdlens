# cmdlens UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add visible Codex progress feedback, timeout handling, and friendly Codex-specific error messages to `cmdlens`.

**Architecture:** The CLI will wrap Codex-backed work in a small status/spinner utility that writes to stderr. The Codex integration layer will enforce a timeout and translate low-level subprocess failures into typed application errors, which the CLI will render as concise guidance.

**Tech Stack:** TypeScript, Vitest, Commander, Inquirer, Execa

---

### Task 1: Status and Spinner Lifecycle

**Files:**
- Modify: `src/cli/status.ts`
- Modify: `src/bin/cmdlens.ts`
- Modify: `src/cli/interactive.ts`
- Test: `tests/cli/status.test.ts`

**Step 1: Write the failing test**

Add a test that verifies spinner-capable status reporting announces start and completion through an injected reporter.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/cli/status.test.ts`
Expected: FAIL because spinner lifecycle behavior is incomplete.

**Step 3: Write minimal implementation**

Extend the status helper to support:
- start message
- completion message
- injectable reporter hooks
- stderr default behavior suitable for human mode and `--json`

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/cli/status.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/cli/status.ts src/bin/cmdlens.ts src/cli/interactive.ts tests/cli/status.test.ts
git commit -m "feat: add Codex request status feedback"
```

### Task 2: Timeout and Friendly Codex Errors

**Files:**
- Modify: `src/core/codex.ts`
- Create: `src/core/errors.ts`
- Create: `src/cli/errors.ts`
- Test: `tests/core/codex.test.ts`
- Test: `tests/cli/errors.test.ts`

**Step 1: Write the failing tests**

Add tests that verify:
- Codex subprocess timeout becomes a typed timeout error
- auth/network/malformed-output failures are mapped into friendly CLI guidance

**Step 2: Run tests to verify they fail**

Run: `npm test -- tests/core/codex.test.ts tests/cli/errors.test.ts`
Expected: FAIL because typed Codex errors and friendly rendering do not exist yet.

**Step 3: Write minimal implementation**

Implement:
- a timeout constant for Codex requests
- typed Codex application errors
- stderr/stdout-friendly user error rendering
- message mapping for missing binary, timeout, login/auth, network, and malformed output

**Step 4: Run tests to verify they pass**

Run: `npm test -- tests/core/codex.test.ts tests/cli/errors.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/core/codex.ts src/core/errors.ts src/cli/errors.ts tests/core/codex.test.ts tests/cli/errors.test.ts
git commit -m "feat: add friendly Codex timeout and error handling"
```

### Task 3: Full Verification

**Files:**
- Modify: `README.md`

**Step 1: Write the failing documentation test if needed**

Only add a README assertion if the user-facing guidance changes materially.

**Step 2: Update docs**

Document that `cmdlens` shows progress while waiting on Codex and may ask users to verify login/network with `codex login status`.

**Step 3: Run full verification**

Run: `npm run build`
Expected: PASS

Run: `npm run check`
Expected: PASS

**Step 4: Commit**

```bash
git add README.md
git commit -m "docs: describe Codex progress and recovery guidance"
```
