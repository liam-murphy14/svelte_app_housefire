// @vitest-environment happy-dom
// @vitest-environment-options {"customExportConditions":["browser"]}

import { flushSync } from 'svelte';
import { createClassComponent } from 'svelte/legacy';
import { describe, expect, it } from 'vitest';
import SortableTable from './SortableTable.svelte';

describe('SortableTable desktop controls', () => {
  it('filters rows from the search input and renders an empty state', () => {
    const target = document.createElement('div');
    document.body.append(target);
    const component = createClassComponent({
      component: SortableTable,
      target,
      props: {
        idKey: 'id',
        tableHeaders: { name: 'Name' },
        tableData: [
          { id: 'property-1', name: 'Warehouse' },
          { id: 'property-2', name: 'Office' },
        ],
        enablePagination: true,
      },
    } as never);
    flushSync();

    const input = target.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'unmatched';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();

    expect(target.textContent).toContain('No property records match "unmatched".');

    component.$destroy();
    target.remove();
  });
});
