import { deletePropertyById, getPropertyById } from '$lib/server/db/propertyQueries';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  console.log('received GET request to /api/property/[id] with params: ', params);
  const id = params.id;
  if (!id) {
    error(400, {
      message: 'No id provided',
    });
  }
  const property = await getPropertyById(id);
  if (!property) {
    error(404, {
      message: 'No property found',
    });
  }
  return json(property);
};

export const DELETE: RequestHandler = async ({ params }) => {
  console.log('received DELETE request to /api/property/[id] with params: ', params);
  const id = params.id;
  if (!id) {
    error(400, {
      message: 'No id provided',
    });
  }
  const property = await deletePropertyById(id);
  if (!property) {
    error(404, {
      message: 'No property found',
    });
  }
  return json(property);
};
