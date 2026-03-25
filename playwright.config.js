import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'http://ec2-54-252-26-41.ap-southeast-2.compute.amazonaws.com:8702',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Step 1 — authenticate all 3 users, save .auth/<role>.json
    {
      name: 'setup',
      testMatch: /global-setup\.js/,
    },

    // Step 2 — each project loads its own saved auth state
    {
      name: 'aa',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/aa.json', userRole: 'aa' },
      dependencies: ['setup'],
    },
    {
      name: 'doctor',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/doctor.json', userRole: 'doctor' },
      dependencies: ['setup'],
    },
    {
      name: 'pharmacist',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/pharmacist.json', userRole: 'pharmacist' },
      dependencies: ['setup'],
    },
  ],
});
