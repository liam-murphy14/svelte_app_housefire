<script lang="ts">
  import '../app.postcss';
  import Seo from '$lib/components/Seo.svelte';
  import { page } from '$app/stores';
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css?family=Poppins:100,200,300,400,500,600,700,800,900"
  />
</svelte:head>

<Seo
  title={$page?.data?.metaTags?.title ?? 'Housefire'}
  metadescription={$page?.data?.metaTags?.description ??
    'See fine-grained property data for your favorite REITs, updated monthly with more tickers added regularly.'}
/>

<div class="h-screen w-screen -z-50 bg-hf-base-light overflow-auto flex flex-col">
  <div class="sticky top-0 p-2 w-full border-b border-hf-grey bg-hf-base-light flex-shrink-0">
    <a href="/"><img src="/hf-logo.svg" alt="Housefire Logo" /> </a>
  </div>
  <div class="overflow-auto">
    <slot />
  </div>
</div>
