# Housefire

Housefire is a SvelteKit application for browsing fine-grained property
holdings for real-estate investment trusts (REITs). The public site lists REIT
tickers and provides a ticker-specific property view with a Leaflet map,
property markers, a sortable table, and page-level SEO metadata.

This repository also provides server-side API routes for REIT, property, and
geocode records. Data is stored in PostgreSQL through Prisma. The companion
Python repository, [`python_serverless_housefire`](https://github.com/liam-murphy14/python_serverless_housefire),
collects and transforms property data before sending it to this app's API.

## Quick start

### Prerequisites

- [Nix](https://nixos.org/) and [direnv](https://direnv.net/) are recommended.
  The Nix flake provides Node.js and npm-related tooling.
- A reachable local beta PostgreSQL database.
- The beta database connection values and a local API key from the project
  maintainer.

### 1. Enter the development environment

Clone the repository and enter its directory:

```bash
git clone git@github.com:liam-murphy14/svelte_app_housefire.git
cd svelte_app_housefire
```

With direnv enabled, allow the repository environment:

```bash
direnv allow
```

Without direnv, enter the same Nix shell manually:

```bash
nix develop
```

If you already have a compatible Node.js and npm installation, you can use
those directly instead.

### 2. Configure local environment variables

Create a private local environment file:

```bash
cp .env.example .env
```

Fill in the beta values in `.env`:

```dotenv
# Runtime connection through the beta PgBouncer endpoint (port 6432).
DB_URL=

# Prisma CLI and migration connection through direct PostgreSQL (port 5432).
DB_URL_DIRECT=

# Local API authentication secret.
SELF_API_KEY=
```

Ask the project maintainer for the beta database connection values. Keep
`.env` private; it is ignored by git and must never contain committed
credentials.

### 3. Install dependencies

```bash
npm install
```

The `postinstall` script also runs `prisma generate`, which generates the
Prisma client and the Prisma-shaped Zod schemas used by the API routes.

### 4. Apply the beta database schema

```bash
npm run db:migrate:beta
```

This applies tracked Prisma migrations to the beta database using
`DB_URL_DIRECT`. Migrations do not run automatically when starting the app.

### 5. Load beta test data (optional)

```bash
npm run db:seed:beta
```

This is a full beta test-data reset: it deletes all REIT, property, and
geocode rows, then inserts the known fixtures. Do not run it against a shared
database unless resetting that data is intentional.

The older demo seed can be run with `npx prisma db seed`. It creates a small
`PLD` dataset and is a one-shot create rather than an upsert, so check the
database first and do not repeatedly run it against populated data.

### 6. Start the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The homepage lists the
available REIT tickers. A ticker-specific page is available at
`/properties/<ticker>`.

## Development workflow

The normal edit-and-check loop is:

```bash
npm run check
npm run lint
npm run test:unit
npm run dev
```

The beta-configured development server reads live data from PostgreSQL. The
public pages do not require an API header, but every `/api` request must
include the exact local `x-api-key` header matching `SELF_API_KEY`.

### Useful commands

| Command                          | Purpose                                                  |
| -------------------------------- | -------------------------------------------------------- |
| `npm run dev`                    | Start the Vite/SvelteKit development server.             |
| `npm run build`                  | Build the app for the Vercel adapter in beta mode.       |
| `npm run preview`                | Serve the beta-mode build locally.                       |
| `npm run check`                  | Run SvelteKit sync and `svelte-check`.                   |
| `npm run lint`                   | Check Prettier formatting and run ESLint.                |
| `npm run test:unit`              | Run Vitest tests under `src/`.                           |
| `npm run test:integration`       | Build, preview, and run Playwright tests under `tests/`. |
| `npm test`                       | Run integration tests followed by unit tests.            |
| `npm run db:migrate:beta`        | Apply tracked migrations to the beta database.           |
| `npm run db:seed:beta`           | Reset and repopulate beta test data.                     |
| `npx prisma generate`            | Regenerate Prisma Client and generated Zod schemas.      |
| `npx prettier --check README.md` | Check README formatting.                                 |

`npm run test:integration` and `npm test` need a reachable PostgreSQL database
because the homepage and property page load data at request time. The
Playwright setup also builds and previews the application before opening a
browser.

For a production migration, deliberately verify that `.env.production` points
to the production database before running:

```bash
npm run db:migrate:prod
```

Do not use the beta migration command for production credentials.

## Application structure

- `src/routes/` contains SvelteKit pages, server loads, and API handlers.
- `src/lib/components/` contains reusable Svelte UI components.
- `src/lib/server/db/` contains the Prisma singleton, query helpers, and seed
  scripts.
- `src/lib/utils/` contains small utilities and generated Prisma/Zod output.
- `prisma/schema.prisma` is the source of truth for the PostgreSQL models.
- `static/` contains the logo, favicon, and Leaflet marker assets.
- `tests/` contains Playwright browser tests.
- `src/**/*.test.ts` contains Vitest unit and server-route tests.

The homepage loads REIT tickers from `getAllTickers`. The property page loads
properties for a ticker, then creates the Leaflet map in `onMount` so browser-
only Leaflet code does not run during server-side rendering. Database access
stays in server-only modules and query helpers.

The main data models are:

- `Reit`, identified by a unique ticker.
- `Property`, related to a REIT through `reitTicker` and containing optional
  address, coordinate, and square-footage fields.
- `Geocode`, containing parsed address fields and required latitude/longitude
  values.

## API overview

API routes live under `src/routes/api/` and are protected globally by
`src/hooks.server.ts`:

- `/api/reits` lists and creates REIT records.
- `/api/properties` creates property records in bulk; property routes also
  support lookup and deletion by id or ticker.
- `/api/geocodes` lists and creates geocode records, including lookup by
  `addressInput`.

Request bodies are validated at the route boundary with generated Zod schemas.
Database operations belong in the query modules under `src/lib/server/db/`.
Missing API keys return `401`, an incorrect key returns `403`, and malformed
request data is intended to return `400`.

## Making changes safely

- Check `git status --short` before editing and preserve unrelated worktree
  changes.
- Keep Prisma, database clients, and private environment variables in server
  code. Do not import them into browser components.
- If `prisma/schema.prisma` changes, run `npx prisma generate` and create/apply
  the corresponding migration before deploying code that depends on it.
- Do not hand-edit `src/lib/utils/prismaGeneratedZod/index.ts`; it is generated
  from the Prisma schema.
- Add or update automated tests when changing a route or data contract.
- Do not commit `.env`, `.env.*`, `.direnv`, build output, or generated
  SvelteKit output.

The production deployment target is Vercel through
`@sveltejs/adapter-vercel`.
