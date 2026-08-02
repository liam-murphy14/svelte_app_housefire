# Property Detail Page Refinements Design

## Goal

Refine the property detail page so its visible address reads naturally, square
footage appears as a property fact, backend-only address input data is not
shown, and each property has a focused location map above its details.

## Scope

- Keep the existing Prisma schema, API contracts, and stored
  `Property.squareFootage` field unchanged.
- Format the visible property address from `address`, `address2`, `city`,
  `state`, `zip`, and `country`, omitting missing components and rendering the
  state/ZIP portion as `state zip`.
- Use the formatted visible address for the page subheading and for the
  property-name fallback in the heading and SEO metadata.
- Do not render or use `addressInput` as user-facing property-page content.
- Add a presentation-only `Square footage` fact when the scalar square-footage
  value exists, while preserving stored fact order and avoiding a duplicate if
  a square-footage fact is already stored.
- Remove the top-level square-footage row from the property-details grid.
- Add a client-only Leaflet map above the property-details section. Center it
  on the property coordinates at a close property-level zoom, add one marker,
  and show a labeled unavailable state when either coordinate is missing.
- Leave the existing portfolio map and portfolio-page behavior unchanged.

## Architecture and data flow

Add small pure utilities for visible address formatting and presentation-only
fact composition. The property detail server load continues to retrieve one
Prisma property and normalize stored facts, then adds the generated
square-footage fact to the page data without changing the database shape.

The detail page will import Leaflet CSS and dynamically import Leaflet inside
`onMount`, matching the existing portfolio map’s SSR-safe pattern. It will use
a bound DOM element for the map, set the map view to the property’s valid
latitude/longitude, add an OpenStreetMap tile layer, and add a marker with the
property name or visible address as its popup summary. The map will not use
`(0, 0)` as a fallback for missing coordinates.

## Page layout

1. Existing back link and property heading.
2. Prettified full-address subheading.
3. `Property location` section with a rounded bordered map container, or an
   accessible `Map unavailable for this property` status when coordinates are
   incomplete.
4. `Property details` grid containing visible descriptive/address/location and
   coordinate fields, excluding `Address input` and `Square footage`.
5. Existing ordered `Property facts` section, now including the generated
   square-footage fact when applicable.

## Testing and verification

- Unit-test full address formatting, optional `address2`, and blank-component
  omission.
- Unit-test square-footage fact composition for present, missing, and already-
  stored square-footage facts.
- Update detail-page render tests for the formatted address, generated fact,
  removed address-input and top-level square-footage display, and map section.
- Update server-load metadata tests to verify visible-address fallback rather
  than `addressInput` fallback.
- Test the missing-coordinate map placeholder through server rendering.
- Run focused Vitest tests, then `npm run test:unit`, `npm run check`,
  `npm run lint`, and `npm run build`.
- Inspect the final diff and worktree for unrelated changes, secrets, and
  generated output.

## Non-goals

- No database migration or removal of `Property.squareFootage`.
- No migration of existing stored records into the JSON facts field.
- No new facts CRUD endpoint or normalized facts model.
- No reusable map-component refactor for the portfolio page.
- No changes to API-key authentication or portfolio table behavior.
