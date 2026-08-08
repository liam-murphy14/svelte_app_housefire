import type { Prisma } from '@prisma/client';

export const BETA_TEST_REIT_TICKER = 'HFTEST';
export const BETA_TEST_GEOCODE_PREFIX = `${BETA_TEST_REIT_TICKER}:`;

export const assertBetaSeedEnvironment = (nodeEnv = process.env.NODE_ENV): void => {
  if (nodeEnv === 'production') {
    throw new Error('Refusing to seed beta test data in production');
  }
};

export const betaTestProperties = [
  {
    addressInput: '101 Harbor Way, Seattle, WA 98101',
    name: 'North Harbor Logistics',
    address: '101 Harbor Way',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    country: 'USA',
    latitude: 47.6062,
    longitude: -122.3321,
    squareFootage: 120000,
    facts: [
      { label: 'Year built', value: '2018' },
      { label: 'Lease term', value: '12 years' },
    ],
  },
  {
    addressInput: '202 Front Range Road, Denver, CO 80216',
    name: 'Front Range Distribution Center',
    address: '202 Front Range Road',
    city: 'Denver',
    state: 'CO',
    zip: '80216',
    country: 'USA',
    latitude: 39.7392,
    longitude: -104.9903,
    squareFootage: 245000,
    facts: [
      { label: 'Year built', value: '2021' },
      { label: 'Lease term', value: '15 years' },
    ],
  },
  {
    addressInput: '303 Peachtree Industrial Boulevard, Atlanta, GA 30341',
    name: 'Peachtree Industrial Campus',
    address: '303 Peachtree Industrial Boulevard',
    city: 'Atlanta',
    state: 'GA',
    zip: '30341',
    country: 'USA',
    latitude: 33.749,
    longitude: -84.388,
    squareFootage: 89000,
    facts: [
      { label: 'Year built', value: '2016' },
      { label: 'Lease term', value: '10 years' },
    ],
  },
] satisfies Prisma.PropertyCreateWithoutReitInput[];

export const betaTestGeocodes = betaTestProperties.map(
  ({ addressInput, city, state, zip, country, latitude, longitude }) => ({
    addressInput: `${BETA_TEST_GEOCODE_PREFIX}${addressInput}`,
    locality: city,
    administrativeAreaLevel1: state,
    postalCode: zip,
    country,
    formattedAddress: addressInput,
    latitude: latitude as number,
    longitude: longitude as number,
  }),
) satisfies Prisma.GeocodeCreateManyInput[];
