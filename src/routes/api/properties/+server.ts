import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createManyProperties } from '$lib/server/db/propertyQueries';
import { PropertyCreateManyArgsSchema } from '$lib/utils/prismaGeneratedZod';
import { PropertyFactsSchema } from '$lib/utils/propertyFacts';
import { ZodError } from 'zod';
import { formatZodError } from '$lib/server/validation';
import { getPrismaHttpError } from '$lib/server/prismaErrors';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('received POST request to /api/properties: ', body);
    const propertiesCreateManyInput = PropertyCreateManyArgsSchema.parse({ data: body }).data;
    const propertyInputs = Array.isArray(propertiesCreateManyInput)
      ? propertiesCreateManyInput
      : [propertiesCreateManyInput];

    const normalizedPropertyInputs = propertyInputs.map((property) => {
      if (property.facts === undefined) {
        return property;
      }

      return {
        ...property,
        facts: PropertyFactsSchema.parse(property.facts),
      };
    });
    const normalizedPropertiesCreateManyInput = Array.isArray(propertiesCreateManyInput)
      ? normalizedPropertyInputs
      : normalizedPropertyInputs[0];

    const propertiesCreatePrismaResponse = await createManyProperties(
      normalizedPropertiesCreateManyInput,
    );
    return json(propertiesCreatePrismaResponse);
  } catch (e) {
    if (e instanceof ZodError) {
      error(400, {
        message: formatZodError(e),
      });
    }
    const prismaHttpError = getPrismaHttpError(e);
    if (prismaHttpError) {
      error(prismaHttpError.status, {
        message: prismaHttpError.message,
      });
    }
    console.error('Error in POST /api/properties: ', e);
    error(500, {
      message: 'Something went wrong',
    });
  }
};
