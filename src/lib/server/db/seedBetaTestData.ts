import 'dotenv/config';
import prisma from '$lib/server/db/prisma';
import {
  assertBetaSeedEnvironment,
  BETA_TEST_REIT_TICKER,
  betaTestGeocodes,
  betaTestProperties,
} from './betaTestFixtures';

export const seedBetaTestData = async (): Promise<{
  propertyCount: number;
  geocodeCount: number;
}> => {
  assertBetaSeedEnvironment();

  return await prisma.$transaction(async (transaction) => {
    await transaction.property.deleteMany({});
    await transaction.reit.deleteMany({});
    await transaction.geocode.deleteMany({});

    await transaction.reit.create({
      data: {
        ticker: BETA_TEST_REIT_TICKER,
        properties: { create: betaTestProperties },
      },
    });

    const geocodes = await transaction.geocode.createMany({ data: betaTestGeocodes });

    return {
      propertyCount: betaTestProperties.length,
      geocodeCount: geocodes.count,
    };
  });
};

const result = await seedBetaTestData();
console.log(
  `Seeded ${BETA_TEST_REIT_TICKER}: ${result.propertyCount} properties, ${result.geocodeCount} geocodes`,
);
