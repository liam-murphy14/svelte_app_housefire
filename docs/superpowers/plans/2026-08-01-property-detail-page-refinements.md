# Property Detail Page Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the property detail page with a formatted visible address, a presentation-only square-footage fact, no backend-only address input display, and a focused property map above the details.

**Architecture:** Keep Prisma, API contracts, and stored scalar fields unchanged. Add pure display utilities for visible-address formatting and square-footage fact composition, use them in the detail server load, and keep an SSR-safe Leaflet map local to the detail page so the portfolio map is unaffected.

**Tech Stack:** SvelteKit 2, Svelte 5, TypeScript, Leaflet, Vitest, Svelte server-rendering tests, Tailwind CSS.

## Global Constraints

- Keep the existing Prisma schema, API contracts, and stored `Property.squareFootage` field unchanged.
- Format `address`, `address2`, `city`, `state`, `zip`, and `country`, omitting blanks and rendering state/ZIP as `state zip`.
- Use the formatted address for the heading fallback, subheading, and SEO metadata fallback.
- Do not render or use `addressInput` as user-facing detail-page content.
- Add a presentation-only `Square footage` fact when the scalar exists, preserving stored fact order and avoiding duplicates.
- Remove the top-level square-footage row from the details grid.
- Put a client-only one-marker Leaflet map above details; show `Map unavailable for this property` when coordinates are incomplete.
- Leave the existing portfolio map/page behavior unchanged.
- Use test-first development for every behavior change.
- Do not edit generated Prisma/Zod output; no schema change is required.

## File Map

- Create: `src/lib/utils/propertyAddress.ts`, `src/lib/utils/propertyAddress.test.ts`
- Modify: `src/lib/utils/propertyFacts.ts`, `src/lib/utils/propertyFacts.test.ts`
- Modify: `src/routes/properties/[ticker]/[id]/+page.server.ts`, `page.server.test.ts`
- Modify: `src/routes/properties/[ticker]/[id]/+page.svelte`, `page.test.ts`

---

### Task 1: Add the visible property-address formatter

**Files:** Create `src/lib/utils/propertyAddress.ts` and `src/lib/utils/propertyAddress.test.ts`.

**Interfaces:** `formatPropertyAddress(value: PropertyAddressFields): string` consumes optional visible address fields and returns a trimmed comma-separated address.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { formatPropertyAddress } from './propertyAddress';

describe('formatPropertyAddress', () => {
  it('formats the full address with state and ZIP together', () => {
    expect(formatPropertyAddress({
      address: '1 Main Street', address2: 'Suite 100', city: 'Dallas',
      state: 'TX', zip: '75001', country: 'United States',
    })).toBe('1 Main Street, Suite 100, Dallas, TX 75001, United States');
  });

  it('omits blank components', () => {
    expect(formatPropertyAddress({
      address: '1 Main Street', address2: '   ', city: 'Dallas',
      state: null, zip: '75001', country: 'United States',
    })).toBe('1 Main Street, Dallas, 75001, United States');
  });

  it('returns an empty string when no visible fields exist', () => {
    expect(formatPropertyAddress({})).toBe('');
  });
});
```

- [ ] **Step 2: Verify the intended failure**

Run `npx vitest run src/lib/utils/propertyAddress.test.ts`. Expect failure because the module and formatter do not exist.

- [ ] **Step 3: Implement the formatter**

Create the utility with:

```ts
export type PropertyAddressFields = {
  address?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
};

const clean = (value: string | null | undefined): string => value?.trim() || '';

export const formatPropertyAddress = ({
  address, address2, city, state, zip, country,
}: PropertyAddressFields): string => {
  const location = [clean(city), [clean(state), clean(zip)].filter(Boolean).join(' ')]
    .filter(Boolean).join(', ');
  return [clean(address), clean(address2), location, clean(country)]
    .filter(Boolean).join(', ');
};
```

- [ ] **Step 4: Verify and commit**

Run `npx vitest run src/lib/utils/propertyAddress.test.ts` and `npx prettier --check src/lib/utils/propertyAddress.ts src/lib/utils/propertyAddress.test.ts`. Then commit:

```bash
git add src/lib/utils/propertyAddress.ts src/lib/utils/propertyAddress.test.ts
git commit -m "feat: format visible property addresses"
```

### Task 2: Compose square footage into presentation facts

**Files:** Modify `src/lib/utils/propertyFacts.ts` and `src/lib/utils/propertyFacts.test.ts`.

**Interfaces:** `withSquareFootageFact(facts: PropertyFact[], squareFootage: number | null | undefined): PropertyFact[]` prepends one formatted fact when needed and preserves stored facts.

- [ ] **Step 1: Write the failing tests**

Import `withSquareFootageFact` and add:

```ts
describe('withSquareFootageFact', () => {
  it('prepends formatted square footage and preserves stored order', () => {
    const facts = [{ label: 'Year built', value: '2022' }, { label: 'Lease term', value: '15 years' }];
    expect(withSquareFootageFact(facts, 125000)).toEqual([
      { label: 'Square footage', value: '125,000' }, ...facts,
    ]);
  });

  it('does not add a fact for missing or non-finite values', () => {
    const facts = [{ label: 'Year built', value: '2022' }];
    expect(withSquareFootageFact(facts, null)).toEqual(facts);
    expect(withSquareFootageFact(facts, undefined)).toEqual(facts);
    expect(withSquareFootageFact(facts, Number.NaN)).toEqual(facts);
  });

  it('does not duplicate an existing square-footage fact', () => {
    const facts = [{ label: 'Square Footage', value: '125,000' }];
    expect(withSquareFootageFact(facts, 125000)).toEqual(facts);
  });
});
```

- [ ] **Step 2: Verify the intended failure**

Run `npx vitest run src/lib/utils/propertyFacts.test.ts`. Expect the new tests to fail because `withSquareFootageFact` is not defined.

- [ ] **Step 3: Implement the composer**

Add after `parsePropertyFacts`:

```ts
export const withSquareFootageFact = (
  facts: PropertyFact[], squareFootage: number | null | undefined,
): PropertyFact[] => {
  if (typeof squareFootage !== 'number' || !Number.isFinite(squareFootage) ||
      facts.some((fact) => fact.label.trim().toLowerCase() === 'square footage')) {
    return facts;
  }
  return [
    { label: 'Square footage', value: new Intl.NumberFormat('en-US').format(squareFootage) },
    ...facts,
  ];
};
```

- [ ] **Step 4: Verify and commit**

Run `npx vitest run src/lib/utils/propertyFacts.test.ts` and `npx prettier --check src/lib/utils/propertyFacts.ts src/lib/utils/propertyFacts.test.ts`. Then commit:

```bash
git add src/lib/utils/propertyFacts.ts src/lib/utils/propertyFacts.test.ts
git commit -m "feat: present square footage as a property fact"
```

### Task 3: Feed formatted address and composed facts into the detail load

**Files:** Modify `src/routes/properties/[ticker]/[id]/+page.server.ts` and `page.server.test.ts`.

**Interfaces:** The load consumes `getPropertyById` and the display utilities; it returns normalized/composed facts and metadata using the property name or visible address, never `addressInput`.

- [ ] **Step 1: Write the failing server-load assertions**

Update the happy-path mock with `name: ''`, visible address fields, `squareFootage: 125000`, and `addressInput: 'backend-only-address-input'`. Assert:

```ts
expect(result).toMatchObject({
  property: { facts: [
    { label: 'Square footage', value: '125,000' },
    { label: 'Year built', value: '2022' },
  ] },
  metaTags: {
    title: 'PLD | 1 Main Street, Suite 100, Dallas, TX 75001, United States Property Details',
  },
});
expect(result.metaTags.title).not.toContain('backend-only-address-input');
```

Add a nameless property with no visible address fields and assert its title uses the stable `Property Details` fallback, not `addressInput`.

- [ ] **Step 2: Verify the intended failure**

Run `npx vitest run 'src/routes/properties/[ticker]/[id]/page.server.test.ts'`. Expect the updated happy-path/fallback assertions to fail while the 404 tests remain valid.

- [ ] **Step 3: Implement the load changes**

Import `formatPropertyAddress`, `parsePropertyFacts`, and `withSquareFootageFact`, then use:

```ts
const visibleAddress = formatPropertyAddress(property);
const propertyLabel = property.name?.trim() || visibleAddress || 'Property';

return {
  ticker: params.ticker,
  property: {
    ...property,
    facts: withSquareFootageFact(parsePropertyFacts(property.facts), property.squareFootage),
  },
  metaTags: {
    title: `${params.ticker} | ${propertyLabel} Property Details`,
    description: `See detailed property information and facts for ${params.ticker}.`,
  },
};
```

Keep the missing-property and ticker-mismatch 404 guard unchanged.

- [ ] **Step 4: Verify and commit**

Run the focused server-load test and `npx prettier --check 'src/routes/properties/[ticker]/[id]/+page.server.ts' 'src/routes/properties/[ticker]/[id]/page.server.test.ts'`. Then commit:

```bash
git add 'src/routes/properties/[ticker]/[id]/+page.server.ts' 'src/routes/properties/[ticker]/[id]/page.server.test.ts'
git commit -m "feat: use visible property data in detail loads"
```

### Task 4: Add the focused property map and revise the detail page

**Files:** Modify `src/routes/properties/[ticker]/[id]/+page.svelte` and `page.test.ts`.

**Interfaces:** The page consumes the updated detail data and renders a formatted subheading, one-property map or unavailable state, no `addressInput`/top-level square-footage display, and the composed facts.

- [ ] **Step 1: Write the failing render tests**

Use `addressInput: 'backend-only-address-input'` in the main fixture and assert:

```ts
expect(body).toContain('1 Main Street, Suite 100, Dallas, TX 75001, United States');
expect(body).toContain('Property location');
expect(body).toContain('id="property-map"');
expect(body).toContain('Square footage');
expect(body).toContain('125,000');
expect(body).not.toContain('backend-only-address-input');
```

Replace the whitespace-name test with visible fields and assert the `<h1>` contains `1 Main Street, Dallas, TX 75001, United States`, not the backend input. Add a no-coordinate fixture and assert:

```ts
expect(body).toContain('Map unavailable for this property');
expect(body).not.toContain('id="property-map"');
```

- [ ] **Step 2: Verify the intended failure**

Run `npx vitest run 'src/routes/properties/[ticker]/[id]/page.test.ts'`. Expect failure because the current page displays `addressInput` and scalar square footage, lacks the map/placeholder, and falls back to `addressInput` for nameless properties.

- [ ] **Step 3: Implement map setup and display derivations**

Import `leaflet/dist/leaflet.css`, `onMount`, `Map` as a type, and `formatPropertyAddress`. Add `mapElement: HTMLDivElement`, optional `map`, and:

```ts
const propertyAddress = $derived(formatPropertyAddress(data.property));
const propertyHeading = $derived(data.property.name?.trim() || propertyAddress || 'Property');
const hasCoordinates = $derived(
  typeof data.property.latitude === 'number' && Number.isFinite(data.property.latitude) &&
  typeof data.property.longitude === 'number' && Number.isFinite(data.property.longitude),
);
```

In `onMount`, return when `hasCoordinates` is false, dynamically import Leaflet, set the icon path to `/leaflet/`, initialize `leaflet.map(mapElement).setView([latitude, longitude], 15)`, add the existing OpenStreetMap tile layer, add one marker with a heading/address popup, open the popup, and return cleanup that removes the map. Use local numeric coordinates after the guard if asynchronous narrowing requires it.

- [ ] **Step 4: Implement the markup**

Use `propertyAddress` for the subheading and `propertyHeading` for the heading fallback. Insert before `Property details`:

```svelte
<section class="mt-8" aria-labelledby="property-location-title">
  <h2 id="property-location-title" class="hf-heading-5">Property location</h2>
  {#if hasCoordinates}
    <div id="property-map" bind:this={mapElement}
      class="mt-4 h-[24rem] overflow-hidden rounded-xl border border-hf-base-dark/20"></div>
  {:else}
    <p class="mt-4 rounded-xl border border-dashed border-hf-navy bg-hf-blue/20 p-6 hf-body-2"
      role="status">Map unavailable for this property.</p>
  {/if}
</section>
```

Retain `Name`, `Address`, `Address line 2`, `Neighborhood`, `Location`, `Country`, `Latitude`, and `Longitude` in the details grid. Remove `Square footage` and `Address input` blocks. Keep the existing facts section over `data.property.facts`.

- [ ] **Step 5: Verify and commit**

Run the focused page test, `npm run check`, and `npx prettier --check 'src/routes/properties/[ticker]/[id]/+page.svelte' 'src/routes/properties/[ticker]/[id]/page.test.ts'`. Expect tests to pass, `svelte-check` to report 0 errors/0 warnings, and clean formatting. Then commit:

```bash
git add 'src/routes/properties/[ticker]/[id]/+page.svelte' 'src/routes/properties/[ticker]/[id]/page.test.ts'
git commit -m "feat: refine property detail presentation"
```

### Task 5: Run the complete applicable verification suite

**Files:** No source changes expected; inspect the final worktree and diff.

- [ ] **Step 1:** Run `npm run test:unit`; expect zero failures.
- [ ] **Step 2:** Run `npm run lint`; expect Prettier and ESLint to pass.
- [ ] **Step 3:** Run `npm run build`; expect the Vercel build to pass without a database connection.
- [ ] **Step 4:** Run:

```bash
git diff --check HEAD~4..HEAD
git status --short
git diff --stat HEAD~4..HEAD
```

Expected: only approved design/plan documents and focused property-detail changes are present; no environment files, build output, generated Prisma/Zod edits, or unrelated user changes appear.
