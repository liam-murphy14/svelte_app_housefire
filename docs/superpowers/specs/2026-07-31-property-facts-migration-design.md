# Property facts database migration

## Context

The application schema and generated Prisma client now include `Property.facts`,
but the deployed PostgreSQL database predates that field. Property reads fail
because Prisma selects the missing column. The repository currently has no
tracked Prisma migrations and no command for applying schema changes during a
release.

## Goals

- Add the missing `Property.facts` column without changing existing property
  query behavior.
- Preserve existing records by giving the column an empty-array JSON default.
- Track the schema change in version control and expose an explicit deployment
  command for future schema updates.
- Apply the migration to the configured direct database connection now.

## Design

Add one Prisma migration containing the equivalent of:

```sql
ALTER TABLE "Property"
ADD COLUMN "facts" JSONB NOT NULL DEFAULT '[]'::jsonb;
```

Add `db:migrate` to `package.json` with `prisma migrate deploy`. Prisma will
record the migration in its `_prisma_migrations` table and skip it on later
deployments. The release process must run this command against `DB_URL_DIRECT`
before serving an application build that uses the new Prisma client. The
runtime application continues to use `DB_URL` through the existing adapter.

No query helper or page changes are required: Prisma scalar reads already
include `facts`, and the existing facts validation/display code handles the
default empty array.

## Verification

- Confirm the migration SQL and Prisma schema agree.
- Run the migration against the configured direct database and confirm Prisma
  reports it applied successfully or is already current.
- Run `npm run check`, `npm run lint`, `npm run test:unit`, and `npm run build`.
- Inspect the final diff and ensure no environment files or generated build
  output are included.

## Non-goals

- Do not remove `facts` from reads to mask an out-of-date database.
- Do not change runtime connection handling.
- Do not add a normalized facts table or a separate facts API.
