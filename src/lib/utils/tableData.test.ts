import { describe, expect, it } from 'vitest';
import {
  clampPage,
  filterTableRows,
  getPageCount,
  getPageNumbers,
  getPageRows,
  sortTableRows,
} from './tableData';

const rows = [
  { id: '1', name: 'Dallas Warehouse', city: 'Dallas', address: '1 Main Street' },
  { id: '2', name: 'Austin Yard', city: 'Austin', address: '2 Congress Avenue' },
  { id: '3', name: 'Phoenix Hub', city: 'Phoenix', address: '3 Central Avenue' },
];

describe('table data helpers', () => {
  it('matches a query against every string-valued field case-insensitively', () => {
    expect(filterTableRows(rows, 'CONGRESS')).toEqual([rows[1]]);
    expect(filterTableRows(rows, 'warehouse')).toEqual([rows[0]]);
    expect(filterTableRows(rows, '')).toEqual(rows);
  });

  it('ignores non-string values when filtering', () => {
    const row = { id: '4', name: 'Numeric Site', count: 42, marker: { open: true } };

    expect(filterTableRows([row], '42')).toEqual([]);
    expect(filterTableRows([row], 'numeric')).toEqual([row]);
  });

  it('sorts a copy without mutating the input rows', () => {
    const input = [rows[2], rows[0], rows[1]];

    expect(sortTableRows(input, 'name', 'asc')).toEqual([rows[1], rows[0], rows[2]]);
    expect(input).toEqual([rows[2], rows[0], rows[1]]);
  });

  it('places nullish values first when natively sorting ascending', () => {
    const input = [
      { id: '1', value: 'middle' },
      { id: '2', value: undefined },
      { id: '3', value: null },
      { id: '4', value: 'first' },
    ];

    const sortedRows = sortTableRows(input, 'value', 'asc');

    expect(sortedRows.slice(0, 2).every(({ value }) => value == null)).toBe(true);
    expect(sortedRows.slice(2)).toEqual([input[3], input[0]]);
  });

  it('compares native numeric values numerically', () => {
    const input = [
      { id: '1', value: 10 },
      { id: '2', value: 2 },
      { id: '3', value: 30 },
    ];

    expect(sortTableRows(input, 'value', 'asc')).toEqual([input[1], input[0], input[2]]);
  });

  it('sorts native values in descending order', () => {
    const input = [
      { id: '1', value: 'alpha' },
      { id: '2', value: 'charlie' },
      { id: '3', value: 'bravo' },
    ];

    expect(sortTableRows(input, 'value', 'desc')).toEqual([input[1], input[2], input[0]]);
  });

  it('sorts the complete result before taking the page slice', () => {
    const input = [rows[2], rows[0], rows[1]];
    const sortedRows = sortTableRows(input, 'name', 'asc');

    expect(getPageRows(sortedRows, 1, 2)).toEqual([rows[1], rows[0]]);
  });

  it('uses a provided comparator in either direction', () => {
    const input = [
      { id: '1', squareFootage: 200 },
      { id: '2', squareFootage: 50 },
    ];
    const sortFunctions = {
      squareFootage: (left: unknown, right: unknown) => Number(left) - Number(right),
    };

    expect(sortTableRows(input, 'squareFootage', 'asc', sortFunctions)).toEqual([
      input[1],
      input[0],
    ]);
    expect(sortTableRows(input, 'squareFootage', 'desc', sortFunctions)).toEqual([
      input[0],
      input[1],
    ]);
  });

  it('calculates page counts and returns the requested page slice', () => {
    expect(getPageCount(rows.length, 2)).toBe(2);
    expect(getPageCount(rows.length, 0)).toBe(0);
    expect(getPageRows(rows, 2, 2)).toEqual([rows[2]]);
    expect(getPageRows(rows, 3, 2)).toEqual([]);
  });

  it('returns no rows for invalid page or rows-per-page bounds', () => {
    expect(getPageRows(rows, 0, 2)).toEqual([]);
    expect(getPageRows(rows, -1, 2)).toEqual([]);
    expect(getPageRows(rows, 1, 0)).toEqual([]);
    expect(getPageRows(rows, 1, -2)).toEqual([]);
  });

  it('supports numbered navigation and clamps invalid pages', () => {
    expect(getPageNumbers(3)).toEqual([1, 2, 3]);
    expect(getPageNumbers(0)).toEqual([]);
    expect(clampPage(4, 3)).toBe(3);
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(7, 0)).toBe(1);
  });

  it('returns a bounded page window with ellipses for larger result sets', () => {
    expect(getPageNumbers(8, 1)).toEqual([1, 2, 'ellipsis', 8]);
    expect(getPageNumbers(8, 2)).toEqual([1, 2, 3, 'ellipsis', 8]);
    expect(getPageNumbers(8, 4)).toEqual([1, 'ellipsis', 3, 4, 5, 'ellipsis', 8]);
    expect(getPageNumbers(8, 7)).toEqual([1, 'ellipsis', 6, 7, 8]);
  });
});
