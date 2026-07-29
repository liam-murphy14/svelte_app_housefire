import { describe, expect, it } from 'vitest';
import { PropertyCreateManyInputSchema } from '$lib/utils/prismaGeneratedZod';
import { PropertyFactsSchema } from './propertyFacts';

const baseProperty = {
  addressInput: '100 Main Street, Anywhere, USA',
  reitTicker: 'PLD',
};

describe('PropertyFactsSchema', () => {
  it('parses an ordered list of labeled facts', () => {
    const facts = [
      { label: 'Year built', value: '2022' },
      { label: 'Lease term', value: '15 years' },
    ];

    expect(PropertyFactsSchema.parse(facts)).toEqual(facts);
  });

  it('trims surrounding whitespace from labels and values', () => {
    expect(PropertyFactsSchema.parse([{ label: ' Year built ', value: ' 2022 ' }])).toEqual([
      { label: 'Year built', value: '2022' },
    ]);
  });

  it('rejects blank labels and values', () => {
    expect(() => PropertyFactsSchema.parse([{ label: ' ', value: '2022' }])).toThrow();
    expect(() => PropertyFactsSchema.parse([{ label: 'Year built', value: '\t' }])).toThrow();
  });

  it('rejects malformed entries and extra keys', () => {
    expect(() => PropertyFactsSchema.parse([{ label: 'Year built' }])).toThrow();
    expect(() =>
      PropertyFactsSchema.parse([{ label: 'Year built', value: '2022', source: 'listing' }]),
    ).toThrow();
  });

  it('allows the generated property-create schema to receive facts', () => {
    const result = PropertyCreateManyInputSchema.parse({
      ...baseProperty,
      facts: [{ label: 'Year built', value: '2022' }],
    });

    expect(result.facts).toEqual([{ label: 'Year built', value: '2022' }]);
  });

  it('allows existing property-create payloads to omit facts', () => {
    expect(PropertyCreateManyInputSchema.parse(baseProperty)).toEqual(baseProperty);
  });
});
