<script lang="ts">
  import Link from '$lib/components/Link.svelte';
  import { displayPropertyValue } from '$lib/utils/propertyDisplay';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const propertyLocation = $derived(
    [data.property.city, data.property.state, data.property.zip].filter(Boolean).join(', '),
  );
  const propertyHeading = $derived(
    data.property.name?.trim() ? data.property.name : data.property.addressInput,
  );
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
      <h1 class="mt-3 hf-heading-3">{displayPropertyValue(propertyHeading)}</h1>
      <p class="mt-3 max-w-2xl text-hf-base-dark/70 hf-body-1">
        {displayPropertyValue(data.property.address || data.property.addressInput)}
      </p>
    </header>

    <section class="mt-8" aria-labelledby="property-details-title">
      <h2 id="property-details-title" class="hf-heading-5">Property details</h2>
      <dl class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Name</dt>
          <dd class="mt-1 hf-body-2">{displayPropertyValue(data.property.name)}</dd>
        </div>
        <div>
          <dt class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Address</dt>
          <dd class="mt-1 hf-body-2">{displayPropertyValue(data.property.address)}</dd>
        </div>
        <div>
          <dt class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Address line 2</dt>
          <dd class="mt-1 hf-body-2">{displayPropertyValue(data.property.address2)}</dd>
        </div>
        <div>
          <dt class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Neighborhood</dt>
          <dd class="mt-1 hf-body-2">{displayPropertyValue(data.property.neighborhood)}</dd>
        </div>
        <div>
          <dt class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Location</dt>
          <dd class="mt-1 hf-body-2">{displayPropertyValue(propertyLocation)}</dd>
        </div>
        <div>
          <dt class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Country</dt>
          <dd class="mt-1 hf-body-2">{displayPropertyValue(data.property.country)}</dd>
        </div>
        <div>
          <dt class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Latitude</dt>
          <dd class="mt-1 hf-body-2">{displayPropertyValue(data.property.latitude)}</dd>
        </div>
        <div>
          <dt class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Longitude</dt>
          <dd class="mt-1 hf-body-2">{displayPropertyValue(data.property.longitude)}</dd>
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
          {#each data.property.facts as fact, factIndex (fact.label + '-' + factIndex)}
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
