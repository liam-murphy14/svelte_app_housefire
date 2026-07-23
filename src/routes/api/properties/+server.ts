import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createManyProperties } from '$lib/server/db/propertyQueries';
import { PropertyCreateManyArgsSchema } from '$lib/utils/prismaGeneratedZod';
import { ZodError } from 'zod';
import { formatZodError } from '$lib/server/validation';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('received POST request to /api/properties: ', body);
    const propertiesCreateManyInput = PropertyCreateManyArgsSchema.parse({ data: body }).data;
    const propertiesCreatePrismaResponse = await createManyProperties(propertiesCreateManyInput);
    return json(propertiesCreatePrismaResponse);
  } catch (e) {
    if (e instanceof ZodError) {
      error(400, {
        message: formatZodError(e),
      });
    }
    console.error('Error in POST /api/properties: ', e);
    error(500, {
      message: 'Something went wrong',
    });
  }
};
