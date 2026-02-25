import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

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

export default async function globalSetup() {
  const env = parseEnvFile(path.join(BACKEND_DIR, '.env'));
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = env;

  const auth = DB_PASSWORD ? `${DB_USER}:${DB_PASSWORD}` : DB_USER;
  const connStr = `postgresql://${auth}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

  console.log('\nTruncating all tables...');
  execSync(
    `psql "${connStr}" -c 'TRUNCATE TABLE "Application", "JobRoleLocation", "JobRole", "User", "UserType", "Capability", "Band", "Location", "JobRoleStatus", "ApplicationStatus" RESTART IDENTITY CASCADE;'`,
    { stdio: 'inherit' },
  );

  console.log('Re-seeding database...');
  execSync('npm run db:seed', { cwd: BACKEND_DIR, stdio: 'inherit' });

  console.log('Database ready for e2e tests\n');
}
