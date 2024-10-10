import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GeocodeCreateInputSchema, GeocodeFindManyArgsSchema } from '$lib/utils/prismaGeneratedZod';
import { ZodError } from 'zod';
import { createGeocode, findManyGeocodes } from '$lib/server/db/geocodeQueries';

export const GET: RequestHandler = async ({ url }) => {
  console.log('received GET request to /api/geocodes with url:', url);
  try {
    const whereParams: { [key: string]: string } = {};
    url.searchParams.forEach((value, key) => {
      if (key === 'take' || key === 'skip') {
        return;
      }
      whereParams[key] = value;
    });
    const take = url.searchParams.has('take') ? parseInt(url.searchParams.get('take') ?? '5') : 5;
    const skip = url.searchParams.has('skip') ? parseInt(url.searchParams.get('skip') ?? '0') : 0;
    const geocodeFindManyInput = GeocodeFindManyArgsSchema.parse({
      where: whereParams,
      take,
      skip,
    });
    const geocodeFindManyPrismaResponse = await findManyGeocodes(geocodeFindManyInput);
    return json(geocodeFindManyPrismaResponse);
  } catch (e) {
    if (e instanceof ZodError) {
      const zodErrorMessages = e.errors.map((error) => error.message).join(', ');
      error(400, {
        message: zodErrorMessages,
      });
    }
    console.error('Error in GET /api/geocodes: ', e);
    error(500, {
      message: 'Something went wrong',
    });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('received POST request to /api/geocodes: ', body);
    const geocodeCreateInput = GeocodeCreateInputSchema.parse(body);
    const geocodeCreatePrismaResponse = await createGeocode(geocodeCreateInput);
    return json(geocodeCreatePrismaResponse);
  } catch (e) {
    if (e instanceof ZodError) {
      const zodErrorMessages = e.errors.map((error) => error.message).join(', ');
      error(400, {
        message: zodErrorMessages,
      });
    }
    console.error('Error in POST /api/geocodes: ', e);
    error(500, {
      message: 'Something went wrong',
    });
  }
};
