/**
 * Auth setup — runs under the 'setup' project before any user project.
 * Calls loginAs() for each role and saves storage state to .auth/<role>.json.
 */
import { test as setup } from '@playwright/test';
import USERS from './fixtures/users.json' assert { type: 'json' };
import { loginAs } from './helpers/auth.helper.js';

for (const role of Object.keys(USERS)) {
  setup(`authenticate: ${role}`, async ({ page }) => {
    await loginAs(page, role);
    await page.context().storageState({ path: `.auth/${role}.json` });
    console.log(`  ✓ .auth/${role}.json saved`);
  });
}
