# Editorial Dashboard Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the minimal Housefire homepage with an editorial dashboard that explains the REIT, property, and geocode data layers and links visitors into the existing ticker-specific property views.

**Architecture:** Keep the existing homepage server load and render the new experience entirely in `src/routes/+page.svelte`. Use semantic HTML, existing Tailwind theme tokens, and the current typography classes; add no new client-side data flow or dependencies. Align homepage SEO metadata in `+page.server.ts` and update the existing Playwright smoke test to prove the editorial content and catalog action are present.

**Tech Stack:** SvelteKit, Svelte 5, TypeScript, Tailwind CSS 4, Poppins typography, Playwright.

## Global Constraints

- The first version is editorial and must not display live database counts.
- The page continues to use the existing `reitTickers` server-loaded data for the browseable ticker directory.
- A future data-summary aggregation table should provide trusted summary records; no aggregation table or summary query is part of this work.
- Preserve the existing `hf-base-light` canvas, Poppins font, gradient logo, and Housefire theme tokens.
- Use existing Housefire typography classes and Tailwind theme utilities; do not introduce a separate visual system.
- Do not add animation libraries, raster assets, external imagery, new data dependencies, or client-side JavaScript for the landing page.
- Keep the change limited to the homepage, homepage SEO metadata, and its smoke test.
- Preserve unrelated user changes and inspect the final diff before claiming completion.

## File Map

- Modify: `src/routes/+page.svelte` — editorial layout, CSS-built decorative snapshot, data-layer panels, ticker tiles, and empty state.
- Modify: `src/routes/+page.server.ts` — homepage title and description only; keep `getAllTickers` unchanged.
- Modify: `tests/test.ts` — homepage smoke assertions for the new hero, data-layer explanation, catalog heading, CTA, and SEO title.
- Do not modify: `src/app.css` — the current typography and theme tokens are sufficient for this implementation.

### Task 1: Add the failing homepage smoke assertions

**Files:**

- Modify: `tests/test.ts`

**Interfaces:**

- Consumes: The existing homepage at `/` and its `Housefire Logo` image.
- Produces: A regression test requiring the approved editorial structure and homepage SEO title.

- [ ] **Step 1: Replace the old sentence assertion with the approved editorial assertions**

Update `tests/test.ts` to this exact test:

```ts
import { expect, test } from '@playwright/test';

test('index page explains Housefire and exposes the catalog entry point', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByAltText('Housefire Logo')).toBeVisible();
  await expect(page).toHaveTitle('Housefire | REIT Property Data, Made Tangible');
  await expect(
    page.getByRole('heading', { name: "See the shape of a REIT's portfolio." }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'A portfolio, in three useful layers.' }),
  ).toBeVisible();
  await expect(page.getByText('Geocodes', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Start with a ticker.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Browse the catalog' }).first()).toHaveAttribute(
    'href',
    '#catalog',
  );
});
```

- [ ] **Step 2: Run the new smoke test and verify it fails for the missing editorial content**

Run:

```sh
npm run test:integration -- tests/test.ts
```

Expected on a reachable PostgreSQL-backed app: the test starts, finds the existing logo, then fails because the current homepage does not contain the new title or headings. If the homepage cannot load because PostgreSQL is unavailable, record that external failure and continue to the implementation; the static checks remain independent of the database.

- [ ] **Step 3: Commit the failing test**

```sh
git add tests/test.ts
git commit -m "test: specify editorial homepage content"
```

### Task 2: Align homepage SEO metadata

**Files:**

- Modify: `src/routes/+page.server.ts`

**Interfaces:**

- Consumes: Existing `getAllTickers` server query.
- Produces: `metaTags.title` equal to `REIT Property Data, Made Tangible` and a description that names Housefire, REIT holdings, property records, locations, and geocode data.

- [ ] **Step 1: Keep the existing ticker load and replace only the metadata copy**

The complete file should be:

```ts
import { getAllTickers } from '$lib/server/db/reitQueries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    reitTickers: await getAllTickers(),
    metaTags: {
      title: 'REIT Property Data, Made Tangible',
      description:
        'Housefire is a growing catalog of REIT holdings, with property records, locations, and map-ready geocode data.',
    },
  };
};
```

- [ ] **Step 2: Run the formatter and the homepage type check**

Run:

```sh
npx prettier --check src/routes/+page.server.ts
npx eslint src/routes/+page.server.ts
```

Expected: both commands exit 0. The Playwright test remains red because the page markup is not implemented yet.

- [ ] **Step 3: Commit the metadata change**

```sh
git add src/routes/+page.server.ts
git commit -m "content: align homepage metadata"
```

### Task 3: Implement the editorial dashboard homepage

**Files:**

- Modify: `src/routes/+page.svelte`

**Interfaces:**

- Consumes: `PageServerData.reitTickers` from the existing homepage server load and SvelteKit `resolve`/`Pathname` for property links.
- Produces: A semantic responsive homepage with the approved hero, three data-layer panels, ticker directory, empty state, closing note, and keyboard-visible focus states.

- [ ] **Step 1: Replace the minimal homepage with the editorial dashboard markup**

Replace `src/routes/+page.svelte` with:

```svelte
<script lang="ts">
  import type { PageServerData } from './$types';
  import { resolve } from '$app/paths';
  import type { Pathname } from '$app/types';

  export let data: PageServerData;

  const propertyHref = (ticker: string) => resolve(`/properties/${ticker}` as Pathname);
</script>

<main class="w-full overflow-hidden px-6 pb-16 text-hf-base-dark sm:px-10 lg:px-16">
  <section
    class="mx-auto grid max-w-6xl gap-12 pb-20 pt-16 lg:grid-cols-2 lg:items-center lg:gap-20 lg:pb-28 lg:pt-24"
  >
    <div>
      <p class="hf-caption-x uppercase tracking-[0.28em] text-hf-navy">
        Housefire / REIT property data
      </p>
      <h1 class="mt-5 max-w-3xl text-hf-base-dark hf-heading-2">
        See the shape of a REIT's portfolio.
      </h1>
      <p class="mt-7 max-w-xl text-hf-base-dark hf-body-1 sm:text-lg sm:leading-8">
        Housefire turns property holdings into a clearer view of the places, records, and locations
        behind a ticker.
      </p>
      <a
        href="#catalog"
        class="mt-9 inline-flex items-center gap-3 rounded-full bg-hf-base-dark px-5 py-3 text-hf-base-light hf-body-1-x transition-colors duration-300 hover:bg-hf-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hf-orange"
      >
        Browse the catalog
        <span aria-hidden="true" class="text-hf-orange">↘</span>
      </a>
    </div>

    <div
      aria-hidden="true"
      class="relative overflow-hidden rounded-2xl border border-hf-base-dark bg-hf-blue/40 p-4 sm:p-6"
    >
      <div class="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-hf-orange/70"></div>
      <div
        class="absolute -bottom-16 -left-12 h-40 w-40 rounded-full border-[18px] border-hf-orange/40"
      ></div>
      <div class="relative rounded-xl border border-hf-base-dark/20 bg-hf-base-light p-4 sm:p-6">
        <div class="flex items-center justify-between gap-4">
          <span class="hf-tiny-x tracking-[0.2em] text-hf-navy">PORTFOLIO SNAPSHOT</span>
          <span class="hf-tiny-x text-hf-base-dark/60">MAP + TABLE</span>
        </div>
        <div class="mt-12 flex h-32 items-end gap-3 border-b border-hf-base-dark/20 pb-3 sm:mt-16">
          <div class="h-1/3 flex-1 rounded-t bg-hf-orange"></div>
          <div class="h-2/3 flex-1 rounded-t bg-hf-navy"></div>
          <div class="h-1/2 flex-1 rounded-t bg-hf-orange/70"></div>
          <div class="h-full flex-1 rounded-t bg-hf-base-dark"></div>
          <div class="h-3/4 flex-1 rounded-t bg-hf-blue"></div>
        </div>
        <div class="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">
              Property record
            </p>
            <div class="mt-2 h-2 rounded-full bg-hf-base-dark/80"></div>
            <div class="mt-2 h-2 w-3/4 rounded-full bg-hf-grey"></div>
          </div>
          <div>
            <p class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Location</p>
            <div class="mt-2 h-2 rounded-full bg-hf-navy/80"></div>
            <div class="mt-2 h-2 w-2/3 rounded-full bg-hf-grey"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section
    class="mx-auto max-w-6xl border-t border-hf-grey py-16 sm:py-20"
    aria-labelledby="layers-title"
  >
    <div class="max-w-2xl">
      <p class="hf-caption-x uppercase tracking-[0.28em] text-hf-navy">A practical field guide</p>
      <h2 id="layers-title" class="mt-4 text-hf-base-dark hf-heading-4">
        A portfolio, in three useful layers.
      </h2>
    </div>

    <div class="mt-10 grid gap-10 md:grid-cols-3 md:gap-6 lg:mt-14 lg:gap-10">
      <article class="border-t-2 border-hf-orange pt-4">
        <p class="hf-caption-x text-hf-navy">01 / REITs</p>
        <h3 class="mt-4 text-hf-base-dark hf-heading-5">Start with the ticker.</h3>
        <p class="mt-3 text-hf-base-dark hf-body-2">
          Ticker-level entry points make it easy to browse an investment trust's holdings.
        </p>
      </article>
      <article class="border-t-2 border-hf-navy pt-4">
        <p class="hf-caption-x text-hf-navy">02 / Properties</p>
        <h3 class="mt-4 text-hf-base-dark hf-heading-5">Make the holdings tangible.</h3>
        <p class="mt-3 text-hf-base-dark hf-body-2">
          Property records bring together names, addresses, locations, and square-footage fields
          where available.
        </p>
      </article>
      <article class="border-t-2 border-hf-orange pt-4">
        <p class="hf-caption-x text-hf-navy">03 / Geocodes</p>
        <h3 class="mt-4 text-hf-base-dark hf-heading-5">Keep location in the picture.</h3>
        <p class="mt-3 text-hf-base-dark hf-body-2">
          Normalized address records and coordinates support map-ready location data.
        </p>
      </article>
    </div>
  </section>

  <section
    id="catalog"
    class="mx-auto max-w-6xl border-t border-hf-grey py-16 sm:py-20"
    aria-labelledby="catalog-title"
  >
    <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div class="max-w-2xl">
        <p class="hf-caption-x uppercase tracking-[0.28em] text-hf-navy">Browse the catalog</p>
        <h2 id="catalog-title" class="mt-4 text-hf-base-dark hf-heading-4">Start with a ticker.</h2>
        <p class="mt-4 text-hf-base-dark hf-body-1">
          Choose a REIT to explore its properties on a map and in a sortable table.
        </p>
      </div>
      <p class="hf-caption text-hf-base-dark/60">Updated monthly / growing regularly</p>
    </div>

    {#if data.reitTickers.length > 0}
      <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.reitTickers as ticker (ticker)}
          <a
            href={propertyHref(ticker)}
            class="group flex min-h-28 flex-col justify-between rounded-xl border border-hf-base-dark/20 bg-hf-base-light p-4 transition-colors duration-300 hover:border-hf-navy hover:bg-hf-blue/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hf-orange"
          >
            <span class="text-hf-base-dark hf-heading-5">{ticker}</span>
            <span class="flex items-center justify-between gap-3 text-hf-navy hf-caption-x">
              View properties
              <span
                aria-hidden="true"
                class="text-hf-orange transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </a>
        {/each}
      </div>
    {:else}
      <div
        class="mt-10 rounded-xl border border-dashed border-hf-navy bg-hf-blue/20 p-6 sm:p-8"
        role="status"
      >
        <h3 class="text-hf-base-dark hf-heading-5">The catalog is being prepared.</h3>
        <p class="mt-3 max-w-xl text-hf-base-dark hf-body-2">
          More REIT tickers will be added regularly. Check back soon to explore the map-and-table
          property views.
        </p>
      </div>
    {/if}
  </section>

  <section
    class="mx-auto max-w-6xl border-y border-hf-base-dark bg-hf-base-dark px-6 py-12 text-hf-base-light sm:px-10 sm:py-16"
    aria-labelledby="closing-title"
  >
    <p class="hf-caption-x uppercase tracking-[0.28em] text-hf-orange">
      Read the portfolio differently
    </p>
    <div class="mt-5 flex flex-col justify-between gap-8 md:flex-row md:items-end">
      <h2 id="closing-title" class="max-w-2xl hf-heading-4">A clearer way to read a portfolio.</h2>
      <a
        href="#catalog"
        class="inline-flex shrink-0 items-center gap-3 text-hf-orange hf-body-1-x underline decoration-hf-orange/50 underline-offset-4 transition-colors duration-300 hover:text-hf-base-light hover:decoration-hf-base-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hf-orange"
      >
        Browse available tickers
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  </section>
</main>
```

- [ ] **Step 2: Run formatting and the Svelte/TypeScript checks**

Run:

```sh
npx prettier --write src/routes/+page.svelte
npx prettier --check src/routes/+page.svelte src/routes/+page.server.ts tests/test.ts
npm run check
```

Expected: Prettier reports the changed files clean and `svelte-check` reports 0 errors and 0 warnings. If Svelte formatting changes the long class attributes, keep the formatter output and re-run the check.

- [ ] **Step 3: Run the focused smoke test and verify it passes**

Run:

```sh
npm run test:integration -- tests/test.ts
```

Expected with a reachable PostgreSQL database: the homepage smoke test passes and confirms the logo, SEO title, hero, data-layer explanation, catalog heading, geocodes label, and `#catalog` action.

- [ ] **Step 4: Commit the homepage implementation**

```sh
git add src/routes/+page.svelte
git commit -m "feat: add editorial homepage dashboard"
```

### Task 4: Run full verification and review the final diff

**Files:**

- Verify: `src/routes/+page.svelte`
- Verify: `src/routes/+page.server.ts`
- Verify: `tests/test.ts`

**Interfaces:**

- Consumes: The implementation from Tasks 1–3 and the repository's existing check/test commands.
- Produces: Evidence that static checks, build, unit tests, and the database-backed integration test either pass or have a precisely reported external blocker.

- [ ] **Step 1: Run the repository-wide formatter check and lint**

Run:

```sh
npm run lint
```

Expected: Prettier and ESLint both exit 0.

- [ ] **Step 2: Build the configured Vercel application**

Run:

```sh
npm run build
```

Expected: the SvelteKit/Vercel production build exits 0. Existing optional `pg-native` or Cloudflare socket warnings may appear without failing the build.

- [ ] **Step 3: Run unit tests**

Run:

```sh
npm run test:unit
```

Expected: all Vitest tests pass.

- [ ] **Step 4: Run the full integration suite**

Run:

```sh
npm run test:integration
```

Expected with PostgreSQL available: Playwright builds/previews the app and all integration tests pass. If PostgreSQL is unavailable, record the exact connection or environment error rather than treating the integration suite as passed.

- [ ] **Step 5: Inspect whitespace, scope, and repository status**

Run:

```sh
git diff --check
git diff -- src/routes/+page.svelte src/routes/+page.server.ts tests/test.ts
git status --short
```

Expected: no whitespace errors; the diff contains only the editorial homepage, SEO copy, and test changes; no `.env`, generated SvelteKit output, or unrelated files appear.
