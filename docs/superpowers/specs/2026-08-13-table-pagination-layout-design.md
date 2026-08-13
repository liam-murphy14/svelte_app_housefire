# Table Pagination Layout Design

## Goal

Make the desktop property table's pagination feel attached to the table rather than competing with the section heading, while changing the default page size from 25 rows to 10.

## Context

`SortableTable.svelte` currently renders search, rows-per-page, result summary, and page navigation together in a toolbar above the table. On the property page, that toolbar sits immediately below the “Property records” heading and beside the map, making the page controls visually prominent before the table content. The mobile property view is a separate card list and is not part of this change.

## Options considered

1. Keep all controls above the table. This preserves the current structure but leaves the pagination visually disconnected from the rows it controls.
2. Put all controls below the table. This follows the conventional table pattern, but makes search less discoverable and requires a long scroll for larger result sets.
3. Split the controls: keep search above the table, and move result summary, page-size selection, and pagination into a compact footer attached to the table. This keeps the content-changing control near the table heading while placing navigation next to the rows it navigates.

## Design

Use option 3.

- Render the search field in a small top toolbar above the table.
- Render the table in a bounded vertical scroll region on desktop so a large result set does not push its controls away from the map and section heading.
- Render a compact footer immediately below the table containing:
  - the existing result summary;
  - the rows-per-page select, defaulting to 10; and
  - the existing bounded page navigation.
- Make the footer sticky to the bottom of the table's scroll region, keeping navigation available while browsing without duplicating controls above and below the table.
- Preserve existing filtering, sorting, page clamping, accessible labels, and mobile behavior.

## Testing

Update the server-rendered and client-side `SortableTable` tests to verify:

- the default result summary and visible rows use 10 rows per page;
- search remains above the table;
- pagination and the result summary render in the table footer;
- page navigation, page-size changes, sorting, filtering, and page clamping retain their existing behavior.

Run the focused component tests, then `npm run check`, `npm run lint`, and `npm run test:unit` before reporting completion.
