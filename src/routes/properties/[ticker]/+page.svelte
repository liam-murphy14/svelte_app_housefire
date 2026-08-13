<script lang="ts">
  import type { PageServerData } from './$types';
  import 'leaflet/dist/leaflet.css';
  import { onMount } from 'svelte';
  import type { Map, Marker } from 'leaflet';
  import type { Property } from '@prisma/client';
  import SortableTable from '$lib/components/SortableTable.svelte';
  import { displayPropertyValue } from '$lib/utils/propertyDisplay';
  import { propertyDetailsPath, propertyPopupContent } from '$lib/utils/propertyMap';

  type PropertyWithMarker = {
    marker: Marker;
  } & Property;
  const MOBILE_BATCH_SIZE = 25;
  export let data: PageServerData;

  let leaflet: typeof import('leaflet');
  let map: Map;
  let joinedPropertyData: Array<Property | PropertyWithMarker> = data.properties;
  let mobileVisibleCount = MOBILE_BATCH_SIZE;
  let mobileLoadMoreSentinel: HTMLDivElement;
  let mobileLoadObserver: IntersectionObserver | undefined;

  $: visibleMobileProperties = data.properties.slice(0, mobileVisibleCount);
  $: hasMoreMobileProperties = visibleMobileProperties.length < data.properties.length;

  // FUNCTIONS FOR LEAFLET
  const addPropertyMarker = (property: Property) => {
    // TODO: add better error handling for missing lat/lng
    const lat = property.latitude ?? 0;
    const lng = property.longitude ?? 0;
    const marker = leaflet.marker([lat, lng]).addTo(map);
    marker.bindPopup(propertyPopupContent(property, data.ticker));
    return marker;
  };

  const focusProperty = (tableRowData: Record<string, unknown>) => {
    const property = tableRowData as unknown as PropertyWithMarker;
    if (!leaflet || !map || !property.marker) return;

    // TODO: add better error handling for missing lat/lng
    const lat = property.latitude ?? 0;
    const lng = property.longitude ?? 0;
    map.flyTo([lat, lng], 13);
    property.marker.openPopup();
  };

  const propertyIdentifier = (tableRowData: Record<string, unknown>) => {
    const name = typeof tableRowData.name === 'string' ? tableRowData.name.trim() : '';
    if (name) return name;

    const addressInput =
      typeof tableRowData.addressInput === 'string' ? tableRowData.addressInput.trim() : '';
    if (addressInput) return addressInput;

    return String(tableRowData.id);
  };

  const propertyDetailsHref = (tableRowData: Record<string, unknown>) =>
    propertyDetailsPath(data.ticker, String(tableRowData.id));

  const loadMoreMobileProperties = () => {
    mobileVisibleCount = Math.min(mobileVisibleCount + MOBILE_BATCH_SIZE, data.properties.length);
  };

  onMount(() => {
    const initializePage = async () => {
      try {
        // import leaflet onMount since it is client only
        const l = await import('leaflet');
        leaflet = l.default;
        leaflet.Icon.Default.imagePath = '/leaflet/';

        // initialize map
        map = leaflet.map('map').setView([39, -98], 3);
        leaflet
          .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          })
          .addTo(map);

        joinedPropertyData = data.properties.map((property) => {
          return {
            ...(property ?? {}),
            marker: addPropertyMarker(property),
          };
        });
      } catch (e) {
        console.error(e);
      }

      mobileLoadObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMoreMobileProperties();
        }
      });

      if (mobileLoadMoreSentinel) {
        mobileLoadObserver.observe(mobileLoadMoreSentinel);
      }
    };

    void initializePage();

    return () => {
      mobileLoadObserver?.disconnect();
    };
  });
</script>

<div
  class="min-h-full overflow-auto bg-hf-base-light px-6 py-8 text-hf-base-dark sm:px-10 lg:px-16 lg:py-10"
>
  <div class="mx-auto max-w-7xl">
    <header class="border-b border-hf-grey pb-6">
      <p class="hf-caption-x uppercase tracking-[0.28em] text-hf-navy">
        {data.ticker} / Property portfolio
      </p>
      <h1 class="mt-3 hf-heading-3">{data.ticker} Properties</h1>
      <p class="mt-3 max-w-2xl text-hf-base-dark/70 hf-body-1">
        Browse the property records for this portfolio.
      </p>
    </header>

    <div class="mt-8 hidden gap-8 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section aria-labelledby="map-title">
        <p class="hf-caption-x uppercase tracking-[0.2em] text-hf-navy">01 / Map</p>
        <h2 id="map-title" class="mt-2 hf-heading-5">Where the portfolio sits</h2>
        <div
          id="map"
          class="mt-3 h-[32rem] overflow-hidden rounded-xl border border-hf-base-dark/20"
        ></div>
      </section>
      <section aria-labelledby="table-title" class="min-w-0">
        <p class="hf-caption-x uppercase tracking-[0.2em] text-hf-navy">02 / Records</p>
        <div class="mt-2 flex items-end justify-between gap-4">
          <h2 id="table-title" class="hf-heading-5">Property records</h2>
          <p class="hf-caption text-hf-base-dark/60">
            Open a property name for details, or select the rest of its row to focus the map
          </p>
        </div>
        <div class="mt-3">
          <SortableTable
            idKey="id"
            tableHeaders={{
              name: 'Name',
              city: 'City',
              state: 'State',
            }}
            tableData={joinedPropertyData}
            enablePagination={true}
            rowOnClick={focusProperty}
            rowActionLabel={(row) => `View ${propertyIdentifier(row)} property details`}
            rowActionText={propertyIdentifier}
            rowActionHref={propertyDetailsHref}
          />
        </div>
      </section>
    </div>

    <!-- Facts intentionally stay on the property detail page and are omitted from compact mobile cards for now. -->
    <section class="mt-8 lg:hidden" aria-labelledby="mobile-properties-title">
      <p class="hf-caption-x uppercase tracking-[0.2em] text-hf-navy">Property records</p>
      <h2 id="mobile-properties-title" class="mt-2 hf-heading-4">Holdings at a glance</h2>
      {#if data.properties.length > 0}
        <div class="mt-4 grid gap-4">
          {#each visibleMobileProperties as property (property.id)}
            <article
              class="rounded-xl border border-hf-base-dark/20 bg-hf-base-light p-5 shadow-[0_8px_24px_rgba(18,18,18,0.06)]"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <p class="hf-tiny-x uppercase tracking-[0.2em] text-hf-navy">Property record</p>
                  <h3 class="mt-2 break-words text-hf-base-dark hf-heading-5">
                    {displayPropertyValue(property.name)}
                  </h3>
                </div>
                <div class="shrink-0 text-right">
                  <p class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">
                    Square footage
                  </p>
                  <p class="mt-1 text-hf-base-dark hf-body-1-x">
                    {displayPropertyValue(property.squareFootage)}
                  </p>
                </div>
              </div>
              <div class="mt-5 border-t border-hf-grey pt-4">
                <p class="hf-tiny-x uppercase tracking-[0.16em] text-hf-base-dark/60">Address</p>
                <p class="mt-2 text-hf-base-dark hf-body-2">
                  {displayPropertyValue(property.address)}
                </p>
                <p class="mt-1 text-hf-base-dark/70 hf-caption">
                  {displayPropertyValue(
                    [property.city, property.state, property.zip].filter(Boolean).join(', '),
                  )}
                </p>
              </div>
            </article>
          {/each}
        </div>
        {#if hasMoreMobileProperties}
          <div bind:this={mobileLoadMoreSentinel} aria-hidden="true"></div>
          <p class="mt-4 text-hf-base-dark/70 hf-caption" role="status">
            Showing {visibleMobileProperties.length} of {data.properties.length} properties.
          </p>
        {/if}
      {:else}
        <div
          class="mt-4 rounded-xl border border-dashed border-hf-navy bg-hf-blue/20 p-6"
          role="status"
        >
          <p class="text-hf-base-dark hf-body-2">
            No property records are available for this ticker yet.
          </p>
        </div>
      {/if}
    </section>
  </div>
</div>
