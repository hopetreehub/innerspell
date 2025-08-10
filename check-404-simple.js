const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--auto-open-devtools-for-tabs']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  const failed404Resources = [];
  const allResources = [];

  // Listen to all responses
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    const resourceInfo = {
      url: url,
      status: status,
      statusText: response.statusText()
    };
    
    allResources.push(resourceInfo);
    
    if (status === 404) {
      failed404Resources.push(resourceInfo);
      console.log(`❌ 404 Error: ${url}`);
    }
  });

  console.log('Navigating to http://localhost:4000/reading...');
  
  try {
    // Navigate to the page
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait a bit more for any lazy-loaded resources
    await page.waitForTimeout(5000);

    // Take screenshot of the full page
    await page.screenshot({ 
      path: 'reading-page-full.png',
      fullPage: true 
    });

    console.log('\n📊 Network Summary:');
    console.log(`Total resources loaded: ${allResources.length}`);
    console.log(`404 errors: ${failed404Resources.length}`);

    // Check for specific important files
    const importantFiles = [
      'main-app',
      'app-pages-internals',
      'layout.css',
      'webpack',
      '.js',
      '.css'
    ];

    console.log('\n🔍 Resource Status by Type:');
    
    // Group resources by extension
    const jsFiles = allResources.filter(r => r.url.endsWith('.js'));
    const cssFiles = allResources.filter(r => r.url.endsWith('.css'));
    const chunks = allResources.filter(r => r.url.includes('_next/static/chunks'));
    
    console.log(`\nJavaScript files: ${jsFiles.length}`);
    jsFiles.forEach(r => {
      const status = r.status === 200 ? '✅' : '❌';
      const fileName = r.url.split('/').pop();
      console.log(`  ${status} ${fileName} (${r.status})`);
    });
    
    console.log(`\nCSS files: ${cssFiles.length}`);
    cssFiles.forEach(r => {
      const status = r.status === 200 ? '✅' : '❌';
      const fileName = r.url.split('/').pop();
      console.log(`  ${status} ${fileName} (${r.status})`);
    });
    
    console.log(`\nNext.js chunks: ${chunks.length}`);
    const chunksWithErrors = chunks.filter(r => r.status !== 200);
    if (chunksWithErrors.length > 0) {
      console.log('  Chunks with errors:');
      chunksWithErrors.forEach(r => {
        console.log(`  ❌ ${r.url.split('/').slice(-2).join('/')} (${r.status})`);
      });
    } else {
      console.log('  ✅ All chunks loaded successfully');
    }

    if (failed404Resources.length > 0) {
      console.log('\n❌ All 404 Errors:');
      failed404Resources.forEach(r => {
        console.log(`  - ${r.url}`);
      });
    } else {
      console.log('\n✅ No 404 errors detected! All resources loaded successfully.');
    }

    // Check page functionality
    const pageTitle = await page.title();
    const hasMainContent = await page.evaluate(() => {
      return document.querySelector('main') !== null;
    });
    const hasReadingContent = await page.evaluate(() => {
      const content = document.body.textContent;
      return content.includes('독서') || content.includes('읽기') || content.includes('Reading');
    });

    console.log('\n📄 Page Functionality:');
    console.log(`Title: ${pageTitle}`);
    console.log(`Main content present: ${hasMainContent ? 'Yes' : 'No'}`);
    console.log(`Reading content visible: ${hasReadingContent ? 'Yes' : 'No'}`);

    // Take a screenshot with DevTools open
    console.log('\n📸 Screenshots saved:');
    console.log('  - reading-page-full.png (full page screenshot)');
    
    // Evaluate and log any console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    if (consoleErrors.length > 0) {
      console.log('\n⚠️ Console Errors:');
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n✅ Test completed. Browser window is open for manual inspection.');
    console.log('Check the Network tab in DevTools for detailed resource loading information.');
    console.log('Press Ctrl+C to close...');

    // Keep browser open
    await new Promise(() => {});

  } catch (error) {
    console.error('Error during test:', error);
    await browser.close();
  }
})();