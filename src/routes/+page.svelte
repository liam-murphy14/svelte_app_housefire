<script lang="ts">
  import type { PageServerData } from './$types';
  import Link from '$lib/components/Link.svelte';
  export let data: PageServerData;
</script>

<div class="w-full p-6 text-hf-base-dark hf-body-1">
  See fine-grained property data for your favorite REITs, updated monthly with more tickers added
  regularly.
  <ul class="mt-4">
    {#each data.reitTickers as ticker}
      <li>
        <Link href={`/properties/${ticker}`} text={ticker} />
      </li>
    {/each}
  </ul>
</div>
