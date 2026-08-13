import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getAllReits, createReit } = vi.hoisted(() => ({
  getAllReits: vi.fn(),
  createReit: vi.fn(),
}));

vi.mock('$lib/server/db/reitQueries', () => ({
  getAllReits,
  createReit,
}));

import { GET, POST } from './+server';

const eventWithBody = (body: unknown) =>
  ({
    request: new Request('http://localhost/api/reits', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  }) as Parameters<typeof POST>[0];

describe('/api/reits', () => {
  beforeEach(() => {
    getAllReits.mockReset();
    createReit.mockReset();
  });

  it('returns all REIT records from the query helper', async () => {
    const reits = [{ id: 'reit-1', ticker: 'PLD' }];
    getAllReits.mockResolvedValue(reits);

    const response = await GET({} as Parameters<typeof GET>[0]);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(reits);
  });

  it('returns HTTP 409 when a REIT ticker already exists', async () => {
    createReit.mockRejectedValue({ code: 'P2002' });

    await expect(POST(eventWithBody({ ticker: 'PLD' }))).rejects.toMatchObject({ status: 409 });
  });
});
