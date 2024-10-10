<script lang="ts">
  import type { PageServerData } from './$types';
  import 'leaflet/dist/leaflet.css';
  import { onMount } from 'svelte';
  import type { Property } from '@prisma/client';
  import SortableTable from '$lib/components/SortableTable.svelte';

  type PropertyWithMarker = {
    marker: L.Marker;
  } & Property;
  export let data: PageServerData;

  let L: typeof import('leaflet');
  let map: L.Map;
  let joinedPropertyData: PropertyWithMarker[] = [];

  // FUNCTIONS FOR LEAFLET
  const addPropertyMarker = (property: Property) => {
    // TODO: add better error handling for missing lat/lng
    const lat = property.latitude ?? 0;
    const lng = property.longitude ?? 0;
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`<b>${property.name}</b><br>${property.address}`);
    return marker;
  };

  const focusProperty = (tableRowData: PropertyWithMarker) => {
    // TODO: add better error handling for missing lat/lng
    const lat = tableRowData.latitude ?? 0;
    const lng = tableRowData.longitude ?? 0;
    map.flyTo([lat, lng], 13);
    tableRowData.marker.openPopup();
  };

  onMount(async () => {
    try {
      // import leaflet onMount since it is client only
      const l = await import('leaflet');
      L = l.default;
      L.Icon.Default.imagePath = '/leaflet/';

      // initialize map
      map = L.map('map').setView([39, -98], 3);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      joinedPropertyData = data.properties.map((property) => {
        return {
          ...(property ?? {}),
          marker: addPropertyMarker(property),
        };
      });
    } catch (e) {
      console.error(e);
    }
  });
</script>

<div class="p-6 overflow-auto h-full">
  <div class="flex w-full h-full overflow-auto gap-4">
    <div class="w-1/2 h-full flex flex-col">
      <h1 class="text-hf-base-dark hf-heading-3">
        {data.ticker} Properties
      </h1>
      <div class="flex-grow w-full flex items-center">
        <div class="flex-grow w-full">
          <div id="map" />
        </div>
      </div>
    </div>
    <div class="w-1/2 h-full overflow-auto">
      <SortableTable
        idKey={'id'}
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
  </div>
</div>

<style lang="postcss">
  #map {
    @apply h-96;
  }
</style>
