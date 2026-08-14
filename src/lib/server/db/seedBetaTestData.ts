import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import {
  assertBetaSeedEnvironment,
  BETA_TEST_REIT_TICKER,
  betaTestGeocodes,
  betaTestProperties,
} from './betaTestFixtures.ts';

const createPrismaClient = () => {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    throw new Error('DB_URL is not configured');
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: dbUrl }),
  });
};

export const seedBetaTestData = async (): Promise<{
  propertyCount: number;
  geocodeCount: number;
}> => {
  assertBetaSeedEnvironment();
  const prisma = createPrismaClient();

  try {
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
  } finally {
    await prisma.$disconnect();
  }
};

const result = await seedBetaTestData();
console.log(
  `Seeded ${BETA_TEST_REIT_TICKER}: ${result.propertyCount} properties, ${result.geocodeCount} geocodes`,
);
