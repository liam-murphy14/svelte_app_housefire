# PgBouncer Connection Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route Housefire runtime queries through PgBouncer via `DB_URL` while routing Prisma CLI commands directly to PostgreSQL via `DB_URL_DIRECT`.

**Architecture:** Keep the existing `PrismaPg` runtime singleton unchanged so SvelteKit server routes continue using the PgBouncer connection. Change only Prisma CLI datasource configuration to read the direct connection variable, and document both variables in the safe environment template.

**Tech Stack:** Prisma 7.9.0, `@prisma/adapter-pg`, `pg`, SvelteKit, TypeScript, npm scripts.

## Global Constraints

- Use `DB_URL` for the PgBouncer transaction-pool runtime connection.
- Use `DB_URL_DIRECT` for direct PostgreSQL Prisma CLI commands.
- Do not append `pgbouncer=true`; the deployment uses PgBouncer 1.25.
- Keep PgBouncer in transaction mode with `max_prepared_statements` greater than zero.
- Do not commit credentials or modify generated Prisma/Zod output.
- Do not change runtime pool tuning without observed connection or timeout symptoms.

---

### Task 1: Separate Prisma runtime and CLI connection variables

**Files:**

- Modify: `prisma.config.ts:6-8`
- Modify: `.env.example:1-2`

**Interfaces:**

- Runtime consumer: `src/lib/server/db/prisma.ts` continues consuming `DB_URL`.
- CLI consumer: `prisma.config.ts` will consume `DB_URL_DIRECT`.
- Environment contract: `.env.example` will document `DB_URL`, `DB_URL_DIRECT`, and `SELF_API_KEY` without values.

- [x] **Step 1: Update Prisma CLI configuration**

Change the datasource URL in `prisma.config.ts` from `env('DB_URL')` to `env('DB_URL_DIRECT')`:

```ts
datasource: {
  url: env('DB_URL_DIRECT'),
},
```

- [x] **Step 2: Document both safe environment variable names**

Set `.env.example` to:

```env
# PgBouncer transaction-pool connection used by the deployed application.
DB_URL=

# Direct PostgreSQL connection used by Prisma CLI commands.
DB_URL_DIRECT=

SELF_API_KEY=
```

- [x] **Step 3: Run configuration validation without exposing credentials**

Run:

```sh
DB_URL_DIRECT='postgresql://placeholder:placeholder@localhost:5432/placeholder' npx prisma validate
```

Expected: Prisma validates `prisma/schema.prisma` successfully without attempting to use the runtime PgBouncer variable.

- [x] **Step 4: Run repository checks**

Run:

```sh
npm run check
npm run build
npm run lint
npm run test:unit
```

Expected: each command exits with status 0. If integration tests are attempted, report any PostgreSQL availability failure separately from code failures.

- [x] **Step 5: Review the final diff**

Run:

```sh
git diff --check
git status --short
git diff -- prisma.config.ts .env.example
```

Expected: only the intended configuration and environment-template changes are present, with no credentials or generated output.

- [x] **Step 6: Commit the implementation**

```sh
git add prisma.config.ts .env.example
git commit -m "fix: separate PgBouncer and direct Prisma URLs"
```
