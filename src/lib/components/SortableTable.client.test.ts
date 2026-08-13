// @vitest-environment happy-dom
// @vitest-environment-options {"customExportConditions":["browser"]}

import { createClassComponent } from 'svelte/legacy';
import { describe, expect, it } from 'vitest';
import SortableTable from './SortableTable.svelte';

const propertyRows = (count: number, start = 1) =>
  Array.from({ length: count }, (_, index) => ({
    id: `property-${start + index}`,
    name: `Property [${String(start + index).padStart(2, '0')}]`,
  }));

const mountTable = (tableData = propertyRows(26)) => {
  const target = document.createElement('div');
  document.body.append(target);
  const component = createClassComponent({
    component: SortableTable,
    target,
    props: {
      idKey: 'id',
      tableHeaders: { name: 'Name' },
      tableData,
      enablePagination: true,
    },
  } as never);

  return { component, target };
};

const getButton = (target: HTMLElement, label: string) =>
  [...target.querySelectorAll('button')].find(
    (button) => button.textContent?.trim() === label,
  ) as HTMLButtonElement;

describe('SortableTable desktop controls', () => {
  it('renders the search input before the table and pagination after it', () => {
    const { component, target } = mountTable();

    const searchInput = target.querySelector('input[type="search"]') as HTMLInputElement;
    const table = target.querySelector('table') as HTMLTableElement;
    const pagination = target.querySelector(
      'nav[aria-label="Property table pages"]',
    ) as HTMLElement;

    expect(
      searchInput.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      table.compareDocumentPosition(pagination) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    component.$destroy();
    target.remove();
  });

  it('filters rows from the search input and renders an empty state', async () => {
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

    const input = target.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'unmatched';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await Promise.resolve();

    expect(target.textContent).toContain('No property records match "unmatched".');
    expect(target.querySelector('td > span[role="status"]')?.textContent).toContain(
      'No property records match "unmatched".',
    );
    expect(getButton(target, 'Previous').disabled).toBe(true);
    expect(getButton(target, 'Next').disabled).toBe(true);

    component.$destroy();
    target.remove();
  });

  it('distinguishes an initially empty table from an empty search result', () => {
    const { component, target } = mountTable([]);

    expect(target.textContent).toContain('No property records are available.');
    expect(target.querySelector('td > span[role="status"]')?.textContent).toContain(
      'No property records are available.',
    );

    component.$destroy();
    target.remove();
  });

  it('moves between numbered pages through previous and next controls', async () => {
    const { component, target } = mountTable();

    getButton(target, 'Next').click();
    await Promise.resolve();

    expect(target.querySelector('tbody')?.textContent).toContain('Property [11]');
    expect(target.querySelector('tbody')?.textContent).not.toContain('Property [01]');
    expect(target.querySelector('[aria-current="page"]')?.textContent).toBe('2');

    getButton(target, 'Previous').click();
    await Promise.resolve();

    expect(target.querySelector('tbody')?.textContent).toContain('Property [01]');
    expect(target.querySelector('tbody')?.textContent).not.toContain('Property [26]');
    expect(target.querySelector('[aria-current="page"]')?.textContent).toBe('1');

    component.$destroy();
    target.remove();
  });

  it('selects a directly rendered page number from the bounded navigation', async () => {
    const { component, target } = mountTable(propertyRows(201));

    const pageTwoButton = target.querySelector(
      'button[aria-label="Go to page 2"]',
    ) as HTMLButtonElement;
    pageTwoButton.click();
    await Promise.resolve();

    expect(target.querySelector('tbody')?.textContent).toContain('Property [11]');
    expect(target.querySelector('tbody')?.textContent).not.toContain('Property [01]');
    expect(target.querySelector('[aria-current="page"]')?.textContent).toBe('2');
    expect(target.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(1);

    component.$destroy();
    target.remove();
  });

  it('resets to the first page when the page size changes', async () => {
    const { component, target } = mountTable();

    getButton(target, 'Next').click();
    await Promise.resolve();

    const select = target.querySelector('select') as HTMLSelectElement;
    select.value = '25';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await Promise.resolve();

    expect(target.textContent).toContain('Showing 1–25 of 26 properties');
    expect(target.querySelector('tbody')?.textContent).toContain('Property [01]');
    expect(target.querySelector('tbody')?.textContent).not.toContain('Property [26]');
    expect(target.querySelector('[aria-current="page"]')?.textContent).toBe('1');

    component.$destroy();
    target.remove();
  });

  it('resets to the first page when sorting changes', async () => {
    const { component, target } = mountTable(propertyRows(26).reverse());

    getButton(target, 'Next').click();
    await Promise.resolve();
    getButton(target, 'Name').click();
    await Promise.resolve();

    expect(target.querySelector('tbody')?.textContent).toContain('Property [01]');
    expect(target.querySelector('tbody')?.textContent).not.toContain('Property [11]');
    expect(target.querySelector('[aria-current="page"]')?.textContent).toBe('1');

    component.$destroy();
    target.remove();
  });

  it('clamps the visible page when table data shrinks', async () => {
    const { component, target } = mountTable();

    getButton(target, 'Next').click();
    await Promise.resolve();
    component.$set({ tableData: propertyRows(1) });
    await Promise.resolve();

    expect(target.querySelector('tbody')?.textContent).toContain('Property [01]');
    expect(target.querySelector('[aria-current="page"]')?.textContent).toBe('1');
    expect(getButton(target, 'Previous').disabled).toBe(true);
    expect(getButton(target, 'Next').disabled).toBe(true);

    component.$destroy();
    target.remove();
  });
});
