import prisma from '$lib/server/db/prisma';
import { type Property, Prisma } from '@prisma/client';

export const getPropertyById: (id: string) => Promise<Property | null> = async (id) => {
  return await prisma.property.findUnique({
    where: {
      id,
    },
  });
};

export const deletePropertyById = async (id: string) => {
  return await prisma.property.delete({
    where: {
      id,
    },
  });
};

export const getPropertiesByTicker: (ticker: string) => Promise<Property[]> = async (ticker) => {
  return await prisma.property.findMany({
    where: {
      reit: {
        ticker,
      },
    },
  });
};

export const deletePropertiesByTicker = async (ticker: string) => {
  return await prisma.property.deleteMany({
    where: {
      reit: {
        ticker,
      },
    },
  });
};

export const createManyProperties = async (
  propertiesToCreate: Prisma.PropertyCreateManyInput | Prisma.PropertyCreateManyInput[],
) => {
  return await prisma.property.createManyAndReturn({
    data: propertiesToCreate,
  });
};
