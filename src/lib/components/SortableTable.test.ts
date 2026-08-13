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

  it('renders formatted row action text when the first cell is unnamed', () => {
    const { body } = render(SortableTable, {
      props: {
        idKey: 'id',
        tableHeaders: { name: 'Name' },
        tableData: [{ id: 'property-1', name: null, addressInput: '  123 Market Street  ' }],
        rowActionLabel: (row: Record<string, unknown>) =>
          `Focus ${String(row.addressInput).trim()} on map`,
        rowActionText: (row: Record<string, unknown>) => String(row.addressInput).trim(),
      },
    });

    expect(body).toContain('aria-label="Focus 123 Market Street on map"');
    expect(body).toContain('>123 Market Street</button>');
  });

  it('renders a visible first-cell detail link without replacing row behavior', () => {
    const { body } = render(SortableTable, {
      props: {
        idKey: 'id',
        tableHeaders: { name: 'Name', city: 'City' },
        tableData: [{ id: 'property-1', name: 'Warehouse', city: 'Dallas' }],
        rowActionLabel: (row: Record<string, unknown>) => `View ${row.name} property details`,
        rowActionText: (row: Record<string, unknown>) => String(row.name),
        rowActionHref: () => '/properties/PLD/property-1',
      },
    });

    expect(body).toContain('href="/properties/PLD/property-1"');
    expect(body).toContain('aria-label="View Warehouse property details"');
    expect(body).toContain('>Warehouse</a>');
    expect(body).toContain('underline');
    expect(body).not.toContain('>Warehouse</button>');
  });

  it('renders desktop search and pagination controls over the first page', () => {
    const rows = Array.from({ length: 26 }, (_, index) => ({
      id: `property-${index + 1}`,
      name: `Property ${index + 1}`,
    }));
    const { body } = render(SortableTable, {
      props: {
        idKey: 'id',
        tableHeaders: { name: 'Name' },
        tableData: rows,
        enablePagination: true,
      },
    });

    expect(body).toContain('Search properties');
    expect(body).toContain('Showing 1–25 of 26 properties');
    expect(body).toContain('Property 1');
    expect(body).toContain('Property 25');
    expect(body).not.toContain('Property 26');
    expect(body).toContain('aria-current="page"');
    expect(body).toContain('10');
    expect(body).toContain('25');
    expect(body).toContain('50');
    expect(body).toContain('100');
  });
});
