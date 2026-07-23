<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Pathname } from '$app/types';

  export let href: string;
  export let text: string;
  export let target: string | undefined = '_self';
  const rel = target === '_blank' ? 'noopener noreferrer' : undefined;
</script>

<a
  class="underline text-hf-orange hf-body-1 hover:text-hf-orange/80 transition-colors duration-300 ease-out"
  href={resolve(href as Pathname)}
  {target}
  {rel}
>
  {text}
</a>
