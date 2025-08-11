import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: ['**/*.playwright.ts'],
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run start',
    port: 3000,
    // Always start a fresh server so the in-memory SQLite DB is clean per run
    reuseExistingServer: false,
    env: {
      ONE_DASHBOARD_DB: ':memory:',
      NODE_ENV: 'production',
    },
  },
  projects: [
    {
      name: 'chromium',

      use: {...devices['Desktop Chrome'], headless: false},
    },
  ],
});
