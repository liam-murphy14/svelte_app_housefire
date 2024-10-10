import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deletePropertiesByTicker, getPropertiesByTicker } from '$lib/server/db/propertyQueries';

export const GET: RequestHandler = async ({ params }) => {
  console.log('received GET request to /api/properties/byTicker with params: ', params);
  const ticker = params.ticker;
  const properties = await getPropertiesByTicker(ticker);
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
  const properties = await deletePropertiesByTicker(ticker);
  if (!properties || !properties.count) {
    error(404, {
      message: 'No properties found',
    });
  }
  return json(properties);
};
