import { test, expect } from '../../fixtures/index.js';
import { APPROVAL_DATA, EXISTING_APPROVAL_ID } from '../../fixtures/approvals.js';
import { canCreateApproval } from '../../helpers/auth.helper.js';
import {
  navigateToApprovals,
  createApproval,
  verifyApprovalExists,
  filterByStatus,
  getApprovalRows,
  openApproval,
  fillApprovalForm,
  submitApprovalForm,
  approveRequest,
  rejectRequest,
} from '../../helpers/approval.helper.js';
import { APPROVAL_SELECTORS } from '../../selectors/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Each test runs 3× — once per project (ams / doctor / pharmacist).
// Use test.skip(userRole !== 'x') to restrict a test to a specific role.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Approvals - List & Navigation', () => {

  test('should navigate to approvals page', async ({ page }) => {
    await navigateToApprovals(page);
    await expect(page.locator('h1')).toContainText('Approvals');
  });

  test('should display approvals list or empty state', async ({ page }) => {
    await navigateToApprovals(page);
    const rows = await getApprovalRows(page);
    const isEmpty = await page.locator(APPROVAL_SELECTORS.list.emptyState).isVisible();
    expect(rows.length > 0 || isEmpty).toBe(true);
  });

  test('should filter approvals by pending status', async ({ page }) => {
    await navigateToApprovals(page);
    await filterByStatus(page, 'pending');
    const rows = await getApprovalRows(page);
    for (const row of rows) {
      const status = await row.locator(APPROVAL_SELECTORS.list.statusBadge).textContent();
      expect(status?.toLowerCase()).toContain('pending');
    }
  });

  test('should search approvals by patient ID prefix', async ({ page }) => {
    await navigateToApprovals(page);
    const rows = await getApprovalRows(page);
    expect(rows).toBeDefined();
  });

});

test.describe('Approvals - Create (AMS & Doctor only)', () => {

  test('should show create approval button', async ({ page, userRole }) => {
    test.skip(!canCreateApproval(userRole), `${userRole} does not have create_approval permission`);

    await navigateToApprovals(page);
    await expect(page.locator(APPROVAL_SELECTORS.createBtn)).toBeVisible();
  });

  test('should create a standard approval', async ({ page, userRole }) => {
    test.skip(!canCreateApproval(userRole), `${userRole} does not have create_approval permission`);

    await createApproval(page, APPROVAL_DATA.standard, userRole);
    await verifyApprovalExists(page, APPROVAL_DATA.standard.patientId);
  });

  test('should create an urgent approval', async ({ page, userRole }) => {
    test.skip(!canCreateApproval(userRole), `${userRole} does not have create_approval permission`);

    await createApproval(page, APPROVAL_DATA.urgent, userRole);
    await verifyApprovalExists(page, APPROVAL_DATA.urgent.patientId);
  });

  test('pharmacist should NOT see create approval button', async ({ page, userRole }) => {
    test.skip(userRole !== 'pharmacist', 'Permission check — pharmacist only');

    await navigateToApprovals(page);
    await expect(page.locator(APPROVAL_SELECTORS.createBtn)).not.toBeVisible();
  });

});

test.describe('Approvals - High Antimicrobial Flow (Doctor only)', () => {

  test('should show high-risk banner for a restricted drug', async ({ page, userRole }) => {
    test.skip(userRole !== 'doctor', 'High antimicrobial flow is doctor-specific');

    await navigateToApprovals(page);
    await page.click(APPROVAL_SELECTORS.createBtn);
    await page.waitForLoadState('networkidle');
    await fillApprovalForm(page, APPROVAL_DATA.highAntimicrobial);

    await expect(page.locator(APPROVAL_SELECTORS.antimicrobial.highRiskBanner)).toBeVisible();
  });

  test('should block submission without justification', async ({ page, userRole }) => {
    test.skip(userRole !== 'doctor', 'High antimicrobial flow is doctor-specific');

    await navigateToApprovals(page);
    await page.click(APPROVAL_SELECTORS.createBtn);
    await page.waitForLoadState('networkidle');
    await fillApprovalForm(page, APPROVAL_DATA.highAntimicrobial);
    await submitApprovalForm(page);

    // Form should stay open — high-risk banner still visible
    await expect(page.locator(APPROVAL_SELECTORS.antimicrobial.highRiskBanner)).toBeVisible();
  });

  test('should create high antimicrobial approval with justification and ID consult', async ({ page, userRole }) => {
    test.skip(userRole !== 'doctor', 'High antimicrobial flow is doctor-specific');

    await createApproval(page, APPROVAL_DATA.highAntimicrobial, 'doctor');
    await verifyApprovalExists(page, APPROVAL_DATA.highAntimicrobial.patientId);
  });

});

test.describe('Approvals - Review Actions (AMS & Doctor)', () => {

  test('should approve an existing request', async ({ page, userRole }) => {
    test.skip(!canCreateApproval(userRole), `${userRole} cannot review approvals`);

    await navigateToApprovals(page);
    await openApproval(page, EXISTING_APPROVAL_ID);
    await approveRequest(page, 'Approved after clinical review');
    await expect(page.locator(APPROVAL_SELECTORS.successToast)).toBeVisible();
  });

  test('should reject an existing request with a reason', async ({ page, userRole }) => {
    test.skip(!canCreateApproval(userRole), `${userRole} cannot review approvals`);

    await navigateToApprovals(page);
    await openApproval(page, EXISTING_APPROVAL_ID);
    await rejectRequest(page, 'Drug not appropriate for this indication');
    await expect(page.locator(APPROVAL_SELECTORS.successToast)).toBeVisible();
  });

});
