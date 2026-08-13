import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createGeocode, findManyGeocodes } = vi.hoisted(() => ({
  createGeocode: vi.fn(),
  findManyGeocodes: vi.fn(),
}));

vi.mock('$lib/server/db/geocodeQueries', () => ({
  createGeocode,
  findManyGeocodes,
}));

import { POST } from './+server';

const eventWithBody = (body: unknown) =>
  ({
    request: new Request('http://localhost/api/geocodes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  }) as Parameters<typeof POST>[0];

describe('POST /api/geocodes', () => {
  beforeEach(() => {
    createGeocode.mockReset();
    findManyGeocodes.mockReset();
  });

  it('returns HTTP 409 when an address input already exists', async () => {
    createGeocode.mockRejectedValue({ code: 'P2002' });

    await expect(
      POST(
        eventWithBody({
          addressInput: '100 Main Street, Anywhere, USA',
          latitude: 47.6062,
          longitude: -122.3321,
        }),
      ),
    ).rejects.toMatchObject({ status: 409 });
  });
});
