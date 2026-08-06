# Local beta environment design

## Goal

Make the default local Housefire development server use the Housefire beta
database while keeping production migrations available through an explicit,
separate command.

The beta infrastructure is the PostgreSQL setup documented in the recent
`nixos-configs` commits: database and role `housefire_beta`, PgBouncer on port
`6432`, and direct PostgreSQL on port `5432` at `rbpi.liammurphydev.com`.

## Constraints

- The default local `.env` must target only `housefire_beta`.
- The existing production `.env` values must be preserved in the ignored
  `.env.production` file without being printed or committed.
- Runtime application traffic must use `DB_URL` through PgBouncer on port
  `6432`.
- Prisma CLI migration traffic must use `DB_URL_DIRECT` through PostgreSQL on
  port `5432`.
- Beta and production migration commands must be named separately:
  `npm run db:migrate:beta` and `npm run db:migrate:prod`.
- The generic `npm run db:migrate` command must not remain as an ambiguous
  migration target.
- The local beta `SELF_API_KEY` must be separate from the production key.
- No passwords, API keys, SCRAM verifiers, or `.env` contents may enter the
  repository or documentation.

## Environment files

`.env` remains the file loaded by default by SvelteKit and Prisma. Its
non-secret contract is:

```text
DB_URL=postgresql://housefire_beta:<beta-password>@rbpi.liammurphydev.com:6432/housefire_beta
DB_URL_DIRECT=postgresql://housefire_beta:<beta-password>@rbpi.liammurphydev.com:5432/housefire_beta
SELF_API_KEY=<local-beta-api-key>
```

The password must be URL-encoded when required by the connection-string
parser. The beta database password is not derivable from the NixOS SCRAM
verifier, so the implementation must not guess or copy the production
password.

`.env.production` is an ignored local file containing the existing production
values. It is used only by the explicit production migration command and is
never checked into git.

## Package commands

Update `package.json` with these commands:

```json
"db:migrate:beta": "DOTENV_CONFIG_PATH=.env prisma migrate deploy",
"db:migrate:prod": "DOTENV_CONFIG_PATH=.env.production prisma migrate deploy"
```

The existing `db:migrate` entry is removed. Setting `DOTENV_CONFIG_PATH`
selects the environment file consumed by the existing `import 'dotenv/config'`
in `prisma.config.ts`; the Prisma datasource continues to read
`DB_URL_DIRECT`.

## Documentation

Update `.env.example` to describe beta as the local default and explain the
two connection paths. Update `AGENTS.md` so its setup, command table, and
migration guidance use the explicit beta and production commands and warn
that production migration requires `.env.production`.

The documentation must explain that the local app's API key is only for
authenticating requests to the local beta-configured server. It must not imply
that production credentials may be reused.

## Data flow and safety

For normal local development:

```text
browser / local API client
        -> local SvelteKit server
        -> DB_URL -> PgBouncer:6432 -> housefire_beta
```

For beta migrations:

```text
npm run db:migrate:beta
        -> .env -> DB_URL_DIRECT -> PostgreSQL:5432 -> housefire_beta
```

For production migrations:

```text
npm run db:migrate:prod
        -> .env.production -> DB_URL_DIRECT -> PostgreSQL:5432 -> housefire
```

No application code or Prisma schema changes are required. The runtime Prisma
singleton remains on `DB_URL`, and `prisma.config.ts` remains on
`DB_URL_DIRECT`.

## Verification

The implementation will verify:

- the package scripts point to the intended environment files;
- `.env.example` and `AGENTS.md` contain no credentials;
- Prisma configuration validation works with a placeholder direct URL;
- `npm run check`, `npm run build`, `npm run lint`, and `npm run test:unit`
  pass;
- `git diff --check` passes and ignored production/beta environment files are
  absent from the tracked diff; and
- the final repository status contains only intentional tracked changes.

Database connectivity will be tested only if the beta password is available
locally; connection failures will be reported separately from code or
configuration failures.
