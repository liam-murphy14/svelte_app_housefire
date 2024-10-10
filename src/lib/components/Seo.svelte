<script lang="ts">
  import { VERTICAL_LINE_ENTITY } from '$lib/constants/unicodeChars';

  export let metadescription: string;
  export let title: string;

  const siteTitle = 'Housefire';

  const pageTitle = `${siteTitle} ${VERTICAL_LINE_ENTITY} ${title}`;
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={metadescription} />
  <meta
    name="robots"
    content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
  />
</svelte:head>
