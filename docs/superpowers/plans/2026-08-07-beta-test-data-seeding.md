# Beta Test-Data Seeding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a repeatable, explicitly beta-scoped command that recreates a reserved `HFTEST` REIT, three properties, and three geocodes without changing the existing `PLD` demo seed.

**Architecture:** Keep fixture values and the beta safety guard in a database-free module so they can be unit-tested without importing Prisma. Add a standalone `vite-node` runner that uses the existing Prisma singleton and performs a beta-targeted full reset plus recreation in one transaction. Add a package script that clears inherited direct-connection configuration and explicitly loads `.env`.

**Tech Stack:** TypeScript, Vite Node, Prisma 7 with the existing PostgreSQL adapter, Vitest, npm scripts, and SvelteKit path aliases.

## Global Constraints

- Use the runtime `DB_URL` from `.env`; never use `DB_URL_DIRECT` for the beta seed.
- Reserve ticker `HFTEST` and geocode address-input prefix `HFTEST:` for this fixture.
- The explicit beta command may delete all `Property`, `Reit`, and `Geocode` rows; delete properties before REITs to respect the relation.
- Reject `NODE_ENV=production` before starting the Prisma transaction.
- Keep the existing `src/lib/server/db/seed.ts` and its `PLD` demo behavior unchanged.
- Do not log environment values or run the mutating, full-reset seed command as part of automated verification.
- Follow TDD for database-free behavior: each fixture or command test must fail for the expected missing behavior before its implementation is added.

---

### Task 1: Add and verify the beta package command

**Files:**

- Modify: `src/localEnvironment.test.ts`
- Modify: `package.json`

**Interfaces:**

- Produces the npm script `db:seed:beta` for later tasks and user execution.

- [ ] **Step 1: Write the failing command-selection test**

Add this test inside the existing `describe('local environment command selection', ...)` block:

```ts
it('selects the beta dotenv file for test-data seeding', () => {
  const script = scripts['db:seed:beta'] ?? '';

  expect(script).toMatch(
    /^unset DB_URL_DIRECT && DOTENV_CONFIG_PATH=\\.env vite-node \\.\\/src\\/lib\\/server\\/db\\/seedBetaTestData\\.ts$/,
  );
});
```

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run:

```bash
npx vitest run src/localEnvironment.test.ts
```

Expected: the new test fails because `package.json` does not yet define `db:seed:beta`; the existing tests continue to pass.

- [ ] **Step 3: Add the minimal npm command**

Add this entry to `package.json` scripts:

```json
"db:seed:beta": "unset DB_URL_DIRECT && DOTENV_CONFIG_PATH=.env vite-node ./src/lib/server/db/seedBetaTestData.ts"
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
npx vitest run src/localEnvironment.test.ts
```

Expected: all tests in the file pass.

- [ ] **Step 5: Commit the command change**

```bash
git add package.json src/localEnvironment.test.ts
git commit -m "feat: add beta test-data seed command"
```

### Task 2: Define and test the database-free fixture module

**Files:**

- Create: `src/lib/server/db/betaTestFixtures.test.ts`
- Create: `src/lib/server/db/betaTestFixtures.ts`

**Interfaces:**

- Produces `BETA_TEST_REIT_TICKER`, `BETA_TEST_GEOCODE_PREFIX`, `betaTestProperties`, `betaTestGeocodes`, and `assertBetaSeedEnvironment` for the seed runner.
- `betaTestProperties` is a `Prisma.PropertyCreateWithoutReitInput[]`-compatible array with three records.
- `betaTestGeocodes` is a `Prisma.GeocodeCreateManyInput[]`-compatible array with three records.
- `assertBetaSeedEnvironment(nodeEnv?: string, dbUrl?: string): void` throws for `production`, missing/invalid database URLs, or database URLs whose database name is not `housefire_beta`.

- [ ] **Step 1: Write the failing fixture and safety tests**

Create `src/lib/server/db/betaTestFixtures.test.ts` with:

```ts
import { describe, expect, it } from 'vitest';
import {
  assertBetaSeedEnvironment,
  BETA_TEST_GEOCODE_PREFIX,
  BETA_TEST_REIT_TICKER,
  betaTestGeocodes,
  betaTestProperties,
} from './betaTestFixtures';

describe('beta test fixtures', () => {
  it('contains three distinct properties and matching namespaced geocodes', () => {
    expect(BETA_TEST_REIT_TICKER).toBe('HFTEST');
    expect(betaTestProperties).toHaveLength(3);
    expect(new Set(betaTestProperties.map(({ addressInput }) => addressInput)).size).toBe(3);
    expect(new Set(betaTestProperties.map(({ name }) => name)).size).toBe(3);
    expect(
      betaTestProperties.every(
        ({ latitude, longitude, squareFootage, facts }) =>
          typeof latitude === 'number' &&
          typeof longitude === 'number' &&
          typeof squareFootage === 'number' &&
          Array.isArray(facts),
      ),
    ).toBe(true);

    expect(betaTestGeocodes).toHaveLength(3);
    expect(
      betaTestGeocodes.every(
        ({ addressInput, latitude, longitude }) =>
          addressInput.startsWith(BETA_TEST_GEOCODE_PREFIX) &&
          typeof latitude === 'number' &&
          typeof longitude === 'number',
      ),
    ).toBe(true);
    expect(
      betaTestGeocodes
        .map(({ addressInput }) => addressInput.slice(BETA_TEST_GEOCODE_PREFIX.length))
        .sort(),
    ).toEqual(betaTestProperties.map(({ addressInput }) => addressInput).sort());
  });

  it('rejects production before a beta seed can start', () => {
    expect(() => assertBetaSeedEnvironment('production')).toThrow(
      'Refusing to seed beta test data in production',
    );
    expect(() =>
      assertBetaSeedEnvironment('development', 'postgresql://localhost/housefire_beta'),
    ).not.toThrow();
    expect(() =>
      assertBetaSeedEnvironment('development', 'postgresql://localhost/housefire_production'),
    ).toThrow('Refusing to seed outside the beta database');
  });
});
```

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run:

```bash
npx vitest run src/lib/server/db/betaTestFixtures.test.ts
```

Expected: the test fails because `betaTestFixtures.ts` does not exist yet.

- [ ] **Step 3: Implement the fixture constants and guard**

Create `src/lib/server/db/betaTestFixtures.ts` with the following shape and records:

```ts
import type { Prisma } from '@prisma/client';

export const BETA_TEST_REIT_TICKER = 'HFTEST';
export const BETA_TEST_GEOCODE_PREFIX = `${BETA_TEST_REIT_TICKER}:`;
const BETA_DATABASE_NAME = 'housefire_beta';

export const assertBetaSeedEnvironment = (
  nodeEnv = process.env.NODE_ENV,
  dbUrl = process.env.DB_URL,
): void => {
  if (nodeEnv === 'production') {
    throw new Error('Refusing to seed beta test data in production');
  }

  let databaseName: string;
  try {
    databaseName = new URL(dbUrl ?? '').pathname.replace(/^\/+/, '');
  } catch {
    throw new Error('Refusing to seed outside the beta database');
  }

  if (databaseName !== BETA_DATABASE_NAME) {
    throw new Error('Refusing to seed outside the beta database');
  }
};

export const betaTestProperties = [
  {
    addressInput: '101 Harbor Way, Seattle, WA 98101',
    name: 'North Harbor Logistics',
    address: '101 Harbor Way',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    country: 'USA',
    latitude: 47.6062,
    longitude: -122.3321,
    squareFootage: 120000,
    facts: [
      { label: 'Year built', value: '2018' },
      { label: 'Lease term', value: '12 years' },
    ],
  },
  {
    addressInput: '202 Front Range Road, Denver, CO 80216',
    name: 'Front Range Distribution Center',
    address: '202 Front Range Road',
    city: 'Denver',
    state: 'CO',
    zip: '80216',
    country: 'USA',
    latitude: 39.7392,
    longitude: -104.9903,
    squareFootage: 245000,
    facts: [
      { label: 'Year built', value: '2021' },
      { label: 'Lease term', value: '15 years' },
    ],
  },
  {
    addressInput: '303 Peachtree Industrial Boulevard, Atlanta, GA 30341',
    name: 'Peachtree Industrial Campus',
    address: '303 Peachtree Industrial Boulevard',
    city: 'Atlanta',
    state: 'GA',
    zip: '30341',
    country: 'USA',
    latitude: 33.749,
    longitude: -84.388,
    squareFootage: 89000,
    facts: [
      { label: 'Year built', value: '2016' },
      { label: 'Lease term', value: '10 years' },
    ],
  },
] satisfies Prisma.PropertyCreateWithoutReitInput[];

export const betaTestGeocodes = betaTestProperties.map(
  ({ addressInput, city, state, zip, country, latitude, longitude }) => ({
    addressInput: `${BETA_TEST_GEOCODE_PREFIX}${addressInput}`,
    locality: city,
    administrativeAreaLevel1: state,
    postalCode: zip,
    country,
    formattedAddress: addressInput,
    latitude: latitude as number,
    longitude: longitude as number,
  }),
) satisfies Prisma.GeocodeCreateManyInput[];
```

Keep geocode source values derived from the property fixture so the arrays cannot silently diverge. Preserve the exact `facts` shape (`{ label, value }`) used by `PropertyFactsSchema`.

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
npx vitest run src/lib/server/db/betaTestFixtures.test.ts
```

Expected: both fixture tests pass without requiring `DB_URL`.

- [ ] **Step 5: Commit the fixture module**

```bash
git add src/lib/server/db/betaTestFixtures.ts src/lib/server/db/betaTestFixtures.test.ts
git commit -m "feat: define beta test-data fixtures"
```

### Task 3: Add the transactional seed runner

**Files:**

- Modify: `src/lib/server/db/betaTestFixtures.test.ts`
- Modify: `src/lib/server/db/betaTestFixtures.ts`
- Create: `src/lib/server/db/seedBetaTestData.ts`

**Interfaces:**

- Consumes the constants and guard from `./betaTestFixtures` and the existing default Prisma client from `$lib/server/db/prisma`.
- Produces `seedBetaTestData(): Promise<{ propertyCount: number; geocodeCount: number }>` and an executable script entry point.

- [ ] **Step 1: Run the new beta-target guard test and verify the expected failure**

Run:

```bash
npx vitest run src/lib/server/db/betaTestFixtures.test.ts
```

Expected: the new non-beta URL assertion fails because the existing guard only checks `NODE_ENV`.

- [ ] **Step 2: Implement the beta-target guard and transactional runner**

Update `src/lib/server/db/betaTestFixtures.ts` with the URL check described in Task 2, then create `src/lib/server/db/seedBetaTestData.ts`:

```ts
import 'dotenv/config';
import prisma from '$lib/server/db/prisma';
import {
  assertBetaSeedEnvironment,
  BETA_TEST_REIT_TICKER,
  betaTestGeocodes,
  betaTestProperties,
} from './betaTestFixtures';

export const seedBetaTestData = async (): Promise<{
  propertyCount: number;
  geocodeCount: number;
}> => {
  assertBetaSeedEnvironment();

  return await prisma.$transaction(async (transaction) => {
    await transaction.property.deleteMany({});
    await transaction.reit.deleteMany({});
    await transaction.geocode.deleteMany({});

    await transaction.reit.create({
      data: {
        ticker: BETA_TEST_REIT_TICKER,
        properties: { create: betaTestProperties },
      },
    });

    const geocodes = await transaction.geocode.createMany({ data: betaTestGeocodes });

    return {
      propertyCount: betaTestProperties.length,
      geocodeCount: geocodes.count,
    };
  });
};

const result = await seedBetaTestData();
console.log(
  `Seeded ${BETA_TEST_REIT_TICKER}: ${result.propertyCount} properties, ${result.geocodeCount} geocodes`,
);
```

The full reset is intentional: this command is explicitly beta-scoped, and the `DB_URL` guard rejects database names other than `housefire_beta`. The delete order is required by the `Property.reit` relation. Empty-table deletes are safe on the first run, and the transaction ensures cleanup and recreation commit together. Do not print connection details.

- [ ] **Step 3: Run static checks for the runner**

Run:

```bash
npx prettier --check src/lib/server/db/seedBetaTestData.ts src/lib/server/db/betaTestFixtures.ts src/lib/server/db/betaTestFixtures.test.ts src/localEnvironment.test.ts package.json
npx eslint src/lib/server/db/seedBetaTestData.ts src/lib/server/db/betaTestFixtures.ts src/lib/server/db/betaTestFixtures.test.ts src/localEnvironment.test.ts
npm run check
```

Expected: formatting, ESLint, and Svelte/TypeScript checks pass. Do not run `npm run db:seed:beta` in this verification step.

- [ ] **Step 4: Commit the runner**

```bash
git add src/lib/server/db/betaTestFixtures.ts src/lib/server/db/betaTestFixtures.test.ts src/lib/server/db/seedBetaTestData.ts
git commit -m "feat: add transactional beta test-data seeder"
```

### Task 4: Run the complete applicable verification and review the diff

**Files:**

- Verify: all files changed by Tasks 1–3

**Interfaces:**

- Confirms the command, fixture module, and runner are consistent with the approved spec.

- [ ] **Step 1: Run the complete unit suite**

Run:

```bash
npm run test:unit
```

Expected: all unit tests pass.

- [ ] **Step 2: Run repository linting**

Run:

```bash
npm run lint
```

Expected: Prettier and ESLint pass.

- [ ] **Step 3: Review the final status and diff**

Run:

```bash
git diff --check
git status --short
git diff 658198b..HEAD --stat
```

Confirm that only the approved package command, environment test, fixture module/test, runner, and updated design/plan files are present; confirm that no `.env`, build output, or generated Prisma output was added.

- [ ] **Step 4: Provide the beta execution command**

After verification, hand off:

```bash
npm run db:seed:beta
```

State clearly that this command mutates the beta database and was not executed automatically.
