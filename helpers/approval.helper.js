import { expect } from '@playwright/test';
import { APPROVAL_SELECTORS, NAV_SELECTORS, COMMON_SELECTORS } from '../selectors/index.js';

// ── Internal utility ──────────────────────────────────────────────────────────

async function waitForSpinner(page) {
  await page
    .locator(COMMON_SELECTORS.loadingSpinner)
    .waitFor({ state: 'hidden', timeout: 15_000 })
    .catch(() => {});
}

// ── Navigation ────────────────────────────────────────────────────────────────

export async function navigateToApprovals(page) {
  await page.click(NAV_SELECTORS.approvals);
  await waitForSpinner(page);
}

// ── Form interactions ─────────────────────────────────────────────────────────

export async function fillApprovalForm(page, data) {
  const { form } = APPROVAL_SELECTORS;
  await page.fill(form.patientId, data.patientId);
  await page.fill(form.drugName, data.drugName);
  await page.fill(form.dosage, data.dosage);
  await page.fill(form.duration, data.duration);
  await page.fill(form.indication, data.indication);
  if (data.notes) await page.fill(form.notes, data.notes);
}

/** Doctor-only: extra fields shown for highly antimicrobial drugs */
export async function fillAntimicrobialFields(page, data) {
  const { antimicrobial } = APPROVAL_SELECTORS;
  if (data.justification) await page.fill(antimicrobial.justificationField, data.justification);
  if (data.requiresIDConsult) await page.check(antimicrobial.idConsultCheckbox);
}

export async function submitApprovalForm(page) {
  await page.click(APPROVAL_SELECTORS.form.submitBtn);
  await waitForSpinner(page);
}

/**
 * Full create-approval flow. Handles role-specific branches automatically.
 * @param {import('@playwright/test').Page} page
 * @param {object} data - from APPROVAL_DATA
 * @param {'ams' | 'doctor' | 'pharmacist'} role
 */
export async function createApproval(page, data, role) {
  await navigateToApprovals(page);
  await page.click(APPROVAL_SELECTORS.createBtn);
  await page.waitForLoadState('networkidle');
  await fillApprovalForm(page, data);

  if (role === 'doctor') {
    const isHighRisk = await page.locator(APPROVAL_SELECTORS.antimicrobial.highRiskBanner).isVisible();
    if (isHighRisk) await fillAntimicrobialFields(page, data);
  }

  await submitApprovalForm(page);
  await page.waitForSelector(APPROVAL_SELECTORS.successToast, { timeout: 10_000 });
}

// ── List interactions ─────────────────────────────────────────────────────────

export async function searchApproval(page, query) {
  await page.fill(APPROVAL_SELECTORS.list.searchInput, query);
  await page.keyboard.press('Enter');
  await waitForSpinner(page);
}

export async function filterByStatus(page, status) {
  await page.selectOption(APPROVAL_SELECTORS.list.filterStatus, status);
  await waitForSpinner(page);
}

export async function getApprovalRows(page) {
  await waitForSpinner(page);
  return page.locator(APPROVAL_SELECTORS.list.row).all();
}

export async function openApproval(page, patientId) {
  await page.locator(APPROVAL_SELECTORS.list.row, { hasText: patientId }).click();
  await page.waitForLoadState('networkidle');
}

/** Search for patientId and assert at least one row exists */
export async function verifyApprovalExists(page, patientId) {
  await navigateToApprovals(page);
  await searchApproval(page, patientId);
  const rows = await getApprovalRows(page);
  expect(rows.length).toBeGreaterThan(0);
}

// ── Review actions ────────────────────────────────────────────────────────────

export async function approveRequest(page, comments = '') {
  const { detail } = APPROVAL_SELECTORS;
  await page.click(detail.approveBtn);
  if (comments) await page.fill(detail.commentsInput, comments);
  await page.click(detail.confirmBtn);
  await waitForSpinner(page);
}

export async function rejectRequest(page, comments) {
  const { detail } = APPROVAL_SELECTORS;
  await page.click(detail.rejectBtn);
  await page.fill(detail.commentsInput, comments);
  await page.click(detail.confirmBtn);
  await waitForSpinner(page);
}
