# Property Detail Page and Facts Display Design

## Goal

Add a property-level page so free-form property facts have enough room to be
read clearly. Keep the REIT portfolio table concise while preserving its map
interaction.

## Scope

- Reconcile `feat/property-facts` with the responsive property-page changes
  currently on `main`.
- Add a nested route at `/properties/<ticker>/<id>`.
- Load one property server-side and render its existing descriptive, address,
  coordinate, square-footage, and ordered facts data.
- Keep the facts order and render each fact as a labeled value.
- Reduce the desktop portfolio table to `Name`, `City`, and `State`.
- Make the property name an obviously styled, accessible link to the detail
  page.
- Keep the rest of the desktop table row clickable for map focus.
- Add a clearly labeled property-detail link to each Leaflet map popup.
- Leave mobile cards unchanged. Add a source-code comment stating that facts
  are intentionally omitted from the compact mobile cards for now and are
  shown on the property detail page.

## Architecture and data flow

1. Merge the current `main` branch into the existing `feat/property-facts`
   worktree so the feature retains the responsive table/card implementation.
2. Add `src/routes/properties/[ticker]/[id]/+page.server.ts`.
   - Read `id` and `ticker` from route params.
   - Use the existing `getPropertyById` query helper.
   - Return HTTP 404 when the property does not exist or its `reitTicker` does
     not match the URL ticker.
   - Normalize the JSON facts value through the shared facts parser before
     returning page data.
   - Supply property-specific title and description metadata.
3. Add the corresponding `+page.svelte` detail view with:
   - a back link to the ticker portfolio;
   - the property name or a stable address fallback as the page heading;
   - a compact property-details grid for existing scalar fields;
   - an ordered facts section; and
   - an empty-state message when no valid facts are present.
4. Extend `SortableTable.svelte` with an optional detail-link callback for the
   first-column action. The generated anchor must stop row-click propagation,
   remain keyboard accessible, and use visible link styling. Existing button
   behavior remains available for other callers.
5. Update the portfolio page to:
   - pass the detail URL and accessible label for each property name;
   - keep the existing row callback for map focus;
   - use only `name`, `city`, and `state` table columns; and
   - build popup HTML with the existing summary plus a detail link. Escape
     property-supplied text before inserting it into the Leaflet popup.

## Facts handling

The ingestion contract remains `PropertyFactsSchema`: an ordered array of
strict `{ label: string, value: string }` objects with trimmed, non-empty
values. A shared safe parser will return valid facts for display and an empty
array for malformed legacy JSON, so one bad stored value does not break the
property page. The detail page will not reorder, truncate, or otherwise
transform valid facts beyond presenting their labels and values.

## Testing and verification

- Extend facts utility tests for safe parsing of valid, empty, and malformed
  values.
- Add detail-page server-load tests for the happy path, missing property, and
  ticker mismatch.
- Add a component test proving the table renders a visible detail link and
  does not treat its click as a map-row click.
- Add a focused test for popup HTML generation, including the detail URL and
  escaped property text.
- Run the focused Vitest tests, then `npm run test:unit`, `npm run check`,
  `npm run lint`, and `npm run build`.
- Inspect the final diff and worktree for unrelated changes, secrets, and
  generated build output.

## Non-goals

- No separate facts CRUD endpoint or normalized `PropertyFact` database model.
- No facts in the mobile cards during this change.
- No change to the existing API-key behavior.
- No migration directory is introduced; database schema synchronization
  remains a separate deployment/database operation as documented by the
  existing property-facts work.
