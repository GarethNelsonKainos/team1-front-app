import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path, { resolve } from 'node:path';
import { After, Before, BeforeAll } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { config } from 'dotenv';
import type { PlaywrightWorld } from './world';

config({ path: resolve('tests/.env') });

const BACKEND_DIR = path.resolve(process.cwd(), '../team1-back-app');

function parseEnvFile(filePath: string): Record<string, string> {
  const content = readFileSync(filePath, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

BeforeAll(async () => {
  // always reset db with seed data before tests run
  const env = parseEnvFile(path.join(BACKEND_DIR, '.env'));
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = env;
  const auth = DB_PASSWORD ? `${DB_USER}:${DB_PASSWORD}` : DB_USER;
  const connStr = `postgresql://${auth}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

  execSync(
    `psql "${connStr}" -c 'TRUNCATE TABLE "Application", "JobRoleLocation", "JobRole", "User", "UserType", "Capability", "Band", "Location", "JobRoleStatus", "ApplicationStatus" RESTART IDENTITY CASCADE;'`,
    { stdio: 'inherit' },
  );
  execSync('npm run db:seed', { cwd: BACKEND_DIR, stdio: 'inherit' });
});

Before(async function (this: PlaywrightWorld) {
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext({
    baseURL: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  });
  this.page = await this.context.newPage();
});

After(async function (this: PlaywrightWorld) {
  await this.page?.close();
  await this.context?.close();
  await this.browser?.close();
});