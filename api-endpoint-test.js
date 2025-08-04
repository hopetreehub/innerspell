const { chromium } = require('playwright');

async function testAPIEndpoints() {
  console.log('🔗 Testing API Endpoints...\n');
  
  const endpoints = [
    {
      name: 'Analytics Performance',
      url: 'http://localhost:4000/api/analytics/performance',
      expectedStatus: [401, 404] // Unauthorized or Not Found is acceptable
    },
    {
      name: 'Next.js Health Check', 
      url: 'http://localhost:4000/api/health',
      expectedStatus: [200, 404] // OK or Not Found is acceptable
    }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url);
      const status = response.status;
      const isExpected = endpoint.expectedStatus.includes(status);
      
      console.log(`${endpoint.name}:`);
      console.log(`  URL: ${endpoint.url}`);
      console.log(`  Status: ${status} ${isExpected ? '✅' : '❌'}`);
      console.log(`  Expected: ${endpoint.expectedStatus.join(' or ')}`);
      
      if (status === 200) {
        try {
          const text = await response.text();
          console.log(`  Response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
        } catch (e) {
          console.log('  Response: [Binary or invalid JSON]');
        }
      }
      console.log();
    } catch (error) {
      console.log(`${endpoint.name}: ❌ ERROR - ${error.message}\n`);
    }
  }
}

async function testLoginRedirectProperly() {
  console.log('🔄 Testing Login Redirect Behavior...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('1. Navigating to /login...');
    await page.goto('http://localhost:4000/login', { waitUntil: 'networkidle' });
    
    console.log('2. Waiting for redirect...');
    await page.waitForTimeout(3000); // Wait for client-side redirect
    
    const finalUrl = page.url();
    const isRedirected = finalUrl.includes('/sign-in');
    
    console.log(`Final URL: ${finalUrl}`);
    console.log(`Redirect Status: ${isRedirected ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (isRedirected) {
      console.log('3. Checking sign-in form...');
      const formExists = await page.locator('form').count() > 0;
      console.log(`Sign-in form exists: ${formExists ? '✅ YES' : '❌ NO'}`);
    }
    
  } catch (error) {
    console.log(`❌ Login redirect test failed: ${error.message}`);
  }
  
  await browser.close();
}

async function runAllTests() {
  await testAPIEndpoints();
  await testLoginRedirectProperly();
}

runAllTests().catch(console.error);