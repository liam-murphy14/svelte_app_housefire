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

<table class="overflow-scroll border border-hf-grey rounded-lg">
  <thead>
    <tr>
      {#each keys as key (key)}
        <th
          class="border border-hf-grey bg-hf-grey/30 p-2 cursor-pointer"
          on:click={() => onTableHeaderClick(key)}
        >
          <div class="flex items-center justify-center gap-2 h-full w-full">
            <div class="hf-body-1-x text-hf-base-dark">
              {tableHeaders[key]}
            </div>
            <Icon
              src={sortKey === key
                ? sortDirection === 'asc'
                  ? ChevronUp
                  : ChevronDown
                : ChevronUpDown}
              mini
              theme="base"
              size="md"
            />
          </div>
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each tableData as row (row[idKey])}
      <tr
        class="border border-hf-grey hover:bg-hf-blue/30 transition-colors duration-300 ease-out cursor-pointer"
        on:click={() => rowOnClick(row)}
      >
        {#each keys as key (key)}
          <td class="border border-hf-grey p-2 hf-body-2 text-hf-base-dark">
            {row[key]}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
