# Property Detail Page and Facts Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a property-level page for ordered free-form facts, streamline the desktop portfolio table, and link both property names and map popups to the detail page.

**Architecture:** First merge the responsive property-page work from `main` into the existing `feat/property-facts` worktree. Keep facts in the existing Prisma JSON field, add a shared safe parser for display, and load one property server-side at `/properties/[ticker]/[id]`. Extend the reusable table with an optional first-cell detail link while preserving the existing row callback for map focus. Centralize detail URL and escaped Leaflet popup HTML generation in a small utility.

**Tech Stack:** SvelteKit 2, Svelte 5, TypeScript, Prisma 7, PostgreSQL JSONB, Zod 4, Leaflet, Vitest, Svelte server rendering tests.

## Global Constraints

- Facts are ordered objects with exactly `label` and `value` string fields.
- `label` and `value` must be non-empty after trimming; validation normalizes leading and trailing whitespace.
- `Property.facts` is non-null and defaults to `[]`.
- Existing property-create payloads without `facts` remain valid.
- The existing `POST /api/properties` route remains the only ingestion endpoint in this change.
- Validation failures use the existing HTTP 400 path and `formatZodError`; unexpected handler failures remain HTTP 500 responses.
- `prisma/schema.prisma` is the source of truth; `src/lib/utils/prismaGeneratedZod/index.ts` is regenerated and never hand-edited.
- The property detail route is `/properties/<ticker>/<id>` and returns HTTP 404 when the property is missing or its `reitTicker` does not match the URL ticker.
- The desktop portfolio table contains exactly `Name`, `City`, and `State` columns.
- The property name is a visibly styled, accessible detail link; clicking elsewhere in the desktop row continues to focus the map.
- Each Leaflet popup contains a clearly labeled detail link and escapes property-supplied HTML text.
- Facts are rendered in stored order on the property detail page and are not rendered in the mobile cards during this change.
- Add a source-code comment in the mobile-card section stating that facts are intentionally omitted there for now and are shown on the property detail page.
- No separate facts CRUD endpoint or normalized `PropertyFact` database model is included.
- No migration directory is introduced; database schema synchronization remains a separate deployment/database operation.

---

### Task 1: Reconcile the feature worktree with current `main`

**Files:**

- Modify through merge: all files changed by `main` since the feature branch point.
- Do not manually edit generated files during this task.

**Interfaces:**

- Consumes: the clean `feat/property-facts` worktree at `/Users/liammurphy/Projects/svelte_app_housefire/.worktrees/property-facts` and the current local `main` branch.
- Produces: the responsive `src/routes/properties/[ticker]/+page.svelte`, updated `SortableTable.svelte`, `propertyDisplay` utility/tests, and their supporting changes available on `feat/property-facts` without dropping the existing facts/API commits.

- [ ] **Step 1: Confirm the feature worktree is clean**

Run:

```bash
git status --short --branch
git rev-parse HEAD
git log --oneline --decorate -6
```

Expected: no unstaged or untracked files, branch `feat/property-facts`, and the existing property-facts commits are present.

- [ ] **Step 2: Merge the current main branch**

Run from the feature worktree:

```bash
git merge main --no-edit
```

Expected: the merge completes without conflicts because the facts commits and responsive-page commits touch separate application areas. The resulting history contains the current `main` responsive property UI and the feature branch's facts schema/API changes.

- [ ] **Step 3: Run the existing static check**

```bash
npm run check
```

Expected: SvelteKit sync and `svelte-check` complete successfully before new implementation begins.

### Task 2: Add a safe facts parser for page display

**Files:**

- Modify: `src/lib/utils/propertyFacts.ts`
- Modify: `src/lib/utils/propertyFacts.test.ts`

**Interfaces:**

- Consumes: `PropertyFactsSchema` and arbitrary JSON returned from Prisma.
- Produces: `parsePropertyFacts(value: unknown): PropertyFact[]`, returning valid ordered facts or `[]` for malformed/empty values.

- [ ] **Step 1: Write failing parser tests**

Update the import and append these tests:

```ts
import { parsePropertyFacts, PropertyFactsSchema } from './propertyFacts';

describe('parsePropertyFacts', () => {
  it('returns valid facts in their original order', () => {
    const facts = [
      { label: 'Year built', value: '2022' },
      { label: 'Lease term', value: '15 years' },
    ];

    expect(parsePropertyFacts(facts)).toEqual(facts);
  });

  it('returns an empty list for empty or malformed stored JSON', () => {
    expect(parsePropertyFacts([])).toEqual([]);
    expect(parsePropertyFacts([{ label: 'Year built' }])).toEqual([]);
    expect(parsePropertyFacts({ label: 'Year built', value: '2022' })).toEqual([]);
  });
});
```

- [ ] **Step 2: Verify the parser tests fail for the intended reason**

```bash
npx vitest run src/lib/utils/propertyFacts.test.ts
```

Expected: existing schema tests pass and the new tests fail because `parsePropertyFacts` is not defined.

- [ ] **Step 3: Implement the minimal parser**

Add after `PropertyFactsSchema`:

```ts
export const parsePropertyFacts = (value: unknown): PropertyFact[] => {
  const result = PropertyFactsSchema.safeParse(value);
  return result.success ? result.data : [];
};
```

- [ ] **Step 4: Verify and commit**

```bash
npx vitest run src/lib/utils/propertyFacts.test.ts
npx prettier --check src/lib/utils/propertyFacts.ts src/lib/utils/propertyFacts.test.ts
git add src/lib/utils/propertyFacts.ts src/lib/utils/propertyFacts.test.ts
git commit -m "feat: safely parse property facts for display"
```

Expected: tests and formatting pass before the commit is created.

### Task 3: Add an accessible detail-link action to `SortableTable`

**Files:**

- Modify: `src/lib/components/SortableTable.svelte`
- Modify: `src/lib/components/SortableTable.test.ts`

**Interfaces:**

- Consumes: existing `rowActionLabel`, `rowActionText`, `rowOnClick`, and table row data.
- Produces: optional `rowActionHref: ((row: Record<string, unknown>) => string) | undefined` for a first-column anchor. When present, it takes precedence over the existing first-column button and stops click propagation.

- [ ] **Step 1: Write the failing link-rendering test**

Append to `src/lib/components/SortableTable.test.ts`:

```ts
it('renders a visible first-cell detail link without replacing row behavior', () => {
  const { body } = render(SortableTable, {
    props: {
      idKey: 'id',
      tableHeaders: { name: 'Name', city: 'City' },
      tableData: [{ id: 'property-1', name: 'Warehouse', city: 'Dallas' }],
      rowActionLabel: (row: Record<string, unknown>) => `View ${row.name} property details`,
      rowActionText: (row: Record<string, unknown>) => String(row.name),
      rowActionHref: () => '/properties/PLD/property-1',
    },
  });

  expect(body).toContain('href="/properties/PLD/property-1"');
  expect(body).toContain('aria-label="View Warehouse property details"');
  expect(body).toContain('>Warehouse</a>');
  expect(body).toContain('underline');
  expect(body).not.toContain('>Warehouse</button>');
});
```

- [ ] **Step 2: Verify the new test fails**

```bash
npx vitest run src/lib/components/SortableTable.test.ts
```

Expected: existing tests pass and the new test fails because `rowActionHref` is not implemented.

- [ ] **Step 3: Implement the optional anchor branch**

Add the prop:

```ts
export let rowActionHref: ((row: TableRow) => string) | undefined = undefined;
```

In the first-cell action branch, put this before the existing button branch:

```svelte
{#if index === 0 && rowActionHref}
  <a
    href={rowActionHref(row)}
    class="rounded-sm text-hf-navy underline decoration-2 underline-offset-4 hover:text-hf-orange focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hf-navy"
    aria-label={rowActionLabel ? rowActionLabel(row) : `Open ${tableHeaders[key]}`}
    on:click|stopPropagation={() => {}}
  >
    {rowActionText ? rowActionText(row) : row[key]}
  </a>
{:else if index === 0 && rowActionLabel}
  <button
    type="button"
    class="rounded-sm text-left focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hf-navy"
    aria-label={rowActionLabel(row)}
    on:click|stopPropagation={() => rowOnClick(row)}
  >
    {rowActionText ? rowActionText(row) : row[key]}
  </button>
{:else}
  {row[key]}
{/if}
```

Keep the surrounding row `on:click={() => rowOnClick(row)}` unchanged.

- [ ] **Step 4: Verify and commit**

```bash
npx vitest run src/lib/components/SortableTable.test.ts
npx prettier --check src/lib/components/SortableTable.svelte src/lib/components/SortableTable.test.ts
git add src/lib/components/SortableTable.svelte src/lib/components/SortableTable.test.ts
git commit -m "feat: support property detail links in tables"
```

Expected: all table tests pass, formatting is clean, and the link click handler includes `stopPropagation`.

### Task 4: Centralize property detail URLs and escaped popup content

**Files:**

- Create: `src/lib/utils/propertyMap.ts`
- Create: `src/lib/utils/propertyMap.test.ts`

**Interfaces:**

- Consumes: ticker, property ID, and property `id`, `name`, `address`, and `addressInput` values.
- Produces: `propertyDetailsPath(ticker: string, id: string): string` and `propertyPopupContent(property, ticker): string`.

- [ ] **Step 1: Write failing utility tests**

Create `src/lib/utils/propertyMap.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { propertyDetailsPath, propertyPopupContent } from './propertyMap';

describe('propertyDetailsPath', () => {
  it('builds the nested property route', () => {
    expect(propertyDetailsPath('PLD', 'property-1')).toBe('/properties/PLD/property-1');
  });
});

describe('propertyPopupContent', () => {
  it('includes escaped summary text and a property-detail link', () => {
    const popup = propertyPopupContent(
      {
        id: 'property-1',
        name: '<Warehouse>',
        address: '1 Main & 2nd',
        addressInput: '1 Main & 2nd, Dallas, TX',
      },
      'PLD',
    );

    expect(popup).toContain('&lt;Warehouse&gt;');
    expect(popup).toContain('1 Main &amp; 2nd');
    expect(popup).toContain('href="/properties/PLD/property-1"');
    expect(popup).toContain('View property details');
    expect(popup).not.toContain('<Warehouse>');
  });
});
```

- [ ] **Step 2: Verify the utility test fails**

```bash
npx vitest run src/lib/utils/propertyMap.test.ts
```

Expected: Vitest fails because `src/lib/utils/propertyMap.ts` does not exist.

- [ ] **Step 3: Implement the utility**

Create `src/lib/utils/propertyMap.ts`:

```ts
import type { Property } from '@prisma/client';

const htmlEscapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => htmlEscapeMap[character]);

export const propertyDetailsPath = (ticker: string, id: string): string =>
  `/properties/${encodeURIComponent(ticker)}/${encodeURIComponent(id)}`;

type PropertyPopupData = Pick<Property, 'id' | 'name' | 'address' | 'addressInput'>;

export const propertyPopupContent = (property: PropertyPopupData, ticker: string): string => {
  const title = property.name?.trim() || property.addressInput.trim() || 'Property';
  const address = property.address?.trim() || property.addressInput.trim() || 'Address unavailable';
  const href = propertyDetailsPath(ticker, property.id);

  return `<b>${escapeHtml(title)}</b><br>${escapeHtml(address)}<br><a class="text-hf-orange underline" href="${escapeHtml(href)}">View property details</a>`;
};
```

- [ ] **Step 4: Verify and commit**

```bash
npx vitest run src/lib/utils/propertyMap.test.ts
npx prettier --check src/lib/utils/propertyMap.ts src/lib/utils/propertyMap.test.ts
git add src/lib/utils/propertyMap.ts src/lib/utils/propertyMap.test.ts
git commit -m "feat: add property detail popup links"
```

Expected: URL, escaping, and popup-link assertions pass before the commit.

### Task 5: Add the property detail server route

**Files:**

- Create: `src/routes/properties/[ticker]/[id]/+page.server.ts`
- Create: `src/routes/properties/[ticker]/[id]/+page.server.test.ts`

**Interfaces:**

- Consumes: `getPropertyById`, `parsePropertyFacts`, and route params `{ ticker: string; id: string }`.
- Produces: page data `{ ticker, property, metaTags }`, where `property.facts` is `PropertyFact[]`, plus HTTP 404 for absent or mismatched properties.

- [ ] **Step 1: Write failing server-load tests**

Create `src/routes/properties/[ticker]/[id]/+page.server.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getPropertyById } = vi.hoisted(() => ({
  getPropertyById: vi.fn(),
}));

vi.mock('$lib/server/db/propertyQueries', () => ({
  getPropertyById,
}));

import { load } from './+page.server';

const loadEvent = (params: { ticker: string; id: string }) =>
  ({ params }) as Parameters<typeof load>[0];

describe('property detail page load', () => {
  beforeEach(() => {
    getPropertyById.mockReset();
  });

  it('returns the property with normalized ordered facts', async () => {
    getPropertyById.mockResolvedValue({
      id: 'property-1',
      reitTicker: 'PLD',
      name: 'Warehouse',
      addressInput: '1 Main Street, Dallas, TX',
      facts: [{ label: ' Year built ', value: ' 2022 ' }],
    });

    const result = await load(loadEvent({ ticker: 'PLD', id: 'property-1' }));

    expect(result.property.facts).toEqual([{ label: 'Year built', value: '2022' }]);
    expect(result.metaTags.title).toContain('PLD');
    expect(getPropertyById).toHaveBeenCalledWith('property-1');
  });

  it('returns HTTP 404 when the property does not exist', async () => {
    getPropertyById.mockResolvedValue(null);

    await expect(load(loadEvent({ ticker: 'PLD', id: 'missing' }))).rejects.toMatchObject({
      status: 404,
    });
  });

  it('returns HTTP 404 when the property belongs to another ticker', async () => {
    getPropertyById.mockResolvedValue({ id: 'property-1', reitTicker: 'REXR', facts: [] });

    await expect(load(loadEvent({ ticker: 'PLD', id: 'property-1' }))).rejects.toMatchObject({
      status: 404,
    });
  });
});
```

- [ ] **Step 2: Verify the expected red failure**

```bash
npx vitest run 'src/routes/properties/[ticker]/[id]/+page.server.test.ts'
```

Expected: Vitest fails because the nested route and its `load` function do not exist.

- [ ] **Step 3: Implement the server load**

Create `src/routes/properties/[ticker]/[id]/+page.server.ts`:

```ts
import { error } from '@sveltejs/kit';
import { getPropertyById } from '$lib/server/db/propertyQueries';
import { parsePropertyFacts } from '$lib/utils/propertyFacts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const property = await getPropertyById(params.id);

  if (!property || property.reitTicker !== params.ticker) {
    error(404, { message: 'No property found' });
  }

  return {
    ticker: params.ticker,
    property: {
      ...property,
      facts: parsePropertyFacts(property.facts),
    },
    metaTags: {
      title: `${property.name?.trim() || property.addressInput} Property Details`,
      description: `See detailed property information and facts for ${params.ticker}.`,
    },
  };
};
```

- [ ] **Step 4: Verify and commit**

```bash
npx vitest run 'src/routes/properties/[ticker]/[id]/+page.server.test.ts'
npm run check
git add 'src/routes/properties/[ticker]/[id]/+page.server.ts' 'src/routes/properties/[ticker]/[id]/+page.server.test.ts'
git commit -m "feat: load property detail pages"
```

Expected: all three route tests pass and SvelteKit generates the new route types without errors or warnings.

### Task 6: Render property details and ordered facts

**Files:**

- Create: `src/routes/properties/[ticker]/[id]/+page.svelte`
- Create: `src/routes/properties/[ticker]/[id]/+page.test.ts`

**Interfaces:**

- Consumes: `PageServerData` from Task 5, including `property.facts: PropertyFact[]`.
- Produces: a server-renderable detail view with a portfolio back link, scalar property details, ordered fact labels/values, and an empty facts state.

- [ ] **Step 1: Write failing server-rendering tests**

Create `src/routes/properties/[ticker]/[id]/+page.test.ts`:

```ts
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Page from './+page.svelte';

describe('property detail page', () => {
  it('renders the property fields and ordered facts', () => {
    const { body } = render(Page, {
      props: {
        data: {
          ticker: 'PLD',
          property: {
            id: 'property-1',
            name: 'Warehouse',
            addressInput: '1 Main Street, Dallas, TX',
            address: '1 Main Street',
            city: 'Dallas',
            state: 'TX',
            zip: '75001',
            squareFootage: 125000,
            facts: [
              { label: 'Year built', value: '2022' },
              { label: 'Lease term', value: '15 years' },
            ],
          },
          metaTags: { title: 'Warehouse Property Details', description: 'Property details' },
        },
      } as never,
    });

    expect(body).toContain('Warehouse');
    expect(body).toContain('125,000');
    expect(body).toContain('Year built');
    expect(body).toContain('2022');
    expect(body.indexOf('Year built')).toBeLessThan(body.indexOf('Lease term'));
    expect(body).toContain('href="/properties/PLD"');
  });

  it('renders an empty-state message when there are no facts', () => {
    const { body } = render(Page, {
      props: {
        data: {
          ticker: 'PLD',
          property: { id: 'property-1', addressInput: '1 Main Street', facts: [] },
          metaTags: { title: 'Property Details', description: 'Property details' },
        },
      } as never,
    });

    expect(body).toContain('No property facts are available for this record yet.');
  });
});
```

- [ ] **Step 2: Verify the expected red failure**

```bash
npx vitest run 'src/routes/properties/[ticker]/[id]/+page.test.ts'
```

Expected: Vitest fails because the detail page component does not exist.

- [ ] **Step 3: Implement the detail page**

Create the component with these required behaviors:

```svelte
<script lang="ts">
  import Link from '$lib/components/Link.svelte';
  import { displayPropertyValue } from '$lib/utils/propertyDisplay';
  import type { PageData } from './$types';

  export let data: PageData;

  const propertyLocation = [data.property.city, data.property.state, data.property.zip]
    .filter(Boolean)
    .join(', ');
</script>

<div
  class="min-h-full overflow-auto bg-hf-base-light px-6 py-8 text-hf-base-dark sm:px-10 lg:px-16 lg:py-10"
>
  <div class="mx-auto max-w-5xl">
    <Link href={`/properties/${data.ticker}`} text={`Back to ${data.ticker} properties`} />

    <header class="mt-6 border-b border-hf-grey pb-6">
      <p class="hf-caption-x uppercase tracking-[0.28em] text-hf-navy">
        {data.ticker} / Property detail
      </p>
      <h1 class="mt-3 hf-heading-3">
        {displayPropertyValue(data.property.name || data.property.addressInput)}
      </h1>
      <p class="mt-3 max-w-2xl text-hf-base-dark/70 hf-body-1">
        {displayPropertyValue(data.property.address || data.property.addressInput)}
      </p>
    </header>

    <section class="mt-8" aria-labelledby="property-details-title">
      <h2 id="property-details-title" class="hf-heading-5">Property details</h2>
      <dl class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Location</dt>
          <dd class="mt-1 hf-body-2">{displayPropertyValue(propertyLocation)}</dd>
        </div>
        <div>
          <dt class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Country</dt>
          <dd class="mt-1 hf-body-2">{displayPropertyValue(data.property.country)}</dd>
        </div>
        <div>
          <dt class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Square footage</dt>
          <dd class="mt-1 hf-body-2">{displayPropertyValue(data.property.squareFootage)}</dd>
        </div>
        <div>
          <dt class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Address input</dt>
          <dd class="mt-1 break-words hf-body-2">
            {displayPropertyValue(data.property.addressInput)}
          </dd>
        </div>
      </dl>
    </section>

    <section class="mt-8" aria-labelledby="property-facts-title">
      <h2 id="property-facts-title" class="hf-heading-5">Property facts</h2>
      {#if data.property.facts.length > 0}
        <dl
          class="mt-4 divide-y divide-hf-grey rounded-xl border border-hf-base-dark/20 bg-hf-base-light"
        >
          {#each data.property.facts as fact (fact.label)}
            <div
              class="grid gap-1 px-4 py-4 sm:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] sm:gap-4"
            >
              <dt class="hf-body-2-x text-hf-navy">{fact.label}</dt>
              <dd class="break-words hf-body-2">{fact.value}</dd>
            </div>
          {/each}
        </dl>
      {:else}
        <p
          class="mt-4 rounded-xl border border-dashed border-hf-navy bg-hf-blue/20 p-6 hf-body-2"
          role="status"
        >
          No property facts are available for this record yet.
        </p>
      {/if}
    </section>
  </div>
</div>
```

Use repository typography and spacing conventions while keeping the exact facts loop and empty-state behavior above. The mobile-card comment belongs on the portfolio page, not this detail view.

- [ ] **Step 4: Verify and commit**

```bash
npx vitest run 'src/routes/properties/[ticker]/[id]/+page.test.ts'
npx prettier --check 'src/routes/properties/[ticker]/[id]/+page.svelte' 'src/routes/properties/[ticker]/[id]/+page.test.ts'
npm run check
git add 'src/routes/properties/[ticker]/[id]/+page.svelte' 'src/routes/properties/[ticker]/[id]/+page.test.ts'
git commit -m "feat: render property detail facts"
```

Expected: both rendering tests pass, files are formatted, and Svelte reports no errors or warnings.

### Task 7: Integrate links and streamline the portfolio page

**Files:**

- Modify: `src/routes/properties/[ticker]/+page.svelte`
- Create: `src/routes/properties/[ticker]/+page.test.ts`

**Interfaces:**

- Consumes: `propertyDetailsPath`, `propertyPopupContent`, and the `rowActionHref` prop from Tasks 3–4.
- Produces: a portfolio page whose desktop table has only `Name`, `City`, and `State`; property-name links open detail pages; other row clicks focus the map; popups include detail links; mobile cards remain unchanged except for the source-code note.

- [ ] **Step 1: Write a failing portfolio-rendering test**

Create `src/routes/properties/[ticker]/+page.test.ts`:

```ts
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Page from './+page.svelte';

describe('ticker property page', () => {
  it('keeps the desktop table narrow and links the property name to details', () => {
    const { body } = render(Page, {
      props: {
        data: {
          ticker: 'PLD',
          properties: [
            {
              id: 'property-1',
              name: 'Warehouse',
              addressInput: '1 Main Street, Dallas, TX',
              city: 'Dallas',
              state: 'TX',
              facts: [],
            },
          ],
          metaTags: { title: 'PLD Property Data', description: 'Property data' },
        },
      } as never,
    });

    const tableStart = body.indexOf('<table');
    const tableEnd = body.indexOf('</table>') + '</table>'.length;
    const tableMarkup = body.slice(tableStart, tableEnd);

    expect(tableMarkup).toContain('Name');
    expect(tableMarkup).toContain('City');
    expect(tableMarkup).toContain('State');
    expect(tableMarkup).not.toContain('Address');
    expect(tableMarkup).not.toContain('Square Footage');
    expect(tableMarkup).toContain('href="/properties/PLD/property-1"');
    expect(tableMarkup).toContain('View Warehouse property details');
  });
});
```

- [ ] **Step 2: Verify the expected red failure**

```bash
npx vitest run 'src/routes/properties/[ticker]/+page.test.ts'
```

Expected: the test fails because the current table still includes `Address` and `Square Footage` and does not render a detail URL.

- [ ] **Step 3: Update the portfolio page integration**

Make these focused changes in `src/routes/properties/[ticker]/+page.svelte`:

1. Import `propertyDetailsPath` and `propertyPopupContent` from `$lib/utils/propertyMap`.
2. Replace the raw popup string with:

```ts
marker.bindPopup(propertyPopupContent(property, data.ticker));
```

3. Add the table-link helper:

```ts
const propertyDetailsHref = (tableRowData: Record<string, unknown>) =>
  propertyDetailsPath(data.ticker, String(tableRowData.id));
```

4. Keep `focusProperty`, `propertyIdentifier`, and the row callback for map focus. Update the desktop hint:

```svelte
<p class="hf-caption text-hf-base-dark/60">
  Open a property name for details, or select the rest of its row to focus the map
</p>
```

5. Change the desktop table headers to exactly:

```svelte
tableHeaders={{
  name: 'Name',
  city: 'City',
  state: 'State',
}}
```

6. Pass the detail-link props while retaining row behavior:

```svelte
rowActionLabel={(row) => `View ${propertyIdentifier(row)} property details`}
rowActionText={propertyIdentifier}
rowActionHref={propertyDetailsHref}
```

7. Add this source-code comment immediately before the mobile-card section:

```svelte
<!-- Facts intentionally stay on the property detail page and are omitted from compact mobile cards for now. -->
```

Do not remove or alter the mobile card's current square-footage, address, or empty-state display.

- [ ] **Step 4: Verify and commit**

```bash
npx vitest run 'src/routes/properties/[ticker]/+page.test.ts'
npx prettier --check 'src/routes/properties/[ticker]/+page.svelte' 'src/routes/properties/[ticker]/+page.test.ts'
npm run check
git add 'src/routes/properties/[ticker]/+page.svelte' 'src/routes/properties/[ticker]/+page.test.ts'
git commit -m "feat: link portfolio properties to detail pages"
```

Expected: the portfolio rendering test passes, the table contains only the three desktop columns, the details link is present, and Svelte reports no errors or warnings.

### Task 8: Run the complete applicable verification suite

**Files:**

- No intended source changes; only ignored test/build output may be generated.

- [ ] **Step 1: Inspect the complete diff and working tree**

```bash
git diff --check main...HEAD
git status --short
git diff --stat main...HEAD
```

Expected: only the approved design/plan documents, facts feature, detail route, table/map link utilities, tests, and portfolio/detail UI changes are present. No `.env`, build output, or unrelated files appear.

- [ ] **Step 2: Run all unit tests**

```bash
npm run test:unit
```

Expected: Vitest exits 0 with all tests passing.

- [ ] **Step 3: Run type and lint checks**

```bash
npm run check
npm run lint
```

Expected: both commands exit 0 with no Svelte-check errors/warnings, formatting failures, or ESLint errors.

- [ ] **Step 4: Run the production build**

```bash
npm run build
```

Expected: the Vercel build exits 0. Existing optional `pg-native` or Cloudflare socket warnings are acceptable only if no new error appears.

- [ ] **Step 5: Run integration tests if PostgreSQL is reachable**

```bash
npm run test:integration
```

Expected: Playwright builds/previews the app and passes its smoke test when the configured PostgreSQL database is reachable. If the database is unavailable, record the exact external-service failure instead of changing application code or credentials.

- [ ] **Step 6: Recheck status and report evidence**

```bash
git status --short --branch
git log --oneline --decorate -10
```

Report the exact command results, any PostgreSQL-dependent blocker, and the final feature-worktree commit list.
