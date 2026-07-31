# Task 3 Report: SortableTable detail-link action

## Scope

Added the optional `rowActionHref` first-cell detail-link action to `SortableTable`.
The link is visibly styled and accessible, stops click propagation, and takes precedence over the existing first-cell button when provided. Existing `rowActionLabel`, `rowActionText`, button, and row-click behavior remain unchanged.

## TDD evidence

### RED

Added the focused test:

```sh
npx vitest run src/lib/components/SortableTable.test.ts
```

Result: failed as expected with `3 tests | 1 failed`; the new link-rendering test failed because `href="/properties/PLD/property-1"` was absent. The two pre-existing tests passed.

### GREEN

Implemented the optional `rowActionHref` prop and anchor branch, including:

- internal navigation through SvelteKit `resolve()`;
- visible underline and hover/focus styling;
- accessible `aria-label` using `rowActionLabel` with a header-based fallback;
- `on:click|stopPropagation` so row click handling remains separate; and
- existing button branch preserved as the fallback.

Focused test:

```sh
npx vitest run src/lib/components/SortableTable.test.ts
```

Result: passed, `1 test file` and `3 tests`.

Additional checks:

```sh
npx prettier --check src/lib/components/SortableTable.svelte src/lib/components/SortableTable.test.ts
npx eslint src/lib/components/SortableTable.svelte src/lib/components/SortableTable.test.ts
```

Both passed with exit code 0.

## Concerns

No known concerns. The link href is resolved as a SvelteKit `Pathname`, matching the repository lint and existing internal-link convention.
