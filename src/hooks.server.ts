import { error, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// handler for api key validation on api routes
export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/api')) {
    if (!event.request.headers.has('x-api-key')) {
      error(401, {
        message: 'Unauthorized',
      });
    }
    if (!env.SELF_API_KEY) {
      console.error('SELF_API_KEY is not configured');
      error(500, {
        message: 'API key is not configured',
      });
    }
    if (event.request.headers.get('x-api-key') !== env.SELF_API_KEY) {
      error(403, {
        message: 'Forbidden',
      });
    }
  }

  return await resolve(event);
};
