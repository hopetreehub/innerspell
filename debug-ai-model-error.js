// Comprehensive AI Model Error Debug Script
const { chromium } = require('playwright');

async function debugAIModelError() {
  console.log('🔍 AI Model Error Root Cause Analysis');
  console.log('=====================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enhanced logging
  const logs = {
    console: [],
    network: [],
    errors: [],
    apiCalls: []
  };
  
  // Capture console logs
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    logs.console.push(logEntry);
    
    if (msg.type() === 'error' || msg.text().includes('NOT_FOUND') || msg.text().includes('gpt-3.5-turbo')) {
      console.log(`[CONSOLE ${msg.type().toUpperCase()}]`, msg.text());
    }
  });
  
  // Capture network requests/responses
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      const apiCall = {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: new Date().toISOString()
      };
      logs.apiCalls.push(apiCall);
      console.log(`[API REQUEST] ${request.method()} ${request.url()}`);
      if (request.postData()) {
        console.log(`[REQUEST BODY]`, request.postData());
      }
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const entry = {
        url: response.url(),
        status: response.status(),
        headers: response.headers(),
        timestamp: new Date().toISOString()
      };
      
      try {
        const text = await response.text();
        entry.body = text;
        
        if (text.includes('NOT_FOUND') || text.includes('gpt-3.5-turbo') || text.includes('error')) {
          console.log(`[API RESPONSE] ${response.status()} ${response.url()}`);
          console.log(`[RESPONSE BODY]`, text);
        }
      } catch (e) {
        entry.error = 'Could not read response body';
      }
      
      logs.network.push(entry);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    logs.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.log(`[PAGE ERROR]`, error.message);
  });
  
  try {
    console.log('1. Navigating to production site...');
    await page.goto('https://tarotap.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    console.log('2. Clicking tarot reading button...');
    await page.click('text="무료 타로 카드 뽑기"');
    await page.waitForTimeout(2000);
    
    console.log('3. Entering question...');
    await page.fill('textarea[placeholder*="질문"]', '오늘의 운세는 어떤가요?');
    
    console.log('4. Selecting spread...');
    await page.click('text="1장 뽑기"');
    await page.waitForTimeout(1000);
    
    console.log('5. Selecting card...');
    await page.click('.card-back');
    await page.waitForTimeout(1000);
    
    console.log('6. Requesting AI interpretation...');
    const interpretButton = await page.locator('text="AI 해석 요청"').first();
    
    // Intercept the actual API call
    const [response] = await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/') && 
        (response.url().includes('tarot') || response.url().includes('ai'))
      ),
      interpretButton.click()
    ]);
    
    console.log('\n7. API Response Details:');
    console.log('URL:', response.url());
    console.log('Status:', response.status());
    const responseBody = await response.text();
    console.log('Body:', responseBody);
    
    // Wait for error message
    await page.waitForTimeout(5000);
    
    // Check for error messages
    const errorSelectors = [
      'text=/NOT_FOUND/i',
      'text=/gpt-3.5-turbo/i',
      'text=/Model.*not found/i',
      'text=/오류/i',
      '[role="alert"]'
    ];
    
    for (const selector of errorSelectors) {
      const element = await page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log(`\n8. Error found with selector: ${selector}`);
        console.log('Error text:', await element.textContent());
      }
    }
    
    // Log all API calls
    console.log('\n9. All API calls during session:');
    logs.apiCalls.forEach(call => {
      console.log(`${call.method} ${call.url}`);
      if (call.postData && (call.postData.includes('model') || call.postData.includes('gpt'))) {
        console.log('Request body:', call.postData);
      }
    });
    
    // Save detailed logs
    const fs = require('fs');
    fs.writeFileSync('ai-model-error-debug.json', JSON.stringify(logs, null, 2));
    console.log('\n10. Detailed logs saved to ai-model-error-debug.json');
    
  } catch (error) {
    console.error('Error during test:', error);
  }
  
  console.log('\n🔍 Keeping browser open for manual inspection...');
  console.log('Check the DevTools Network tab for more details.');
  console.log('Press Ctrl+C to exit.');
  
  // Keep browser open
  await new Promise(() => {});
}

debugAIModelError().catch(console.error);