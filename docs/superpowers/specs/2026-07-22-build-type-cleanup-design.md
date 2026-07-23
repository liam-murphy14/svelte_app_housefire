# Build and Type-Checking Cleanup Design

## Goal

Bring Housefire's current dependency line to a coherent, working state without downgrading packages. The primary success criteria are a passing Svelte type check and production build, with lint and the existing test commands made useful and current where the required changes are local and low-risk.

## Root causes found

1. Tailwind 4 is installed, but `postcss.config.cjs` registers `tailwindcss` as the PostCSS plugin and `src/app.postcss` uses the pre-Tailwind-4 directives.
2. `@types/node` is absent even though server code references `process`.
3. `$env/static/private` requires a generated `SELF_API_KEY` export that is not present in the local environment, making the repository's type check depend on a developer-specific ignored file.
4. Prisma's regenerated `Property` input requires `addressInput`, but the demo seed does not provide it.
5. Zod 4 exposes validation issues through `ZodError.issues`, while API handlers still use the older `.errors` property.
6. `SortableTable.svelte` emits invalid table structure, causing an SSR/hydration warning.
7. Prettier 3 no longer accepts the old `--plugin-search-dir` CLI option or `pluginSearchDirs` configuration. The generated Zod file should not be hand-formatted by the repository lint command.
8. The Playwright smoke test still expects the default SvelteKit welcome heading instead of Housefire content.

## Chosen approach

Keep the existing dependency versions and complete the Tailwind 4 migration. Install the official `@tailwindcss/postcss` adapter, use Tailwind 4's import/config directives while preserving the existing legacy theme file, and remove obsolete Prettier configuration. Add a safe `.env.example` and read the API key from SvelteKit's runtime private environment object so type checking does not depend on a local secret file.

Fix the server-side type errors directly. Extract the repeated Zod issue-message formatting into a small tested helper, update all affected handlers to use it, and add the required seed fields. Correct the table markup without changing its sorting behavior. Update the smoke test to assert the Housefire homepage's stable logo/content instead of the starter template.

## Scope boundaries

- Do not downgrade Tailwind, SvelteKit, Prisma, Zod, or other dependencies.
- Do not redesign the application or refactor unrelated database/query code.
- Do not commit or expose `.env` values. `.env.example` contains names/placeholders only.
- Do not hand-edit generated Prisma/Zod output.
- Keep destructive API behavior unchanged.

## Verification

Run, in order as fixes land, targeted unit tests and `svelte-check`, then the repository commands:

```sh
npm run check
npm run build
npm run lint
npm run test:unit
npm run test:integration
npm test
```

If integration requires an unavailable database or external service, report that separately from code failures.
