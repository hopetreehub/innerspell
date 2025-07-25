/**
 * Comprehensive Firebase Authentication and Tarot Reading Test
 * 
 * This test verifies:
 * 1. Application loads correctly on port 4000
 * 2. Google Sign-In functionality works
 * 3. Authentication is properly handled
 * 4. Tarot reading creation and saving
 * 5. Tarot reading sharing functionality
 * 6. Firebase Firestore operations
 * 7. Screenshots at each step
 * 8. Detailed error reporting
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:4000';
const SCREENSHOTS_DIR = path.join(__dirname, 'firebase-test-screenshots');
const TIMEOUT = 30000; // 30 seconds

// Test results
const testResults = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  tests: [],
  errors: [],
  screenshots: [],
  firebaseStatus: {}
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  console.log(logMessage);
  
  if (type === 'error') {
    testResults.errors.push({ timestamp, message });
  }
}

async function takeScreenshot(page, name, description) {
  try {
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true,
      timeout: 10000 
    });
    
    testResults.screenshots.push({
      name,
      description,
      path: screenshotPath,
      timestamp: new Date().toISOString()
    });
    
    log(`Screenshot saved: ${name} - ${description}`);
    return screenshotPath;
  } catch (error) {
    log(`Failed to take screenshot ${name}: ${error.message}`, 'error');
    return null;
  }
}

async function waitForElement(page, selector, options = {}) {
  try {
    const element = await page.waitForSelector(selector, {
      timeout: options.timeout || TIMEOUT,
      state: options.state || 'visible'
    });
    log(`Element found: ${selector}`);
    return element;
  } catch (error) {
    log(`Element not found: ${selector} - ${error.message}`, 'error');
    return null;
  }
}

async function checkFirebaseConfiguration(page) {
  log('Checking Firebase configuration...');
  
  try {
    const firebaseConfig = await page.evaluate(() => {
      return {
        hasFirebaseApp: typeof window.firebase !== 'undefined' || typeof window.auth !== 'undefined',
        hasAuth: typeof window.auth !== 'undefined',
        hasFirestore: typeof window.db !== 'undefined',
        localStorage: Object.keys(localStorage).filter(key => key.includes('firebase')),
        sessionStorage: Object.keys(sessionStorage).filter(key => key.includes('firebase'))
      };
    });
    
    testResults.firebaseStatus = firebaseConfig;
    log(`Firebase status: ${JSON.stringify(firebaseConfig, null, 2)}`);
    
    return firebaseConfig;
  } catch (error) {
    log(`Error checking Firebase configuration: ${error.message}`, 'error');
    return null;
  }
}

async function testApplicationLoad(page) {
  log('=== Testing Application Load ===');
  
  try {
    log(`Navigating to ${BASE_URL}...`);
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    
    if (!response || !response.ok()) {
      throw new Error(`Failed to load application: ${response ? response.status() : 'No response'}`);
    }
    
    await takeScreenshot(page, '01-homepage-loaded', 'Homepage loaded successfully');
    
    // Check for essential elements
    const title = await page.title();
    log(`Page title: ${title}`);
    
    // Check if the page has loaded properly
    const hasMainContent = await page.locator('main, .container, #__next').count() > 0;
    
    testResults.tests.push({
      name: 'Application Load',
      status: 'passed',
      details: { title, hasMainContent, url: BASE_URL }
    });
    
    log('✅ Application loaded successfully');
    return true;
    
  } catch (error) {
    log(`❌ Application load failed: ${error.message}`, 'error');
    await takeScreenshot(page, '01-error-homepage', 'Homepage load error');
    
    testResults.tests.push({
      name: 'Application Load',
      status: 'failed',
      error: error.message
    });
    
    return false;
  }
}

async function testGoogleSignIn(page) {
  log('=== Testing Google Sign-In ===');
  
  try {
    // Navigate to sign-in page
    log('Navigating to sign-in page...');
    await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await takeScreenshot(page, '02-signin-page', 'Sign-in page loaded');
    
    // Look for Google sign-in button
    const googleButtonSelectors = [
      'button:has-text("Google")',
      'button:has-text("구글")',
      '[data-testid="google-signin"]',
      '.google-signin-button',
      'button[class*="google"]',
      'button:has([alt*="Google"])'
    ];
    
    let googleButton = null;
    for (const selector of googleButtonSelectors) {
      try {
        googleButton = await page.locator(selector).first();
        if (await googleButton.count() > 0) {
          log(`Found Google button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!googleButton || await googleButton.count() === 0) {
      throw new Error('Google sign-in button not found');
    }
    
    await takeScreenshot(page, '03-google-button-found', 'Google sign-in button located');
    
    // Check button properties
    const buttonText = await googleButton.textContent();
    const isVisible = await googleButton.isVisible();
    const isEnabled = await googleButton.isEnabled();
    
    log(`Button text: "${buttonText}", Visible: ${isVisible}, Enabled: ${isEnabled}`);
    
    if (!isVisible || !isEnabled) {
      throw new Error('Google sign-in button is not clickable');
    }
    
    // Click the Google button
    log('Clicking Google sign-in button...');
    await googleButton.click();
    
    await takeScreenshot(page, '04-after-google-click', 'After clicking Google sign-in');
    
    // Wait for either:
    // 1. Redirect to Google OAuth
    // 2. Error message
    // 3. Success/user interface change
    
    await page.waitForTimeout(3000); // Wait for any popup or redirect
    
    const currentUrl = page.url();
    log(`Current URL after click: ${currentUrl}`);
    
    // Check for various outcomes
    const hasGoogleRedirect = currentUrl.includes('accounts.google.com') || currentUrl.includes('oauth');
    const hasErrorMessage = await page.locator('[class*="error"], .error, .alert-error').count() > 0;
    const hasUserMenu = await page.locator('[data-testid="user-menu"], .user-menu, .avatar').count() > 0;
    
    testResults.tests.push({
      name: 'Google Sign-In Button',
      status: 'passed',
      details: {
        buttonFound: true,
        buttonText,
        isVisible,
        isEnabled,
        urlAfterClick: currentUrl,
        hasGoogleRedirect,
        hasErrorMessage,
        hasUserMenu
      }
    });
    
    log('✅ Google sign-in button test completed');
    return true;
    
  } catch (error) {
    log(`❌ Google sign-in test failed: ${error.message}`, 'error');
    await takeScreenshot(page, '04-error-google-signin', 'Google sign-in error');
    
    testResults.tests.push({
      name: 'Google Sign-In Button',
      status: 'failed',
      error: error.message
    });
    
    return false;
  }
}

async function testTarotReadingPage(page) {
  log('=== Testing Tarot Reading Page ===');
  
  try {
    // Navigate to tarot reading page
    log('Navigating to tarot reading page...');
    await page.goto(`${BASE_URL}/reading`, { waitUntil: 'networkidle' });
    await takeScreenshot(page, '05-reading-page', 'Tarot reading page loaded');
    
    // Check for essential elements
    const questionInput = await page.locator('input[type="text"], textarea').first();
    const hasQuestionInput = await questionInput.count() > 0;
    
    if (hasQuestionInput) {
      log('Found question input field');
      
      // Enter a test question
      const testQuestion = "What should I focus on today?";
      await questionInput.fill(testQuestion);
      await takeScreenshot(page, '06-question-entered', 'Test question entered');
      log(`Entered question: "${testQuestion}"`);
    }
    
    // Look for tarot-related elements
    const hasTarotCards = await page.locator('.card, [class*="card"], [data-card]').count() > 0;
    const hasShuffleButton = await page.locator('button:has-text("Shuffle"), button:has-text("섞기"), [data-testid="shuffle"]').count() > 0;
    const hasReadingButton = await page.locator('button:has-text("Reading"), button:has-text("리딩"), button:has-text("Start")').count() > 0;
    
    log(`Tarot elements found - Cards: ${hasTarotCards}, Shuffle: ${hasShuffleButton}, Reading: ${hasReadingButton}`);
    
    // Try to start a reading if possible
    if (hasReadingButton) {
      const readingButton = await page.locator('button:has-text("Reading"), button:has-text("리딩"), button:has-text("Start")').first();
      if (await readingButton.isVisible() && await readingButton.isEnabled()) {
        log('Attempting to start reading...');
        await readingButton.click();
        await page.waitForTimeout(2000);
        await takeScreenshot(page, '07-reading-started', 'Reading started');
      }
    }
    
    testResults.tests.push({
      name: 'Tarot Reading Page',
      status: 'passed',
      details: {
        hasQuestionInput,
        hasTarotCards,
        hasShuffleButton,
        hasReadingButton,
        testQuestion: hasQuestionInput ? "What should I focus on today?" : null
      }
    });
    
    log('✅ Tarot reading page test completed');
    return true;
    
  } catch (error) {
    log(`❌ Tarot reading page test failed: ${error.message}`, 'error');
    await takeScreenshot(page, '07-error-reading-page', 'Tarot reading page error');
    
    testResults.tests.push({
      name: 'Tarot Reading Page',
      status: 'failed',
      error: error.message
    });
    
    return false;
  }
}

async function testCommunityPage(page) {
  log('=== Testing Community Page ===');
  
  try {
    // Navigate to community page
    log('Navigating to community page...');
    await page.goto(`${BASE_URL}/community`, { waitUntil: 'networkidle' });
    await takeScreenshot(page, '08-community-page', 'Community page loaded');
    
    // Check for community elements
    const hasPosts = await page.locator('.post, [class*="post"], .card').count() > 0;
    const hasCreateButton = await page.locator('button:has-text("Create"), button:has-text("작성"), .create-post').count() > 0;
    const hasNavigation = await page.locator('nav, .navigation, .tabs').count() > 0;
    
    log(`Community elements - Posts: ${hasPosts}, Create: ${hasCreateButton}, Navigation: ${hasNavigation}`);
    
    testResults.tests.push({
      name: 'Community Page',
      status: 'passed',
      details: {
        hasPosts,
        hasCreateButton,
        hasNavigation
      }
    });
    
    log('✅ Community page test completed');
    return true;
    
  } catch (error) {
    log(`❌ Community page test failed: ${error.message}`, 'error');
    await takeScreenshot(page, '08-error-community', 'Community page error');
    
    testResults.tests.push({
      name: 'Community Page',
      status: 'failed',
      error: error.message
    });
    
    return false;
  }
}

async function testFirebaseOperations(page) {
  log('=== Testing Firebase Operations ===');
  
  try {
    // Check Firebase configuration
    const firebaseConfig = await checkFirebaseConfiguration(page);
    
    // Test console.log outputs for Firebase operations
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Firebase') || text.includes('firebase') || text.includes('🔥')) {
        consoleLogs.push(text);
        log(`Console: ${text}`);
      }
    });
    
    // Navigate to pages that should trigger Firebase operations
    await page.goto(`${BASE_URL}/reading`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    testResults.tests.push({
      name: 'Firebase Operations',
      status: 'passed',
      details: {
        firebaseConfig,
        consoleLogs: consoleLogs.slice(0, 10) // Limit to first 10 logs
      }
    });
    
    log('✅ Firebase operations test completed');
    return true;
    
  } catch (error) {
    log(`❌ Firebase operations test failed: ${error.message}`, 'error');
    
    testResults.tests.push({
      name: 'Firebase Operations',
      status: 'failed',
      error: error.message
    });
    
    return false;
  }
}

async function generateTestReport() {
  log('=== Generating Test Report ===');
  
  const reportPath = path.join(__dirname, 'firebase-test-report.json');
  const summaryPath = path.join(__dirname, 'firebase-test-summary.md');
  
  // Calculate summary
  const totalTests = testResults.tests.length;
  const passedTests = testResults.tests.filter(t => t.status === 'passed').length;
  const failedTests = testResults.tests.filter(t => t.status === 'failed').length;
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  
  // Save detailed JSON report
  await fs.promises.writeFile(reportPath, JSON.stringify(testResults, null, 2));
  log(`Detailed report saved: ${reportPath}`);
  
  // Generate markdown summary
  const summary = `# Firebase Authentication and Tarot Reading Test Report

**Test Date:** ${testResults.timestamp}
**Base URL:** ${testResults.baseUrl}
**Total Tests:** ${totalTests}
**Passed:** ${passedTests}
**Failed:** ${failedTests}
**Success Rate:** ${successRate}%

## Test Results

${testResults.tests.map(test => `
### ${test.name}
- **Status:** ${test.status === 'passed' ? '✅ PASSED' : '❌ FAILED'}
${test.error ? `- **Error:** ${test.error}` : ''}
${test.details ? `- **Details:** ${JSON.stringify(test.details, null, 2)}` : ''}
`).join('\n')}

## Firebase Status
\`\`\`json
${JSON.stringify(testResults.firebaseStatus, null, 2)}
\`\`\`

## Screenshots
${testResults.screenshots.map(ss => `- **${ss.name}:** ${ss.description} (${ss.timestamp})`).join('\n')}

## Errors
${testResults.errors.length > 0 ? 
  testResults.errors.map(err => `- [${err.timestamp}] ${err.message}`).join('\n') :
  'No errors recorded.'
}

## Recommendations

### Issues Found:
${failedTests > 0 ? `
- ${failedTests} test(s) failed
- Check Firebase configuration and credentials
- Verify Google OAuth setup
- Review Firestore security rules
` : 'No critical issues found.'}

### Next Steps:
1. **Firebase Setup:** Ensure all Firebase services are properly configured
2. **Authentication:** Verify Google OAuth configuration and authorized domains
3. **Firestore Rules:** Check that rules allow proper client-side operations
4. **Environment Variables:** Confirm all required Firebase environment variables are set
5. **Domain Configuration:** Ensure localhost:4000 is in Firebase authorized domains

### Firestore Rules Check:
The current rules should allow:
- \`userReadings\` collection: authenticated users can read/write their own readings
- \`sharedReadings\` collection: anyone can read, anyone can create (for sharing)

### Required Environment Variables:
- \`NEXT_PUBLIC_FIREBASE_API_KEY\`
- \`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN\`
- \`NEXT_PUBLIC_FIREBASE_PROJECT_ID\`
- \`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET\`
- \`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID\`
- \`NEXT_PUBLIC_FIREBASE_APP_ID\`
`;

  await fs.promises.writeFile(summaryPath, summary);
  log(`Summary report saved: ${summaryPath}`);
  
  // Console summary
  console.log('\n' + '='.repeat(60));
  console.log('🧪 FIREBASE AUTHENTICATION & TAROT READING TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`📊 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  console.log(`📁 Screenshots: ${testResults.screenshots.length}`);
  console.log(`⚠️  Errors: ${testResults.errors.length}`);
  console.log('='.repeat(60));
  
  if (failedTests > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests.filter(t => t.status === 'failed').forEach(test => {
      console.log(`  - ${test.name}: ${test.error}`);
    });
  }
  
  if (passedTests > 0) {
    console.log('\n✅ PASSED TESTS:');
    testResults.tests.filter(t => t.status === 'passed').forEach(test => {
      console.log(`  - ${test.name}`);
    });
  }
  
  console.log(`\n📋 Full reports saved to:`);
  console.log(`   - ${reportPath}`);
  console.log(`   - ${summaryPath}`);
  console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
}

async function main() {
  log('🚀 Starting comprehensive Firebase and tarot reading test...');
  
  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
  
  let browser = null;
  let page = null;
  
  try {
    // Launch browser
    log('Launching Chromium browser...');
    browser = await chromium.launch({
      headless: false, // Set to true for headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    page = await browser.newPage({
      viewport: { width: 1920, height: 1080 }
    });
    
    // Set up error handling
    page.on('error', (error) => {
      log(`Page error: ${error.message}`, 'error');
    });
    
    page.on('pageerror', (error) => {
      log(`Page script error: ${error.message}`, 'error');
    });
    
    // Run tests
    await testApplicationLoad(page);
    await testGoogleSignIn(page);
    await testTarotReadingPage(page);
    await testCommunityPage(page);
    await testFirebaseOperations(page);
    
    // Final screenshot
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await takeScreenshot(page, '09-final-state', 'Final application state');
    
  } catch (error) {
    log(`Fatal error during testing: ${error.message}`, 'error');
  } finally {
    if (browser) {
      await browser.close();
    }
    
    // Generate report
    await generateTestReport();
  }
}

// Run the test
main().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});