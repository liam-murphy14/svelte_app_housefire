export const displayPropertyValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  return typeof value === 'number' ? new Intl.NumberFormat('en-US').format(value) : value;
};
