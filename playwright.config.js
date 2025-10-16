/**
 * Playwright Configuration - Test E2E per RFI POC
 *
 * Test automatici per feature 001 e feature 002
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',

  // Timeout per test singolo (30s default)
  timeout: 30 * 1000,

  // Configurazione expect
  expect: {
    timeout: 5000
  },

  // Esegui test in parallelo
  fullyParallel: true,

  // Riprova test falliti (0 in dev, 2 in CI)
  retries: process.env.CI ? 2 : 0,

  // Worker paralleli (in CI usa 1, localmente auto)
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  // Configurazione browser/context condivisa
  use: {
    // Base URL per navigazione
    baseURL: 'http://localhost:8000',

    // Screenshot solo su fallimento
    screenshot: 'only-on-failure',

    // Video solo su fallimento
    video: 'retain-on-failure',

    // Trace solo su fallimento
    trace: 'on-first-retry',
  },

  // Progetti browser
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Opzionale: Firefox e Safari per cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Web server locale (avvia automaticamente python http.server)
  webServer: {
    command: 'python3 -m http.server 8000',
    port: 8000,
    reuseExistingServer: true,
    timeout: 10 * 1000
  },
});
