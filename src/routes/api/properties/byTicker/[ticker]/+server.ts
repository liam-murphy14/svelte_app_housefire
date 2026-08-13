import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deletePropertiesByTicker, getPropertiesByTicker } from '$lib/server/db/propertyQueries';
import { getPrismaHttpError } from '$lib/server/prismaErrors';

export const GET: RequestHandler = async ({ params }) => {
  console.log('received GET request to /api/properties/byTicker with params: ', params);
  const ticker = params.ticker;
  let properties;
  try {
    properties = await getPropertiesByTicker(ticker);
  } catch (e) {
    const prismaHttpError = getPrismaHttpError(e);
    if (prismaHttpError) {
      error(prismaHttpError.status, {
        message: prismaHttpError.message,
      });
    }
    console.error('Error in GET /api/properties/byTicker/[ticker]: ', e);
    error(500, {
      message: 'Something went wrong',
    });
  }
  if (!properties || !properties.length) {
    error(404, {
      message: 'No properties found',
    });
  }
  return json(properties);
};

export const DELETE: RequestHandler = async ({ params }) => {
  console.log('received DELETE request to /api/properties/byTicker with params: ', params);
  const ticker = params.ticker;
  let properties;
  try {
    properties = await deletePropertiesByTicker(ticker);
  } catch (e) {
    const prismaHttpError = getPrismaHttpError(e);
    if (prismaHttpError) {
      error(prismaHttpError.status, {
        message: prismaHttpError.message,
      });
    }
    console.error('Error in DELETE /api/properties/byTicker/[ticker]: ', e);
    error(500, {
      message: 'Something went wrong',
    });
  }
  if (!properties || !properties.count) {
    error(404, {
      message: 'No properties found',
    });
  }
  return json(properties);
};
