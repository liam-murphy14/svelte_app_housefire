import prisma from '$lib/server/db/prisma';
import type { Geocode, Prisma } from '@prisma/client';

export const getGeocodeByAddressInput: (addressInput: string) => Promise<Geocode | null> = async (
  addressInput,
) => {
  return await prisma.geocode.findUnique({
    where: {
      addressInput,
    },
  });
};

export const findManyGeocodes: (
  geocodeFindManyInput: Prisma.GeocodeFindManyArgs,
) => Promise<Geocode[]> = async (geocodeFindManyInput) => {
  return await prisma.geocode.findMany(geocodeFindManyInput);
};

export const createGeocode: (
  geocodeToCreate: Prisma.GeocodeCreateInput,
) => Promise<Geocode> = async (geocodeToCreate) => {
  return await prisma.geocode.create({
    data: geocodeToCreate,
  });
};
