import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke test configuration for post-deployment validation
 * Used by CD pipeline to verify deployments
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/smoke-*.spec.ts',
  timeout: 60 * 1000, // 60 seconds per test
  retries: 2, // Retry failed tests twice
  workers: 2, // Run tests in parallel
  
  use: {
    // Base URL will be set by environment variable in CD pipeline
    baseURL: process.env.DEPLOYMENT_URL || 'http://localhost:4000',
    
    // Browser settings
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    
    // Timeouts
    actionTimeout: 30 * 1000,
    navigationTimeout: 30 * 1000,
  },
  
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        browserName: 'chromium',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'Mobile Chrome',
      use: {
        browserName: 'chromium',
        ...devices['Pixel 5'],
      },
    },
  ],
  
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/smoke-results.json' }],
  ],
  
  outputDir: 'test-results/',
});