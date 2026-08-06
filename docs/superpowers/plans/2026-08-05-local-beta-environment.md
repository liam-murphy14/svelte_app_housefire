# Local beta environment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make local Housefire development use the beta database by default while providing explicit beta and production Prisma migration commands.

**Architecture:** Keep the existing SvelteKit runtime contract on DB_URL and the Prisma CLI contract on DB_URL_DIRECT. Move the current ignored production environment file to .env.production, create .env for the beta runtime/direct URLs, and select the migration environment explicitly with DOTENV_CONFIG_PATH in package.json scripts. Update safe templates and the repository guide without adding application code.

**Tech Stack:** SvelteKit, Prisma 7, dotenv, npm scripts, PostgreSQL 18, PgBouncer, Markdown, shell-safe local environment files.

## Global Constraints

- The default local .env must target only housefire_beta.
- The existing production .env values must be preserved in the ignored .env.production file without being printed or committed.
- Runtime application traffic must use DB_URL through PgBouncer on port 6432.
- Prisma CLI migration traffic must use DB_URL_DIRECT through PostgreSQL on port 5432.
- Beta and production migration commands must be named separately: npm run db:migrate:beta and npm run db:migrate:prod.
- The generic npm run db:migrate command must not remain as an ambiguous migration target.
- The local beta SELF_API_KEY must be separate from the production key.
- No passwords, API keys, SCRAM verifiers, or .env contents may enter the repository or documentation.
- Do not change src/lib/server/db/prisma.ts or prisma.config.ts; their existing variable boundaries already match the beta architecture.
- Do not run a migration command during implementation unless the user has supplied working credentials and explicitly intends to apply migrations.

---

### Task 1: Add explicit beta and production migration scripts

**Files:**

- Modify: package.json:6-10
- Test: Prisma configuration validation using the selected dotenv files

**Interfaces:**

- Consumes: .env for beta and .env.production for production.
- Produces: npm run db:migrate:beta and npm run db:migrate:prod, each invoking prisma migrate deploy with an explicit dotenv file.

- [ ] **Step 1: Confirm the current script and Prisma environment boundary**

Run:

    node -e "const p=require('./package.json'); console.log(p.scripts['db:migrate'])"
    sed -n '1,20p' prisma.config.ts

Expected: the current script is prisma migrate deploy, and prisma.config.ts reads DB_URL_DIRECT after importing dotenv/config.

- [ ] **Step 2: Update the npm scripts**

Change the scripts block to remove the ambiguous entry and add:

    "db:migrate:beta": "DOTENV_CONFIG_PATH=.env prisma migrate deploy",
    "db:migrate:prod": "DOTENV_CONFIG_PATH=.env.production prisma migrate deploy",

Keep dev, build, and all test scripts unchanged.

- [ ] **Step 3: Record the validation to run after local files exist**

Do not run a migration. After Task 3 creates both ignored environment files,
validate each selected dotenv configuration without printing environment
contents:

    DOTENV_CONFIG_PATH=.env npx prisma validate
    DOTENV_CONFIG_PATH=.env.production npx prisma validate

Expected: both commands validate prisma/schema.prisma successfully. If the
beta credentials are not available yet, stop after the script inspection and
complete this validation only after the user supplies the beta password
privately. A missing credential is not a reason to alter Prisma configuration.

- [ ] **Step 4: Check the package diff**

Run:

    npx prettier --check package.json
    git diff --check

Expected: formatting and whitespace checks pass, with only the two explicit migration scripts changed.

- [ ] **Step 5: Commit the script change**

  git add package.json
  git commit -m "build: separate beta and production migrations"

### Task 2: Update safe environment and repository documentation

**Files:**

- Modify: .env.example:1-7
- Modify: AGENTS.md:34-66, 80-90, 138-146
- Test: credential-name and migration-command scans

**Interfaces:**

- Consumes: the approved local beta/production environment design.
- Produces: safe onboarding documentation that describes beta as the default and production migration as an explicit operation.

- [ ] **Step 1: Update .env.example**

Replace its contents with a secret-free contract that identifies the beta default and the two connection paths:

    # Local default: beta runtime connection through PgBouncer.
    DB_URL=

    # Local beta Prisma CLI connection through direct PostgreSQL.
    DB_URL_DIRECT=

    # Local-only API key for the beta-configured development server.
    SELF_API_KEY=

Do not add a password, hostname containing credentials, API key, or verifier.

- [ ] **Step 2: Update AGENTS.md setup guidance**

Change the required-environment and setup text to state:

- .env is the local beta default.
- DB_URL uses PgBouncer on port 6432 and the housefire_beta database.
- DB_URL_DIRECT uses direct PostgreSQL on port 5432 and the housefire_beta database for local beta CLI work.
- .env.production is an ignored file reserved for production migration credentials.
- beta and production API/database credentials must remain separate.

Retain the instruction never to expose the current local .env value.

- [ ] **Step 3: Update the command table and migration instructions**

Replace generic migration command references with:

    npm run db:migrate:beta  Apply tracked migrations to housefire_beta through DB_URL_DIRECT.
    npm run db:migrate:prod  Apply tracked migrations to production through .env.production.

State that production migrations require deliberately selecting .env.production, checking the target before execution, and must not be run through the beta command. State that neither command is run automatically by npm run dev, npm run build, or tests.

- [ ] **Step 4: Scan documentation for unsafe content and stale commands**

Run:

    rg -n --hidden -g '!node_modules/**' -g '!.git/**' -g '!.env' -g '!.env.*' \
      '(postgresql://[^[:space:]]+:[^@[:space:]]+@|postgres://[^[:space:]]+:[^@[:space:]]+@|SCRAM-SHA-256\$|SELF_API_KEY=[^[:space:]]+)' \
      .env.example AGENTS.md docs/superpowers/specs/2026-08-05-local-beta-environment-design.md
    rg -n 'npm run db:migrate([^:]|$)|"db:migrate"' AGENTS.md .env.example package.json

Expected: the credential scan returns no matches. The stale-command scan returns no generic migration command; only db:migrate:beta and db:migrate:prod remain.

- [ ] **Step 5: Format and commit documentation**

Run:

    npx prettier --check .env.example AGENTS.md
    git diff --check
    git add .env.example AGENTS.md
    git commit -m "docs: document beta-first local environment"

### Task 3: Switch ignored local files to beta by default

**Files:**

- Modify ignored local file: .env
- Create ignored local file: .env.production
- Test: secret-safe file metadata and environment-target checks

**Interfaces:**

- Consumes: the existing local .env containing production values and the beta infrastructure contract from nixos-configs.
- Produces: a default .env for housefire_beta and a preserved .env.production for explicit production migrations.

- [ ] **Step 1: Check local file state without printing values**

Run:

    test -f .env
    test ! -e .env.production
    git check-ignore -q .env .env.production

If .env.production already exists, stop before overwriting it and preserve both files for manual review. Do not print either file.

- [ ] **Step 2: Preserve the current production environment**

Move the existing ignored file without displaying or transforming its contents:

    mv .env .env.production
    chmod 600 .env.production

Do not use git add, git diff, sed, cat, or logging commands that could expose its values.

- [ ] **Step 3: Create the beta default environment**

Create .env with exactly these keys and beta targets:

    DB_URL=the beta housefire_beta role URL at rbpi.liammurphydev.com:6432/housefire_beta
    DB_URL_DIRECT=the beta housefire_beta role URL at rbpi.liammurphydev.com:5432/housefire_beta
    SELF_API_KEY=a local key distinct from production

Replace the descriptive values locally with the URL-encoded beta role
password and a key distinct from production. Do not paste either secret into
the repository, plan, commit, tool output, shell history, or chat. Set mode
600:

    chmod 600 .env

The beta password must be the password configured for the NixOS housefire_beta role; the SCRAM verifier in the PgBouncer userlist cannot be used as a PostgreSQL URL password.

- [ ] **Step 4: Verify targets without exposing secrets**

Run a redacted metadata check that shows only the database names, ports, and presence of required keys:

    awk -F= '/^(DB_URL|DB_URL_DIRECT|SELF_API_KEY)=/ { print $1, "configured" }' .env .env.production
    sed -E 's#(postgres(ql)?://)[^@[:space:]]+@#\1[redacted]@#g' .env | sed -E 's#(SELF_API_KEY=).*$#\1[redacted]#'

Expected: .env contains housefire_beta with ports 6432 and 5432, and .env.production remains the preserved production file. Do not include this output in a commit or final report.

- [ ] **Step 5: Commit only tracked documentation/code changes**

Run:

    git status --short
    git diff --cached --name-only

Expected: .env and .env.production are absent from the tracked status and staged file list. Do not commit either ignored file.

### Task 4: Run repository verification and final safety review

**Files:**

- Test: repository checks and final diff/status

**Interfaces:**

- Consumes: the package scripts, documentation, and local environment files from Tasks 1–3.
- Produces: evidence that the default local app points at beta and migrations remain explicitly targeted.

- [ ] **Step 1: Validate both dotenv configurations without applying migrations**

Run:

    DOTENV_CONFIG_PATH=.env npx prisma validate
    DOTENV_CONFIG_PATH=.env.production npx prisma validate

Expected: both Prisma schemas validate without a database migration or schema write. If either URL is unavailable to the parser, fix only local ignored files and rerun; do not alter tracked code to bypass validation.

- [ ] **Step 2: Run static checks and unit tests**

Run:

    npm run check
    npm run build
    npm run lint
    npm run test:unit

Expected: each command exits zero. Do not run npm run db:migrate:beta or npm run db:migrate:prod as part of this verification unless the user explicitly requests applying migrations.

- [ ] **Step 3: Review tracked diff and ignored-file safety**

Run:

    git diff --check
    git status --short --branch
    git diff origin/main -- package.json .env.example AGENTS.md
    git ls-files .env .env.production

Expected: the tracked changes contain only the intended scripts and safe documentation; git ls-files prints no environment files; no credentials or generated Prisma output are present.

- [ ] **Step 4: Report external connectivity separately**

If a non-mutating beta connectivity check is needed and credentials are available, use a read-only command against the beta URL and report only its exit status and whether it reached housefire_beta. Never report the URL, password, API key, or command output containing connection details.

- [ ] **Step 5: Commit any final tracked fixes**

If verification requires a tracked correction, review it with git diff --check, then commit only the intended files:

    git add package.json .env.example AGENTS.md
    git commit -m "chore: verify beta-first local setup"

If no correction is needed, do not create an empty commit.
