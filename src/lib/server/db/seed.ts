import prisma from '$lib/server/db/prisma';

// create dummy reit with properties
await prisma.reit.create({
  data: {
    ticker: 'PLD',
    properties: {
      createMany: {
        data: [
          {
            name: 'PLD Property 1',
            address: '123 Main St',
            address2: 'Suite 100',
            neighborhood: 'Downtown',
            city: 'Anytown',
            state: 'CA',
            zip: '90210',
            country: 'USA',
            latitude: 34.0522,
            longitude: -118.2437,
            squareFootage: 100000,
          },
          {
            name: 'PLD Property 2',
            address: '456 Elm St',
            city: 'Anytown',
            state: 'CA',
            zip: '90210',
            country: 'USA',
            latitude: 34.0522,
            longitude: -118.2437,
            squareFootage: 200000,
          },
        ],
      },
    },
  },
});
