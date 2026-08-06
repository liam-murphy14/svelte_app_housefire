# Housefire repository guide

This is the repository-level guide for agents and developers working on Housefire. There is no README or more-specific `AGENTS.md` in the repository; this file is the source of local project guidance unless a deeper directory adds its own instructions.

## Project at a glance

Housefire is a small SvelteKit application for browsing fine-grained property holdings for real-estate investment trusts (REITs). The public UI lists REIT tickers and exposes a ticker-specific property view with:

- a Leaflet/OpenStreetMap map with one marker per property;
- a sortable property table; and
- page-level SEO metadata.

The application also exposes server routes for managing REIT, property, and geocode records. Data is stored in PostgreSQL through Prisma. API routes are protected by a shared API key in the `x-api-key` request header.

The deployment adapter is `@sveltejs/adapter-vercel`, so Vercel is the intended production target unless the SvelteKit adapter is changed.

## Working agreement

- Read this file before changing application code, schema, build configuration, or generated output.
- Preserve existing user changes in a dirty worktree. Check `git status --short` before editing and keep unrelated changes out of the patch.
- Use subagent-driven development by default when executing implementation plans; use inline execution only for very small changes.
- Keep server-only code under `src/lib/server` or server route files. Do not import Prisma, private environment variables, or other server-only modules into browser components.
- Treat `prisma/schema.prisma` as the source of truth for database models. Do not hand-edit `src/lib/utils/prismaGeneratedZod/index.ts`; regenerate it after schema or generator changes.
- Do not commit `.env`, `.env.*`, `.direnv`, build output, or generated SvelteKit output. `.env.example` documents the required private variables without containing credentials.
- API changes must account for the global API-key hook, request validation, status codes, and the corresponding Prisma query helper.
- When changing a route or data contract, update or add an automated test. The existing suite is intentionally small, so do not treat passing smoke coverage as comprehensive behavior coverage.
- Run the narrowest relevant checks while iterating, then run the full applicable checks before claiming a change is complete.

## Toolchain and setup

The project is an npm-based, TypeScript-enabled SvelteKit app using Svelte 5, Vite, Tailwind CSS 4, Prisma 7 with the PostgreSQL driver adapter, Zod 4, Leaflet, Vitest, and Playwright. ESLint 10 uses the flat `eslint.config.js` configuration.

Required environment:

- `DB_URL`: local beta runtime PostgreSQL connection URL used by `src/lib/server/db/prisma.ts`, through PgBouncer on port `6432` to the `housefire_beta` database.
- `DB_URL_DIRECT`: local beta direct PostgreSQL connection URL required by `prisma.config.ts` and Prisma CLI migration work, through port `5432` to the `housefire_beta` database.
- `SELF_API_KEY`: local-only API authentication secret used by `src/hooks.server.ts` to authenticate every `/api` request on the beta-configured development server.

Create a local `.env` with those beta values before using the database or API; `.env` is the local beta default. `.env.production` is an ignored file reserved for production migration credentials. Keep beta and production API/database credentials separate. Never put actual credentials in either file in a commit. The current local `.env` contains a `DB_URL` key; do not expose its value in logs or documentation.

Node and npm can be provided through the Nix development shell. `.envrc` contains:

```sh
use flake .
layout node
```

The flake supplies `nodejs` and `npm-check-updates` on Linux and macOS for x86_64 and aarch64 systems. `npm install` runs the `postinstall` hook, which runs `prisma generate`.

Typical setup:

```sh
npm install
npm run check
npm run dev
```

The local development server is normally available at `http://localhost:5173`.

Apply tracked Prisma migrations to the local beta database through `DB_URL_DIRECT` with:

```sh
npm run db:migrate:beta
```

For production migrations, deliberately select `.env.production`, check that it targets production before execution, and run:

```sh
npm run db:migrate:prod
```

Do not run production migrations through the beta command. Neither migration command runs automatically through `npm run dev`, `npm run build`, or tests. Run the applicable migration command before deploying application code that depends on a new schema field, and inspect the migration and selected environment target before applying it.

The demo seed is configured in `package.json` as `vite-node ./src/lib/server/db/seed.ts`; with a reachable database it can be invoked through Prisma's seed command:

```sh
npx prisma db seed
```

The seed creates a `PLD` REIT with two sample properties. It uses a top-level create rather than an upsert, so it should be treated as a one-shot/demo seed and not repeatedly run against a populated database without checking for duplicates.

## Commands

All commands are defined in `package.json`:

| Command                    | Purpose                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run dev`              | Start Vite/SvelteKit development mode.                                                            |
| `npm run build`            | Build the SvelteKit app for the configured Vercel adapter.                                        |
| `npm run db:migrate:beta`  | Apply tracked migrations to `housefire_beta` through `DB_URL_DIRECT`.                             |
| `npm run db:migrate:prod`  | Apply tracked migrations to production through `.env.production`.                                 |
| `npm run preview`          | Serve the built app locally.                                                                      |
| `npm run check`            | Run SvelteKit sync and `svelte-check` with the repository TypeScript config.                      |
| `npm run lint`             | Check Prettier formatting, then run ESLint.                                                       |
| `npm run prettier`         | Rewrite the repository with Prettier; use carefully because it is broad.                          |
| `npm run test:unit`        | Run Vitest tests under `src`.                                                                     |
| `npm run test:integration` | Run Playwright tests under `tests`; its web server first runs `npm run build && npm run preview`. |
| `npm test`                 | Run integration tests first, then unit tests.                                                     |
| `npm run check:watch`      | Run `svelte-check` in watch mode.                                                                 |

Useful direct commands:

```sh
npx prisma generate
npx prisma db seed
npx prettier --check path/to/changed/file
npx eslint path/to/changed/file
```

## Current verification baseline

The repository's maintained static checks and unit tests are currently expected to pass:

- `npm run check`: SvelteKit sync and `svelte-check` should report 0 errors and 0 warnings.
- `npm run lint`: Prettier check and ESLint should both pass.
- `npm run build`: the Vercel production build should pass without requiring a database connection during compilation. The adapter may still print warnings for optional `pg-native` and Cloudflare socket imports.
- `npm run test:unit`: runs the arithmetic placeholder and the tested Zod validation-message helper.

`npm run test:integration` and `npm test` require a reachable PostgreSQL database because the homepage and property page load data at request time. Playwright also builds and previews the app before opening the browser. Record the exact external dependency failure if those commands cannot run in the current environment.

## Repository layout

```text
.
├── src/
│   ├── routes/                 SvelteKit pages, server loads, and API handlers
│   ├── lib/components/        Reusable Svelte UI components
│   ├── lib/server/db/         Prisma singleton, query helpers, and demo seed
│   ├── lib/utils/              Small utilities and generated Prisma/Zod schemas
│   ├── lib/constants/          Shared Unicode/entity constants
│   ├── hooks.server.ts         API-key authentication hook
│   ├── app.html                HTML shell and favicon reference
│   ├── app.css                 Tailwind directives and Housefire typography classes
│   └── app.d.ts                Empty SvelteKit App type extension scaffold
├── prisma/schema.prisma       PostgreSQL Prisma schema and Zod generator config
├── static/                    Logo, favicon, and Leaflet marker/layer assets
├── tests/test.ts              Playwright smoke test
├── src/index.test.ts          Vitest placeholder unit test
├── package.json               Scripts and dependency declarations
├── package-lock.json          Locked npm dependency graph; tracked in this repo
├── svelte.config.js           SvelteKit config with Vercel adapter
├── vite.config.ts             Vite/SvelteKit/Vitest config
├── playwright.config.ts       Playwright web server and test-directory config
├── tsconfig.json              Strict TypeScript config extending generated SvelteKit types
├── tailwind.config.cjs        Housefire colors, Poppins font, and type scale
├── postcss.config.cjs         Tailwind 4 PostCSS adapter configuration
├── prisma.config.ts           Prisma schema and DB_URL_DIRECT configuration for beta/production Prisma CLI commands
├── flake.nix / flake.lock     Reproducible Node development shell and formatter
└── dotfiles                   ESLint, Prettier, npm, envrc, and gitignore rules
```

Generated or machine-managed paths:

- `.svelte-kit/` is generated by SvelteKit and ignored.
- `node_modules/` is installed locally and ignored.
- `src/lib/utils/prismaGeneratedZod/index.ts` is generated from Prisma schema definitions, but is currently tracked. Regenerate it with `npx prisma generate`; do not manually maintain it.
- `package-lock.json` is tracked even though the ignore file contains a lockfile pattern. Keep it synchronized with `package.json` when intentionally changing dependencies.

## Application flow

### Browser pages

`src/routes/+page.server.ts` loads all REIT tickers through `getAllTickers`. `src/routes/+page.svelte` renders them as links to `/properties/<ticker>`.

`src/routes/properties/[ticker]/+page.server.ts` loads all properties for the route ticker and supplies ticker-specific SEO metadata. `src/routes/properties/[ticker]/+page.svelte` then:

1. imports Leaflet CSS;
2. dynamically imports Leaflet inside `onMount`, keeping the browser-only map code out of SSR;
3. configures Leaflet's icon path to `/leaflet/`, which depends on the copied assets in `static/leaflet/`;
4. creates an OpenStreetMap tile layer centered on the United States;
5. creates one marker per loaded property; and
6. joins each marker to the property row so clicking a table row flies to the marker and opens its popup.

The map currently falls back to latitude/longitude `0` when a property lacks coordinates. This is called out by TODOs in the page and should be handled deliberately if data quality improves.

`src/routes/+layout.svelte` imports global CSS, renders the Housefire logo header, loads Poppins from Google Fonts, and supplies the shared `Seo` component. `src/routes/+layout.ts` disables prerendering because the page loads live database data at request time; `src/routes/api/+layout.ts` also explicitly disables prerendering for the API.

### API authentication

`src/hooks.server.ts` runs for every request. If the pathname starts with `/api`:

- no `x-api-key` header returns HTTP 401 (`Unauthorized`);
- a header that does not exactly equal `SELF_API_KEY` returns HTTP 403 (`Forbidden`); and
- a matching key allows the request to reach its handler.

This is a single shared secret, not user authentication. Keep it server-only and use the exact lowercase header name shown above. API routes are not intended to be called anonymously from the browser.

### API route inventory

All routes below are under `/api` and therefore require the API key.

| Method   | Route                                        | Behavior                                                                                                                                                                                  |
| -------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/api/reits`                                 | Validate a `ReitCreateInput` body with generated Zod schema, then create a REIT.                                                                                                          |
| `GET`    | `/api/geocodes`                              | Read filter fields from query parameters, plus `take` (default `5`) and `skip` (default `0`), validate Prisma args, and return geocodes.                                                  |
| `POST`   | `/api/geocodes`                              | Validate a `GeocodeCreateInput` body and create a geocode.                                                                                                                                |
| `GET`    | `/api/geocodes/byAddressInput/:addressInput` | Return the unique geocode for an address input, or 404. URL-encode the address value when calling this route.                                                                             |
| `POST`   | `/api/properties`                            | Validate a bulk property-create body through `PropertyCreateManyArgsSchema` and return `createManyAndReturn` results. The incoming body is wrapped as `{ data: body }` before validation. |
| `GET`    | `/api/properties/:id`                        | Return one property by Prisma id, or 400/404 for a missing id/property.                                                                                                                   |
| `DELETE` | `/api/properties/:id`                        | Delete one property by id and return the deleted record.                                                                                                                                  |
| `GET`    | `/api/properties/byTicker/:ticker`           | Return all properties related to a REIT ticker, or 404 when none are found.                                                                                                               |
| `DELETE` | `/api/properties/byTicker/:ticker`           | Delete all properties for a ticker and return Prisma's `{ count }` result, or 404 when nothing was deleted.                                                                               |

The handlers use `@sveltejs/kit` `json` and `error`. Validation failures are intended to become HTTP 400 responses; unexpected handler failures are logged and become HTTP 500 responses. Keep request validation at the route boundary and database access in the query modules.

## Database model and ownership

The PostgreSQL schema is defined in `prisma/schema.prisma`:

- `Reit`: cuid id, timestamps, unique `ticker`, and a one-to-many relation to `Property`.
- `Property`: cuid id, timestamps, required unique `addressInput`, optional descriptive/address/coordinate/square-footage fields, and required `reitTicker` relation to `Reit.ticker`. There is an index on `reitTicker`.
- `Geocode`: cuid id, timestamps, required unique `addressInput`, optional parsed address components, and required latitude/longitude. It is not relationally linked to `Property`.

The relation uses the REIT ticker—not the REIT id—as its foreign key. Preserve that detail in queries and seed/import code.

Database access is centralized in:

- `src/lib/server/db/prisma.ts`: singleton Prisma client with development global reuse;
- `reitQueries.ts`: list REITs/tickers and create a REIT;
- `propertyQueries.ts`: find/delete by id, find/delete by ticker, and bulk-create properties;
- `geocodeQueries.ts`: find by address input, filtered/paginated find-many, and create; and
- `seed.ts`: dummy `PLD` data.

The generated Zod module is used at API boundaries for Prisma-shaped input. If the schema changes, regenerate Prisma Client and the Zod module together, then update route types and tests.

## UI and styling conventions

Tailwind utility classes are used throughout Svelte components. Housefire design tokens live in `tailwind.config.cjs`:

- `hf-base-light`, `hf-base-dark`, `hf-orange`, `hf-blue`, `hf-grey`, and `hf-navy` colors;
- Poppins as the sans font; and
- custom title, heading, body, caption, and tiny font sizes.

`src/app.css` imports Tailwind 4 and defines reusable `.hf-*` typography classes. The legacy `tailwind.config.cjs` remains the source of Housefire theme tokens through Tailwind's `@config` directive. `Icon.svelte` wraps `svelte-hero-icons` with Housefire theme and size classes. `Link.svelte` applies the shared link treatment and resolves internal paths. `Seo.svelte` builds titles as `Housefire | <page title>` and emits description/robots metadata.

`SortableTable.svelte` accepts a header map, record rows, row id key, optional comparator functions, and a typed row-click callback. It sorts the input array in place and uses native comparisons when a comparator is not supplied. Strengthen the record model carefully because it is the main reusable data-table component.

## Testing guidance

Unit tests are discovered by Vite from `src/**/*.{test,spec}.{js,ts}`. `src/index.test.ts` is a small arithmetic smoke test, while `src/lib/server/validation.test.ts` covers the shared Zod error formatter used by API routes.

Playwright tests live in `tests/` and use `playwright.config.ts`. The smoke test asserts the Housefire logo and homepage copy. Because Playwright builds and previews the app through its `webServer` command, build/configuration and database availability can affect integration tests before the browser assertion runs.

For route and data changes, prefer tests that cover:

- missing and invalid API-key behavior;
- request validation and status codes;
- Prisma query helper behavior with representative data;
- empty ticker/property/geocode results; and
- the property page's map/table interaction where browser behavior is involved.

## Change hotspots and cautions

- Tailwind/PostCSS: Tailwind 4 uses `@tailwindcss/postcss` in `postcss.config.cjs`; global styles live in `src/app.css` and import `tailwindcss/index.css` plus the legacy theme config.
- Environment typing: API authentication reads `SELF_API_KEY` through `$env/dynamic/private`, allowing builds without a generated secret-specific static environment type. Runtime API requests still require the variable to be configured.
- Prisma runtime: Prisma 7 is configured with `@prisma/adapter-pg` and `pg`; `DB_URL` must be present whenever Prisma is instantiated.
- Zod: Zod 4 exposes validation details through `ZodError.issues`. API handlers should use the shared `formatZodError` helper for consistent 400 messages.
- Table markup: `SortableTable.svelte` keeps header cells inside a `<thead><tr>` structure and uses typed record rows.
- API logs: handlers log request URLs and bodies. Avoid logging credentials or sensitive property data, and reduce or structure logs if these endpoints become public-facing.
- Destructive endpoints: both property `DELETE` routes mutate the database. Keep the API key protection and add explicit tests before changing their behavior.
- Leaflet SSR: keep Leaflet imports that require browser globals inside `onMount` or otherwise client-only code.
- Data quality: map markers use zero coordinates for missing latitude/longitude. Do not treat `(0, 0)` as valid property data without checking the source fields.
- Generated output: changes to the large generated Zod file should normally be the result of a generator/dependency change, not hand edits.

## Suggested agent workflow

1. Inspect `git status --short` and read the relevant route, query helper, schema, and config before editing.
2. Confirm the expected behavior and identify whether the change affects browser code, server code, database schema, generated code, or deployment.
3. Make the smallest focused change, preserving the established SvelteKit file-routing and Prisma query-module boundaries.
4. Regenerate Prisma/Zod output when the schema or generator changes.
5. Run targeted formatting, linting, type checks, unit tests, and integration/build checks appropriate to the change.
6. Compare the final diff and check `git status --short` for accidental generated, secret, or unrelated files.
7. Report verification results precisely, including external-service blockers such as unavailable PostgreSQL.
