<script lang="ts">
  import type { PageServerData } from './$types';
  import { resolve } from '$app/paths';
  import type { Pathname } from '$app/types';

  export let data: PageServerData;
</script>

<main class="w-full overflow-hidden px-6 pb-16 text-hf-base-dark sm:px-10 lg:px-16">
  <section
    class="mx-auto grid max-w-6xl gap-12 pb-20 pt-16 lg:grid-cols-2 lg:items-center lg:gap-20 lg:pb-28 lg:pt-24"
  >
    <div>
      <p
        class="inline-flex rounded-md bg-hf-base-dark px-3 py-2 hf-caption-x uppercase tracking-[0.28em] text-hf-orange"
      >
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
        class="mt-9 inline-flex items-center gap-3 rounded-full bg-hf-base-dark px-5 py-3 text-hf-base-light hf-body-1-x transition-colors duration-300 hover:bg-hf-navy focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hf-navy"
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
    </div>

    {#if data.reitTickers.length > 0}
      <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.reitTickers as ticker (ticker)}
          <a
            href={resolve(`/properties/${ticker}` as Pathname)}
            class="group flex min-h-28 flex-col justify-between rounded-xl border border-hf-base-dark/20 bg-hf-base-light p-4 transition-colors duration-300 hover:border-hf-navy hover:bg-hf-blue/30 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hf-navy"
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
    id="closing"
    class="mx-auto max-w-6xl border-y border-hf-base-dark bg-hf-base-dark px-6 py-12 text-hf-base-light sm:px-10 sm:py-16"
    aria-labelledby="closing-title"
  >
    <p class="hf-caption-x uppercase tracking-[0.28em] text-hf-orange">
      Read the portfolio differently
    </p>
    <div class="mt-5 flex flex-col justify-between gap-8 md:flex-row md:items-end">
      <div class="max-w-2xl">
        <h2 id="closing-title" class="hf-heading-4">A clearer way to read a portfolio.</h2>
        <p class="mt-3 hf-caption text-hf-base-light/70">Updated monthly / growing regularly</p>
      </div>
      <a
        href="#catalog"
        class="inline-flex shrink-0 items-center gap-3 text-hf-orange hf-body-1-x underline decoration-hf-orange/50 underline-offset-4 transition-colors duration-300 hover:text-hf-base-light hover:decoration-hf-base-light focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hf-orange"
      >
        Browse available tickers
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  </section>
</main>
