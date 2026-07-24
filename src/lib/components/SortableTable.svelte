<script lang="ts">
  import { ChevronUpDown, ChevronUp, ChevronDown } from 'svelte-hero-icons';
  import Icon from './Icon.svelte';

  type TableRow = Record<string, unknown>;

  export let idKey: string;
  export let tableHeaders: { [key: string]: string } = {};
  export let tableData: TableRow[] = [];
  export let sortFunctions: { [key: string]: (a: unknown, b: unknown) => number } = {};
  export let rowOnClick: (row: TableRow) => void = () => {};

  let sortKey: string = '';
  let sortDirection: 'asc' | 'desc' = 'asc';

  const onTableHeaderClick = (headerKey: string) => {
    if (sortKey === headerKey) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = headerKey;
      sortDirection = 'asc';
    }
    try {
      tableData = sortTable(sortKey, sortDirection);
    } catch (e) {
      console.error('Issue sorting table,', e);
    }
  };

  const sortTable = (sortKey: string, sortDirection: 'asc' | 'desc') => {
    const sortFunction = sortFunctions[sortKey];
    if (!sortFunction) {
      // try to sort natively
      try {
        return tableData.sort((a, b) => {
          const left = a[sortKey];
          const right = b[sortKey];
          if (left === right) return 0;
          if (left === undefined || left === null) return sortDirection === 'asc' ? -1 : 1;
          if (right === undefined || right === null) return sortDirection === 'asc' ? 1 : -1;
          const result =
            typeof left === 'number' && typeof right === 'number'
              ? left - right
              : String(left).localeCompare(String(right));
          return sortDirection === 'asc' ? result : -result;
        });
      } catch (e) {
        console.error(e);
        return tableData;
      }
    } else {
      return tableData.sort((a, b) => {
        if (sortDirection === 'asc') {
          return sortFunction(a[sortKey], b[sortKey]);
        } else {
          return sortFunction(b[sortKey], a[sortKey]);
        }
      });
    }
  };

  const keys = Object.keys(tableHeaders);
</script>

<div class="w-full overflow-x-auto rounded-xl border border-hf-base-dark/20 bg-hf-base-light">
  <table class="min-w-full border-collapse">
    <thead>
      <tr>
        {#each keys as key (key)}
          <th
            scope="col"
            aria-sort={sortKey === key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            class="bg-hf-navy"
          >
            <button
              type="button"
              class="group flex min-h-10 w-full items-center justify-between gap-3 rounded-md px-2 py-1 text-left text-hf-base-light focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hf-orange"
              aria-label={sortKey === key
                ? `${tableHeaders[key]}, sorted ${sortDirection === 'asc' ? 'ascending' : 'descending'}`
                : `Sort by ${tableHeaders[key]}`}
              on:click={() => onTableHeaderClick(key)}
            >
              <span class="hf-body-1-x">{tableHeaders[key]}</span>
              <Icon
                src={sortKey === key ? (sortDirection === 'asc' ? ChevronUp : ChevronDown) : ChevronUpDown}
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
      {#each tableData as row (row[idKey])}
        <tr
          tabindex="0"
          class="cursor-pointer border-b border-hf-base-dark/20 transition-colors duration-300 ease-out hover:bg-hf-blue/30 focus-visible:bg-hf-blue/30 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-hf-orange"
          on:click={() => rowOnClick(row)}
          on:keydown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              rowOnClick(row);
            }
          }}
        >
          {#each keys as key (key)}
            <td class="px-4 py-3 hf-body-2 text-hf-base-dark">
              {row[key]}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
