import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import SortableTable from './SortableTable.svelte';

describe('SortableTable', () => {
  it('renders accessible sort controls and a native row action', () => {
    const { body } = render(SortableTable, {
      props: {
        idKey: 'id',
        tableHeaders: { name: 'Name' },
        tableData: [{ id: 'property-1', name: 'Warehouse' }],
        rowActionLabel: (row: Record<string, unknown>) => `Focus ${row.name} on map`,
      },
    });

    expect(body).toContain('aria-sort="none"');
    expect(body).toContain('type="button"');
    expect(body).toContain('aria-label="Focus Warehouse on map"');
    expect(body).not.toContain('tabindex="0"');
    expect(body).toContain('Warehouse');
  });
});
