# Playwright Page Coverage Design

## Goal

Make the integration suite exercise every public browser page with deterministic beta data and keep Node's repeated Playwright web-server file-descriptor warnings out of test output.

## Scope

The public page flow consists of the homepage, a ticker property page, and a property detail page. The integration suite will cover those pages in one seeded browser journey using the existing `HFTEST` beta fixtures. API routes and the existing unit/component coverage remain outside this change.

## Data flow

Playwright's `webServer.command` will run the existing `npm run db:seed:beta` command before building and previewing the app. The guarded seeder resets only the local `housefire_beta` database, creates the `HFTEST` ticker, and inserts three properties with facts, coordinates, and geocode records. The test will discover the property-detail URL from the rendered link instead of depending on generated Prisma ids.

The test will navigate from `/` to `/properties/HFTEST`, verify the seeded portfolio records, follow the North Harbor Logistics detail link, and verify the detail page's title, address, facts, coordinate values, and map container. This confirms both server-rendered data loading and the client-visible route transition for all public pages.

## Web-server warning handling

The baseline integration run passes but Node 24 emits repeated unmanaged-file-descriptor warnings from the Playwright-managed web-server process, along with a related `NO_COLOR` warning. The Playwright `webServer.env` configuration will set `NODE_NO_WARNINGS=1` and `FORCE_COLOR=0` only for the build/preview/seed subprocess. Application runtime behavior and non-Playwright commands will keep their existing warning behavior.

## Acceptance criteria

- `npm run test:integration` seeds beta data before starting the preview server.
- The integration suite verifies `/`, `/properties/HFTEST`, and `/properties/HFTEST/:id` using real database-backed page loads.
- The suite asserts meaningful seeded content rather than only route status codes.
- The repeated `File descriptor ... unmanaged mode` lines and the `NO_COLOR` warning do not appear in Playwright web-server output.
- Existing static checks, unit tests, and the integration suite remain passing.

