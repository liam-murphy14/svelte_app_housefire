export type PropertyAddressFields = {
  address?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
};

const clean = (value: string | null | undefined): string => value?.trim() || '';

export const formatPropertyAddress = ({
  address,
  address2,
  city,
  state,
  zip,
  country,
}: PropertyAddressFields): string => {
  const location = [clean(city), [clean(state), clean(zip)].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
  return [clean(address), clean(address2), location, clean(country)].filter(Boolean).join(', ');
};
