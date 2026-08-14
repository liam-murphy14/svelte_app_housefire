# Playwright Page Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Playwright seed deterministic beta data, verify every public browser page, and suppress the Node warnings emitted by the Playwright-managed web server.

**Architecture:** Extend the existing Playwright smoke test into a real browser journey from the homepage to the seeded ticker page and a seeded property detail page. Configure the existing `webServer` lifecycle to run the guarded beta seeder before build/preview and pass warning-control environment variables only to that subprocess.

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

- [ ] **Step 1: Write the failing test**

Append this test to `tests/test.ts`:

```ts
test('all public data pages render seeded beta data', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'HFTEST', exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'HFTEST', exact: true }).click();
  await expect(page).toHaveURL(/\/properties\/HFTEST$/);
  await expect(page).toHaveTitle('Housefire | HFTEST Property Data');
  await expect(page.getByRole('heading', { name: 'HFTEST Properties' })).toBeVisible();
  await expect(page.locator('#map')).toHaveClass(/leaflet-container/);
  await expect(
    page.getByRole('link', { name: 'View North Harbor Logistics property details' }),
  ).toBeVisible();
  await expect(page.getByText('Front Range Distribution Center', { exact: true })).toBeVisible();
  await expect(page.getByText('Peachtree Industrial Campus', { exact: true })).toBeVisible();

  await page
    .getByRole('link', { name: 'View North Harbor Logistics property details' })
    .click();
  await expect(page).toHaveURL(/\/properties\/HFTEST\/[^/]+$/);
  await expect(page).toHaveTitle(
    'Housefire | HFTEST | North Harbor Logistics Property Details',
  );
  await expect(page.getByRole('heading', { name: 'North Harbor Logistics' })).toBeVisible();
  await expect(
    page.getByText('101 Harbor Way, Seattle, WA 98101, USA', { exact: true }),
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

- [ ] **Step 2: Run the integration test to verify it fails for missing seeded data**

Run:

```bash
npm run test:integration -- tests/test.ts
```

Expected: the existing smoke test passes, while `all public data pages render seeded beta data` fails when the homepage cannot find the `HFTEST` link because the current `webServer.command` does not seed the beta database.

- [ ] **Step 3: Run the focused formatter check**

Run:

```bash
npx prettier --check tests/test.ts
```

Expected: the file is formatted after the test is added.

- [ ] **Step 4: Commit the test-only change**

```bash
git add tests/test.ts
git commit -m "test: cover seeded public pages"
```

### Task 2: Seed and quiet the Playwright web server

**Files:**
- Modify: `playwright.config.ts`

**Interfaces:**
- Consumes: The existing `npm run db:seed:beta`, `npm run build`, and `npm run preview` scripts.
- Produces: A Playwright web-server lifecycle that resets/creates beta fixtures before every run and passes `NODE_NO_WARNINGS=1` plus `FORCE_COLOR=0` only to its child processes.

- [ ] **Step 1: Update the web-server command and environment**

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

- [ ] **Step 2: Run the focused integration suite to verify it passes without the noisy warnings**

Run:

```bash
npm run test:integration -- tests/test.ts
```

Expected: all tests in `tests/test.ts` pass; the output contains no `[WebServer]` lines matching `File descriptor .* unmanaged mode` and no `NO_COLOR` warning.

- [ ] **Step 3: Run repository checks relevant to the changed files**

Run:

```bash
npx prettier --check tests/test.ts playwright.config.ts
npx eslint tests/test.ts playwright.config.ts
npm run check
```

Expected: Prettier, ESLint, and Svelte/TypeScript checks exit successfully.

- [ ] **Step 4: Commit the web-server configuration change**

```bash
git add playwright.config.ts
git commit -m "test: seed beta data for Playwright"
```

### Final verification

- [ ] **Step 1: Run the complete integration suite**

```bash
npm run test:integration
```

Expected: all integration tests pass, with no unmanaged-file-descriptor or `NO_COLOR` warning lines.

- [ ] **Step 2: Run the complete unit suite**

```bash
npm run test:unit -- --run
```

Expected: all Vitest tests pass.

- [ ] **Step 3: Inspect the final diff and worktree**

```bash
git diff --check HEAD~2..HEAD
git status --short
git log -2 --oneline
```

Expected: only `tests/test.ts` and `playwright.config.ts` are implementation changes, the committed design/plan docs are intentional, and no environment or build output is present.

