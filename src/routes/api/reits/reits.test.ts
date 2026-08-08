import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getAllReits, createReit } = vi.hoisted(() => ({
  getAllReits: vi.fn(),
  createReit: vi.fn(),
}));

vi.mock('$lib/server/db/reitQueries', () => ({
  getAllReits,
  createReit,
}));

import { GET } from './+server';

describe('GET /api/reits', () => {
  beforeEach(() => getAllReits.mockReset());

  it('returns all REIT records from the query helper', async () => {
    const reits = [{ id: 'reit-1', ticker: 'PLD' }];
    getAllReits.mockResolvedValue(reits);

    const response = await GET({} as Parameters<typeof GET>[0]);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(reits);
  });
});
