import { beforeEach, describe, expect, it, vi } from 'vitest';

const { deletePropertiesByTicker, getPropertiesByTicker } = vi.hoisted(() => ({
  deletePropertiesByTicker: vi.fn(),
  getPropertiesByTicker: vi.fn(),
}));

vi.mock('$lib/server/db/propertyQueries', () => ({
  deletePropertiesByTicker,
  getPropertiesByTicker,
}));

import { DELETE, GET } from './+server';

const eventWithTicker = <T extends typeof GET | typeof DELETE>(handler: T, ticker: string) =>
  ({ params: { ticker } }) as Parameters<T>[0];

describe('/api/properties/byTicker/[ticker]', () => {
  beforeEach(() => {
    deletePropertiesByTicker.mockReset();
    getPropertiesByTicker.mockReset();
  });

  it('returns HTTP 404 when a ticker has no properties', async () => {
    getPropertiesByTicker.mockResolvedValue([]);

    await expect(GET(eventWithTicker(GET, 'MISSING'))).rejects.toMatchObject({ status: 404 });
  });

  it('returns HTTP 404 when deleting a ticker with no properties', async () => {
    deletePropertiesByTicker.mockResolvedValue({ count: 0 });

    await expect(DELETE(eventWithTicker(DELETE, 'MISSING'))).rejects.toMatchObject({ status: 404 });
  });
});
