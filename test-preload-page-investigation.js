const { chromium } = require('playwright');

async function investigatePreloadPage() {
  console.log('Investigating preload page 404 issue...');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Test 1: Try different variations of the preload URL
    console.log('\n1. Testing different preload URL variations...');
    
    const urlsToTest = [
      'https://test-studio-firebase.vercel.app/preload-admin-data',
      'https://test-studio-firebase.vercel.app/preload-admin-data/',
      'https://test-studio-firebase.vercel.app/admin',
      'https://test-studio-firebase.vercel.app/'
    ];
    
    for (let i = 0; i < urlsToTest.length; i++) {
      const url = urlsToTest[i];
      console.log(`Testing URL ${i + 1}: ${url}`);
      
      try {
        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });
        
        console.log(`Status: ${response.status()}`);
        await page.waitForTimeout(1000);
        
        await page.screenshot({
          path: `preload-test-${i + 1}-${url.split('/').pop() || 'root'}.png`,
          fullPage: true
        });
        
        const title = await page.title();
        console.log(`Page title: ${title}`);
        
        // Check if it's the 404 page
        const is404 = await page.locator('text=/404|페이지를 찾을 수 없습니다/i').isVisible().catch(() => false);
        console.log(`Is 404 page: ${is404}`);
        
      } catch (error) {
        console.log(`Error loading ${url}: ${error.message}`);
      }
      
      console.log('---');
    }
    
    // Test 2: Check if Next.js routing is working properly
    console.log('\n2. Testing Next.js app routing...');
    
    await page.goto('https://test-studio-firebase.vercel.app/', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    
    // Check for Next.js routing info in the page
    const nextjsInfo = await page.evaluate(() => {
      return {
        hasNextRouter: typeof window.__NEXT_DATA__ !== 'undefined',
        nextData: window.__NEXT_DATA__ ? {
          page: window.__NEXT_DATA__.page,
          props: Object.keys(window.__NEXT_DATA__.props || {}),
          buildId: window.__NEXT_DATA__.buildId
        } : null,
        hasNextConfig: typeof window.__NEXT_ROUTER_BASEPATH !== 'undefined'
      };
    });
    
    console.log('Next.js info:', nextjsInfo);
    
    // Test 3: Try to access preload page directly and check network tab
    console.log('\n3. Direct preload page access with network monitoring...');
    
    const networkRequests = [];
    page.on('response', response => {
      networkRequests.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    });
    
    try {
      await page.goto('https://test-studio-firebase.vercel.app/preload-admin-data', {
        waitUntil: 'networkidle',
        timeout: 10000
      });
    } catch (error) {
      console.log('Expected error for 404 page');
    }
    
    // Filter relevant network requests
    const relevantRequests = networkRequests.filter(req => 
      req.url.includes('preload') || 
      req.url.includes('admin') || 
      req.status >= 400
    );
    
    console.log('Relevant network requests:', relevantRequests);
    
    await page.screenshot({
      path: 'preload-404-investigation.png',
      fullPage: true
    });
    
    // Test 4: Check if the route exists in sitemap or robots.txt
    console.log('\n4. Checking sitemap and robots.txt...');
    
    try {
      await page.goto('https://test-studio-firebase.vercel.app/sitemap.xml', {
        waitUntil: 'domcontentloaded',
        timeout: 5000
      });
      
      const sitemapContent = await page.textContent('body').catch(() => 'Could not read sitemap');
      console.log('Sitemap contains preload:', sitemapContent.includes('preload'));
      
    } catch (error) {
      console.log('Error accessing sitemap:', error.message);
    }
    
    try {
      await page.goto('https://test-studio-firebase.vercel.app/robots.txt', {
        waitUntil: 'domcontentloaded',
        timeout: 5000
      });
      
      const robotsTxt = await page.textContent('body').catch(() => 'Could not read robots.txt');
      console.log('Robots.txt content length:', robotsTxt.length);
      
    } catch (error) {
      console.log('Error accessing robots.txt:', error.message);
    }
    
    // Generate investigation report
    const report = {
      timestamp: new Date().toISOString(),
      findings: {
        preloadPageExists: false, // Based on 404 response
        nextjsRouting: nextjsInfo,
        networkRequests: relevantRequests,
        possibleCauses: [
          'Preload page might not be properly built/deployed',
          'Next.js app routing configuration issue',
          'Build process might be excluding the preload page',
          'Vercel deployment issue with dynamic routes'
        ]
      },
      recommendations: [
        'Check Vercel build logs for any errors',
        'Verify if the preload page is in the built output',
        'Check Next.js configuration for route exclusions',
        'Consider implementing preload functionality in an existing route'
      ]
    };
    
    console.log('\n=== PRELOAD PAGE INVESTIGATION SUMMARY ===');
    console.log('Status: Preload page returns 404');
    console.log('Next.js routing:', nextjsInfo.hasNextRouter ? 'Working' : 'Issues detected');
    console.log('Network requests with errors:', relevantRequests.filter(r => r.status >= 400).length);
    console.log('===========================================');
    
    // Since preload page is not working, let's create alternative test
    console.log('\n5. Creating alternative optimization test without preload page...');
    
    // Test admin page loading without preload
    const adminTestStart = Date.now();
    
    await page.goto('https://test-studio-firebase.vercel.app/admin', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    
    const adminLoadTime = Date.now() - adminTestStart;
    console.log(`Admin page load time (without preload): ${adminLoadTime}ms`);
    
    await page.screenshot({
      path: 'admin-without-preload-optimization.png',
      fullPage: true
    });
    
    console.log('Investigation complete. Check screenshots for visual confirmation.');
    
  } catch (error) {
    console.error('Investigation error:', error);
    
    await page.screenshot({
      path: 'preload-investigation-error.png',
      fullPage: true
    });
  }
  
  console.log('\nInvestigation completed. Browser will remain open for inspection.');
  console.log('Press Ctrl+C to close the browser and exit.');
  
  await new Promise(() => {});
}

// Run the investigation
investigatePreloadPage().catch(console.error);