/**
 * Focused Firebase Authentication and Tarot Reading Test
 * 
 * This test focuses on key functionality with shorter timeouts
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:4000';
const SCREENSHOTS_DIR = path.join(__dirname, 'firebase-focused-screenshots');
const TIMEOUT = 15000; // 15 seconds

const testResults = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  tests: [],
  errors: [],
  screenshots: [],
  summary: {}
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  
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
      timeout: 5000 
    });
    
    testResults.screenshots.push({
      name,
      description,
      path: screenshotPath
    });
    
    log(`Screenshot: ${name}`);
    return screenshotPath;
  } catch (error) {
    log(`Screenshot failed: ${name}`, 'error');
    return null;
  }
}

async function testQuickLoad(page) {
  try {
    log('Testing homepage...');
    const response = await page.goto(BASE_URL, { 
      waitUntil: 'domcontentloaded', 
      timeout: TIMEOUT 
    });
    
    await takeScreenshot(page, '01-homepage', 'Homepage loaded');
    
    const title = await page.title();
    const hasContent = await page.locator('body').count() > 0;
    
    testResults.tests.push({
      name: 'Homepage Load',
      status: response?.ok() ? 'passed' : 'failed',
      details: { title, hasContent, status: response?.status() }
    });
    
    return response?.ok();
  } catch (error) {
    log(`Homepage test failed: ${error.message}`, 'error');
    testResults.tests.push({
      name: 'Homepage Load',
      status: 'failed',
      error: error.message
    });
    return false;
  }
}

async function testSignInPage(page) {
  try {
    log('Testing sign-in page...');
    await page.goto(`${BASE_URL}/sign-in`, { 
      waitUntil: 'domcontentloaded', 
      timeout: TIMEOUT 
    });
    
    await takeScreenshot(page, '02-signin', 'Sign-in page');
    
    // Look for Google button
    const googleButton = await page.locator('button:has-text("Google"), button:has-text("구글")').first();
    const hasGoogleButton = await googleButton.count() > 0;
    
    let buttonClickable = false;
    if (hasGoogleButton) {
      buttonClickable = await googleButton.isVisible() && await googleButton.isEnabled();
    }
    
    testResults.tests.push({
      name: 'Sign-In Page',
      status: hasGoogleButton ? 'passed' : 'failed',
      details: { hasGoogleButton, buttonClickable }
    });
    
    return hasGoogleButton;
  } catch (error) {
    log(`Sign-in test failed: ${error.message}`, 'error');
    testResults.tests.push({
      name: 'Sign-In Page',
      status: 'failed',
      error: error.message
    });
    return false;
  }
}

async function testReadingPage(page) {
  try {
    log('Testing reading page...');
    await page.goto(`${BASE_URL}/reading`, { 
      waitUntil: 'domcontentloaded', 
      timeout: TIMEOUT 
    });
    
    await takeScreenshot(page, '03-reading', 'Reading page');
    
    const hasQuestionInput = await page.locator('input, textarea').count() > 0;
    const hasTarotElements = await page.locator('.card, [data-card], button:has-text("Shuffle")').count() > 0;
    
    testResults.tests.push({
      name: 'Reading Page',
      status: hasQuestionInput || hasTarotElements ? 'passed' : 'failed',
      details: { hasQuestionInput, hasTarotElements }
    });
    
    return hasQuestionInput || hasTarotElements;
  } catch (error) {
    log(`Reading test failed: ${error.message}`, 'error');
    testResults.tests.push({
      name: 'Reading Page',
      status: 'failed',
      error: error.message
    });
    return false;
  }
}

async function checkFirebaseConfig(page) {
  try {
    log('Checking Firebase configuration...');
    
    const firebaseInfo = await page.evaluate(() => {
      return {
        hasAuth: typeof window.auth !== 'undefined',
        hasFirestore: typeof window.db !== 'undefined',
        hasMockAuth: window.localStorage.getItem('mock-auth') !== null,
        consoleLogs: window.consoleCapture || []
      };
    });
    
    testResults.tests.push({
      name: 'Firebase Configuration',
      status: 'passed',
      details: firebaseInfo
    });
    
    testResults.summary.firebaseConfig = firebaseInfo;
    
    return true;
  } catch (error) {
    log(`Firebase config check failed: ${error.message}`, 'error');
    testResults.tests.push({
      name: 'Firebase Configuration',
      status: 'failed',
      error: error.message
    });
    return false;
  }
}

async function analyzeFirestoreRules() {
  log('Analyzing Firestore rules...');
  
  try {
    const rulesPath = path.join(__dirname, 'firestore.rules');
    const rulesContent = await fs.promises.readFile(rulesPath, 'utf8');
    
    const analysis = {
      hasUserReadings: rulesContent.includes('userReadings'),
      hasSharedReadings: rulesContent.includes('sharedReadings'),
      allowsUserReadingsCRUD: rulesContent.includes('userReadings') && 
                             rulesContent.includes('request.auth.uid == resource.data.userId'),
      allowsSharedReadingsCreate: rulesContent.includes('sharedReadings') && 
                                 rulesContent.includes('allow create: if true'),
      allowsSharedReadingsRead: rulesContent.includes('sharedReadings') && 
                               rulesContent.includes('allow read: if true')
    };
    
    testResults.tests.push({
      name: 'Firestore Rules Analysis',
      status: analysis.hasUserReadings && analysis.hasSharedReadings ? 'passed' : 'failed',
      details: analysis
    });
    
    testResults.summary.firestoreRules = analysis;
    
    return analysis;
  } catch (error) {
    log(`Rules analysis failed: ${error.message}`, 'error');
    testResults.tests.push({
      name: 'Firestore Rules Analysis',
      status: 'failed',
      error: error.message
    });
    return null;
  }
}

async function generateReport() {
  const reportPath = path.join(__dirname, 'firebase-focused-report.json');
  const summaryPath = path.join(__dirname, 'firebase-focused-summary.md');
  
  const totalTests = testResults.tests.length;
  const passedTests = testResults.tests.filter(t => t.status === 'passed').length;
  const failedTests = testResults.tests.filter(t => t.status === 'failed').length;
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  
  testResults.summary.statistics = {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    successRate: `${successRate}%`
  };
  
  // Save JSON report
  await fs.promises.writeFile(reportPath, JSON.stringify(testResults, null, 2));
  
  // Generate markdown summary
  const summary = `# Firebase Authentication & Tarot Reading - Focused Test Report

**Date:** ${testResults.timestamp}
**Base URL:** ${testResults.baseUrl}
**Success Rate:** ${successRate}% (${passedTests}/${totalTests} tests passed)

## Test Results Summary

${testResults.tests.map(test => `
### ${test.name}: ${test.status === 'passed' ? '✅ PASSED' : '❌ FAILED'}
${test.details ? '**Details:** ' + JSON.stringify(test.details, null, 2) : ''}
${test.error ? '**Error:** ' + test.error : ''}
`).join('\n')}

## Firebase Configuration Analysis

${testResults.summary.firebaseConfig ? '```json\n' + JSON.stringify(testResults.summary.firebaseConfig, null, 2) + '\n```' : 'Not available'}

## Firestore Rules Analysis

${testResults.summary.firestoreRules ? '```json\n' + JSON.stringify(testResults.summary.firestoreRules, null, 2) + '\n```' : 'Not available'}

## Issues and Recommendations

### Current Status:
- **userReadings Collection:** ${testResults.summary.firestoreRules?.hasUserReadings ? '✅ Configured' : '❌ Missing'}
- **sharedReadings Collection:** ${testResults.summary.firestoreRules?.hasSharedReadings ? '✅ Configured' : '❌ Missing'}
- **User Authentication:** ${testResults.summary.firebaseConfig?.hasAuth ? '✅ Available' : '❌ Not detected'}
- **Firestore Database:** ${testResults.summary.firebaseConfig?.hasFirestore ? '✅ Available' : '❌ Not detected'}

### Required for Full Functionality:

1. **Firebase Environment Variables:**
   - NEXT_PUBLIC_FIREBASE_API_KEY
   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   - NEXT_PUBLIC_FIREBASE_APP_ID

2. **Google OAuth Configuration:**
   - Add localhost:4000 to Firebase authorized domains
   - Configure OAuth consent screen
   - Verify Google provider is enabled

3. **Firestore Rules Verification:**
   The current rules should allow:
   - Authenticated users to save/read their own readings (userReadings)
   - Anyone to create/read shared readings (sharedReadings)

### Next Steps:
1. Check Firebase project configuration
2. Verify environment variables are set
3. Test authentication flow manually
4. Deploy Firestore rules: \`firebase deploy --only firestore:rules\`

## Screenshots
${testResults.screenshots.map(s => `- ${s.name}: ${s.description}`).join('\n')}
`;

  await fs.promises.writeFile(summaryPath, summary);
  
  console.log('\n' + '='.repeat(50));
  console.log('🧪 FIREBASE FOCUSED TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`📊 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  console.log('='.repeat(50));
  
  console.log(`\n📋 Reports saved:`);
  console.log(`   - JSON: ${reportPath}`);
  console.log(`   - Summary: ${summaryPath}`);
  console.log(`📸 Screenshots: ${SCREENSHOTS_DIR}`);
}

async function main() {
  log('🚀 Starting focused Firebase test...');
  
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
  
  let browser = null;
  
  try {
    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 }
    });
    
    // Capture console logs
    page.on('console', msg => {
      if (msg.text().includes('Firebase') || msg.text().includes('firebase')) {
        log(`Console: ${msg.text()}`);
      }
    });
    
    // Run tests
    await testQuickLoad(page);
    await testSignInPage(page);
    await testReadingPage(page);
    await checkFirebaseConfig(page);
    
    // Analyze rules (no browser needed)
    await analyzeFirestoreRules();
    
    // Final screenshot
    await takeScreenshot(page, '04-final', 'Final state');
    
  } catch (error) {
    log(`Test execution error: ${error.message}`, 'error');
  } finally {
    if (browser) {
      await browser.close();
    }
    
    await generateReport();
  }
}

main().catch(console.error);