import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGeocodeByAddressInput } from '$lib/server/db/geocodeQueries';
import { getPrismaHttpError } from '$lib/server/prismaErrors';

export const GET: RequestHandler = async ({ params }) => {
  console.log('received GET request to /api/geocode with params: ', params);
  const addressInput = params.addressInput;
  let geocode;
  try {
    geocode = await getGeocodeByAddressInput(addressInput);
  } catch (e) {
    const prismaHttpError = getPrismaHttpError(e);
    if (prismaHttpError) {
      error(prismaHttpError.status, {
        message: prismaHttpError.message,
      });
    }
    console.error('Error in GET /api/geocodes/byAddressInput/[addressInput]: ', e);
    error(500, {
      message: 'Something went wrong',
    });
  }
  if (!geocode) {
    error(404, {
      message: 'No geocode found',
    });
  }
  return json(geocode);
};
