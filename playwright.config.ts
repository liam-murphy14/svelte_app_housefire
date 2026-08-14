import type { PlaywrightTestConfig } from '@playwright/test';

const chromeExecutablePath =
  process.env.PLAYWRIGHT_CHROME_PATH ??
  (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : undefined);

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npm run db:seed:beta && npm run build && npm run preview',
    port: 4173,
    env: {
      NODE_NO_WARNINGS: '1',
      FORCE_COLOR: '0',
    },
  },
  use: chromeExecutablePath
    ? { launchOptions: { executablePath: chromeExecutablePath } }
    : undefined,
  testDir: 'tests',
  testMatch: /(.+\.)?(test|spec)\.[jt]s/,
};

export default config;
