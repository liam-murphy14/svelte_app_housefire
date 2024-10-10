import { getPropertiesByTicker } from '$lib/server/db/propertyQueries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { ticker } = params;

  return {
    ticker,
    properties: await getPropertiesByTicker(ticker),
    metaTags: {
      title: `${ticker} Property Data`,
      description: `See fine-grained property data for ${ticker} holdings, including property type, location, square footage, and more.`,
    },
  };
};
