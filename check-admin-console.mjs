import { chromium } from 'playwright';

async function checkAdminConsole() {
  console.log('Starting browser console check...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Collect console messages
  const consoleLogs = [];
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
      time: new Date().toISOString()
    };
    consoleLogs.push(logEntry);
    console.log(`[${logEntry.type}] ${logEntry.text}`);
  });
  
  // Collect page errors
  page.on('pageerror', error => {
    console.error('Page error:', error);
    consoleLogs.push({
      type: 'error',
      text: error.toString(),
      time: new Date().toISOString()
    });
  });
  
  // Collect network requests
  const networkRequests = [];
  page.on('request', request => {
    const reqInfo = {
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      time: new Date().toISOString()
    };
    networkRequests.push(reqInfo);
    if (request.url().includes('tarot') || request.url().includes('guideline') || request.url().includes('admin')) {
      console.log(`[Network Request] ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('tarot') || response.url().includes('guideline') || response.url().includes('admin')) {
      console.log(`[Network Response] ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('Navigating to /admin page...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait a bit to collect any delayed console messages
    await page.waitForTimeout(3000);
    
    // Check current URL after possible redirect
    const currentUrl = page.url();
    console.log('Current URL after navigation:', currentUrl);
    
    // Take screenshot of the page
    await page.screenshot({ 
      path: 'admin-page-initial.png',
      fullPage: true 
    });
    
    // Open DevTools Console programmatically if possible
    await page.keyboard.press('F12');
    await page.waitForTimeout(2000);
    
    // Take screenshot with DevTools open
    await page.screenshot({ 
      path: 'admin-page-with-devtools.png',
      fullPage: true 
    });
    
    // Try to access console through evaluate
    const browserConsoleLogs = await page.evaluate(() => {
      const logs = [];
      // Try to capture any global errors or logs
      if (window.console && window.console.log) {
        const originalLog = window.console.log;
        window.console.log = function(...args) {
          logs.push({ type: 'log', message: args.join(' ') });
          originalLog.apply(console, args);
        };
      }
      return logs;
    });
    
    // Print summary
    console.log('\n=== Console Logs Summary ===');
    console.log(`Total console messages: ${consoleLogs.length}`);
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}. [${log.type}] ${log.text}`);
      if (log.location) {
        console.log(`   Location: ${log.location.url}:${log.location.lineNumber}`);
      }
    });
    
    console.log('\n=== Network Requests Summary ===');
    console.log(`Total network requests: ${networkRequests.length}`);
    const relevantRequests = networkRequests.filter(req => 
      req.url.includes('tarot') || 
      req.url.includes('guideline') || 
      req.url.includes('admin') ||
      req.url.includes('api')
    );
    console.log(`Relevant requests: ${relevantRequests.length}`);
    relevantRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url}`);
    });
    
    // Check for specific elements on the page
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        hasLoginForm: !!document.querySelector('form'),
        hasErrorMessages: !!document.querySelector('[class*="error"]'),
        bodyText: document.body.innerText.substring(0, 500)
      };
    });
    
    console.log('\n=== Page Content Summary ===');
    console.log('Title:', pageContent.title);
    console.log('Has login form:', pageContent.hasLoginForm);
    console.log('Has error messages:', pageContent.hasErrorMessages);
    console.log('Body preview:', pageContent.bodyText);
    
    // Keep browser open for manual inspection
    console.log('\n=== Browser is open for manual inspection ===');
    console.log('Press Ctrl+C to close the browser and exit.');
    
    // Keep the script running
    await new Promise(() => {});
    
  } catch (error) {
    console.error('Error during page check:', error);
    await page.screenshot({ path: 'admin-error-state.png' });
  }
}

// Run the check
checkAdminConsole().catch(console.error);