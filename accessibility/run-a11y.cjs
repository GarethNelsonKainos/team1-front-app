/**
 * US033 - Run pa11y-ci with a custom base URL.
 *
 * Reads the static .pa11yci config, replaces `http://localhost:3000`
 * with the BASE_URL env var, writes a temp config, and runs pa11y-ci.
 *
 * Usage:
 *   BASE_URL=https://your-aws-url.com node accessibility/run-a11y.cjs
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const configPath = path.join(__dirname, '.pa11yci');
const tmpConfigPath = path.join(__dirname, '.pa11yci-tmp');
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

const raw = fs.readFileSync(configPath, 'utf-8');
const replaced = raw.replace(/http:\/\/localhost:3000/g, baseUrl);

fs.writeFileSync(tmpConfigPath, replaced);

try {
  execSync(`npx pa11y-ci --config "${tmpConfigPath}"`, { stdio: 'inherit' });
} finally {
  fs.unlinkSync(tmpConfigPath);
}
