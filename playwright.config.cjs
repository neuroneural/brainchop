// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  snapshotPathTemplate: './tests/snapshots/{testName}/{testName}-{projectName}{ext}',

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // set window size to 1280x720
        viewport: { width: 1280, height: 720 },
        headless: true,
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'], 
        // set window size to 1280x720
        viewport: { width: 1280, height: 720 },
        headless: true,
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // set window size to 1280x720
        viewport: { width: 1280, height: 720 },
        headless: true,
       },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run preview',
    url: 'http://127.0.0.1:8088',
    reuseExistingServer: !process.env.CI,
    timeout: 20 * 1000,
  }
});

