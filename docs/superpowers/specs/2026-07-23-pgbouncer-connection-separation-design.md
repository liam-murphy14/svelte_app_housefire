# PgBouncer Connection Separation Design

## Goal

Configure Housefire for the repository's self-hosted PgBouncer deployment so runtime Prisma Client traffic uses PgBouncer while Prisma CLI schema and migration commands use a direct PostgreSQL connection.

## Context

Housefire uses Prisma 7.9.0 with `@prisma/adapter-pg` and `pg`. The runtime client is created once at module scope in `src/lib/server/db/prisma.ts`, and currently receives `DB_URL`. Prisma CLI configuration in `prisma.config.ts` also currently receives `DB_URL`, which would send CLI commands through PgBouncer.

The deployment uses PgBouncer 1.25 in transaction pooling mode with `max_prepared_statements` set to its default value of approximately 200. Prisma's current PgBouncer guidance says transaction mode is required, `pgbouncer=true` should not be added for PgBouncer 1.21 or later, and Prisma CLI commands should use a direct connection.

## Chosen approach

Keep `DB_URL` as the runtime connection string and document it as the PgBouncer URL. Use the existing Vercel variable `DB_URL_DIRECT` for the direct PostgreSQL connection and change `prisma.config.ts` to use `DB_URL_DIRECT`. Keep the runtime adapter unchanged because it already uses `DB_URL` and already exports one shared Prisma client instance.

The connection contract will be:

```env
# PgBouncer transaction-pool connection used by the deployed application.
DB_URL=

# Direct PostgreSQL connection used by Prisma CLI commands.
DB_URL_DIRECT=

SELF_API_KEY=
```

No `pgbouncer=true` query parameter will be added by the application because the deployment runs PgBouncer 1.25. The parameter, if needed for a different local or deployed PgBouncer version, remains the responsibility of the supplied connection URL.

## Scope boundaries

- Modify only `prisma.config.ts` and `.env.example`.
- Do not change Prisma models, generated output, runtime query helpers, or dependencies.
- Do not add connection pool tuning without observed limits or timeout symptoms; the existing `PrismaPg` adapter remains on its driver defaults.
- Do not place credentials in tracked files or logs.

## Data flow

- Vercel request/page/API route -> server query helper -> `PrismaClient`/`PrismaPg` -> `DB_URL` -> PgBouncer transaction pool -> PostgreSQL.
- Local/CI Prisma CLI command -> `prisma.config.ts` -> `DB_URL_DIRECT` -> PostgreSQL.

## Verification

Run `npm run check`, `npm run build`, `npm run lint`, and `npm run test:unit`. Verify the final diff contains only the intended configuration/documentation changes and no secret values. Database-backed integration tests remain dependent on a reachable PostgreSQL instance.
