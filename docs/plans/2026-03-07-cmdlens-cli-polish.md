# cmdlens CLI Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the readability and visual polish of `cmdlens` terminal output with better spacing, color, section layout, and cleaner status transitions.

**Architecture:** Keep the change narrowly scoped to rendering and status output. The CLI will keep the same command flow and data model, but the renderer will format output as visually distinct sections and the status reporter will clear spinner lines correctly before printing terminal messages.

**Tech Stack:** TypeScript, Vitest, Picocolors

---

### Task 1: Add renderer formatting tests

**Files:**
- Create: `tests/cli/render.test.ts`

**Step 1: Write the failing test**

Add tests that verify:
- result rendering uses section-style headings and spacing
- execution rendering shows a dedicated execution heading and output block
- status success lines do not leak leftover spinner text

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/cli/render.test.ts`
Expected: FAIL because the current renderer is still inline and the status line clearing behavior is incomplete.

**Step 3: Write minimal implementation**

No implementation yet. Stop at the failing test.

### Task 2: Implement polished CLI rendering

**Files:**
- Modify: `src/cli/render.ts`
- Modify: `src/cli/status.ts`
- Test: `tests/cli/render.test.ts`

**Step 1: Implement minimal rendering changes**

Update the renderer to:
- add colorful section headings
- render command/output as blocks
- add spacing between sections
- present alternatives as a list
- render execution state more clearly

Update the status helper to clear the full line before writing the success/failure message.

**Step 2: Run targeted tests**

Run: `npm test -- tests/cli/render.test.ts`
Expected: PASS

**Step 3: Run adjacent CLI tests**

Run: `npm test -- tests/cli/cmdlens.test.ts tests/cli/status.test.ts`
Expected: PASS

### Task 3: Full verification

**Files:**
- Modify: `README.md` only if the user-facing description needs a wording tweak

**Step 1: Run full verification**

Run: `npm run build`
Expected: PASS

Run: `npm run check`
Expected: PASS
