import { beforeEach, describe, expect, it, vi } from 'vitest';

const { propertyCreateManyAndReturn, reitUpsert, prisma } = vi.hoisted(() => {
  const propertyCreateManyAndReturn = vi.fn();
  const reitUpsert = vi.fn();
  const transaction = {
    property: { createManyAndReturn: propertyCreateManyAndReturn },
    reit: { upsert: reitUpsert },
  };
  const prisma = {
    property: { createManyAndReturn: propertyCreateManyAndReturn },
    $transaction: vi.fn(async (callback: (tx: typeof transaction) => unknown) =>
      callback(transaction),
    ),
  };

  return { propertyCreateManyAndReturn, reitUpsert, prisma, transaction };
});

vi.mock('$lib/server/db/prisma', () => ({ default: prisma }));

import { createManyProperties } from './propertyQueries';

describe('createManyProperties', () => {
  beforeEach(() => {
    propertyCreateManyAndReturn.mockReset();
    reitUpsert.mockReset();
    prisma.$transaction.mockClear();
    propertyCreateManyAndReturn.mockResolvedValue([]);
    reitUpsert.mockResolvedValue({ ticker: 'PLD' });
  });

  it('creates a missing parent REIT before inserting a property batch', async () => {
    const properties = [
      { addressInput: '100 Main Street, Anywhere, USA', reitTicker: 'PLD' },
      { addressInput: '200 Main Street, Anywhere, USA', reitTicker: 'PLD' },
    ];

    await createManyProperties(properties);

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(reitUpsert).toHaveBeenCalledWith({
      where: { ticker: 'PLD' },
      create: { ticker: 'PLD' },
      update: {},
    });
    expect(propertyCreateManyAndReturn).toHaveBeenCalledWith({ data: properties });
  });

  it('upserts each distinct ticker and preserves a single-property input', async () => {
    const property = {
      addressInput: '300 Main Street, Anywhere, USA',
      reitTicker: 'REXR',
    };

    await createManyProperties([
      property,
      { ...property, addressInput: '400 Main Street, Anywhere, USA', reitTicker: 'PLD' },
    ]);
    await createManyProperties(property);

    expect(reitUpsert).toHaveBeenCalledTimes(3);
    expect(reitUpsert).toHaveBeenNthCalledWith(1, {
      where: { ticker: 'REXR' },
      create: { ticker: 'REXR' },
      update: {},
    });
    expect(reitUpsert).toHaveBeenNthCalledWith(2, {
      where: { ticker: 'PLD' },
      create: { ticker: 'PLD' },
      update: {},
    });
    expect(reitUpsert).toHaveBeenNthCalledWith(3, {
      where: { ticker: 'REXR' },
      create: { ticker: 'REXR' },
      update: {},
    });
    expect(propertyCreateManyAndReturn).toHaveBeenNthCalledWith(2, { data: property });
  });
});
