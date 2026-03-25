/**
 * Auth setup — runs under the 'setup' project before any user project.
 * Calls loginAs() for each role and saves storage state to .auth/<role>.json.
 */
import { test as setup } from '@playwright/test';
import fs from 'fs';
import { USERS } from './fixtures/users.js';
import { loginAs } from './helpers/auth.helper.js';

const AUTH_DIR = '.auth';
fs.mkdirSync(AUTH_DIR, { recursive: true });

for (const role of Object.keys(USERS)) {
  setup(`authenticate: ${role}`, async ({ page }) => {
    await loginAs(page, role);
    await page.context().storageState({ path: `${AUTH_DIR}/${role}.json` });
    console.log(`  ✓ .auth/${role}.json saved`);
  });
}
