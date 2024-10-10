import { error, type Handle } from '@sveltejs/kit';
import { SELF_API_KEY } from '$env/static/private';

// handler for api key validation on api routes
export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/api')) {
    if (!event.request.headers.has('x-api-key')) {
      error(401, {
        message: 'Unauthorized',
      });
    }
    if (event.request.headers.get('x-api-key') !== SELF_API_KEY) {
      error(403, {
        message: 'Forbidden',
      });
    }
  }

  return await resolve(event);
};
