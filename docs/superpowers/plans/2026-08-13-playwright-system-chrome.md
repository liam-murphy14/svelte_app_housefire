# Playwright System Chrome Integration Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `npm run test:integration` launch the locally installed Google Chrome without downloading or installing a Playwright browser.

**Architecture:** Keep the existing Playwright test runner and SvelteKit `webServer` lifecycle. Configure Playwright's Chromium project with an executable path selected from `PLAYWRIGHT_CHROME_PATH`, falling back to the standard macOS Google Chrome binary only on macOS so other environments retain Playwright's normal browser behavior.

**Tech Stack:** Playwright 1.61.1, TypeScript, SvelteKit, Vite, npm scripts.

## Global Constraints

- Work only in the isolated `.worktrees/integration-tests` worktree on branch `fix/integration-tests`.
- Do not install or update dependencies, run `npm install`, or modify `package.json`/`package-lock.json`.
- Use the supplied Chrome binary at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` for local macOS integration tests.
- Preserve the existing `npm run build && npm run preview` web-server lifecycle and the existing test assertions.
- Do not introduce Selenium or a new test framework; Playwright launches Chrome directly and does not require ChromeDriver.
- Keep the Chrome path overridable through `PLAYWRIGHT_CHROME_PATH` for other local installations and CI.
- Run the full applicable verification before claiming completion, recording database or host-permission failures precisely if they occur.

---

### Task 1: Configure Playwright to use system Chrome

**Files:**

- Modify: `playwright.config.ts`

**Interfaces:**

- Consumes: `process.env.PLAYWRIGHT_CHROME_PATH` and `process.platform`.
- Produces: Playwright `use.launchOptions.executablePath` set to the override when supplied, or to `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` on macOS; leaves launch options unset on non-macOS when no override is supplied.

- [x] **Step 1: Confirm the existing integration test is the failing regression case**

Run:

```bash
npm run test:integration
```

Expected before the configuration change: the SvelteKit build/preview reaches the browser phase, then Playwright reports that its cached Chromium executable is missing at `~/Library/Caches/ms-playwright/.../chrome-headless-shell`.

- [x] **Step 2: Implement the smallest configuration change**

Add a platform-aware executable selection to `playwright.config.ts`:

```ts
const chromeExecutablePath =
  process.env.PLAYWRIGHT_CHROME_PATH ??
  (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : undefined);
```

Pass it through the existing config without changing the web server or tests:

```ts
use: chromeExecutablePath
  ? { launchOptions: { executablePath: chromeExecutablePath } }
  : undefined,
```

- [x] **Step 3: Verify the integration test with the supplied Chrome**

Run:

```bash
npm run test:integration
```

Expected: the build and preview start, Playwright launches Google Chrome, and the test passes against the reachable beta PostgreSQL database.

- [x] **Step 4: Run applicable static and unit checks**

Run:

```bash
npm run check
npm run lint
npm run test:unit
npm run build
```

Expected: each command exits 0; existing optional `pg-native` and Cloudflare socket build warnings are acceptable if they remain unchanged.

- [x] **Step 5: Review the final diff and commit**

Run:

```bash
git diff --check
git status --short
git diff -- playwright.config.ts
```

Commit only the tracked configuration/plan changes from this task with:

```bash
git add playwright.config.ts docs/superpowers/plans/2026-08-13-playwright-system-chrome.md
git commit -m "test: use system Chrome for Playwright integration tests"
```
