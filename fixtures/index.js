import { test as base, expect } from '@playwright/test';

/**
 * Extended test with a userRole option.
 * The actual value comes from playwright.config.js → project use.userRole.
 *
 * Available in every test:
 *   userRole — 'ams' | 'doctor' | 'pharmacist'
 */
export const test = base.extend({
  userRole: ['ams', { option: true }],
});

export { expect };
