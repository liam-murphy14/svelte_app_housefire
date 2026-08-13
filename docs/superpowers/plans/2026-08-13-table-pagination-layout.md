# Table Pagination Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the desktop `SortableTable` controls so search stays above the table while pagination, page size, and result summary live in a sticky table footer, with 10 rows as the default page size.

**Architecture:** Keep filtering, sorting, pagination state, and page-number calculation inside `SortableTable.svelte`. Split only the rendered controls: a top search toolbar, a bounded scroll container containing the table and sticky pagination footer, and the existing table markup. Preserve the opt-in `enablePagination` API and the separate mobile property-card behavior.

**Tech Stack:** Svelte 5, TypeScript, Tailwind CSS 4, Vitest, `svelte/server`, and happy-dom component tests.

## Global Constraints

- Keep server-only code out of browser components; this change is client-rendered UI only.
- Preserve existing filtering, sorting, page clamping, accessible labels, and mobile behavior.
- Keep pagination controls opt-in through the existing `enablePagination` prop.
- Use 10 as the initial `rowsPerPage` value while preserving the existing 10, 25, 50, and 100 options.
- Do not hand-edit generated Prisma/Zod output or change dependencies.
- Run focused tests first, then `npm run check`, `npm run lint`, and `npm run test:unit` before completion.

---

### Task 1: Split the table controls into a search toolbar and sticky footer

**Files:**
- Modify: `src/lib/components/SortableTable.svelte`
- Modify: `src/lib/components/SortableTable.test.ts`
- Modify: `src/lib/components/SortableTable.client.test.ts`

**Interfaces:**
- Consumes: the existing `SortableTable` props, table-data helpers, and current pagination behavior.
- Produces: the same `SortableTable` public props and callbacks, with the default page size changed to 10 and the controls rendered in their new positions.

- [ ] **Step 1: Add failing server-rendered layout and default-page-size assertions**

Update the existing paginated server-render test so 26 rows render a default first page containing rows 1 through 10, excluding row 11. Assert that the search label appears before the table markup and that the property-page navigation appears after the closing table markup. Keep assertions for the existing page-size options and result summary, updating the expected summary to `Showing 1–10 of 26 properties`.

- [ ] **Step 2: Add failing client-side placement assertions**

Add a focused assertion to the desktop-control tests that the search input appears before the table and the pagination navigation appears after the table in the rendered DOM. Keep the existing page navigation, search, page-size, sorting, and clamping tests as regression coverage, updating only expectations that depend on the new default of 10 rows.

- [ ] **Step 3: Run the focused tests and confirm they fail for the intended reasons**

Run:

```bash
npx vitest run src/lib/components/SortableTable.test.ts src/lib/components/SortableTable.client.test.ts
```

Expected: the updated default-page-size assertion fails because the component currently defaults to 25, and the placement assertion fails because all controls currently render before the table.

- [ ] **Step 4: Implement the smallest production change that satisfies the failing tests**

In `src/lib/components/SortableTable.svelte`:

- Change `rowsPerPage` from 25 to 10.
- Keep the search label/input in a compact top toolbar rendered before the table.
- Wrap the table and pagination footer in a bounded vertical scroll region that also supports horizontal overflow.
- Move the result summary, rows-per-page select, and existing page navigation into a footer rendered after `</table>`.
- Make that footer sticky to the bottom of the scroll region with an opaque Housefire background and a top border so it remains legible over table rows.
- Preserve the existing button labels, `aria-current`, `aria-label`, disabled states, and page-number generation.
- Keep the non-paginated render path free of the pagination toolbar/footer and preserve its current overflow behavior.

- [ ] **Step 5: Run the focused tests and confirm they pass**

Run:

```bash
npx vitest run src/lib/components/SortableTable.test.ts src/lib/components/SortableTable.client.test.ts
```

Expected: all tests in both files pass with zero failures.

- [ ] **Step 6: Format and run repository checks**

Run:

```bash
npx prettier --check src/lib/components/SortableTable.svelte src/lib/components/SortableTable.test.ts src/lib/components/SortableTable.client.test.ts
npm run check
npm run lint
npm run test:unit
```

Expected: each command exits with status 0; `svelte-check` reports 0 errors and 0 warnings, and unit tests report zero failures.

- [ ] **Step 7: Review the diff and commit the implementation**

Run:

```bash
git diff --check
git status --short
git diff -- src/lib/components/SortableTable.svelte src/lib/components/SortableTable.test.ts src/lib/components/SortableTable.client.test.ts
```

Confirm only the three intended component/test files changed, then commit:

```bash
git add src/lib/components/SortableTable.svelte src/lib/components/SortableTable.test.ts src/lib/components/SortableTable.client.test.ts
git commit -m "feat: refine property table pagination layout"
```
