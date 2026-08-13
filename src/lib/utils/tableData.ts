export type TableRow = Record<string, unknown>;
export type SortDirection = 'asc' | 'desc';
export type SortFunctionMap = Record<string, (left: unknown, right: unknown) => number>;

export const filterTableRows = (rows: TableRow[], query: string): TableRow[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [...rows];

  return rows.filter((row) =>
    Object.values(row).some(
      (value) => typeof value === 'string' && value.toLowerCase().includes(normalizedQuery),
    ),
  );
};

export const sortTableRows = (
  rows: TableRow[],
  sortKey: string,
  sortDirection: SortDirection,
  sortFunctions: SortFunctionMap = {},
): TableRow[] => {
  const sortFunction = sortFunctions[sortKey];

  return [...rows].sort((left, right) => {
    if (sortFunction) {
      return sortDirection === 'asc'
        ? sortFunction(left[sortKey], right[sortKey])
        : sortFunction(right[sortKey], left[sortKey]);
    }

    const leftValue = left[sortKey];
    const rightValue = right[sortKey];
    if (leftValue === rightValue) return 0;
    if (leftValue === undefined || leftValue === null) return sortDirection === 'asc' ? -1 : 1;
    if (rightValue === undefined || rightValue === null) return sortDirection === 'asc' ? 1 : -1;

    const result =
      typeof leftValue === 'number' && typeof rightValue === 'number'
        ? leftValue - rightValue
        : String(leftValue).localeCompare(String(rightValue));
    return sortDirection === 'asc' ? result : -result;
  });
};

export const getPageCount = (rowCount: number, rowsPerPage: number): number =>
  rowCount > 0 && rowsPerPage > 0 ? Math.ceil(rowCount / rowsPerPage) : 0;

export const getPageRows = (rows: TableRow[], page: number, rowsPerPage: number): TableRow[] =>
  page > 0 && rowsPerPage > 0 ? rows.slice((page - 1) * rowsPerPage, page * rowsPerPage) : [];

export const getPageNumbers = (pageCount: number): number[] =>
  pageCount > 0 ? Array.from({ length: pageCount }, (_, index) => index + 1) : [];

export const clampPage = (page: number, pageCount: number): number =>
  pageCount > 0 ? Math.min(Math.max(page, 1), pageCount) : 1;
