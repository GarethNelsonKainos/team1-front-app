import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config({ path: './tests/test.env' });

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global-setup.ts',
  fullyParallel: false,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
