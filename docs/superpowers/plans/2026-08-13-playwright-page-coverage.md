# Playwright Page Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Playwright seed deterministic beta data, verify every public browser page, and suppress the Node warnings emitted by the Playwright-managed web server.

**Architecture:** Extend the existing Playwright smoke test into a real browser journey from the homepage to the seeded ticker page and a seeded property detail page. Configure the existing `webServer` lifecycle to run the guarded, Node-native beta seeder before build/preview and pass warning-control environment variables only to that subprocess.

**Tech Stack:** Playwright Test 1.61, SvelteKit/Vite preview, npm scripts, Prisma beta seeder, TypeScript.

## Global Constraints

- Seed only through the existing `npm run db:seed:beta` command, which is guarded to `housefire_beta`.
- Do not expose database credentials or API keys in test code, config, logs, or documentation.
- Keep the browser coverage scoped to the three public page routes: `/`, `/properties/HFTEST`, and `/properties/HFTEST/:id`.
- Discover the detail-page id from the rendered property link; do not hard-code generated Prisma ids.
- Set `NODE_NO_WARNINGS=1` and `FORCE_COLOR=0` only in Playwright's `webServer.env` configuration.
- Preserve the existing system Chrome override and the existing homepage content assertions.

---

### Task 1: Add the seeded public-page browser journey

**Files:**

- Modify: `tests/test.ts`

**Interfaces:**

- Consumes: Playwright's existing `page` fixture and the `HFTEST` records created by the existing beta seeder.
- Produces: A browser test named `all public data pages render seeded beta data` that follows the homepage → ticker → property-detail path and asserts meaningful rendered content.

- [x] **Step 1: Write the failing test**

Append this test to `tests/test.ts`:

```ts
test('all public data pages render seeded beta data', async ({ page }) => {
  await page.goto('/');
  const tickerLink = page.getByRole('link', { name: 'HFTEST View properties', exact: true });
  await expect(tickerLink).toBeVisible();

  await tickerLink.click();
  await expect(page).toHaveURL(/\/properties\/HFTEST$/);
  await expect(page).toHaveTitle('Housefire | HFTEST Property Data');
  await expect(page.getByRole('heading', { name: 'HFTEST Properties' })).toBeVisible();
  await expect(page.locator('#map')).toHaveClass(/leaflet-container/);
  await expect(
    page.getByRole('link', { name: 'View North Harbor Logistics property details' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'View Front Range Distribution Center property details' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'View Peachtree Industrial Campus property details' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'View North Harbor Logistics property details' }).click();
  await expect(page).toHaveURL(/\/properties\/HFTEST\/[^/]+$/);
  await expect(page).toHaveTitle('Housefire | HFTEST | North Harbor Logistics Property Details');
  await expect(page.getByRole('heading', { name: 'North Harbor Logistics' })).toBeVisible();
  await expect(
    page.getByRole('banner').getByText('101 Harbor Way, Seattle, WA 98101, USA', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Property location' })).toBeVisible();
  await expect(page.locator('#property-map')).toHaveClass(/leaflet-container/);
  await expect(page.getByText('Square footage', { exact: true })).toBeVisible();
  await expect(page.getByText('120,000', { exact: true })).toBeVisible();
  await expect(page.getByText('Year built', { exact: true })).toBeVisible();
  await expect(page.getByText('2018', { exact: true })).toBeVisible();
  await expect(page.getByText('Lease term', { exact: true })).toBeVisible();
  await expect(page.getByText('12 years', { exact: true })).toBeVisible();
  await expect(page.getByText('47.606', { exact: true })).toBeVisible();
  await expect(page.getByText('-122.332', { exact: true })).toBeVisible();
});
```

- [x] **Step 2: Run the integration test to verify it fails for missing seeded data**

Run:

```bash
npm run test:integration -- tests/test.ts
```

Expected: the existing smoke test passes, while `all public data pages render seeded beta data` fails when the homepage cannot find the `HFTEST` link because the current `webServer.command` does not seed the beta database.

- [x] **Step 3: Run the focused formatter check**

Run:

```bash
npx prettier --check tests/test.ts
```

Expected: the file is formatted after the test is added.

- [x] **Step 4: Commit the test-only change**

```bash
git add tests/test.ts
git commit -m "test: cover seeded public pages"
```

### Task 2: Seed and quiet the Playwright web server

**Files:**

- Modify: `playwright.config.ts`
- Modify: `package.json`
- Modify: `src/lib/server/db/seedBetaTestData.ts`
- Modify: `src/localEnvironment.test.ts`
- Modify: `tsconfig.json`
- Modify: `src/lib/components/Seo.svelte`

**Interfaces:**

- Consumes: The existing `npm run db:seed:beta`, `npm run build`, and `npm run preview` scripts.
- Produces: A Playwright web-server lifecycle that resets/creates beta fixtures before every run and passes `NODE_NO_WARNINGS=1` plus `FORCE_COLOR=0` only to its child processes.

- [x] **Step 1: Update the web-server command and environment**

Change the `webServer` block to:

```ts
  webServer: {
    command: 'npm run db:seed:beta && npm run build && npm run preview',
    port: 4173,
    env: {
      NODE_NO_WARNINGS: '1',
      FORCE_COLOR: '0',
    },
  },
```

Keep the existing Chrome executable selection and test-directory configuration unchanged.

- [x] **Step 2: Run the focused integration suite to verify it passes without the noisy warnings**

Run:

```bash
npm run test:integration -- tests/test.ts
```

Expected: all tests in `tests/test.ts` pass; the output contains no `[WebServer]` lines matching `File descriptor .* unmanaged mode` and no `NO_COLOR` warning.

- [x] **Step 3: Run repository checks relevant to the changed files**

Run:

```bash
npx prettier --check tests/test.ts playwright.config.ts
npx eslint tests/test.ts playwright.config.ts
npm run check
```

Expected: Prettier, ESLint, and Svelte/TypeScript checks exit successfully.

- [x] **Step 4: Commit the web-server configuration change**

```bash
git add playwright.config.ts
git commit -m "test: seed beta data for Playwright"
```

### Execution corrections

The original `vite-node` beta seed command entered SvelteKit's browser-only guard under the current dependency versions. The beta seeder now creates its Prisma client directly under Node 24 using `--experimental-strip-types`, while retaining the database-environment guard and transaction reset behavior. The public `Seo` component also recomputes its title when client-side navigation changes page data, which the new browser journey verifies.

### Final verification

- [x] **Step 1: Run the complete integration suite**

```bash
npm run test:integration
```

Expected: all integration tests pass, with no unmanaged-file-descriptor or `NO_COLOR` warning lines.

- [x] **Step 2: Run the complete unit suite**

```bash
npm run test:unit -- --run
```

Expected: all Vitest tests pass.

- [x] **Step 3: Inspect the final diff and worktree**

```bash
git diff --check HEAD~2..HEAD
git status --short
git log -2 --oneline
```

Expected: only the intended test, Playwright, seeder, TypeScript, environment-test, and SEO changes are present alongside the committed design/plan docs; no environment or build output is present.
