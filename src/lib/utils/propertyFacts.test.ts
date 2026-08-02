import { describe, expect, it } from 'vitest';
import { PropertyCreateManyInputSchema } from '$lib/utils/prismaGeneratedZod';
import { parsePropertyFacts, PropertyFactsSchema, withSquareFootageFact } from './propertyFacts';

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

describe('parsePropertyFacts', () => {
  it('returns valid facts in their original order', () => {
    const facts = [
      { label: 'Year built', value: '2022' },
      { label: 'Lease term', value: '15 years' },
    ];

    expect(parsePropertyFacts(facts)).toEqual(facts);
  });

  it('returns an empty list for empty or malformed stored JSON', () => {
    expect(parsePropertyFacts([])).toEqual([]);
    expect(parsePropertyFacts([{ label: 'Year built' }])).toEqual([]);
    expect(parsePropertyFacts({ label: 'Year built', value: '2022' })).toEqual([]);
  });
});

describe('withSquareFootageFact', () => {
  it('prepends formatted square footage and preserves stored order', () => {
    const facts = [
      { label: 'Year built', value: '2022' },
      { label: 'Lease term', value: '15 years' },
    ];
    expect(withSquareFootageFact(facts, 125000)).toEqual([
      { label: 'Square footage', value: '125,000' },
      ...facts,
    ]);
  });

  it('does not add a fact for missing or non-finite values', () => {
    const facts = [{ label: 'Year built', value: '2022' }];
    expect(withSquareFootageFact(facts, null)).toEqual(facts);
    expect(withSquareFootageFact(facts, undefined)).toEqual(facts);
    expect(withSquareFootageFact(facts, Number.NaN)).toEqual(facts);
  });

  it('does not duplicate an existing square-footage fact', () => {
    const facts = [{ label: 'Square Footage', value: '125,000' }];
    expect(withSquareFootageFact(facts, 125000)).toEqual(facts);
  });
});
