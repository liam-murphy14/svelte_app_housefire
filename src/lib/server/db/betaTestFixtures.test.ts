import { describe, expect, it } from 'vitest';
import {
  assertBetaSeedEnvironment,
  BETA_TEST_GEOCODE_PREFIX,
  BETA_TEST_REIT_TICKER,
  betaTestGeocodes,
  betaTestProperties,
} from './betaTestFixtures';

describe('beta test fixtures', () => {
  it('contains three distinct properties and matching namespaced geocodes', () => {
    expect(BETA_TEST_REIT_TICKER).toBe('HFTEST');
    expect(betaTestProperties).toHaveLength(3);
    expect(new Set(betaTestProperties.map(({ addressInput }) => addressInput)).size).toBe(3);
    expect(new Set(betaTestProperties.map(({ name }) => name)).size).toBe(3);
    expect(
      betaTestProperties.every(
        ({ latitude, longitude, squareFootage, facts }) =>
          typeof latitude === 'number' &&
          typeof longitude === 'number' &&
          typeof squareFootage === 'number' &&
          Array.isArray(facts),
      ),
    ).toBe(true);

    expect(betaTestGeocodes).toHaveLength(3);
    expect(
      betaTestGeocodes.every(
        ({ addressInput, latitude, longitude }) =>
          addressInput.startsWith(BETA_TEST_GEOCODE_PREFIX) &&
          typeof latitude === 'number' &&
          typeof longitude === 'number',
      ),
    ).toBe(true);
    expect(
      betaTestGeocodes
        .map(({ addressInput }) => addressInput.slice(BETA_TEST_GEOCODE_PREFIX.length))
        .sort(),
    ).toEqual(betaTestProperties.map(({ addressInput }) => addressInput).sort());
  });

  it('rejects production before a beta seed can start', () => {
    expect(() => assertBetaSeedEnvironment('production')).toThrow(
      'Refusing to seed beta test data in production',
    );
    expect(() =>
      assertBetaSeedEnvironment('development', 'postgresql://localhost/housefire_beta'),
    ).not.toThrow();
    expect(() =>
      assertBetaSeedEnvironment('development', 'postgresql://localhost/housefire_production'),
    ).toThrow('Refusing to seed outside the beta database');
  });
});
