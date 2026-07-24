# Ticket Page Table and Responsive Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the ticket property view use a polished sortable table on large screens and readable property cards without the map on smaller screens.

**Architecture:** Keep `SortableTable.svelte` as the generic desktop table and preserve its sorting API. Make `+page.svelte` responsible for responsive composition: show the map/table pair at `lg` and above and a mobile-only property-card list below `lg`, using the same loaded records. Add one tested display formatter for consistent em-dash handling and number formatting.

**Tech Stack:** Svelte 5, SvelteKit, TypeScript, Tailwind CSS 4, Housefire design tokens, Vitest, Svelte Check, ESLint, Prettier, and Vite production builds.

## Global Constraints

- Keep server-only code under `src/lib/server` or server route files.
- Treat `prisma/schema.prisma` as the source of truth; this UI change requires no schema or generated-output changes.
- Preserve the existing `SortableTable` sorting API and desktop row-to-map marker interaction.
- Use existing Housefire tokens; do not introduce new colors or broad site-wide styling.
- Keep the map hidden below the `lg` breakpoint and do not expose map actions from mobile cards.
- Run `npm run check`, `npm run lint`, `npm run build`, and `npm run test:unit` before claiming completion.

---

### Task 1: Add a tested property display formatter

**Files:**
- Create: `src/lib/utils/propertyDisplay.ts`
- Test: `src/lib/utils/propertyDisplay.test.ts`

**Interfaces:**
- Produce `displayPropertyValue(value: string | number | null | undefined): string`.
- Return `—` for `null`, `undefined`, and empty strings; preserve text; format numbers with `Intl.NumberFormat('en-US')`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { displayPropertyValue } from './propertyDisplay';

describe('displayPropertyValue', () => {
  it('uses an em dash for missing values', () => {
    expect(displayPropertyValue(null)).toBe('—');
    expect(displayPropertyValue(undefined)).toBe('—');
    expect(displayPropertyValue('')).toBe('—');
  });

  it('preserves text and formats numeric values', () => {
    expect(displayPropertyValue('125 Main Street')).toBe('125 Main Street');
    expect(displayPropertyValue(125000)).toBe('125,000');
  });
});
```

- [ ] **Step 2: Verify the test fails**

Run `npm run test:unit -- src/lib/utils/propertyDisplay.test.ts`.

Expected: Vitest fails because `./propertyDisplay` does not exist.

- [ ] **Step 3: Write the minimal implementation**

Create `src/lib/utils/propertyDisplay.ts`:

```ts
export const displayPropertyValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  return typeof value === 'number' ? new Intl.NumberFormat('en-US').format(value) : value;
};
```

- [ ] **Step 4: Verify the test passes**

Run `npm run test:unit -- src/lib/utils/propertyDisplay.test.ts`.

Expected: both formatter tests pass with no failures.

- [ ] **Step 5: Commit the formatter**

```bash
git add src/lib/utils/propertyDisplay.ts src/lib/utils/propertyDisplay.test.ts
git commit -m "feat: add property display formatting helper"
```

### Task 2: Polish and make the desktop table keyboard-accessible

**Files:**
- Modify: `src/lib/components/Icon.svelte`
- Modify: `src/lib/components/SortableTable.svelte`
- Test: `src/lib/components/SortableTable.test.ts`

**Interfaces:**
- `Icon.svelte` accepts its existing `theme="base"` plus `theme="light"` for icons on dark surfaces.
- `SortableTable.svelte` keeps `idKey`, `tableHeaders`, `tableData`, `sortFunctions`, and `rowOnClick` unchanged.
- Header controls sort as before; rows call `rowOnClick(row)` on click or Enter/Space activation.

- [ ] **Step 1: Write the failing table semantics test**

Create `src/lib/components/SortableTable.test.ts`:

```ts
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import SortableTable from './SortableTable.svelte';

describe('SortableTable', () => {
  it('renders accessible sort controls and focusable rows', () => {
    const { body } = render(SortableTable, {
      props: {
        idKey: 'id',
        tableHeaders: { name: 'Name' },
        tableData: [{ id: 'property-1', name: 'Warehouse' }],
      },
    });

    expect(body).toContain('aria-sort="none"');
    expect(body).toContain('type="button"');
    expect(body).toContain('tabindex="0"');
    expect(body).toContain('Warehouse');
  });
});
```

- [ ] **Step 2: Verify the test fails**

Run `npm run test:unit -- src/lib/components/SortableTable.test.ts`.

Expected: the test fails because the current table has no `aria-sort`, header button, or focusable row.

- [ ] **Step 3: Implement the table presentation and semantics**

In `Icon.svelte`, change the prop to `export let theme: 'base' | 'light' = 'base';` and map `base` to `text-hf-base-dark` and `light` to `text-hf-base-light` in the existing `classNames` call.

In `SortableTable.svelte`, keep the sorting state and `sortTable` implementation unchanged, then:

1. Wrap the table in `w-full overflow-x-auto rounded-xl border border-hf-base-dark/20 bg-hf-base-light`; give the table `min-w-full border-collapse`.
2. Give each header `scope="col"`, `aria-sort={sortKey === key ? sortDirection === 'asc' ? 'ascending' : 'descending' : 'none'}`, and a `bg-hf-navy` treatment.
3. Move the click handler to a native button with this styling and accessible label:

```svelte
<button
  type="button"
  class="group flex min-h-10 w-full items-center justify-between gap-3 rounded-md px-2 py-1 text-left text-hf-base-light focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hf-orange"
  aria-label={sortKey === key
    ? `${tableHeaders[key]}, sorted ${sortDirection === 'asc' ? 'ascending' : 'descending'}`
    : `Sort by ${tableHeaders[key]}`}
  on:click={() => onTableHeaderClick(key)}
>
  <span class="hf-body-1-x">{tableHeaders[key]}</span>
  <Icon
    src={sortKey === key ? sortDirection === 'asc' ? ChevronUp : ChevronDown : ChevronUpDown}
    mini
    theme="light"
    size="md"
  />
</button>
```

4. Give each data row `tabindex="0"`, visible hover/focus classes, the existing click handler, and a keydown handler that calls `rowOnClick(row)` for Enter or Space after `event.preventDefault()`.
5. Keep the current cell iteration and values, using `px-4 py-3` spacing and row dividers instead of borders on every cell.

- [ ] **Step 4: Verify table changes**

Run:

```bash
npm run test:unit -- src/lib/components/SortableTable.test.ts
npm run check
```

Expected: the semantics test passes and `svelte-check` reports 0 errors and 0 warnings.

- [ ] **Step 5: Commit the table polish**

```bash
git add src/lib/components/Icon.svelte src/lib/components/SortableTable.svelte src/lib/components/SortableTable.test.ts
git commit -m "feat: polish sortable property table"
```

### Task 3: Add responsive ticket-page composition and mobile cards

**Files:**
- Modify: `src/routes/properties/[ticker]/+page.svelte`

**Interfaces:**
- Keep `PageServerData`, Leaflet setup, and existing `SortableTable` bindings.
- Pass `joinedPropertyData` to the desktop table for marker focus.
- Iterate over `data.properties` for mobile cards so they render immediately from server-loaded data before Leaflet finishes.
- Use `displayPropertyValue` for all optional mobile fields.

- [ ] **Step 1: Record the responsive acceptance checks before editing**

```text
Large viewport: map and sortable table visible; headers expose sort controls; row click/keyboard activation focuses the marker; columns remain readable and can scroll horizontally.
Small viewport: map and desktop table hidden; one card per property; missing values use em dashes; square footage is comma-formatted; cards expose no map action.
```

- [ ] **Step 2: Implement the responsive markup**

Import `displayPropertyValue` and replace only the page markup, preserving the existing Leaflet script:

```ts
import { displayPropertyValue } from '$lib/utils/propertyDisplay';
```

Use this layout contract:

```svelte
<div class="min-h-full overflow-auto bg-hf-base-light px-6 py-8 text-hf-base-dark sm:px-10 lg:px-16 lg:py-10">
  <div class="mx-auto max-w-7xl">
    <header class="border-b border-hf-grey pb-6">
      <p class="hf-caption-x uppercase tracking-[0.28em] text-hf-navy">{data.ticker} / Property portfolio</p>
      <h1 class="mt-3 hf-heading-3">{data.ticker} Properties</h1>
      <p class="mt-3 max-w-2xl text-hf-base-dark/70 hf-body-1">Explore the holdings on a map and sort the underlying property records.</p>
    </header>

    <div class="mt-8 hidden gap-8 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section aria-labelledby="map-title">
        <p class="hf-caption-x uppercase tracking-[0.2em] text-hf-navy">01 / Map</p>
        <h2 id="map-title" class="mt-2 hf-heading-5">Where the portfolio sits</h2>
        <div id="map" class="mt-3 h-[32rem] overflow-hidden rounded-xl border border-hf-base-dark/20"></div>
      </section>
      <section aria-labelledby="table-title" class="min-w-0">
        <p class="hf-caption-x uppercase tracking-[0.2em] text-hf-navy">02 / Records</p>
        <div class="mt-2 flex items-end justify-between gap-4">
          <h2 id="table-title" class="hf-heading-5">Property records</h2>
          <p class="hf-caption text-hf-base-dark/60">Select a row to focus the map</p>
        </div>
        <div class="mt-3">
          <SortableTable
            idKey="id"
            tableHeaders={{
              name: 'Name',
              address: 'Address',
              city: 'City',
              state: 'State',
              squareFootage: 'Square Footage',
            }}
            tableData={joinedPropertyData}
            rowOnClick={focusProperty}
          />
        </div>
      </section>
    </div>

    <section class="mt-8 lg:hidden" aria-labelledby="mobile-properties-title">
      <p class="hf-caption-x uppercase tracking-[0.2em] text-hf-navy">Property records</p>
      <h2 id="mobile-properties-title" class="mt-2 hf-heading-4">Holdings at a glance</h2>
      {#if data.properties.length > 0}
        <div class="mt-4 grid gap-4">
          {#each data.properties as property (property.id)}
            <article class="rounded-xl border border-hf-base-dark/20 bg-hf-base-light p-5 shadow-[0_8px_24px_rgba(18,18,18,0.06)]">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <p class="hf-tiny-x uppercase tracking-[0.2em] text-hf-navy">Property record</p>
                  <h3 class="mt-2 break-words text-hf-base-dark hf-heading-5">{displayPropertyValue(property.name)}</h3>
                </div>
                <div class="shrink-0 text-right">
                  <p class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Square footage</p>
                  <p class="mt-1 text-hf-base-dark hf-body-1-x">{displayPropertyValue(property.squareFootage)}</p>
                </div>
              </div>
              <div class="mt-5 border-t border-hf-grey pt-4">
                <p class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Address</p>
                <p class="mt-2 text-hf-base-dark hf-body-2">{displayPropertyValue(property.address)}</p>
                <p class="mt-1 text-hf-base-dark/70 hf-caption">{displayPropertyValue([property.city, property.state, property.zip].filter(Boolean).join(', '))}</p>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="mt-4 rounded-xl border border-dashed border-hf-navy bg-hf-blue/20 p-6" role="status">
          <p class="text-hf-base-dark hf-body-2">No property records are available for this ticker yet.</p>
        </div>
      {/if}
    </section>
  </div>
</div>
```

Keep the `id="map"` unique, preserve the exact `SortableTable` bindings shown above, and do not recreate sorting in the page.

- [ ] **Step 3: Run focused verification**

Run:

```bash
npm run check
npm run test:unit
npx prettier --check 'src/routes/properties/[ticker]/+page.svelte' src/lib/components/SortableTable.svelte src/lib/components/Icon.svelte src/lib/utils/propertyDisplay.ts src/lib/utils/propertyDisplay.test.ts src/lib/components/SortableTable.test.ts
```

Expected: Svelte Check reports 0 errors and 0 warnings, all unit tests pass, and Prettier accepts every changed file.

- [ ] **Step 4: Commit the responsive page**

```bash
git add 'src/routes/properties/[ticker]/+page.svelte'
git commit -m "feat: add responsive property cards"
```

### Task 4: Run the complete verification pass and inspect the final diff

**Files:**
- Read: `docs/superpowers/specs/2026-07-23-ticket-page-table-responsive-design.md`
- Read: `git diff` and `git status --short`

**Interfaces:** Verify the implementation against the approved spec and repository guide without changing schema, generated output, credentials, or unrelated files.

- [ ] **Step 1: Run `npm run lint`**

Expected: Prettier and ESLint exit 0 with no errors.

- [ ] **Step 2: Run `npm run build`**

Expected: the Vercel production build exits 0. Document only optional adapter warnings if present; they must not be build errors.

- [ ] **Step 3: Run `npm run test:unit`**

Expected: all Vitest tests pass, including the formatter and table semantics tests.

- [ ] **Step 4: Run `npm run test:integration` when PostgreSQL is available**

Expected: Playwright builds/previews the app and passes the smoke test. If PostgreSQL is unavailable, record the exact connection failure rather than treating it as a UI regression.

- [ ] **Step 5: Manually inspect both responsive modes**

At `/properties/<ticker>`, verify at a large viewport that the map/table pair, sort controls, focus states, and row-to-marker interaction work. Verify below `lg` that the map/table are hidden, every property has a card, optional values are intentional, and square footage is comma-formatted.

- [ ] **Step 6: Review the final diff**

Run:

```bash
git diff --check
git diff --stat HEAD~3..HEAD
git status --short
```

Expected: no whitespace errors and no `.env`, build output, or generated Prisma/SvelteKit files added.
