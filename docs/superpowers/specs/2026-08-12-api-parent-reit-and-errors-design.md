# API Parent REIT and Error Handling Design

## Goal

Make property imports self-sufficient when a ticker has no parent REIT, and make expected database failures return useful HTTP responses from the API.

## Design

`createManyProperties` will run the parent-record preparation and property insertion in one Prisma transaction. It will collect distinct `reitTicker` values from the validated property input, upsert each ticker with an empty update, and then call `createManyAndReturn`. This preserves the existing property request contract, supports mixed-ticker batches, avoids duplicate parent rows, and rolls back the entire import if insertion fails.

API handlers will translate expected Prisma request errors at the route boundary: duplicate unique values (`P2002`) become `409 Conflict`, missing records (`P2025`) become `404 Not Found`, and foreign-key violations (`P2003`) become `400 Bad Request`. Unexpected database errors remain `500 Internal Server Error`. The property import should no longer normally produce `P2003` because it creates missing parents atomically.

The geocode lookup endpoint will keep its `404` behavior but return the accurate message `No geocode found`.

## Testing

- Add query-helper coverage proving a missing ticker is upserted before a property batch and that multiple properties share the expected parent-upsert behavior.
- Add route coverage for Prisma `P2002`, `P2003`, and `P2025` status mappings where those handlers can produce them.
- Add a regression assertion for the geocode lookup `404` message.
- Run focused unit tests, then `npm run check`, `npm run lint`, and `npm run build`.

## Scope

No schema or migration change is required. Existing API authentication, request validation, route paths, and successful response shapes remain unchanged.
