import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createManyProperties } = vi.hoisted(() => ({
  createManyProperties: vi.fn(),
}));

vi.mock('$lib/server/db/propertyQueries', () => ({
  createManyProperties,
}));

import { POST } from './+server';

const baseProperty = {
  addressInput: '100 Main Street, Anywhere, USA',
  reitTicker: 'PLD',
};

const eventWithBody = (body: unknown) =>
  ({
    request: new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  }) as Parameters<typeof POST>[0];

describe('POST /api/properties facts validation', () => {
  beforeEach(() => {
    createManyProperties.mockReset();
  });

  it('normalizes a valid facts list before passing it to the query helper', async () => {
    const body = {
      ...baseProperty,
      facts: [{ label: '  Year built  ', value: ' 2022 ' }],
    };
    createManyProperties.mockResolvedValue([body]);

    const response = await POST(eventWithBody(body));

    expect(response.status).toBe(200);
    expect(createManyProperties).toHaveBeenCalledWith({
      ...baseProperty,
      facts: [{ label: 'Year built', value: '2022' }],
    });
  });

  it('preserves property-create bodies that omit facts', async () => {
    const body = { ...baseProperty };
    createManyProperties.mockResolvedValue([body]);

    const response = await POST(eventWithBody(body));

    expect(response.status).toBe(200);
    expect(createManyProperties).toHaveBeenCalledWith(body);
  });

  it('normalizes facts for every property in an array create body', async () => {
    const body = [
      {
        ...baseProperty,
        facts: [{ label: '  Year built ', value: ' 2022' }],
      },
      {
        ...baseProperty,
        addressInput: '200 Main Street, Anywhere, USA',
        facts: [{ label: '  Stories', value: ' 3 ' }],
      },
    ];
    createManyProperties.mockResolvedValue(body);

    const response = await POST(eventWithBody(body));

    expect(response.status).toBe(200);
    expect(createManyProperties).toHaveBeenCalledWith([
      {
        ...baseProperty,
        facts: [{ label: 'Year built', value: '2022' }],
      },
      {
        ...baseProperty,
        addressInput: '200 Main Street, Anywhere, USA',
        facts: [{ label: 'Stories', value: '3' }],
      },
    ]);
  });

  it('returns HTTP 400 and skips persistence for malformed facts', async () => {
    const body = {
      ...baseProperty,
      facts: [{ label: '', value: '2022' }],
    };

    await expect(POST(eventWithBody(body))).rejects.toMatchObject({ status: 400 });
    expect(createManyProperties).not.toHaveBeenCalled();
  });

  it('returns HTTP 400 for a property foreign-key database error', async () => {
    createManyProperties.mockRejectedValue({ code: 'P2003' });

    await expect(POST(eventWithBody(baseProperty))).rejects.toMatchObject({ status: 400 });
  });
});
