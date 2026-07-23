# Build and Type-Checking Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the current dependency line and source code so Housefire builds, type-checks, lints, and runs its maintained tests without downgrading dependencies.

**Architecture:** Keep the existing SvelteKit route structure, Prisma query modules, and Vercel adapter. Make one dependency/configuration change set for Tailwind and Prettier, one server/type-safety change set for environment, seed, and Zod handling, and one UI/test change set for markup and smoke coverage. Integrate only after each disjoint task has been reviewed.

**Tech Stack:** SvelteKit, Svelte 5, Vite 8, Tailwind CSS 4, PostCSS, TypeScript, Prisma 7, Zod 4, Vitest, Playwright, npm.

## Global Constraints

- Preserve current dependency major versions; do not downgrade packages.
- Keep `.env` ignored and never commit real credentials.
- Do not hand-edit `src/lib/utils/prismaGeneratedZod/index.ts`.
- Preserve the API key requirement and existing API status behavior.
- Keep worker write sets disjoint; workers must not revert another worker's changes.
- Use tests to lock behavior for the shared Zod error formatting helper.

---

### Task 1: Align Tailwind 4, Node typings, and Prettier configuration

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json` through npm install commands
- Modify: `postcss.config.cjs`
- Modify: `src/app.css`
- Modify: `.prettierignore`
- Modify: `.prettierrc`

**Interfaces:**

- Produces a Tailwind 4 PostCSS pipeline that consumes the existing `tailwind.config.cjs` theme through `src/app.css`.
- Produces repository commands that invoke Prettier 3 without removed plugin-search options.

- [x] **Step 1: Add the Tailwind 4 PostCSS adapter and Node types**

Run:

```sh
npm install --save-dev @tailwindcss/postcss @types/node
```

Expected: `package.json` and `package-lock.json` include the two dev dependencies without changing package major versions.

- [x] **Step 2: Update PostCSS and Tailwind entrypoint**

Use this PostCSS configuration:

```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

Use this beginning for `src/app.css`:

```css
@config '../tailwind.config.cjs';
@import 'tailwindcss/index.css';
```

Expected: no direct `tailwindcss()` PostCSS call remains. The existing Housefire theme remains available through `@config`; the reusable `.hf-*` typography classes are expressed as plain CSS because Tailwind 4 cannot resolve the legacy custom `@apply` utilities reliably in this setup.

- [x] **Step 3: Remove obsolete Prettier settings**

Change the `lint` script to:

```json
"lint": "prettier --check . && eslint ."
```

Remove `pluginSearchDirs` from `.prettierrc`, and add this generated path to `.prettierignore`:

```text
src/lib/utils/prismaGeneratedZod/index.ts
```

Expected: Prettier no longer warns about unknown plugin-search settings and does not demand hand-formatting of generated output.

- [x] **Step 4: Run targeted verification**

Run:

```sh
npm run check
npm run build
npx prettier --check package.json postcss.config.cjs src/app.css .prettierrc .prettierignore
```

Expected: Tailwind preprocessing errors are gone. Any remaining check errors belong to Tasks 2 or 3 and are recorded rather than hidden.

### Task 2: Fix server environment, validation, and seed typing

**Files:**

- Modify: `src/hooks.server.ts`
- Modify: `src/lib/server/db/seed.ts`
- Create: `src/lib/server/validation.ts`
- Create: `src/lib/server/validation.test.ts`
- Modify: `src/routes/api/geocodes/+server.ts`
- Modify: `src/routes/api/properties/+server.ts`
- Modify: `src/routes/api/reits/+server.ts`
- Create: `.env.example`

**Interfaces:**

- `formatZodError(error: ZodError): string` returns comma-separated messages from `error.issues`.
- The API hook reads `env.SELF_API_KEY` at runtime and preserves 401 for missing headers and 403 for non-matching keys.

- [x] **Step 1: Write the failing validation-helper test**

Create `src/lib/server/validation.test.ts` with this behavior:

```ts
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { formatZodError } from './validation';

describe('formatZodError', () => {
  it('joins Zod issue messages in input order', () => {
    const result = z.object({ ticker: z.string().min(1), count: z.number() }).safeParse({
      ticker: '',
      count: 'not a number',
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(formatZodError(result.error)).toBe(
      'Too small: expected string to have >=1 characters, Invalid input: expected number, received string',
    );
  });
});
```

- [x] **Step 2: Run the test to verify it fails**

Run:

```sh
npx vitest run src/lib/server/validation.test.ts
```

Expected: FAIL because `./validation` and `formatZodError` do not exist yet.

- [x] **Step 3: Implement the helper and update handlers**

Implement:

```ts
import type { ZodError } from 'zod';

export const formatZodError = (error: ZodError): string => {
  return error.issues.map((issue) => issue.message).join(', ');
};
```

Replace each repeated `e.errors.map(...)` block in the three API handlers with `formatZodError(e)`, importing the helper from `$lib/server/validation`.

- [x] **Step 4: Run the test to verify it passes**

Run:

```sh
npx vitest run src/lib/server/validation.test.ts
```

Expected: 1 test passes.

- [x] **Step 5: Fix environment and seed inputs**

Update the hook to import `env` from `$env/dynamic/private` and compare the request header against `env.SELF_API_KEY`. Preserve the existing 401/403 branches. Add `DB_URL=` and `SELF_API_KEY=` placeholder entries to `.env.example`. Add unique `addressInput` values to both seeded properties.

- [x] **Step 6: Run server-focused verification**

Run:

```sh
npx vitest run src/lib/server/validation.test.ts
npm run check
```

Expected: the environment, seed, and Zod errors are gone; any remaining diagnostics are outside this task.

### Task 3: Correct UI markup and integration coverage

**Files:**

- Modify: `src/lib/components/SortableTable.svelte`
- Modify: `tests/test.ts`

**Interfaces:**

- `SortableTable` retains its existing props and sorting/click behavior.
- The Playwright smoke test asserts stable Housefire homepage content instead of starter-template text.

- [x] **Step 1: Update the browser assertion**

Change the smoke test to assert stable Housefire content:

```ts
await expect(page.getByAltText('Housefire Logo')).toBeVisible();
await expect(
  page.getByText('See fine-grained property data for your favorite REITs'),
).toBeVisible();
```

The existing `<thead>` warning is the reproduction for the markup fix; no production behavior test is needed beyond `svelte-check`'s warning count.

- [x] **Step 2: Fix table semantics minimally**

Wrap the generated header cells in a `<tr>` inside `<thead>`, leaving the header iteration, click handlers, icons, and sorting code unchanged.

- [x] **Step 3: Run targeted verification**

Run:

```sh
npx prettier --check src/lib/components/SortableTable.svelte tests/test.ts
npm run check
```

Expected: the invalid `<th>` placement warning is gone and the homepage assertion matches the Housefire page.

### Task 4: Integrate, update repository guidance, and verify the full baseline

**Files:**

- Modify: `AGENTS.md`

**Interfaces:**

- No runtime interface changes. Documentation reflects the repaired commands and no longer claims the fixed issues are current failures.

- [x] **Step 1: Review worker diffs for conflicts and scope**

Check that Tasks 1–3 touched only their assigned files and that generated output, `.env`, `.svelte-kit`, and `node_modules` are not part of the change.

- [x] **Step 2: Run the applicable verification suite**

Run:

```sh
npm run check
npm run build
npm run lint
npm run test:unit
```

Expected: static checks, build, unit tests, formatting, and diff checks exit successfully. Integration testing is intentionally deferred because it requires local preview-server binding and a reachable PostgreSQL database.

- [x] **Step 3: Update `AGENTS.md`**

Remove the now-fixed Tailwind, environment, seed, Zod, table, and Prettier failures from the current verification baseline. Keep any verified external/test-environment limitations and record the new passing command results.

- [x] **Step 4: Inspect final status and diff**

Run:

```sh
git status --short
git diff --check
git diff --stat
```

Expected: only intentional source/config/test/docs files are modified, with no whitespace errors or secrets.
