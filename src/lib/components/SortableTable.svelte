<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Pathname } from '$app/types';
  import { ChevronUpDown, ChevronUp, ChevronDown } from 'svelte-hero-icons';
  import {
    clampPage,
    filterTableRows,
    getPageCount,
    getPageNumbers,
    getPageRows,
    sortTableRows,
    type SortDirection,
    type SortFunctionMap,
    type TableRow,
  } from '$lib/utils/tableData';
  import Icon from './Icon.svelte';

  export let idKey: string;
  export let tableHeaders: Record<string, string> = {};
  export let tableData: TableRow[] = [];
  export let sortFunctions: SortFunctionMap = {};
  export let rowOnClick: (row: TableRow) => void = () => {};
  export let rowActionLabel: ((row: TableRow) => string) | undefined = undefined;
  export let rowActionText: ((row: TableRow) => string) | undefined = undefined;
  export let rowActionHref: ((row: TableRow) => string) | undefined = undefined;
  export let enablePagination = false;

  let sortKey = '';
  let sortDirection: SortDirection = 'asc';
  let searchQuery = '';
  let rowsPerPage = 25;
  let currentPage = 1;

  $: filteredTableData = filterTableRows(tableData, searchQuery);
  $: sortedTableData = sortTableRows(filteredTableData, sortKey, sortDirection, sortFunctions);
  $: pageCount = getPageCount(sortedTableData.length, rowsPerPage);
  $: resultSummary =
    filteredTableData.length > 0
      ? `Showing ${Math.min((currentPage - 1) * rowsPerPage + 1, filteredTableData.length)}–${Math.min(currentPage * rowsPerPage, filteredTableData.length)} of ${filteredTableData.length} properties`
      : 'Showing 0 of 0 properties';
  $: visibleTableData = enablePagination
    ? getPageRows(sortedTableData, currentPage, rowsPerPage)
    : sortedTableData;
  $: pageNumbers = getPageNumbers(pageCount, currentPage);
  $: keys = Object.keys(tableHeaders);
  $: {
    currentPage = clampPage(currentPage, pageCount);
  }

  const onTableHeaderClick = (headerKey: string) => {
    if (sortKey === headerKey) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = headerKey;
      sortDirection = 'asc';
    }
    currentPage = 1;
  };

  const onSearchInput = () => {
    currentPage = 1;
  };

  const onRowsPerPageChange = (event: Event) => {
    rowsPerPage = Number((event.currentTarget as HTMLSelectElement).value);
    currentPage = 1;
  };

  const goToPage = (page: number) => {
    currentPage = clampPage(page, pageCount);
  };
</script>

<div class="w-full overflow-x-auto rounded-xl border border-hf-base-dark/20 bg-hf-base-light">
  {#if enablePagination}
    <div class="flex flex-wrap items-end justify-between gap-4 p-4">
      <label class="flex flex-col gap-1 hf-body-2 text-hf-base-dark">
        Search properties
        <input
          type="search"
          bind:value={searchQuery}
          placeholder="Search properties"
          aria-label="Search properties"
          class="rounded-md border border-hf-base-dark/30 bg-hf-base-light px-3 py-2"
          oninput={(event) => {
            searchQuery = (event.currentTarget as HTMLInputElement).value;
            onSearchInput();
          }}
        />
      </label>
      <label class="flex flex-col gap-1 hf-body-2 text-hf-base-dark">
        Rows per page
        <select
          value={rowsPerPage}
          class="rounded-md border border-hf-base-dark/30 bg-hf-base-light px-3 py-2"
          onchange={onRowsPerPageChange}
        >
          {#each [10, 25, 50, 100] as pageSize (pageSize)}
            <option value={pageSize}>{pageSize}</option>
          {/each}
        </select>
      </label>
      <p class="hf-body-2 text-hf-base-dark" role="status">
        {resultSummary}
      </p>
      <nav aria-label="Property table pages" class="flex items-center gap-1">
        <button
          type="button"
          disabled={pageCount === 0 || currentPage === 1}
          class="min-h-10 min-w-10 rounded-md px-3 py-2 hf-body-2 text-hf-base-dark transition-colors hover:bg-hf-blue/20 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hf-orange disabled:cursor-not-allowed disabled:opacity-50"
          onclick={() => goToPage(currentPage - 1)}
        >
          Previous
        </button>
        {#each pageNumbers as pageNumber, index (`${pageNumber}-${index}`)}
          {#if pageNumber === 'ellipsis'}
            <span
              aria-hidden="true"
              class="flex min-h-10 min-w-10 items-center justify-center px-3 py-2 hf-body-2 text-hf-base-dark"
            >
              &hellip;
            </span>
          {:else}
            <button
              type="button"
              aria-current={pageNumber === currentPage ? 'page' : undefined}
              aria-label={`Go to page ${pageNumber}`}
              class={`min-h-10 min-w-10 rounded-md px-3 py-2 hf-body-2 transition-colors hover:bg-hf-blue/20 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hf-orange disabled:cursor-not-allowed disabled:opacity-50 ${pageNumber === currentPage ? 'bg-hf-navy text-hf-base-light hover:bg-hf-navy' : 'text-hf-base-dark'}`}
              onclick={() => goToPage(pageNumber)}
            >
              {pageNumber}
            </button>
          {/if}
        {/each}
        <button
          type="button"
          disabled={pageCount === 0 || currentPage === pageCount}
          class="min-h-10 min-w-10 rounded-md px-3 py-2 hf-body-2 text-hf-base-dark transition-colors hover:bg-hf-blue/20 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hf-orange disabled:cursor-not-allowed disabled:opacity-50"
          onclick={() => goToPage(currentPage + 1)}
        >
          Next
        </button>
      </nav>
    </div>
  {/if}
  <table class="min-w-full border-collapse">
    <thead>
      <tr>
        {#each keys as key (key)}
          <th
            scope="col"
            aria-sort={sortKey === key
              ? sortDirection === 'asc'
                ? 'ascending'
                : 'descending'
              : 'none'}
            class="bg-hf-navy"
          >
            <button
              type="button"
              class="group flex min-h-10 w-full items-center justify-between gap-3 rounded-md px-2 py-1 text-left text-hf-base-light focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hf-orange"
              aria-label={sortKey === key
                ? `${tableHeaders[key]}, sorted ${sortDirection === 'asc' ? 'ascending' : 'descending'}`
                : `Sort by ${tableHeaders[key]}`}
              onclick={() => onTableHeaderClick(key)}
            >
              <span class="hf-body-1-x">{tableHeaders[key]}</span>
              <Icon
                src={sortKey === key
                  ? sortDirection === 'asc'
                    ? ChevronUp
                    : ChevronDown
                  : ChevronUpDown}
                mini
                theme="light"
                size="md"
              />
            </button>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each visibleTableData as row (row[idKey])}
        <tr
          class="cursor-pointer border-b border-hf-base-dark/20 odd:bg-hf-base-light even:bg-hf-blue/20 transition-colors duration-300 ease-out hover:bg-hf-blue/40"
          onclick={() => rowOnClick(row)}
        >
          {#each keys as key, index (key)}
            <td class="px-4 py-3 hf-body-2 text-hf-base-dark">
              {#if index === 0 && rowActionHref}
                <a
                  href={resolve(rowActionHref(row) as Pathname)}
                  class="rounded-sm text-hf-navy underline decoration-2 underline-offset-4 hover:text-hf-orange focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hf-navy"
                  aria-label={rowActionLabel ? rowActionLabel(row) : `Open ${tableHeaders[key]}`}
                  onclick={(event) => event.stopPropagation()}
                >
                  {rowActionText ? rowActionText(row) : row[key]}
                </a>
              {:else if index === 0 && rowActionLabel}
                <button
                  type="button"
                  class="rounded-sm text-left focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hf-navy"
                  aria-label={rowActionLabel(row)}
                  onclick={(event) => {
                    event.stopPropagation();
                    rowOnClick(row);
                  }}
                >
                  {rowActionText ? rowActionText(row) : row[key]}
                </button>
              {:else}
                {row[key]}
              {/if}
            </td>
          {/each}
        </tr>
      {:else}
        <tr>
          <td colspan={keys.length} class="px-4 py-3 hf-body-2 text-hf-base-dark">
            <span role="status">
              {#if tableData.length === 0}
                No property records are available.
              {:else}
                No property records match "{searchQuery.trim()}".
              {/if}
            </span>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
