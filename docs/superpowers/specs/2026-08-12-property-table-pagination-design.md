# Property Table Pagination and Search Design

## Context

The ticker property page currently fetches all properties and displays every
record in the desktop `SortableTable` and the mobile property-card list. Large
portfolios make the desktop table difficult to scan. The map must continue to
use the complete property collection so every property remains represented by a
marker.

## Goals

- Add client-side search to the desktop property table.
- Search all string-valued property fields, including fields that are not
  visible table columns.
- Add desktop rows-per-page selection with `10`, `25`, `50`, and `100` options,
  selecting `25` initially.
- Add desktop page navigation with previous, next, and numbered page controls.
- Apply filtering and sorting before taking the current page slice.
- Keep all properties available to the Leaflet map and marker-row interaction.
- Make the mobile card list progressively reveal 25 more cards as the user
  reaches the bottom.
- Preserve the existing server load, API, Prisma query, table columns, sorting
  affordances, property links, and responsive layout.

## Non-goals

- No server-side, API, database, or Prisma pagination.
- No changes to the property query or page server load.
- No desktop pagination controls on the mobile card layout.
- No change to the Leaflet marker set or map behavior.
- No new runtime dependencies.
- Integration tests are not part of this iteration; unit, static, lint, and
  build checks are required.

## Design

### Desktop table state and data flow

`SortableTable.svelte` will keep receiving the complete `joinedPropertyData`
array. Its derived display sequence will be:

```text
all rows -> case-insensitive text search -> current sort -> page slice
```

The component will own these client-side values:

- `searchQuery`, initially empty;
- the existing `sortKey` and `sortDirection` values;
- `rowsPerPage`, initially `25`;
- `currentPage`, initially `1`.

Search compares the normalized query against every string-valued field on a
row. Non-string values and the Leaflet marker object are ignored. An empty
query returns every row. The matching behavior is case-insensitive and does
not require exact word boundaries.

Sorting will operate on a copied array so the component does not mutate the
page's full property collection. Sorting occurs before pagination, preserving
the expected meaning of a sortable table across all filtered results.

Changing the query, sort, or rows-per-page value resets `currentPage` to `1`.
When the incoming data changes or filtering reduces the result count,
`currentPage` is clamped to the available page range. A zero-result collection
has a page count of `0` and renders the table's no-results state without an
invalid active page.

### Desktop controls

The table controls appear above the table when `enablePagination` is true for
this instance. The property page enables it explicitly; other table consumers
retain the current controls-free behavior by default. The controls contain:

- a labeled `search` input with the placeholder `Search properties`;
- a labeled select with `10`, `25`, `50`, and `100` rows-per-page options;
- a result summary showing the displayed range and total filtered count;
- previous and next buttons with disabled states at the first and last page;
  and
- numbered page buttons, with the active page exposed by `aria-current="page"`.

When the search produces no matches, the table body renders a status row that
spans all columns and explains that no property records match the search.

### Mobile incremental loading

The mobile card list continues to use the complete `data.properties` array and
keeps its current card content and styling. It starts with 25 visible cards.
The page renders a bottom sentinel while more records remain. An
`IntersectionObserver` created in `onMount` increases the visible count by 25
when the sentinel enters the viewport. The sentinel is removed after the last
record is visible. A status message communicates the number of cards loaded as
additional records are revealed.

The mobile list does not use the desktop search or pagination controls. The
desktop table and mobile cards therefore have independent presentation state,
while both retain access to the same full server-loaded property collection.

### Map and row interaction

The map continues to create one marker for every property in
`data.properties`. `joinedPropertyData` remains the full property array until
Leaflet attaches each marker. The table receives that full joined array and
passes the selected row, including its marker, to the existing map-focus
handler. Pagination only changes which rows are rendered; it does not remove
markers or alter property detail links.

## Component boundaries

- `SortableTable.svelte` owns generic desktop table search, sorting,
  pagination, control rendering, and no-results rendering.
- `+page.svelte` owns the property-specific mobile card list and its
  `IntersectionObserver` lifecycle.
- A small pure table-data utility will hold normalization, filtering, sorting,
  page-count, and page-slice operations so these rules can be unit tested
  without a browser.
- No server or database files change.

## Accessibility

- Search and rows-per-page controls have visible labels and associated form
  controls.
- Sort headers retain their existing button semantics and `aria-sort` values.
- Pagination buttons have descriptive accessible labels; the active page uses
  `aria-current="page"`.
- Previous and next controls are disabled when navigation is unavailable.
- The no-results row uses a status-oriented message rather than leaving an
  empty table unexplained.
- Mobile loading status is announced with a status region, while the sentinel
  itself has no distracting visual treatment.

## Testing and verification

Add focused unit coverage for:

- case-insensitive matching across all string fields;
- sorting the full filtered result before slicing;
- page counts, page slices, and empty-result boundaries; and
- page reset/clamp behavior where the state logic is extracted into testable
  helpers.

Extend component/page rendering coverage for the desktop controls, result
summary, no-results state, and mobile loading status. Add browser-environment
coverage for the mobile observer callback if it can be isolated without
requiring a database.

Run:

```sh
npm run test:unit
npm run check
npm run lint
npm run build
```

Do not run `npm run test:integration` or `npm test` for this iteration because
the user explicitly requested that integration tests be skipped.
