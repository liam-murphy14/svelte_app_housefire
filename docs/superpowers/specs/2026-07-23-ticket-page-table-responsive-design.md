# Ticket Page Table and Responsive Cards Design

## Context

The ticket property page currently shows a Leaflet map and `SortableTable` side by side at every viewport size. The table has the correct sorting and marker-focus behavior, but its visual treatment is denser and less polished than the landing page. On small screens, the map and table compete for limited space.

## Goals

- Keep a true sortable property table on large screens.
- Improve the table's visual hierarchy, spacing, hover states, focus states, and sort affordances using the existing Housefire design tokens.
- Hide the map below the large-screen breakpoint and show the properties as readable card-like rows.
- Keep desktop table rows connected to the map-focus interaction.
- Use the same loaded property records for both responsive views.
- Make missing mobile card values explicit with an em dash.

## Non-goals

- No schema, database, route, or API changes.
- No new sorting behavior or changes to the `SortableTable` public sorting API.
- No map behavior changes beyond hiding it on smaller screens.
- No new design tokens or broad site-wide restyling.

## Design

### Responsive layout

The ticket page will use the existing `joinedPropertyData` collection for two presentation modes:

- At the `lg` breakpoint and above, retain the map and show the sortable table beside it. The table remains the source of row-click behavior: selecting a row flies to the associated marker and opens its popup.
- Below the `lg` breakpoint, hide the map and desktop table, then show a page-local property-card list. Cards present the property name, address, city/state, and square footage when available. They do not expose map navigation while the map is hidden.

The desktop table will remain protected by horizontal overflow at constrained desktop widths so columns stay readable rather than collapsing into a second mobile pattern.

### Desktop table styling

The reusable table will retain its current sorting implementation while receiving a visual pass aligned with the landing page:

- a rounded, contained table frame;
- a stronger `hf-navy` header treatment with readable contrast;
- more intentional cell padding and subtle alternating row surfaces;
- `hf-blue` hover/focus treatment for rows;
- visible, consistently aligned sort icons; and
- keyboard-visible focus styling for sortable headers.

The current sort direction will be exposed through appropriate header semantics so the visual indicator is not the only way to understand the active sort.

### Mobile property cards

The page-local card list will use rounded, bordered panels and existing Housefire colors. Each card will include:

- a compact uppercase property label;
- a prominent property name;
- grouped address details;
- a right-aligned square-footage value when present; and
- an em dash for null or undefined displayed fields.

The card list will inherit the loaded property order. Sorting remains a desktop-table interaction and is not duplicated for the mobile presentation.

## Component boundaries and data flow

`+page.svelte` remains responsible for responsive composition and the mobile value formatter because the card layout is specific to property records. `SortableTable.svelte` remains responsible for generic table rendering and sorting. The page passes the existing `joinedPropertyData` to the table and iterates over that same data for cards.

No server load or query helper changes are needed.

## Accessibility

- Preserve table header semantics and make sortable headers keyboard-focusable.
- Communicate the active sort direction through accessible header state.
- Keep row hover styling paired with a visible focus treatment where interaction is available.
- Do not present hidden map actions in the mobile card layout.
- Preserve readable contrast across the new Housefire token combinations.

## Verification

- Run the relevant unit test suite and add focused coverage for any extracted formatter or behavior that can be tested in the existing setup.
- Run `npm run check` and `npm run lint`.
- Run `npm run build` to verify the SvelteKit production build.
- Inspect the final diff and working tree for unrelated or generated changes.
- Check the ticket page at large and small viewport sizes when a local preview is available, confirming table sorting, row-to-map focus, map hiding, card layout, and missing-value rendering.
