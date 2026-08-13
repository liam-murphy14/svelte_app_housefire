import type { PlaywrightTestConfig } from '@playwright/test';

const chromeExecutablePath =
  process.env.PLAYWRIGHT_CHROME_PATH ??
  (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : undefined);

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
  },
  use: chromeExecutablePath
    ? { launchOptions: { executablePath: chromeExecutablePath } }
    : undefined,
  testDir: 'tests',
  testMatch: /(.+\.)?(test|spec)\.[jt]s/,
};

export default config;
