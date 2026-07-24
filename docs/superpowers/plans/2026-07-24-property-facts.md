# Property Facts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a validated, ordered list of labeled facts to each persisted property and expose it through the existing bulk property API.

**Architecture:** Store facts as a non-null Prisma `Json` field on `Property`, defaulting to an empty array. Keep application-level fact validation in a small shared Zod utility and invoke it in the existing `/api/properties` handler after generated Prisma input validation. Existing property query helpers remain unchanged because Prisma scalar reads include the new field automatically.

**Tech Stack:** Prisma 7, PostgreSQL JSONB, generated `zod-prisma-types` schemas, Zod 4, SvelteKit server routes, Vitest, TypeScript.

## Global Constraints

- Facts are ordered objects with exactly `label` and `value` string fields.
- `label` and `value` must be non-empty after trimming; validation normalizes leading and trailing whitespace.
- `Property.facts` is non-null and defaults to `[]`.
- Existing property-create payloads without `facts` remain valid.
- The existing `POST /api/properties` route remains the only ingestion endpoint in this change.
- Validation failures use the existing HTTP 400 path and `formatZodError`; unexpected handler failures remain HTTP 500 responses.
- `prisma/schema.prisma` is the source of truth; `src/lib/utils/prismaGeneratedZod/index.ts` is regenerated and never hand-edited.
- No property details page, fact-specific CRUD endpoint, or normalized `PropertyFact` model is included.
- Do not add Prisma migrations because this repository currently tracks no migration directory; report the required schema synchronization step separately.

---

### Task 1: Add the property facts data contract

**Files:**

- Create: `src/lib/utils/propertyFacts.ts`
- Test: `src/lib/utils/propertyFacts.test.ts`
- Modify: `prisma/schema.prisma` in the `Property` model
- Regenerate: `src/lib/utils/prismaGeneratedZod/index.ts` via `npx prisma generate`

**Interfaces:**

- Produces `PropertyFactSchema`, `PropertyFactsSchema`, and the inferred `PropertyFact` type from `$lib/utils/propertyFacts`.
- Produces a Prisma `Property` record with `facts: Json` defaulting to `[]`.
- Produces generated `PropertyCreateManyInputSchema` support for an optional `facts` JSON field.

- [ ] **Step 1: Write the failing facts contract tests**

Create `src/lib/utils/propertyFacts.test.ts` with these tests before creating the utility module or changing the Prisma schema:

```ts
import { describe, expect, it } from 'vitest';
import { PropertyCreateManyInputSchema } from '$lib/utils/prismaGeneratedZod';
import { PropertyFactsSchema } from './propertyFacts';

const baseProperty = {
  addressInput: '100 Main Street, Anywhere, USA',
  reitTicker: 'PLD',
};

describe('PropertyFactsSchema', () => {
  it('parses an ordered list of labeled facts', () => {
    const facts = [
      { label: 'Year built', value: '2022' },
      { label: 'Lease term', value: '15 years' },
    ];

    expect(PropertyFactsSchema.parse(facts)).toEqual(facts);
  });

  it('trims surrounding whitespace from labels and values', () => {
    expect(PropertyFactsSchema.parse([{ label: ' Year built ', value: ' 2022 ' }])).toEqual([
      { label: 'Year built', value: '2022' },
    ]);
  });

  it('rejects blank labels and values', () => {
    expect(() => PropertyFactsSchema.parse([{ label: ' ', value: '2022' }])).toThrow();
    expect(() => PropertyFactsSchema.parse([{ label: 'Year built', value: '\t' }])).toThrow();
  });

  it('rejects malformed entries and extra keys', () => {
    expect(() => PropertyFactsSchema.parse([{ label: 'Year built' }])).toThrow();
    expect(() =>
      PropertyFactsSchema.parse([{ label: 'Year built', value: '2022', source: 'listing' }]),
    ).toThrow();
  });

  it('allows the generated property-create schema to receive facts', () => {
    const result = PropertyCreateManyInputSchema.parse({
      ...baseProperty,
      facts: [{ label: 'Year built', value: '2022' }],
    });

    expect(result.facts).toEqual([{ label: 'Year built', value: '2022' }]);
  });

  it('allows existing property-create payloads to omit facts', () => {
    expect(PropertyCreateManyInputSchema.parse(baseProperty)).toEqual(baseProperty);
  });
});
```

- [ ] **Step 2: Run the focused tests and verify the contract is red**

Run:

```bash
npx vitest run src/lib/utils/propertyFacts.test.ts
```

Expected: FAIL because `$lib/utils/propertyFacts` does not exist, and the generated Prisma schema does not yet recognize `facts`.

- [ ] **Step 3: Add the Prisma field and shared Zod contract**

Add `facts` after `squareFootage` in the `Property` model in `prisma/schema.prisma`:

```prisma
  squareFootage Float?
  facts         Json    @default("[]")
  reit          Reit    @relation(fields: [reitTicker], references: [ticker])
```

Create `src/lib/utils/propertyFacts.ts`:

```ts
import { z } from 'zod';

export const PropertyFactSchema = z.strictObject({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

export const PropertyFactsSchema = z.array(PropertyFactSchema);

export type PropertyFact = z.infer<typeof PropertyFactSchema>;
```

- [ ] **Step 4: Regenerate Prisma and the tracked Zod output**

Run:

```bash
npx prisma validate
npx prisma generate
```

Expected: Prisma reports a valid schema, generation completes, and `src/lib/utils/prismaGeneratedZod/index.ts` contains `facts` in the generated property input/output schemas. Do not edit that generated file manually.

- [ ] **Step 5: Run the focused tests and verify they pass**

Run:

```bash
npx vitest run src/lib/utils/propertyFacts.test.ts
```

Expected: all facts-contract tests pass.

- [ ] **Step 6: Check and commit the task**

Run:

```bash
npx prettier --check prisma/schema.prisma src/lib/utils/propertyFacts.ts src/lib/utils/propertyFacts.test.ts src/lib/utils/prismaGeneratedZod/index.ts
git diff --check
```

Expected: Prettier reports all files formatted and `git diff --check` reports no whitespace errors. Commit the schema, generated output, utility, and tests:

```bash
git add prisma/schema.prisma src/lib/utils/propertyFacts.ts src/lib/utils/propertyFacts.test.ts src/lib/utils/prismaGeneratedZod/index.ts
git commit -m "feat: add property facts field"
```

### Task 2: Validate facts at the property API boundary

**Files:**

- Modify: `src/routes/api/properties/+server.ts`
- Test: `src/routes/api/properties/properties.test.ts`

**Interfaces:**

- Consumes `PropertyFactsSchema` from `$lib/utils/propertyFacts` and generated `PropertyCreateManyArgsSchema` from `$lib/utils/prismaGeneratedZod`.
- Produces HTTP 200 for valid property-create bodies containing facts.
- Produces HTTP 400 for present malformed `facts` values without calling `createManyProperties`.

- [ ] **Step 1: Write the failing route tests**

Create `src/routes/api/properties/properties.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createManyProperties } = vi.hoisted(() => ({
  createManyProperties: vi.fn(),
}));

vi.mock('$lib/server/db/propertyQueries', () => ({
  createManyProperties,
}));

import { POST } from './+server';

const baseProperty = {
  addressInput: '100 Main Street, Anywhere, USA',
  reitTicker: 'PLD',
};

const eventWithBody = (body: unknown) =>
  ({
    request: new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  }) as Parameters<typeof POST>[0];

describe('POST /api/properties facts validation', () => {
  beforeEach(() => {
    createManyProperties.mockReset();
  });

  it('accepts a valid facts list and passes it to the query helper', async () => {
    const body = {
      ...baseProperty,
      facts: [{ label: 'Year built', value: '2022' }],
    };
    createManyProperties.mockResolvedValue([body]);

    const response = await POST(eventWithBody(body));

    expect(response.status).toBe(200);
    expect(createManyProperties).toHaveBeenCalledWith(body);
  });

  it('returns HTTP 400 and skips persistence for malformed facts', async () => {
    const body = {
      ...baseProperty,
      facts: [{ label: '', value: '2022' }],
    };

    await expect(POST(eventWithBody(body))).rejects.toMatchObject({ status: 400 });
    expect(createManyProperties).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the route tests and verify the invalid-facts test is red**

Run:

```bash
npx vitest run src/routes/api/properties/properties.test.ts
```

Expected: the valid request may pass, but the malformed-facts test fails because the current handler accepts arbitrary JSON in the generated `facts` field and calls `createManyProperties`.

- [ ] **Step 3: Add facts validation after generated Prisma input parsing**

Update `src/routes/api/properties/+server.ts` to import `PropertyFactsSchema` and validate every present `facts` value before calling the query helper:

```ts
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createManyProperties } from '$lib/server/db/propertyQueries';
import { PropertyCreateManyArgsSchema } from '$lib/utils/prismaGeneratedZod';
import { PropertyFactsSchema } from '$lib/utils/propertyFacts';
import { ZodError } from 'zod';
import { formatZodError } from '$lib/server/validation';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('received POST request to /api/properties: ', body);
    const propertiesCreateManyInput = PropertyCreateManyArgsSchema.parse({ data: body }).data;
    const propertyInputs = Array.isArray(propertiesCreateManyInput)
      ? propertiesCreateManyInput
      : [propertiesCreateManyInput];

    for (const property of propertyInputs) {
      if (property.facts !== undefined) {
        PropertyFactsSchema.parse(property.facts);
      }
    }

    const propertiesCreatePrismaResponse = await createManyProperties(propertiesCreateManyInput);
    return json(propertiesCreatePrismaResponse);
  } catch (e) {
    if (e instanceof ZodError) {
      error(400, {
        message: formatZodError(e),
      });
    }
    console.error('Error in POST /api/properties: ', e);
    error(500, {
      message: 'Something went wrong',
    });
  }
};
```

- [ ] **Step 4: Run the route tests and verify they pass**

Run:

```bash
npx vitest run src/routes/api/properties/properties.test.ts
```

Expected: both route tests pass, including the assertion that malformed facts do not reach `createManyProperties`.

- [ ] **Step 5: Run the complete applicable verification suite**

Run:

```bash
npm run test:unit
npm run check
npm run lint
npm run build
```

Expected: each command exits with status 0. Build warnings about optional adapter imports are acceptable only if the command still exits successfully and no new error is introduced.

- [ ] **Step 6: Inspect scope and commit the task**

Run:

```bash
git diff --check
git status --short
git diff --stat HEAD~1..HEAD
```

Confirm that only the property facts schema, generated Prisma/Zod output, shared validation contract, API validation, and focused tests changed; no `.env`, build output, or SvelteKit generated output is staged. Commit the API and tests:

```bash
git add src/routes/api/properties/+server.ts src/routes/api/properties/properties.test.ts
git commit -m "feat: validate property facts API input"
```

## Final handoff

After both task reviews pass, report that the code stores and validates property facts but does not yet include the details page. Tell the user that the runtime database must be synchronized with the new `Property.facts` field using the repository's existing Prisma schema-sync process before creating or reading records with facts.
