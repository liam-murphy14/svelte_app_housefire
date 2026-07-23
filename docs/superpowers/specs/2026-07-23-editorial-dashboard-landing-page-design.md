# Editorial Dashboard Landing Page Design

**Date:** 2026-07-23  
**Status:** Approved design; implementation plan pending

## Goal

Turn the Housefire landing page from a single sentence and ticker list into an editorial dashboard that explains the project, describes the data it contains, and gives visitors a clear path into the existing REIT property views.

## Product decisions

- The first version is editorial and must not display live database counts.
- The page continues to use the existing `reitTickers` server-loaded data for the browseable ticker directory.
- A future data-summary aggregation table should provide trusted summary records—such as REIT, property, and geocode totals—for a later metrics layer. The first version documents this direction but does not add summary metrics or ad hoc aggregate queries.
- The work is limited to the landing page experience, its SEO copy, the shared style system only where a genuinely reusable utility is needed, and the landing-page smoke test.

## Experience structure

The page is one responsive, scrollable editorial dashboard under the existing Housefire header.

### Hero

Use a small orange overline, a large Housefire heading, an explanatory paragraph, and a primary browse action. The message should communicate that Housefire makes REIT holdings easier to understand spatially and structurally without claiming more data than the application provides.

Recommended editorial direction:

- Overline: `HOUSEFIRE / REIT PROPERTY DATA`
- Heading: `See the shape of a REIT's portfolio.`
- Supporting copy: `Housefire turns property holdings into a clearer view of the places, records, and locations behind a ticker.`
- Action: `Browse the catalog`

The hero's right side is a CSS-built portfolio snapshot: a bordered panel with orange and blue blocks, short labeled rows, and a small map/data motif. It is decorative and explanatory only; it must not imply live totals or represent a real portfolio.

### What the catalog contains

Follow the hero with three compact panels that explain the available data layers:

1. **REITs** — Ticker-level entry points for browsing an investment trust's holdings.
2. **Properties** — Holding records with names, addresses, locations, and square-footage fields where available.
3. **Geocodes** — Normalized address records and latitude/longitude values that support map-ready location data.

The panels should feel like a concise field guide: short copy, clear labels, and no invented examples or statistics.

### Browse the catalog

Introduce the live directory with a clear heading and a short explanation that each ticker opens a map-and-table property view. Render `data.reitTickers` as large, keyboard-accessible link tiles. Each tile routes to `/properties/<ticker>` using the existing SvelteKit path resolution conventions.

When `data.reitTickers` is empty, render an editorial empty state explaining that the catalog is being prepared and that more tickers will be added regularly. Do not render an empty grid or fabricate a sample ticker.

### Closing note

End with a concise note that Housefire is updated monthly and that the catalog will grow over time, followed by a secondary browse action. The tone should be confident and informative rather than promotional.

## Visual and interaction design

- Preserve the existing `hf-base-light` canvas, Poppins font, gradient logo, and `hf-orange`, `hf-blue`, `hf-grey`, and `hf-navy` theme tokens.
- Keep the existing header behavior and logo treatment unless a small spacing adjustment is required for the new page to breathe.
- Use the existing `.hf-title`, `.hf-heading-*`, `.hf-body-*`, `.hf-caption-*`, and `.hf-tiny-*` typography classes for hierarchy.
- Use centered responsive content with generous vertical spacing, thin grey rules, and restrained rounded panels consistent with the current sortable table.
- Use existing Tailwind theme utilities rather than introducing one-off colors. Add a reusable typography utility to `src/app.css` only if the overline treatment cannot be expressed cleanly with the current system.
- Use hover and visible keyboard-focus states for ticker tiles. Preserve underlined link semantics for inline links.
- Use a single-column layout on small screens. The hero snapshot may move below the hero copy, the data-layer panels may stack, and ticker tiles should remain comfortably readable.
- Do not add animation libraries, raster assets, external imagery, new data dependencies, or client-side JavaScript for the landing page.

## Implementation boundary

### Files

- Modify `src/routes/+page.svelte` for the full editorial layout, data-layer panels, ticker directory, empty state, and responsive styling.
- Modify `src/routes/+page.server.ts` only if needed to align the homepage SEO title and description with the new editorial message. Keep its existing `getAllTickers` load.
- Modify `src/app.css` only for a reusable style-system utility that serves this page and is likely to be reused elsewhere.
- Modify `tests/test.ts` to assert the new hero message and the browse/catalog affordance.

### Explicitly out of scope

- No Prisma schema or generated Zod changes.
- No new database queries for counts, summaries, or related records.
- No data-summary aggregation table in this implementation.
- No changes to the property map/table page or API routes.
- No replacement of the existing Housefire component/style conventions.

## Accessibility and SEO

- Use one semantic `h1`, followed by ordered heading levels for the catalog explanation, data-layer panels, and ticker directory.
- Use real links for all ticker navigation so the page remains usable without JavaScript.
- Ensure focus indicators are visible against the off-white and accent backgrounds.
- Keep decorative snapshot elements hidden from assistive technology when they do not convey independent information.
- Update the homepage title and meta description to describe Housefire as a REIT property-data catalog and avoid stale or overly promotional wording.

## Verification

Run the narrow checks while iterating, then the full applicable checks before completion:

```sh
npx prettier --check src/routes/+page.svelte src/routes/+page.server.ts src/app.css tests/test.ts
npx eslint src/routes/+page.svelte src/routes/+page.server.ts tests/test.ts
npm run check
npm run lint
npm run build
npm run test:unit
npm run test:integration
```

The integration test requires the configured PostgreSQL database because the homepage loads live ticker data at request time. If it cannot run, report the exact database or environment failure while still reporting the results of the static checks, build, and unit tests.

## Acceptance criteria

- The homepage explains what Housefire is and names the REIT, property, and geocode data layers.
- The homepage remains grounded in editorial copy and displays no live summary counts.
- Every loaded ticker remains a working link to its existing property route.
- The empty ticker state is intentional and readable.
- The page uses existing Housefire tokens and typography, with no unrelated visual system introduced.
- The page is responsive and keyboard navigable.
- Homepage SEO text matches the new content.
- Existing checks pass, or any external database blocker is reported precisely.
