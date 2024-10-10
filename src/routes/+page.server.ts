import { getAllTickers } from '$lib/server/db/reitQueries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    reitTickers: await getAllTickers(),
    metaTags: {
      title: 'Home of the Hottest REIT Data',
      description:
        'See fine-grained property data for your favorite REITs, updated monthly with more tickers added regularly.',
    },
  };
};
