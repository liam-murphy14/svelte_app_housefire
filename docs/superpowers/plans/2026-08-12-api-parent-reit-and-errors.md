# API Parent REIT and Errors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically create missing parent REIT records during property imports and return accurate HTTP errors for expected database failures.

**Architecture:** Keep the existing route/query-helper boundary. The property query helper will use a single Prisma transaction to upsert each distinct ticker and insert the batch. A shared server error mapper will convert known Prisma request errors into `HttpError` responses, while route handlers retain responsibility for logging and unexpected `500` responses.

**Tech Stack:** SvelteKit request handlers, Prisma 7, PostgreSQL, Vitest, TypeScript.

## Global Constraints

- Keep server-only code under `src/lib/server` or server route files.
- Treat `prisma/schema.prisma` as the source of truth; no schema change is needed.
- Keep request validation at the route boundary and database access in query modules.
- Preserve API-key authentication through `src/hooks.server.ts`.
- Run the narrowest relevant checks while iterating, then the full applicable checks before claiming completion.

---

### Task 1: Add Prisma error translation and route regression tests

**Files:**
- Create: `src/lib/server/prismaErrors.ts`
- Modify: `src/routes/api/geocodes/+server.ts`
- Modify: `src/routes/api/geocodes/byAddressInput/[addressInput]/+server.ts`
- Modify: `src/routes/api/properties/[id]/+server.ts`
- Modify: `src/routes/api/properties/byTicker/[ticker]/+server.ts`
- Modify: `src/routes/api/reits/+server.ts`
- Test: route-local tests for the changed handlers, adding files where absent.

**Interfaces:**
- Produce `getPrismaHttpError(error: unknown): HttpError | null` (or an equivalent typed helper) that maps Prisma codes `P2002` to `409`, `P2003` to `400`, and `P2025` to `404`.
- Preserve existing Zod `400` responses and successful JSON bodies.

- [ ] **Step 1: Write failing tests** for geocode lookup message, property missing-record behavior, delete missing-record behavior, and duplicate REIT/geocode creation status.
- [ ] **Step 2: Run the focused route tests** and verify the new assertions fail for the current generic/mislabelled responses.
- [ ] **Step 3: Implement the small Prisma error-mapping helper** and wrap the affected database calls without catching validation errors as database errors.
- [ ] **Step 4: Correct the geocode missing-record message** to `No geocode found`.
- [ ] **Step 5: Run the focused route tests** and verify they pass.

### Task 2: Atomically ensure parent REITs for property batches

**Files:**
- Modify: `src/lib/server/db/propertyQueries.ts`
- Test: `src/lib/server/db/propertyQueries.test.ts`

**Interfaces:**
- Keep `createManyProperties(propertiesToCreate: Prisma.PropertyCreateManyInput | Prisma.PropertyCreateManyInput[])` unchanged for callers.
- Use Prisma transaction-client methods to upsert each distinct `reitTicker` before `createManyAndReturn`.

- [ ] **Step 1: Write a failing query-helper test** showing a batch with `reitTicker: 'PLD'` upserts `PLD` before inserting properties.
- [ ] **Step 2: Run that focused test** and verify it fails because the current helper only calls `createManyAndReturn`.
- [ ] **Step 3: Implement a transaction** that normalizes the input to an array, derives unique tickers, calls `transaction.reit.upsert({ where: { ticker }, create: { ticker }, update: {} })`, and inserts the original batch through `transaction.property.createManyAndReturn`.
- [ ] **Step 4: Add coverage** for multiple distinct tickers and preserve single-object input behavior.
- [ ] **Step 5: Run the query-helper tests** and verify they pass.

### Task 3: Full verification and diff review

**Files:**
- Inspect all changed files and generated output; do not modify generated Prisma/Zod output.

- [ ] **Step 1: Run focused unit tests** for the changed route and query-helper files.
- [ ] **Step 2: Run `npm run check`.
- [ ] **Step 3: Run `npm run lint`.
- [ ] **Step 4: Run `npm run build`.
- [ ] **Step 5: Review `git diff` and `git status --short`** for unrelated edits, secrets, or generated output.
