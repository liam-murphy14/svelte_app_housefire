import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getGeocodeByAddressInput } = vi.hoisted(() => ({
  getGeocodeByAddressInput: vi.fn(),
}));

vi.mock('$lib/server/db/geocodeQueries', () => ({
  getGeocodeByAddressInput,
}));

import { GET } from './+server';

describe('GET /api/geocodes/byAddressInput/[addressInput]', () => {
  beforeEach(() => getGeocodeByAddressInput.mockReset());

  it('identifies a missing geocode in its HTTP 404 response', async () => {
    getGeocodeByAddressInput.mockResolvedValue(null);

    await expect(
      GET({ params: { addressInput: '100 Main Street, Anywhere, USA' } } as Parameters<
        typeof GET
      >[0]),
    ).rejects.toMatchObject({ status: 404, body: { message: 'No geocode found' } });
  });
});
