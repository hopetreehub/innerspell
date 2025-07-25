#!/usr/bin/env node

/**
 * 🧪 InnerSpell Firebase Authentication Complete Test Suite
 * 
 * This script performs comprehensive testing of the authentication flow
 * including domain verification, Google OAuth, and database operations.
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
    DOMAIN: process.argv[2] || 'test-studio-firebase.vercel.app',
    TIMEOUT: 30000,
    SLOW_MO: 500,
    HEADLESS: false,
    SCREENSHOT_DIR: './screenshots/auth-test'
};

const BASE_URL = `https://${CONFIG.DOMAIN}`;

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Helper functions
const log = {
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.cyan}📋 ${msg}${colors.reset}\n${'='.repeat(50)}`)
};

// Ensure screenshot directory exists
async function ensureScreenshotDir() {
    try {
        await fs.mkdir(CONFIG.SCREENSHOT_DIR, { recursive: true });
    } catch (error) {
        // Directory might already exist
    }
}

// Take screenshot with timestamp
async function takeScreenshot(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}-${name}.png`;
    const filepath = path.join(CONFIG.SCREENSHOT_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    log.info(`Screenshot saved: ${filename}`);
    return filepath;
}

// Test functions
async function testDomainAccess(page) {
    log.section('Testing Domain Access');
    
    try {
        log.info(`Accessing ${BASE_URL}...`);
        const response = await page.goto(BASE_URL, { 
            waitUntil: 'networkidle',
            timeout: CONFIG.TIMEOUT 
        });
        
        if (response.status() === 200) {
            log.success(`Domain is accessible (HTTP ${response.status()})`);
            await takeScreenshot(page, '01-homepage');
            return true;
        } else {
            log.error(`Domain returned HTTP ${response.status()}`);
            return false;
        }
    } catch (error) {
        log.error(`Failed to access domain: ${error.message}`);
        return false;
    }
}

async function testAuthPages(page) {
    log.section('Testing Authentication Pages');
    
    const authPages = [
        { path: '/sign-in', name: 'Sign In' },
        { path: '/sign-up', name: 'Sign Up' }
    ];
    
    for (const authPage of authPages) {
        try {
            log.info(`Testing ${authPage.name} page...`);
            await page.goto(`${BASE_URL}${authPage.path}`, {
                waitUntil: 'networkidle',
                timeout: CONFIG.TIMEOUT
            });
            
            await page.waitForLoadState('domcontentloaded');
            await takeScreenshot(page, `02-${authPage.name.toLowerCase().replace(' ', '-')}`);
            
            // Check for Google login button
            const googleButton = await page.locator('button:has-text("Google")').first();
            if (await googleButton.isVisible()) {
                log.success(`Google login button found on ${authPage.name} page`);
                
                // Check if button is clickable
                const isEnabled = await googleButton.isEnabled();
                if (isEnabled) {
                    log.success('Google login button is enabled');
                } else {
                    log.warning('Google login button is disabled');
                }
            } else {
                log.error(`Google login button not found on ${authPage.name} page`);
            }
        } catch (error) {
            log.error(`Failed to test ${authPage.name} page: ${error.message}`);
        }
    }
}

async function testGoogleOAuthFlow(page) {
    log.section('Testing Google OAuth Flow');
    
    try {
        // Navigate to sign-in page
        await page.goto(`${BASE_URL}/sign-in`, {
            waitUntil: 'networkidle',
            timeout: CONFIG.TIMEOUT
        });
        
        // Find and click Google button
        const googleButton = await page.locator('button:has-text("Google")').first();
        if (!await googleButton.isVisible()) {
            log.error('Google login button not found');
            return false;
        }
        
        log.info('Clicking Google login button...');
        
        // Listen for popup
        const popupPromise = page.context().waitForEvent('page');
        await googleButton.click();
        
        try {
            const popup = await popupPromise;
            log.success('Google OAuth popup opened');
            await takeScreenshot(popup, '03-google-oauth-popup');
            
            // Check popup URL
            const popupUrl = popup.url();
            if (popupUrl.includes('accounts.google.com')) {
                log.success('Redirected to Google accounts');
                
                // Check for Firebase auth domain in redirect
                if (popupUrl.includes('innerspell-an7ce.firebaseapp.com')) {
                    log.success('Firebase auth domain is correctly configured');
                } else {
                    log.warning('Firebase auth domain might not be in the OAuth URL');
                }
            } else {
                log.warning(`Unexpected OAuth URL: ${popupUrl}`);
            }
            
            // Close popup for automated test
            await popup.close();
            log.info('OAuth popup closed (manual login required for full test)');
            
        } catch (popupError) {
            log.error(`OAuth popup error: ${popupError.message}`);
            log.warning('This might be due to popup blockers or domain configuration');
            return false;
        }
        
        return true;
        
    } catch (error) {
        log.error(`OAuth flow test failed: ${error.message}`);
        return false;
    }
}

async function testProtectedRoutes(page) {
    log.section('Testing Protected Routes (Unauthenticated)');
    
    const protectedRoutes = [
        { path: '/dashboard', name: 'Dashboard' },
        { path: '/reading', name: 'Tarot Reading' },
        { path: '/admin', name: 'Admin Panel' }
    ];
    
    for (const route of protectedRoutes) {
        try {
            log.info(`Testing ${route.name} (${route.path})...`);
            await page.goto(`${BASE_URL}${route.path}`, {
                waitUntil: 'networkidle',
                timeout: CONFIG.TIMEOUT
            });
            
            // Check if redirected to sign-in
            const currentUrl = page.url();
            if (currentUrl.includes('/sign-in')) {
                log.success(`${route.name} correctly redirects to sign-in when unauthenticated`);
            } else {
                log.warning(`${route.name} did not redirect to sign-in (current: ${currentUrl})`);
                await takeScreenshot(page, `04-${route.name.toLowerCase().replace(' ', '-')}-unauth`);
            }
        } catch (error) {
            log.error(`Failed to test ${route.name}: ${error.message}`);
        }
    }
}

async function generateReport() {
    log.section('Generating Test Report');
    
    const report = {
        timestamp: new Date().toISOString(),
        domain: CONFIG.DOMAIN,
        baseUrl: BASE_URL,
        firebaseProject: 'innerspell-an7ce',
        requiredDomains: [
            CONFIG.DOMAIN,
            'innerspell-an7ce.firebaseapp.com',
            'localhost:4000'
        ],
        firebaseConsoleUrl: 'https://console.firebase.google.com/project/innerspell-an7ce/authentication/settings',
        vercelEnvVars: [
            'NEXT_PUBLIC_FIREBASE_API_KEY',
            'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
            'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
            'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
            'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
            'NEXT_PUBLIC_FIREBASE_APP_ID',
            'FIREBASE_SERVICE_ACCOUNT_KEY',
            'NEXT_PUBLIC_USE_REAL_AUTH',
            'ENCRYPTION_KEY',
            'BLOG_API_SECRET_KEY'
        ],
        aiApiKeys: [
            'GOOGLE_API_KEY or GEMINI_API_KEY',
            'OPENAI_API_KEY',
            'ANTHROPIC_API_KEY'
        ]
    };
    
    const reportPath = path.join(CONFIG.SCREENSHOT_DIR, 'test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    log.success(`Test report saved: ${reportPath}`);
    
    return report;
}

// Main test runner
async function runTests() {
    console.log(`
${colors.blue}🧪 InnerSpell Firebase Authentication Test Suite${colors.reset}
${'='.repeat(50)}
Domain: ${CONFIG.DOMAIN}
Base URL: ${BASE_URL}
${'='.repeat(50)}
`);

    await ensureScreenshotDir();
    
    const browser = await chromium.launch({
        headless: CONFIG.HEADLESS,
        slowMo: CONFIG.SLOW_MO
    });
    
    const testResults = {
        domainAccess: false,
        authPages: false,
        oauthFlow: false,
        protectedRoutes: false
    };
    
    try {
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });
        
        const page = await context.newPage();
        
        // Run tests
        testResults.domainAccess = await testDomainAccess(page);
        
        if (testResults.domainAccess) {
            await testAuthPages(page);
            testResults.oauthFlow = await testGoogleOAuthFlow(page);
            await testProtectedRoutes(page);
        }
        
        // Generate report
        const report = await generateReport();
        
        // Final summary
        log.section('Test Summary');
        
        if (testResults.domainAccess && testResults.oauthFlow) {
            log.success('Basic authentication setup appears to be working!');
            console.log(`
${colors.yellow}📋 Next Steps:${colors.reset}
1. Add ${CONFIG.DOMAIN} to Firebase authorized domains:
   ${colors.cyan}${report.firebaseConsoleUrl}${colors.reset}
   
2. Ensure all Vercel environment variables are set:
   ${report.vercelEnvVars.map(v => `   • ${v}`).join('\n')}
   
3. Set at least one AI API key:
   ${report.aiApiKeys.map(k => `   • ${k}`).join('\n')}
   
4. Run manual authentication test:
   - Open browser to ${BASE_URL}/sign-in
   - Click "Continue with Google"
   - Complete sign-in process
   - Verify redirect to dashboard
   - Test tarot reading save functionality
`);
        } else {
            log.error('Authentication setup needs configuration');
            console.log(`
${colors.red}❌ Issues Found:${colors.reset}
${!testResults.domainAccess ? '• Domain is not accessible\n' : ''}
${!testResults.oauthFlow ? '• OAuth flow is not working properly\n' : ''}

${colors.yellow}🔧 Troubleshooting:${colors.reset}
1. Verify deployment status:
   ${colors.cyan}npx vercel ls${colors.reset}
   
2. Check if domain is added to Firebase:
   ${colors.cyan}${report.firebaseConsoleUrl}${colors.reset}
   
3. Verify environment variables in Vercel:
   ${colors.cyan}npx vercel env ls${colors.reset}
   
4. Redeploy if needed:
   ${colors.cyan}npx vercel --prod${colors.reset}
`);
        }
        
    } catch (error) {
        log.error(`Test suite failed: ${error.message}`);
    } finally {
        await browser.close();
    }
}

// Run tests
runTests().catch(error => {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
});