import USERS from '../fixtures/users.json' assert { type: 'json' };
import { LOGIN_SELECTORS } from '../selectors/selectors.js';

export async function loginAs(page, role) {
  const user = USERS[role];

  await page.goto('/');

  // 1. Select facility — ng-select with appendto="body" (dropdown renders in <body>)
  await page.locator(LOGIN_SELECTORS.facilityDropdown).click();
  await page.locator(LOGIN_SELECTORS.facilityInput).fill(user.facility);
  await page.locator(LOGIN_SELECTORS.facilityOption).first().click();

  // 2. Fill credentials
  await page.fill(LOGIN_SELECTORS.usernameInput, user.username);
  await page.fill(LOGIN_SELECTORS.passwordInput, user.password);

  // 3. Submit (button is disabled until all required fields are filled)
  await page.click(LOGIN_SELECTORS.loginButton);

  // 4. Wait for Patient List — confirms successful login
  await page.waitForSelector(LOGIN_SELECTORS.patientListHeading, { timeout: 15_000 });
}

