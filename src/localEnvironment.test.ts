import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
  scripts: Record<string, string>;
};

const scripts = packageJson.scripts;

describe('local environment command selection', () => {
  it('pins local build and preview to Vite beta mode', () => {
    expect(scripts.build).toMatch(/^vite build .*--mode beta(?:\s|$)/);
    expect(scripts.preview).toMatch(/^vite preview .*--mode beta(?:\s|$)/);
  });

  it('clears inherited direct URLs before selecting each migration dotenv file', () => {
    const migrationScripts = [
      ['db:migrate:beta', '.env'],
      ['db:migrate:prod', '.env.production'],
    ] as const;

    for (const [scriptName, dotenvFile] of migrationScripts) {
      const script = scripts[scriptName];
      const clearIndex = script.indexOf('unset DB_URL_DIRECT');
      const dotenvIndex = script.indexOf(`DOTENV_CONFIG_PATH=${dotenvFile}`);

      expect(clearIndex, `${scriptName} must clear DB_URL_DIRECT`).toBeGreaterThanOrEqual(0);
      expect(dotenvIndex, `${scriptName} must select ${dotenvFile}`).toBeGreaterThanOrEqual(0);
      expect(clearIndex, `${scriptName} must clear DB_URL_DIRECT first`).toBeLessThan(dotenvIndex);
      expect(script).toContain('prisma migrate deploy');
    }
  });
});
