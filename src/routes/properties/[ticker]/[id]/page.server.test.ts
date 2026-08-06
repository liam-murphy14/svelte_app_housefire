import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getPropertyById } = vi.hoisted(() => ({
  getPropertyById: vi.fn(),
}));

vi.mock('$lib/server/db/propertyQueries', () => ({
  getPropertyById,
}));

import { load } from './+page.server';

const loadEvent = (params: { ticker: string; id: string }) =>
  ({ params }) as Parameters<typeof load>[0];

describe('property detail page load', () => {
  beforeEach(() => {
    getPropertyById.mockReset();
  });

  it('returns the property with composed facts and a visible-address title', async () => {
    getPropertyById.mockResolvedValue({
      id: 'property-1',
      reitTicker: 'PLD',
      name: '',
      address: '1 Main Street',
      address2: 'Suite 100',
      city: 'Dallas',
      state: 'TX',
      zip: '75001',
      country: 'United States',
      squareFootage: 125000,
      addressInput: 'backend-only-address-input',
      facts: [{ label: ' Year built ', value: ' 2022 ' }],
    });

    const result = await load(loadEvent({ ticker: 'PLD', id: 'property-1' }));
    if (!result) throw new Error('Expected property detail page data');

    expect(result).toMatchObject({
      property: {
        facts: [
          { label: 'Square footage', value: '125,000' },
          { label: 'Year built', value: '2022' },
        ],
      },
      metaTags: {
        title: 'PLD | 1 Main Street, Suite 100, Dallas, TX 75001, United States Property Details',
      },
    });
    expect(result.metaTags.title).not.toContain('backend-only-address-input');
    expect(getPropertyById).toHaveBeenCalledWith('property-1');
  });

  it('uses the stable property fallback when no visible label is available', async () => {
    getPropertyById.mockResolvedValue({
      id: 'property-1',
      reitTicker: 'PLD',
      name: '   ',
      addressInput: 'backend-only-address-input',
      facts: [],
    });

    const result = await load(loadEvent({ ticker: 'PLD', id: 'property-1' }));
    if (!result) throw new Error('Expected property detail page data');

    expect(result.metaTags.title).toBe('PLD | Property Property Details');
    expect(result.metaTags.title).not.toContain('backend-only-address-input');
  });

  it('returns HTTP 404 when the property does not exist', async () => {
    getPropertyById.mockResolvedValue(null);

    await expect(load(loadEvent({ ticker: 'PLD', id: 'missing' }))).rejects.toMatchObject({
      status: 404,
    });
  });

  it('returns HTTP 404 when the property belongs to another ticker', async () => {
    getPropertyById.mockResolvedValue({ id: 'property-1', reitTicker: 'REXR', facts: [] });

    await expect(load(loadEvent({ ticker: 'PLD', id: 'property-1' }))).rejects.toMatchObject({
      status: 404,
    });
  });
});
