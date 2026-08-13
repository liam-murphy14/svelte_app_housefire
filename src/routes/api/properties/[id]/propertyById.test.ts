import { beforeEach, describe, expect, it, vi } from 'vitest';

const { deletePropertyById, getPropertyById } = vi.hoisted(() => ({
  deletePropertyById: vi.fn(),
  getPropertyById: vi.fn(),
}));

vi.mock('$lib/server/db/propertyQueries', () => ({
  deletePropertyById,
  getPropertyById,
}));

import { DELETE, GET } from './+server';

const eventWithId = <T extends typeof GET | typeof DELETE>(handler: T, id: string) =>
  ({ params: { id } }) as Parameters<T>[0];

describe('/api/properties/[id]', () => {
  beforeEach(() => {
    deletePropertyById.mockReset();
    getPropertyById.mockReset();
  });

  it('returns HTTP 404 when a requested property does not exist', async () => {
    getPropertyById.mockResolvedValue(null);

    await expect(GET(eventWithId(GET, 'missing-property'))).rejects.toMatchObject({ status: 404 });
  });

  it('returns HTTP 404 when deleting a property that no longer exists', async () => {
    deletePropertyById.mockRejectedValue({ code: 'P2025' });

    await expect(DELETE(eventWithId(DELETE, 'missing-property'))).rejects.toMatchObject({
      status: 404,
    });
  });
});
