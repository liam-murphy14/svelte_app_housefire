# Beta test-data seeding design

## Context

Housefire currently has a one-shot Prisma demo seed that creates the `PLD` REIT. The beta database needs a repeatable test fixture without changing the existing seed's behavior or risking unrelated records.

## Goals

- Provide an explicit `npm run db:seed:beta` command.
- Load the repository's beta `.env` and use the runtime `DB_URL` connection.
- Make repeated runs converge to the same fixture data.
- Keep cleanup limited to a reserved test namespace.
- Exercise representative REIT, property, geocode, map, table, detail, and API data paths.
- Avoid logging connection strings, API keys, or other environment values.

## Non-goals

- Replacing or changing the existing `npx prisma db seed` / `src/lib/server/db/seed.ts` demo seed.
- Running migrations or seeding production.
- Creating a general-purpose data reset command.

## Design

Add `src/lib/server/db/seedBetaTestData.ts` as a standalone `vite-node` script. Add this package command:

```json
"db:seed:beta": "unset DB_URL_DIRECT && DOTENV_CONFIG_PATH=.env vite-node ./src/lib/server/db/seedBetaTestData.ts"
```

The script uses the existing Prisma singleton and executes cleanup plus insertion in one transaction. It reserves the ticker `HFTEST` for the fixture. Each run:

1. Deletes all properties related to `HFTEST`.
2. Deletes the `HFTEST` REIT.
3. Deletes geocodes whose `addressInput` begins with `HFTEST:`.
4. Creates the `HFTEST` REIT with three properties.
5. Creates one geocode for each fixture property.

The fixed fixture consists of three properties with distinct names, addresses, coordinates, square-footage values, and valid `facts` JSON arrays:

- North Harbor Logistics in Seattle, Washington — 120,000 square feet.
- Front Range Distribution Center in Denver, Colorado — 245,000 square feet.
- Peachtree Industrial Campus in Atlanta, Georgia — 89,000 square feet.

Each geocode uses the matching `HFTEST:`-prefixed address input and complete latitude/longitude data. The namespace is deliberately explicit so cleanup cannot affect unrelated REITs or geocodes.

The script rejects `NODE_ENV=production` before opening a database transaction. The package command also clears `DB_URL_DIRECT` so Prisma CLI-only direct credentials cannot be selected accidentally; loading `.env` makes the runtime database connection come from beta `DB_URL`.

On success, the script prints the reserved ticker and counts of created properties and geocodes. It does not print any environment values.

## Testing

Add a unit test for the fixture constants and namespace behavior, including the reserved ticker and geocode prefix. Keep database access out of that test. Run the targeted test first, then `npm run check`, `npm run lint`, and `npm run test:unit`.

The seed command itself will not be run automatically because it mutates the beta database. The handoff will provide the command for the user to run after confirming the local beta `.env` is configured.
