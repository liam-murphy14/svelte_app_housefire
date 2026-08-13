# Property Table Pagination and Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add client-side search, sorting-aware pagination, and page-size controls to the desktop property table while progressively loading mobile property cards and keeping every property on the map.

**Architecture:** Keep the server load and full property array unchanged. Extract pure table-data transformations for filtering, sorting, page slicing, and page bounds; let `SortableTable.svelte` own the desktop controls; and let the property page own the mobile `IntersectionObserver` and visible-card count.

**Tech Stack:** Svelte 5 legacy component props/events, TypeScript, SvelteKit, Vitest, happy-dom, Leaflet, Tailwind CSS 4.

## Global Constraints

- No server-side, API, database, or Prisma pagination.
- No changes to the property query or page server load.
- No desktop pagination controls on the mobile card layout.
- No change to the Leaflet marker set or map behavior.
- No new runtime dependencies.
- Search is case-insensitive and checks every string-valued property field.
- Desktop page-size options are `10`, `25`, `50`, and `100`, with `25` selected initially.
- Mobile cards reveal 25 records initially and 25 additional records per intersection.
- Preserve the existing table columns, sorting affordances, property links, and row-to-map interaction.
- Keep server-only code under server modules; this feature changes browser components and pure client-safe utilities only.
- Run `npm run test:unit`, `npm run check`, `npm run lint`, and `npm run build`; skip `npm run test:integration` and `npm test` for this iteration.
- Preserve unrelated working-tree changes and do not edit generated Prisma/Zod output.

---

### Task 1: Add pure table-data transformations

**Files:**

- Create: `src/lib/utils/tableData.ts`
- Create: `src/lib/utils/tableData.test.ts`

**Interfaces:**

- Consumes: generic `Record<string, unknown>` rows, a search string, a sort key/direction, optional column comparator functions, a page number, and a positive rows-per-page value.
- Produces: `TableRow`, `filterTableRows`, `sortTableRows`, `getPageCount`, `getPageRows`, `getPageNumbers`, and `clampPage` for `SortableTable.svelte`.

- [ ] **Step 1: Write failing utility tests for search, sorting, and paging**

Create `src/lib/utils/tableData.test.ts` with these behaviors:

```ts
import { describe, expect, it } from 'vitest';
import {
  clampPage,
  filterTableRows,
  getPageCount,
  getPageNumbers,
  getPageRows,
  sortTableRows,
} from './tableData';

const rows = [
  { id: '1', name: 'Dallas Warehouse', city: 'Dallas', address: '1 Main Street' },
  { id: '2', name: 'Austin Yard', city: 'Austin', address: '2 Congress Avenue' },
  { id: '3', name: 'Phoenix Hub', city: 'Phoenix', address: '3 Central Avenue' },
];

describe('table data helpers', () => {
  it('matches a query against every string-valued field case-insensitively', () => {
    expect(filterTableRows(rows, 'CONGRESS')).toEqual([rows[1]]);
    expect(filterTableRows(rows, 'warehouse')).toEqual([rows[0]]);
    expect(filterTableRows(rows, '')).toEqual(rows);
  });

  it('ignores non-string values when filtering', () => {
    const row = { id: '4', name: 'Numeric Site', count: 42, marker: { open: true } };

    expect(filterTableRows([row], '42')).toEqual([]);
    expect(filterTableRows([row], 'numeric')).toEqual([row]);
  });

  it('sorts a copy without mutating the input rows', () => {
    const input = [rows[2], rows[0], rows[1]];

    expect(sortTableRows(input, 'name', 'asc')).toEqual([rows[1], rows[0], rows[2]]);
    expect(input).toEqual([rows[2], rows[0], rows[1]]);
  });

  it('sorts the complete result before taking the page slice', () => {
    const input = [rows[2], rows[0], rows[1]];
    const sortedRows = sortTableRows(input, 'name', 'asc');

    expect(getPageRows(sortedRows, 1, 2)).toEqual([rows[1], rows[0]]);
  });

  it('uses a provided comparator in either direction', () => {
    const input = [
      { id: '1', squareFootage: 200 },
      { id: '2', squareFootage: 50 },
    ];
    const sortFunctions = {
      squareFootage: (left: unknown, right: unknown) => Number(left) - Number(right),
    };

    expect(sortTableRows(input, 'squareFootage', 'asc', sortFunctions)).toEqual([
      input[1],
      input[0],
    ]);
    expect(sortTableRows(input, 'squareFootage', 'desc', sortFunctions)).toEqual([
      input[0],
      input[1],
    ]);
  });

  it('calculates page counts and returns the requested page slice', () => {
    expect(getPageCount(rows.length, 2)).toBe(2);
    expect(getPageCount(rows.length, 0)).toBe(0);
    expect(getPageRows(rows, 2, 2)).toEqual([rows[2]]);
    expect(getPageRows(rows, 3, 2)).toEqual([]);
  });

  it('supports numbered navigation and clamps invalid pages', () => {
    expect(getPageNumbers(3)).toEqual([1, 2, 3]);
    expect(getPageNumbers(0)).toEqual([]);
    expect(clampPage(4, 3)).toBe(3);
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(7, 0)).toBe(1);
  });
});
```

- [ ] **Step 2: Run the new test file and verify it fails for the missing module**

Run:

```sh
npm run test:unit -- src/lib/utils/tableData.test.ts
```

Expected: Vitest fails because `./tableData` does not exist yet. Do not proceed until the failure is caused by the missing production module rather than a test syntax error.

- [ ] **Step 3: Implement the minimal pure helpers**

Create `src/lib/utils/tableData.ts` with these exact exported types and signatures:

```ts
export type TableRow = Record<string, unknown>;
export type SortDirection = 'asc' | 'desc';
export type SortFunctionMap = Record<string, (left: unknown, right: unknown) => number>;

export const filterTableRows = (rows: TableRow[], query: string): TableRow[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [...rows];

  return rows.filter((row) =>
    Object.values(row).some(
      (value) => typeof value === 'string' && value.toLowerCase().includes(normalizedQuery),
    ),
  );
};
export const sortTableRows = (
  rows: TableRow[],
  sortKey: string,
  sortDirection: SortDirection,
  sortFunctions: SortFunctionMap = {},
): TableRow[] => {
  const sortFunction = sortFunctions[sortKey];

  return [...rows].sort((left, right) => {
    if (sortFunction) {
      return sortDirection === 'asc'
        ? sortFunction(left[sortKey], right[sortKey])
        : sortFunction(right[sortKey], left[sortKey]);
    }

    const leftValue = left[sortKey];
    const rightValue = right[sortKey];
    if (leftValue === rightValue) return 0;
    if (leftValue === undefined || leftValue === null) return sortDirection === 'asc' ? -1 : 1;
    if (rightValue === undefined || rightValue === null) return sortDirection === 'asc' ? 1 : -1;

    const result =
      typeof leftValue === 'number' && typeof rightValue === 'number'
        ? leftValue - rightValue
        : String(leftValue).localeCompare(String(rightValue));
    return sortDirection === 'asc' ? result : -result;
  });
};
export const getPageCount = (rowCount: number, rowsPerPage: number): number =>
  rowCount > 0 && rowsPerPage > 0 ? Math.ceil(rowCount / rowsPerPage) : 0;
export const getPageRows = (rows: TableRow[], page: number, rowsPerPage: number): TableRow[] =>
  page > 0 && rowsPerPage > 0 ? rows.slice((page - 1) * rowsPerPage, page * rowsPerPage) : [];
export const getPageNumbers = (pageCount: number): number[] =>
  pageCount > 0 ? Array.from({ length: pageCount }, (_, index) => index + 1) : [];
export const clampPage = (page: number, pageCount: number): number =>
  pageCount > 0 ? Math.min(Math.max(page, 1), pageCount) : 1;
```

Implement the following rules:

- `filterTableRows` trims and lowercases the query, returns a shallow copy of all rows for an empty query, and otherwise retains a row when any `typeof value === 'string'` field contains the normalized query.
- `sortTableRows` starts from `[...rows]`, uses the supplied comparator when `sortFunctions[sortKey]` exists, and otherwise preserves the current table's native comparison behavior: nullish values first ascending, numbers numerically, other values through `String(value).localeCompare(String(value))`, and descending as the inverse.
- `getPageCount` returns `0` for zero rows or a non-positive rows-per-page value and otherwise returns `Math.ceil(rowCount / rowsPerPage)`.
- `getPageRows` returns `rows.slice((page - 1) * rowsPerPage, page * rowsPerPage)` and returns an empty array for a non-positive page or rows-per-page value.
- `getPageNumbers` returns the inclusive integer range from `1` through `pageCount`, or an empty array for a non-positive count.
- `clampPage` returns `1` when `pageCount` is `0`, otherwise clamps the supplied page between `1` and `pageCount`.

- [ ] **Step 4: Run the focused tests and the existing utility tests**

Run:

```sh
npm run test:unit -- src/lib/utils/tableData.test.ts src/lib/utils/propertyDisplay.test.ts
```

Expected: all tests pass with no unhandled errors or warnings.

- [ ] **Step 5: Commit the pure utility task**

```sh
git add src/lib/utils/tableData.ts src/lib/utils/tableData.test.ts
git commit -m "feat: add table filtering and pagination helpers"
```

### Task 2: Add desktop search and pagination to `SortableTable`

**Files:**

- Modify: `src/lib/components/SortableTable.svelte`
- Modify: `src/lib/components/SortableTable.test.ts`
- Create: `src/lib/components/SortableTable.client.test.ts`

**Interfaces:**

- Consumes: `TableRow`, `SortDirection`, `SortFunctionMap`, and the six pure helpers from `src/lib/utils/tableData.ts`.
- Produces: a backward-compatible `SortableTable` with the existing props plus `enablePagination: boolean`, defaulting to `false`; when enabled, it renders client-side search, page-size, result-summary, and numbered navigation controls.

- [ ] **Step 1: Add a failing SSR test for enabled controls and first-page slicing**

Append to `src/lib/components/SortableTable.test.ts`:

```ts
it('renders desktop search and pagination controls over the first page', () => {
  const rows = Array.from({ length: 26 }, (_, index) => ({
    id: `property-${index + 1}`,
    name: `Property ${index + 1}`,
  }));
  const { body } = render(SortableTable, {
    props: {
      idKey: 'id',
      tableHeaders: { name: 'Name' },
      tableData: rows,
      enablePagination: true,
    },
  });

  expect(body).toContain('Search properties');
  expect(body).toContain('Showing 1–25 of 26 properties');
  expect(body).toContain('Property 1');
  expect(body).toContain('Property 25');
  expect(body).not.toContain('Property 26');
  expect(body).toContain('aria-current="page"');
  expect(body).toContain('10');
  expect(body).toContain('25');
  expect(body).toContain('50');
  expect(body).toContain('100');
});
```

- [ ] **Step 2: Run the focused component test and verify the new test fails**

Run:

```sh
npm run test:unit -- src/lib/components/SortableTable.test.ts
```

Expected: the existing tests pass and the new test fails because `enablePagination` and its controls do not exist yet.

- [ ] **Step 3: Add a failing happy-dom interaction test for search and no-results state**

Create `src/lib/components/SortableTable.client.test.ts`:

```ts
// @vitest-environment happy-dom

import { flushSync } from 'svelte';
import { createClassComponent } from 'svelte/legacy';
import { describe, expect, it } from 'vitest';
import SortableTable from './SortableTable.svelte';

describe('SortableTable desktop controls', () => {
  it('filters rows from the search input and renders an empty state', () => {
    const target = document.createElement('div');
    document.body.append(target);
    const component = createClassComponent({
      component: SortableTable,
      target,
      props: {
        idKey: 'id',
        tableHeaders: { name: 'Name' },
        tableData: [
          { id: 'property-1', name: 'Warehouse' },
          { id: 'property-2', name: 'Office' },
        ],
        enablePagination: true,
      },
    } as never);

    const input = target.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'unmatched';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();

    expect(target.textContent).toContain('No property records match "unmatched".');

    component.$destroy();
    target.remove();
  });
});
```

Run:

```sh
npm run test:unit -- src/lib/components/SortableTable.client.test.ts
```

Expected: the test fails because the search input and no-results state are not implemented.

- [ ] **Step 4: Implement opt-in desktop controls without changing the default table API**

In `SortableTable.svelte`:

1. Replace the local `TableRow` definition with the imported `TableRow`, `SortDirection`, and `SortFunctionMap` types; import all table-data helpers.
2. Keep `idKey`, `tableHeaders`, `tableData`, `sortFunctions`, `rowOnClick`, `rowActionLabel`, `rowActionText`, and `rowActionHref` unchanged. Add `export let enablePagination = false;`.
3. Store `searchQuery = ''`, `rowsPerPage = 25`, and `currentPage = 1`.
4. Derive `filteredTableData`, `sortedTableData`, `pageCount`, `currentPage`, `visibleTableData`, and `pageNumbers` using the imported helpers. Clamp `currentPage` after every input-data or filter change.
5. Make `sortTableRows` operate on a copy and reset `currentPage` to `1` from the existing header-click handler. Keep the current native and custom comparator semantics.
6. Add handlers with these signatures:

```ts
const onSearchInput = () => {
  currentPage = 1;
};

const onRowsPerPageChange = (event: Event) => {
  rowsPerPage = Number((event.currentTarget as HTMLSelectElement).value);
  currentPage = 1;
};

const goToPage = (page: number) => {
  currentPage = clampPage(page, pageCount);
};
```

7. Render the controls only when `enablePagination` is true. Use a wrapping `<label>` for the search input and select so both controls have visible accessible names. Use `type="search"`, placeholder `Search properties`, and `aria-label="Search properties"`.
8. Render the result summary as a polite status. For non-empty results, use `Showing {start}-{end} of {filteredCount} properties`; for empty results, use `Showing 0 of 0 properties`.
9. Render previous/next buttons and one button per `pageNumbers`. Disable previous on page 1 and next on the final page; set `aria-current="page"` on the active number and give every page button an `aria-label="Go to page N"`.
10. Iterate `visibleTableData` in the existing `<tbody>`. When it is empty, render one `<tr><td colspan={keys.length} role="status">No property records match "{searchQuery.trim()}".</td></tr>` when pagination is enabled, and an equivalent `No property records are available.` message when pagination is disabled.

- [ ] **Step 5: Run the focused component tests and verify they pass**

Run:

```sh
npm run test:unit -- src/lib/components/SortableTable.test.ts src/lib/components/SortableTable.client.test.ts
```

Expected: all existing and new table tests pass.

- [ ] **Step 6: Run formatting and type checks for the changed component and utility**

Run:

```sh
npx prettier --check src/lib/components/SortableTable.svelte src/lib/components/SortableTable.test.ts src/lib/components/SortableTable.client.test.ts src/lib/utils/tableData.ts src/lib/utils/tableData.test.ts
npm run check
```

Expected: Prettier reports all listed files formatted and `svelte-check` reports 0 errors and 0 warnings.

- [ ] **Step 7: Commit the desktop table task**

```sh
git add src/lib/components/SortableTable.svelte src/lib/components/SortableTable.test.ts src/lib/components/SortableTable.client.test.ts
git commit -m "feat: paginate and search sortable tables"
```

### Task 3: Add mobile incremental loading and wire the property page

**Files:**

- Modify: `src/routes/properties/[ticker]/+page.svelte`
- Modify: `src/routes/properties/[ticker]/page.test.ts`
- Create: `src/routes/properties/[ticker]/page.client.test.ts`

**Interfaces:**

- Consumes: `SortableTable`'s `enablePagination` prop and the existing `PageServerData` property array.
- Produces: a property page that passes the full joined property data to the paginated desktop table, creates all map markers, and reveals mobile cards in batches of 25 through an `IntersectionObserver`.

- [ ] **Step 1: Add failing SSR assertions for table controls and mobile loading status**

Append a test to `src/routes/properties/[ticker]/page.test.ts` using 26 property records. Generate them with:

```ts
const properties = Array.from({ length: 26 }, (_, index) => ({
  id: `property-${index + 1}`,
  name: `Property ${index + 1}`,
  addressInput: `${index + 1} Main Street, Dallas, TX`,
  city: 'Dallas',
  state: 'TX',
  facts: [],
}));
```

Render the page with `ticker: 'PLD'` and the existing `metaTags`, then assert:

```ts
expect(body).toContain('Search properties');
expect(body).toContain('Showing 1–25 of 26 properties');
expect(body).toContain('Showing 25 of 26 properties.');
expect(body).not.toContain('>Property 26</h3>');
```

Expected before Task 3 implementation: the table assertions pass because Task 2 has already added those controls, while the test fails because the page has no mobile visible-count status and still renders all mobile cards.

- [ ] **Step 2: Run the page SSR test and verify the new assertions fail for the missing behavior**

Run:

```sh
npm run test:unit -- 'src/routes/properties/[ticker]/page.test.ts'
```

Expected: the pre-existing page tests pass and the new test fails on the missing mobile status/card slicing.

- [ ] **Step 3: Add a failing browser-environment test for observer-driven loading and full map markers**

Create `src/routes/properties/[ticker]/page.client.test.ts` with a happy-dom test that:

1. Mocks `leaflet` with a map double exposing `setView`, a tile-layer double exposing `addTo`, and a marker double exposing `addTo` and `bindPopup`.
2. Stubs `IntersectionObserver` with a constructor that stores its callback and exposes `observe` and `disconnect` spies.
3. Mounts the property page with the 26 generated properties.
4. Waits for the dynamic Leaflet import to settle and flushes Svelte updates.
5. Asserts the marker factory was called 26 times, `Property 25` is present, and `Property 26` is absent.
6. Invokes the stored observer callback with an intersecting entry, flushes updates, and asserts `Property 26` is now present.
7. Destroys the component and removes the target.

Use this test shape for the observer callback:

```ts
observerCallbacks[0](
  [{ isIntersecting: true } as IntersectionObserverEntry],
  {} as IntersectionObserver,
);
flushSync();
expect(target.textContent).toContain('Property 26');
```

Run:

```sh
npm run test:unit -- 'src/routes/properties/[ticker]/page.client.test.ts'
```

Expected: the test fails because the page does not create an observer or batch the mobile cards.

- [ ] **Step 4: Implement full-data desktop wiring and mobile observer lifecycle**

In `+page.svelte`:

1. Keep `joinedPropertyData` as the complete `data.properties` array before and after Leaflet initialization, and pass `enablePagination={true}` to the existing desktop `SortableTable`.
2. Add `const MOBILE_BATCH_SIZE = 25`, `let mobileVisibleCount = MOBILE_BATCH_SIZE`, `let mobileLoadMoreSentinel: HTMLDivElement`, and `let mobileLoadObserver: IntersectionObserver | undefined`.
3. Derive `visibleMobileProperties = data.properties.slice(0, mobileVisibleCount)` and `hasMoreMobileProperties = visibleMobileProperties.length < data.properties.length`.
4. Add `loadMoreMobileProperties` to increase the visible count by `MOBILE_BATCH_SIZE`, capped at `data.properties.length`.
5. In the existing `onMount`, after the Leaflet setup, create an `IntersectionObserver` whose callback calls `loadMoreMobileProperties()` for an intersecting entry. Observe `mobileLoadMoreSentinel` when it exists and return cleanup that disconnects the observer.
6. Replace the mobile `{#each data.properties}` loop with `{#each visibleMobileProperties}`. Keep the current card markup, order, and display formatting unchanged.
7. When `hasMoreMobileProperties` is true, render a sentinel `<div bind:this={mobileLoadMoreSentinel} aria-hidden="true"></div>` and the exact polite status `Showing {visibleMobileProperties.length} of {data.properties.length} properties.`. Do not render the sentinel after all cards are visible.
8. Preserve the existing mobile empty state when `data.properties.length === 0`.

- [ ] **Step 5: Run the page tests and verify both SSR and observer behavior pass**

Run:

```sh
npm run test:unit -- 'src/routes/properties/[ticker]/page.test.ts' 'src/routes/properties/[ticker]/page.client.test.ts'
```

Expected: all page tests pass, including the assertion that every property still creates a map marker and the observer reveals the final card.

- [ ] **Step 6: Run the full requested verification suite**

Run:

```sh
npm run test:unit
npm run check
npm run lint
npm run build
```

Expected: unit tests pass, `svelte-check` reports 0 errors and 0 warnings, Prettier and ESLint pass, and the Vercel adapter build exits successfully. Do not run the integration suite.

- [ ] **Step 7: Inspect the final diff and commit the property-page task**

Run:

```sh
git diff --check
git status --short
git diff --stat
```

Confirm only the planned utility, table, property-page, test, and documentation files changed; leave unrelated user work untouched. Then commit:

```sh
git add src/routes/properties/[ticker]/+page.svelte src/routes/properties/[ticker]/page.test.ts src/routes/properties/[ticker]/page.client.test.ts
git commit -m "feat: progressively load mobile property cards"
```
