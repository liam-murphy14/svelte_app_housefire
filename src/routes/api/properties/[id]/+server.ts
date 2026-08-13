import { deletePropertyById, getPropertyById } from '$lib/server/db/propertyQueries';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getPrismaHttpError } from '$lib/server/prismaErrors';

export const GET: RequestHandler = async ({ params }) => {
  console.log('received GET request to /api/property/[id] with params: ', params);
  const id = params.id;
  if (!id) {
    error(400, {
      message: 'No id provided',
    });
  }
  let property;
  try {
    property = await getPropertyById(id);
  } catch (e) {
    const prismaHttpError = getPrismaHttpError(e);
    if (prismaHttpError) {
      error(prismaHttpError.status, {
        message: prismaHttpError.message,
      });
    }
    console.error('Error in GET /api/properties/[id]: ', e);
    error(500, {
      message: 'Something went wrong',
    });
  }
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
  try {
    const property = await deletePropertyById(id);
    return json(property);
  } catch (e) {
    const prismaHttpError = getPrismaHttpError(e);
    if (prismaHttpError) {
      error(prismaHttpError.status, {
        message: prismaHttpError.message,
      });
    }
    console.error('Error in DELETE /api/properties/[id]: ', e);
    error(500, {
      message: 'Something went wrong',
    });
  }
};
