import { USERS } from '../fixtures/users.js';
import { LOGIN_SELECTORS } from '../selectors/index.js';

/**
 * Full login flow: select facility → fill email → fill password → submit.
 * Used by global-setup.js (to save storage state) and login tests (fresh login).
 *
 * @param {import('@playwright/test').Page} page
 * @param {'aa' | 'doctor' | 'pharmacist'} role
 */
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

export function getUserData(role) {
  return USERS[role];
}

export function hasPermission(role, permission) {
  return USERS[role].permissions.includes(permission);
}

export function canCreateApproval(role) {
  return hasPermission(role, 'create_approval');
}

export function canCreatePA(role) {
  return hasPermission(role, 'create_pa');
}

export function canViewReports(role) {
  return hasPermission(role, 'view_reports');
}
