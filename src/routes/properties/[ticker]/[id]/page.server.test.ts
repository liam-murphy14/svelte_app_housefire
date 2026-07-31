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

	it('returns the property with normalized ordered facts', async () => {
		getPropertyById.mockResolvedValue({
			id: 'property-1',
			reitTicker: 'PLD',
			name: 'Warehouse',
			addressInput: '1 Main Street, Dallas, TX',
			facts: [{ label: ' Year built ', value: ' 2022 ' }],
		});

		const result = await load(loadEvent({ ticker: 'PLD', id: 'property-1' }));

		expect(result).toMatchObject({
			property: { facts: [{ label: 'Year built', value: '2022' }] },
			metaTags: { title: expect.stringContaining('PLD') },
		});
		expect(getPropertyById).toHaveBeenCalledWith('property-1');
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
