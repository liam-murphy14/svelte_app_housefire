import { getAllTickers } from '$lib/server/db/reitQueries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    reitTickers: await getAllTickers(),
    metaTags: {
      title: 'REIT Property Data, Made Tangible',
      description:
        'Housefire is a growing catalog of REIT holdings, with property records, locations, and map-ready geocode data.',
    },
  };
};
