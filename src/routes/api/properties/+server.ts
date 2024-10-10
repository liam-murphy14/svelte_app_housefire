import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createManyProperties } from '$lib/server/db/propertyQueries';
import { PropertyCreateManyArgsSchema } from '$lib/utils/prismaGeneratedZod';
import { ZodError } from 'zod';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('received POST request to /api/properties: ', body);
    const propertiesCreateManyInput = PropertyCreateManyArgsSchema.parse({ data: body }).data;
    const propertiesCreatePrismaResponse = await createManyProperties(propertiesCreateManyInput);
    return json(propertiesCreatePrismaResponse);
  } catch (e) {
    if (e instanceof ZodError) {
      const zodErrorMessages = e.errors.map((error) => error.message).join(', ');
      error(400, {
        message: zodErrorMessages,
      });
    }
    console.error('Error in POST /api/properties: ', e);
    error(500, {
      message: 'Something went wrong',
    });
  }
};
