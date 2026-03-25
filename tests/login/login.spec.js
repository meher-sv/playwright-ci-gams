import { test, expect } from '../../fixtures/index.js';
import { loginAs } from '../../helpers/auth.helper.js';
import { LOGIN_SELECTORS } from '../../selectors/index.js';

// All login tests start unauthenticated — override the project-level storageState
test.use({ storageState: { cookies: [], origins: [] } });

// ─── Reusable helper: fill facility + credentials without submitting ──────────
async function fillLoginForm(page, { facility = 'Version1', username, password }) {
  await page.locator(LOGIN_SELECTORS.facilityDropdown).click();
  await page.locator(LOGIN_SELECTORS.facilityInput).fill(facility);
  await page.locator(LOGIN_SELECTORS.facilityOption).first().click();
  await page.fill(LOGIN_SELECTORS.usernameInput, username);
  await page.fill(LOGIN_SELECTORS.passwordInput, password);
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Login - Form elements', () => {

  test('should display all required form fields', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(LOGIN_SELECTORS.facilityDropdown)).toBeVisible();
    await expect(page.locator(LOGIN_SELECTORS.usernameInput)).toBeVisible();
    await expect(page.locator(LOGIN_SELECTORS.passwordInput)).toBeVisible();
    await expect(page.locator(LOGIN_SELECTORS.loginButton)).toBeVisible();
  });

  test('should have login button disabled on page load', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(LOGIN_SELECTORS.loginButton)).toBeDisabled();
  });

  test('should keep login button disabled with only email filled', async ({ page }) => {
    await page.goto('/');
    await page.fill(LOGIN_SELECTORS.usernameInput, 'test@test.com');
    await expect(page.locator(LOGIN_SELECTORS.loginButton)).toBeDisabled();
  });

  test('should keep login button disabled with email and password but no facility', async ({ page }) => {
    await page.goto('/');
    await page.fill(LOGIN_SELECTORS.usernameInput, 'test@test.com');
    await page.fill(LOGIN_SELECTORS.passwordInput, 'somepassword');
    await expect(page.locator(LOGIN_SELECTORS.loginButton)).toBeDisabled();
  });

  test('should enable login button once all required fields are filled', async ({ page }) => {
    await page.goto('/');
    await fillLoginForm(page, {
      username: 'test@test.com',
      password: 'somepassword',
    });
    await expect(page.locator(LOGIN_SELECTORS.loginButton)).toBeEnabled();
  });

});

test.describe('Login - Unsuccessful', () => {

  test('should show "incorrect password" error for valid user with wrong password', async ({ page }) => {
    await page.goto('/');
    await fillLoginForm(page, {
      username: 'atieh.mohammadrahimi@mh.org.au',
      password: 'WrongPassword@999',
    });
    await page.click(LOGIN_SELECTORS.loginButton);
    await expect(page.locator(LOGIN_SELECTORS.errorAlert)).toBeVisible();
    await expect(page.locator(LOGIN_SELECTORS.errorWrongPassword)).toBeVisible();
  });

  test('should show "username not found" error for non-existent email', async ({ page }) => {
    await page.goto('/');
    await fillLoginForm(page, {
      username: 'nobody@notexist.com',
      password: 'Gams@123#',
    });
    await page.click(LOGIN_SELECTORS.loginButton);
    await expect(page.locator(LOGIN_SELECTORS.errorAlert)).toBeVisible();
    await expect(page.locator(LOGIN_SELECTORS.errorUserNotFound)).toBeVisible();
  });

});

test.describe('Login - Successful', () => {

  // Runs once per project (aa / doctor / pharmacist) — 3 executions total
  test('should login and land on Patient List', async ({ page, userRole }) => {
    await loginAs(page, userRole);
    await expect(page.locator(LOGIN_SELECTORS.patientListHeading)).toBeVisible();
  });

  test('should show navigation bar after login', async ({ page, userRole }) => {
    await loginAs(page, userRole);
    await expect(page.locator('nav, [class*="navbar"], [class*="header"]').first()).toBeVisible();
  });

});

test.describe('Login - Logout', () => {

  test('should logout and return to login page', async ({ page, userRole }) => {
    await loginAs(page, userRole);
    // TODO: share the nav header HTML so we can set the exact logout selector
    await page.locator('[class*="user"], [class*="avatar"], [class*="profile"]').first().click();
    await page.locator('text=Logout, text=Sign out, text=Log out').first().click();
    await expect(page.locator(LOGIN_SELECTORS.loginButton)).toBeVisible();
  });

});
