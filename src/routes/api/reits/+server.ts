import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ReitCreateInputSchema } from '$lib/utils/prismaGeneratedZod';
import { ZodError } from 'zod';
import { createReit, getAllReits } from '$lib/server/db/reitQueries';
import { formatZodError } from '$lib/server/validation';

export const GET: RequestHandler = async () => {
  try {
    return json(await getAllReits());
  } catch (e) {
    console.error('Error in GET /api/reits: ', e);
    error(500, {
      message: 'Something went wrong',
    });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('received POST request to /api/reits: ', body);
    const reitCreateInput = ReitCreateInputSchema.parse(body);
    const reitCreatePrismaResponse = await createReit(reitCreateInput);
    return json(reitCreatePrismaResponse);
  } catch (e) {
    if (e instanceof ZodError) {
      error(400, {
        message: formatZodError(e),
      });
    }
    console.error('Error in POST /api/reits: ', e);
    error(500, {
      message: 'Something went wrong',
    });
  }
};
