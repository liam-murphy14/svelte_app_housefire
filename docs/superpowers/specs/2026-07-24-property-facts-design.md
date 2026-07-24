# Property Facts Design

## Context

Housefire currently stores a property's address, location, descriptive fields, and square footage in one Prisma `Property` record. The existing bulk `POST /api/properties` route accepts Prisma-shaped property records, and the property queries return complete scalar records for the ticker property page and property-by-id route.

Properties need an ordered list of additional facts that can be shown later on a property details page. The first implementation will establish persistence and ingestion without building that page or inventing a separate fact-management workflow before its display requirements are known.

## Goals

- Store an ordered list of labeled facts on every `Property`.
- Keep facts attached to the property record and returned by existing property queries.
- Accept facts through the existing bulk property-create API.
- Validate fact structure at the API boundary with the existing HTTP 400 validation behavior.
- Keep existing property-create payloads valid when they omit facts.
- Provide a shared TypeScript type and Zod schema for future details-page work.

## Non-goals

- No property details page in this change.
- No new fact-specific CRUD endpoints.
- No filtering, sorting, or querying by individual fact labels or values.
- No separate relational `PropertyFact` model.
- No changes to the existing map, property table, or SEO behavior.

## Design

### Data model

Add a non-null `facts` JSON field to the Prisma `Property` model:

```prisma
facts Json @default("[]")
```

The JSON value is an ordered array with this shape:

```ts
type PropertyFact = {
  label: string;
  value: string;
};
```

The field defaults to an empty array so existing and newly created properties without facts have a consistent response shape. PostgreSQL stores Prisma `Json` values as JSONB. Facts remain ordered by their array position; the initial contract does not assign identity to an individual fact.

### Shared validation and type

Create a small shared utility under `src/lib/utils` that exports:

- `PropertyFactSchema`, which accepts a strict object with non-empty trimmed `label` and `value` strings; and
- `PropertyFactsSchema`, which accepts an array of `PropertyFact` objects; and
- `PropertyFact`, inferred from the schema.

The schema is separate from generated Prisma/Zod output because the generated JSON-field schema cannot enforce the application-level object shape. The generated file remains machine-managed and is regenerated after the Prisma schema change.

### API data flow

The existing `POST /api/properties` handler will continue to:

1. Parse the request body with `PropertyCreateManyArgsSchema`.
2. Validate each present `facts` value with `PropertyFactsSchema`.
3. Pass the validated Prisma-shaped input to `createManyProperties`.

The request may contain one property object or an array, matching the current Prisma `createMany` contract. An omitted `facts` field is allowed and relies on the database default. A present `null`, non-array value, fact with extra keys, or fact with a blank/non-string label or value becomes the existing formatted HTTP 400 response. Unexpected database or handler failures remain HTTP 500 responses.

Existing property reads need no query-shape change: Prisma scalar results from `getPropertyById` and `getPropertiesByTicker` will include `facts` automatically after regeneration. The future details page can consume the shared `PropertyFact` type and render the array in stored order.

### Database rollout

The repository currently tracks `prisma/schema.prisma` but no Prisma migrations, so this change will update the schema source of truth and regenerate Prisma Client and the tracked generated Zod module. The environment that runs Housefire must synchronize the database schema through the repository's existing Prisma schema-sync process before the new field is used at runtime. No migration directory or manually edited generated output will be introduced by this change.

## Testing

Add focused unit coverage for the shared facts schema:

- an ordered list of labeled facts parses unchanged;
- a blank label or value is rejected;
- a non-object list entry or extra object key is rejected; and
- an omitted facts field remains valid through the existing property-create input contract.

Run the relevant unit tests while iterating, then run `npm run test:unit`, `npm run check`, `npm run lint`, and `npm run build`. Inspect the final diff and working tree for unrelated, secret, generated, or build-output changes.

## Future extension point

If the property details page later requires independently editable facts, fact provenance, numeric/date values, or queries across facts, the JSON field can be replaced or supplemented with a normalized model in a separately designed change. The initial labeled string contract is intentionally sufficient for display without committing to those requirements early.
