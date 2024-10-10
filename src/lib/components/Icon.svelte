<script lang="ts">
  import { Icon } from 'svelte-hero-icons';
  import { classNames } from '$lib/utils/classNames.utils';

  export let src: any = '';
  export let solid: boolean = false;
  export let mini: boolean = false;
  export let theme: 'base' = 'base';
  export let size: 'sm' | 'md' | 'lg' = 'md';
</script>

<Icon
  {src}
  {solid}
  {mini}
  class={classNames(
    'flex-shrink-0',
    theme === 'base' ? 'text-hf-base-dark' : '',
    size === 'sm' ? 'w-4 h-4' : '',
    size === 'md' ? 'w-6 h-6' : '',
    size === 'lg' ? 'w-8 h-8' : '',
  )}
/>
