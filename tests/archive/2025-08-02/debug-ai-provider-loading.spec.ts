import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5000',
  adminPath: '/admin',
  screenshotDir: 'ai-provider-debug-screenshots',
  timeout: 30000,
  networkTimeout: 15000
};

// Create screenshots directory
const screenshotPath = path.join(process.cwd(), TEST_CONFIG.screenshotDir);

interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  responseBody?: string;
  error?: string;
  timestamp: string;
}

interface ConsoleMessage {
  type: string;
  text: string;
  timestamp: string;
}

interface DebugReport {
  testName: string;
  timestamp: string;
  screenshots: string[];
  consoleMessages: ConsoleMessage[];
  networkRequests: NetworkRequest[];
  errors: string[];
  recommendations: string[];
  summary: string;
}

test.describe('AI Provider Management Debug', () => {
  let debugReport: DebugReport;
  let consoleMessages: ConsoleMessage[] = [];
  let networkRequests: NetworkRequest[] = [];
  let errors: string[] = [];

  test.beforeAll(async () => {
    // Create screenshots directory
    try {
      await fs.mkdir(screenshotPath, { recursive: true });
    } catch (error) {
      console.log('Screenshots directory already exists or error creating:', error);
    }
  });

  test.beforeEach(async ({ page }) => {
    // Initialize debug report
    debugReport = {
      testName: 'AI Provider Management Loading Debug',
      timestamp: new Date().toISOString(),
      screenshots: [],
      consoleMessages: [],
      networkRequests: [],
      errors: [],
      recommendations: [],
      summary: ''
    };

    // Reset arrays
    consoleMessages = [];
    networkRequests = [];
    errors = [];

    // Setup console message logging
    page.on('console', (msg) => {
      const message: ConsoleMessage = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      };
      consoleMessages.push(message);
      console.log(`[CONSOLE ${msg.type().toUpperCase()}]`, msg.text());
    });

    // Setup error logging
    page.on('pageerror', (error) => {
      const errorMsg = `Page Error: ${error.message}`;
      errors.push(errorMsg);
      console.error('[PAGE ERROR]', error);
    });

    // Setup request/response logging with detailed network monitoring
    page.on('request', (request) => {
      const networkRequest: NetworkRequest = {
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      };
      networkRequests.push(networkRequest);
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    });

    page.on('response', async (response) => {
      const request = networkRequests.find(req => 
        req.url === response.url() && !req.hasOwnProperty('status')
      );
      if (request) {
        request.status = response.status();
        
        // Capture response body for API calls
        if (response.url().includes('/api/') || response.url().includes('/admin/')) {
          try {
            const contentType = response.headers()['content-type'] || '';
            if (contentType.includes('application/json')) {
              const body = await response.text();
              request.responseBody = body;
              console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
              if (body && body.length < 1000) {
                console.log(`[RESPONSE BODY]`, body);
              }
            }
          } catch (error) {
            request.error = `Failed to read response body: ${error}`;
            console.error(`[RESPONSE ERROR]`, error);
          }
        }
      }
    });

    page.on('requestfailed', (request) => {
      const failedRequest = networkRequests.find(req => req.url === request.url());
      if (failedRequest) {
        failedRequest.error = `Request failed: ${request.failure()?.errorText || 'Unknown error'}`;
      }
      errors.push(`Request failed: ${request.url()} - ${request.failure()?.errorText}`);
      console.error('[REQUEST FAILED]', request.url(), request.failure()?.errorText);
    });

    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  const takeScreenshot = async (page: Page, name: string, description?: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}-${name}.png`;
    const fullPath = path.join(screenshotPath, filename);
    
    await page.screenshot({ 
      path: fullPath, 
      fullPage: true,
      animations: 'disabled'
    });
    
    debugReport.screenshots.push(filename);
    console.log(`[SCREENSHOT] ${filename}${description ? ` - ${description}` : ''}`);
    return filename;
  };

  const waitForElement = async (page: Page, selector: string, timeout = 10000) => {
    try {
      await page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      errors.push(`Element not found: ${selector} within ${timeout}ms`);
      return false;
    }
  };

  const checkFirestoreConnectivity = async (page: Page) => {
    console.log('[DEBUG] Checking Firestore connectivity...');
    
    // Check for Firestore-related network requests
    const firestoreRequests = networkRequests.filter(req => 
      req.url.includes('firestore.googleapis.com') || 
      req.url.includes('googleapis.com') ||
      req.url.includes('firebase')
    );
    
    console.log(`[FIRESTORE] Found ${firestoreRequests.length} Firestore-related requests`);
    firestoreRequests.forEach(req => {
      console.log(`[FIRESTORE REQ] ${req.method} ${req.url} - Status: ${req.status || 'pending'}`);
    });

    // Check for Firebase/Firestore console messages
    const firestoreMessages = consoleMessages.filter(msg => 
      msg.text.toLowerCase().includes('firestore') ||
      msg.text.toLowerCase().includes('firebase') ||
      msg.text.toLowerCase().includes('aiProviderConfigs') ||
      msg.text.toLowerCase().includes('aiConfiguration')
    );

    console.log(`[FIRESTORE] Found ${firestoreMessages.length} Firestore-related console messages`);
    firestoreMessages.forEach(msg => {
      console.log(`[FIRESTORE MSG] [${msg.type}] ${msg.text}`);
    });
  };

  const analyzeLoadingIssue = async (page: Page) => {
    console.log('[ANALYSIS] Starting loading issue analysis...');
    
    // Check if loading spinner is still visible
    const loadingSpinner = await page.locator('.animate-spin').isVisible();
    console.log(`[ANALYSIS] Loading spinner visible: ${loadingSpinner}`);
    
    // Check for specific error messages in the DOM
    const errorSelectors = [
      '[data-testid="error-message"]',
      '.error',
      '.alert-error',
      '[role="alert"]'
    ];
    
    for (const selector of errorSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          for (const element of elements) {
            const text = await element.textContent();
            if (text) {
              errors.push(`DOM Error: ${text}`);
              console.log(`[ANALYSIS] Found error in DOM: ${text}`);
            }
          }
        }
      } catch (error) {
        // Selector not found, continue
      }
    }

    // Check for failed API calls
    const failedRequests = networkRequests.filter(req => 
      req.error || (req.status && req.status >= 400)
    );
    
    console.log(`[ANALYSIS] Failed requests: ${failedRequests.length}`);
    failedRequests.forEach(req => {
      console.log(`[ANALYSIS] Failed: ${req.method} ${req.url} - ${req.status || 'No status'} - ${req.error || 'No error details'}`);
    });

    // Check for authentication issues
    const authIssues = consoleMessages.filter(msg =>
      msg.text.toLowerCase().includes('auth') ||
      msg.text.toLowerCase().includes('unauthorized') ||
      msg.text.toLowerCase().includes('403') ||
      msg.text.toLowerCase().includes('401')
    );

    if (authIssues.length > 0) {
      console.log(`[ANALYSIS] Potential authentication issues found: ${authIssues.length}`);
      authIssues.forEach(msg => console.log(`[AUTH ISSUE] ${msg.text}`));
    }
  };

  const generateRecommendations = () => {
    console.log('[RECOMMENDATIONS] Generating debug recommendations...');
    
    const recommendations: string[] = [];

    // Check for common issues
    const hasFirestoreErrors = errors.some(error => 
      error.toLowerCase().includes('firestore') || 
      error.toLowerCase().includes('firebase')
    );
    
    const hasNetworkErrors = networkRequests.some(req => req.error);
    const hasFailedRequests = networkRequests.some(req => req.status && req.status >= 400);
    const hasConsoleErrors = consoleMessages.some(msg => msg.type === 'error');

    if (hasFirestoreErrors) {
      recommendations.push('🔥 Firestore connectivity issue detected. Check Firebase configuration and authentication.');
      recommendations.push('📋 Verify that Firestore rules allow read access to aiProviderConfigs and aiConfiguration collections.');
      recommendations.push('🔑 Check that Firebase Admin SDK is properly initialized with valid service account credentials.');
    }

    if (hasNetworkErrors) {
      recommendations.push('🌐 Network request failures detected. Check server connectivity and CORS configuration.');
      recommendations.push('🚀 Verify that the development server is running on the correct port (5000).');
    }

    if (hasFailedRequests) {
      recommendations.push('❌ HTTP errors detected. Check API endpoint implementations and error handling.');
      recommendations.push('🔍 Review server logs for detailed error information.');
    }

    if (hasConsoleErrors) {
      recommendations.push('⚠️ JavaScript errors detected. Check browser console for detailed error information.');
      recommendations.push('🐛 Debug client-side code execution and component lifecycle issues.');
    }

    // Check for specific patterns
    const hasLoadingTimeout = consoleMessages.some(msg => 
      msg.text.includes('timeout') || msg.text.includes('취소')
    );
    
    if (hasLoadingTimeout) {
      recommendations.push('⏱️ Request timeout detected. Increase timeout values or optimize query performance.');
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push('🔍 No obvious issues detected. Consider checking:');
      recommendations.push('   • Server-side logs for detailed error information');
      recommendations.push('   • Database connection and query performance');
      recommendations.push('   • Component state management and useEffect dependencies');
      recommendations.push('   • Network tab in browser dev tools for request details');
    }

    return recommendations;
  };

  test('Comprehensive AI Provider Tab Loading Debug', async ({ page }) => {
    console.log('🚀 Starting comprehensive AI Provider Management debug test...');
    
    try {
      // Step 1: Navigate to homepage
      console.log('[STEP 1] Navigating to homepage...');
      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle' });
      await takeScreenshot(page, '01-homepage', 'Homepage loaded');
      
      // Wait a moment for any async operations
      await page.waitForTimeout(2000);

      // Step 2: Navigate to admin page
      console.log('[STEP 2] Navigating to admin page...');
      await page.goto(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.adminPath}`, { 
        waitUntil: 'networkidle',
        timeout: TEST_CONFIG.timeout 
      });
      
      // Wait for admin page to load
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '02-admin-page', 'Admin page loaded');

      // Step 3: Look for and click on AI Provider Management tab
      console.log('[STEP 3] Looking for AI Provider Management tab...');
      
      // Multiple possible selectors for the AI provider tab
      const aiProviderSelectors = [
        'text="AI 공급자"',
        '[data-value="ai-providers"]',
        'button:has-text("AI 공급자")',
        'a:has-text("AI 공급자")',
        '[data-testid="ai-providers-tab"]',
        'text="AI Provider"',
        'text="AI 제공자"'
      ];

      let tabFound = false;
      let tabSelector = '';

      for (const selector of aiProviderSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible({ timeout: 2000 })) {
            tabFound = true;
            tabSelector = selector;
            console.log(`[STEP 3] Found AI provider tab with selector: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (!tabFound) {
        // Take screenshot of current state
        await takeScreenshot(page, '03-tab-not-found', 'AI provider tab not found');
        
        // Check what tabs are available
        const availableTabs = await page.locator('[role="tab"], button, a').all();
        console.log(`[DEBUG] Found ${availableTabs.length} potential tab elements`);
        
        for (let i = 0; i < Math.min(availableTabs.length, 10); i++) {
          try {
            const text = await availableTabs[i].textContent();
            console.log(`[DEBUG] Tab ${i}: "${text}"`);
          } catch (error) {
            console.log(`[DEBUG] Tab ${i}: Unable to get text`);
          }
        }

        errors.push('AI Provider Management tab not found on admin page');
      } else {
        // Step 4: Click on AI Provider Management tab
        console.log('[STEP 4] Clicking on AI Provider Management tab...');
        await page.locator(tabSelector).click();
        
        // Wait for tab content to load
        await page.waitForTimeout(2000);
        await takeScreenshot(page, '04-ai-provider-tab-clicked', 'AI provider tab clicked');

        // Step 5: Monitor loading state
        console.log('[STEP 5] Monitoring loading state...');
        
        // Check for loading spinner
        const loadingSpinner = page.locator('.animate-spin, [data-testid="loading"], .loading');
        const loadingVisible = await loadingSpinner.isVisible().catch(() => false);
        
        if (loadingVisible) {
          console.log('[STEP 5] Loading spinner detected, waiting for data to load...');
          await takeScreenshot(page, '05-loading-spinner', 'Loading spinner active');
          
          // Wait for loading to complete or timeout
          try {
            await loadingSpinner.waitFor({ state: 'hidden', timeout: TEST_CONFIG.networkTimeout });
            console.log('[STEP 5] Loading completed');
          } catch (error) {
            console.log('[STEP 5] Loading timeout - spinner still visible');
            errors.push('Loading spinner timeout - data never loaded');
          }
        }

        // Step 6: Check final state
        console.log('[STEP 6] Checking final state...');
        await page.waitForTimeout(2000);
        await takeScreenshot(page, '06-final-state', 'Final state after loading');

        // Step 7: Analyze the content
        console.log('[STEP 7] Analyzing loaded content...');
        
        // Check for provider cards or empty state
        const providerCards = await page.locator('[data-testid="provider-card"], .provider-card, .card').count();
        const emptyState = await page.locator('text="AI 공급자가 설정되지 않았습니다", text="AI 공급자가", text="설정되지 않았습니다"').isVisible().catch(() => false);
        
        console.log(`[ANALYSIS] Provider cards found: ${providerCards}`);
        console.log(`[ANALYSIS] Empty state visible: ${emptyState}`);

        if (providerCards === 0 && !emptyState) {
          errors.push('No provider cards found and no empty state shown - potential loading failure');
        }
      }

      // Step 8: Check Firestore connectivity
      console.log('[STEP 8] Checking Firestore connectivity...');
      await checkFirestoreConnectivity(page);

      // Step 9: Analyze loading issues
      console.log('[STEP 9] Analyzing loading issues...');
      await analyzeLoadingIssue(page);

      // Final screenshot
      await takeScreenshot(page, '99-final-debug-state', 'Final debug state');

    } catch (error) {
      console.error('[TEST ERROR]', error);
      errors.push(`Test execution error: ${error}`);
      await takeScreenshot(page, 'error-state', 'Error occurred during test');
    }

    // Generate comprehensive debug report
    debugReport.consoleMessages = consoleMessages;
    debugReport.networkRequests = networkRequests;
    debugReport.errors = errors;
    debugReport.recommendations = generateRecommendations();
    
    // Generate summary
    const errorCount = errors.length;
    const networkErrorCount = networkRequests.filter(req => req.error || (req.status && req.status >= 400)).length;
    const consoleErrorCount = consoleMessages.filter(msg => msg.type === 'error').length;
    
    debugReport.summary = `
Debug Summary:
• Total Errors: ${errorCount}
• Network Errors: ${networkErrorCount}
• Console Errors: ${consoleErrorCount}
• Screenshots Captured: ${debugReport.screenshots.length}
• Network Requests: ${networkRequests.length}
• Console Messages: ${consoleMessages.length}
    `.trim();

    // Save debug report
    const reportPath = path.join(screenshotPath, 'debug-report.json');
    await fs.writeFile(reportPath, JSON.stringify(debugReport, null, 2));
    
    // Generate and save detailed report
    const detailedReport = `
# AI Provider Management Loading Debug Report

**Generated:** ${debugReport.timestamp}
**Test:** ${debugReport.testName}

## Summary
${debugReport.summary}

## Screenshots
${debugReport.screenshots.map(screenshot => `- ${screenshot}`).join('\n')}

## Errors (${errors.length})
${errors.length > 0 ? errors.map(error => `- ${error}`).join('\n') : 'No errors detected'}

## Network Requests (${networkRequests.length})
${networkRequests.map(req => `
### ${req.method} ${req.url}
- **Status:** ${req.status || 'No response'}
- **Timestamp:** ${req.timestamp}
${req.error ? `- **Error:** ${req.error}` : ''}
${req.responseBody && req.responseBody.length < 500 ? `- **Response:** \`${req.responseBody}\`` : ''}
`).join('\n')}

## Console Messages (${consoleMessages.length})
${consoleMessages.map(msg => `- **[${msg.type.toUpperCase()}]** ${msg.text} _(${msg.timestamp})_`).join('\n')}

## Recommendations
${debugReport.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Debug report generated by Playwright test automation*
    `.trim();

    const markdownReportPath = path.join(screenshotPath, 'AI_PROVIDER_DEBUG_REPORT.md');
    await fs.writeFile(markdownReportPath, detailedReport);

    console.log('\n🎯 DEBUG TEST COMPLETED');
    console.log(`📊 Debug Report: ${reportPath}`);
    console.log(`📋 Detailed Report: ${markdownReportPath}`);
    console.log(`📸 Screenshots: ${screenshotPath}/`);
    console.log('\n📋 SUMMARY:');
    console.log(debugReport.summary);
    
    if (debugReport.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      debugReport.recommendations.forEach(rec => console.log(`  ${rec}`));
    }

    // The test passes regardless of loading issues - we're debugging, not testing functionality
    expect(true).toBe(true);
  });

  test('Direct API Testing', async ({ page }) => {
    console.log('🔬 Testing AI Provider API endpoints directly...');

    // Test the API endpoints directly
    const apiEndpoints = [
      '/api/admin/ai-providers',
      '/api/debug/ai-providers'
    ];

    for (const endpoint of apiEndpoints) {
      console.log(`[API TEST] Testing ${endpoint}...`);
      
      try {
        const response = await page.request.get(`${TEST_CONFIG.baseUrl}${endpoint}`);
        const status = response.status();
        console.log(`[API TEST] ${endpoint} - Status: ${status}`);
        
        if (status === 200) {
          try {
            const body = await response.text();
            console.log(`[API TEST] ${endpoint} - Response length: ${body.length} characters`);
            
            if (body.length < 1000) {
              console.log(`[API TEST] ${endpoint} - Response body:`, body);
            }
          } catch (error) {
            console.log(`[API TEST] ${endpoint} - Failed to read response body:`, error);
          }
        } else {
          console.log(`[API TEST] ${endpoint} - Non-200 status received`);
        }
      } catch (error) {
        console.error(`[API TEST] ${endpoint} - Request failed:`, error);
      }
    }

    expect(true).toBe(true);
  });
});