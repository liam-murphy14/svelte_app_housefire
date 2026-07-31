import { error } from '@sveltejs/kit';
import { getPropertyById } from '$lib/server/db/propertyQueries';
import { parsePropertyFacts } from '$lib/utils/propertyFacts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const property = await getPropertyById(params.id);

  if (!property || property.reitTicker !== params.ticker) {
    error(404, { message: 'No property found' });
  }

  return {
    ticker: params.ticker,
    property: {
      ...property,
      facts: parsePropertyFacts(property.facts),
    },
    metaTags: {
      title: `${params.ticker} | ${property.name?.trim() || property.addressInput} Property Details`,
      description: `See detailed property information and facts for ${params.ticker}.`,
    },
  };
};
