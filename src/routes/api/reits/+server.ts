import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ReitCreateInputSchema } from '$lib/utils/prismaGeneratedZod';
import { ZodError } from 'zod';
import { createReit } from '$lib/server/db/reitQueries';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('received POST request to /api/reits: ', body);
    const reitCreateInput = ReitCreateInputSchema.parse(body);
    const reitCreatePrismaResponse = await createReit(reitCreateInput);
    return json(reitCreatePrismaResponse);
  } catch (e) {
    if (e instanceof ZodError) {
      const zodErrorMessages = e.errors.map((error) => error.message).join(', ');
      error(400, {
        message: zodErrorMessages,
      });
    }
    console.error('Error in POST /api/reits: ', e);
    error(500, {
      message: 'Something went wrong',
    });
  }
};
