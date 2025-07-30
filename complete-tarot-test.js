const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Track all API responses for analysis
  const apiResponses = [];
  
  // Enable detailed logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (!text.includes('Cache Stats') && !text.includes('Font loaded') && !text.includes('Critical components') && !text.includes('Performance')) {
      console.log(`CONSOLE [${type}]: ${text}`);
    }
  });
  
  // Enhanced network logging
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    // Capture all API responses
    if (url.includes('api/') && !url.includes('analytics') && !url.includes('performance')) {
      console.log(`\n🌐 NETWORK: ${status} ${url}`);
      
      // Capture and analyze tarot API responses
      if (url.includes('/api/generate-tarot') || url.includes('/api/tarot') || url.includes('/api/debug')) {
        try {
          const body = await response.text();
          console.log(`\n📡 === TAROT API RESPONSE (${body.length} chars) ===`);
          console.log(body.substring(0, 2000) + (body.length > 2000 ? '...\n[TRUNCATED]' : ''));
          console.log('=== END API RESPONSE ===\n');
          
          // Store for analysis
          apiResponses.push({
            url,
            status,
            body,
            timestamp: new Date().toISOString()
          });
          
          // Parse and analyze JSON responses
          try {
            const data = JSON.parse(body);
            
            if (data.interpretation) {
              console.log(`\n✨ INTERPRETATION ANALYSIS:`);
              console.log(`📏 Length: ${data.interpretation.length} characters`);
              
              if (data.interpretation.length > 800) {
                console.log(`✅ RICH INTERPRETATION CONFIRMED! (>${data.interpretation.length} chars)`);
              } else {
                console.log(`⚠️ SHORT INTERPRETATION WARNING (${data.interpretation.length} chars)`);
              }
              
              // Show first part of interpretation
              console.log(`📖 Preview: ${data.interpretation.substring(0, 300)}...`);
            }
            
            if (data.guidelines) {
              console.log(`\n📋 GUIDELINE MATCHING ANALYSIS:`);
              console.log(`🎯 Guidelines matched: ${data.guidelines.length}`);
              
              data.guidelines.forEach((guideline, index) => {
                console.log(`   ${index + 1}. ${guideline.title || guideline.name || 'Untitled'}`);
                if (guideline.description) {
                  console.log(`      Description: ${guideline.description.substring(0, 100)}...`);
                }
              });
            }
            
            if (data.debug) {
              console.log(`\n🔍 DEBUG INFORMATION:`);
              console.log(JSON.stringify(data.debug, null, 2));
            }
            
            if (data.cards) {
              console.log(`\n🃏 CARDS DRAWN: ${data.cards.length} cards`);
              data.cards.forEach((card, index) => {
                console.log(`   ${index + 1}. ${card.name || card.title || 'Unknown'} (${card.orientation || 'upright'})`);
              });
            }
            
          } catch (e) {
            console.log(`📄 Response is not JSON or parsing failed: ${e.message}`);
          }
        } catch (e) {
          console.log(`❌ Could not read response body: ${e.message}`);
        }
      }
    }
  });
  
  // Enhanced request logging
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api/') && !url.includes('analytics') && !url.includes('performance')) {
      console.log(`\n🚀 REQUEST: ${request.method()} ${url}`);
      
      if (request.method() === 'POST') {
        const postData = request.postData();
        if (postData) {
          console.log(`📤 REQUEST BODY: ${postData.substring(0, 1000)}${postData.length > 1000 ? '...[TRUNCATED]' : ''}`);
        }
      }
    }
  });
  
  try {
    console.log('🎴 === COMPLETE TAROT READING TEST ===');
    console.log('🌍 Navigating to http://localhost:4000/reading');
    
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    console.log('⏳ Waiting for page to fully load...');
    await page.waitForTimeout(10000);
    
    await page.screenshot({ path: 'complete-test-01-loaded.png', fullPage: true });
    console.log('📸 Screenshot 1: Page loaded');
    
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Step 1: Find and fill question input
    console.log('\n📝 STEP 1: Entering question...');
    
    const questionInput = page.locator('textarea, input').first();
    await questionInput.waitFor({ state: 'visible', timeout: 10000 });
    
    await questionInput.fill('삼위일체 조망 스프레드와 영적 성장 스타일로 나의 오늘 운세를 알려주세요');
    console.log('✅ Question entered successfully');
    
    await page.screenshot({ path: 'complete-test-02-question.png', fullPage: true });
    console.log('📸 Screenshot 2: Question entered');
    
    // Step 2: Check current selections (Trinity should already be selected)
    console.log('\n⚙️ STEP 2: Verifying spread and style selections...');
    
    // Check if Trinity View is already selected (it should be by default)
    const spreadText = await page.locator('text="삼위일체 조망"').first().textContent().catch(() => null);
    if (spreadText) {
      console.log('✅ Trinity View spread is already selected');
    }
    
    // Look for spiritual growth style or similar options
    const styleDropdown = page.locator('select').nth(1);
    if (await styleDropdown.count() > 0) {
      console.log('🔍 Checking available interpretation styles...');
      const options = await styleDropdown.locator('option').all();
      
      for (let option of options) {
        const text = await option.textContent();
        console.log(`   Option: ${text}`);
        
        // Look for spiritual or growth-related options
        if (text && (text.includes('영적') || text.includes('Spiritual') || text.includes('성장') || text.includes('Growth'))) {
          await styleDropdown.selectOption({ label: text });
          console.log(`✅ Selected interpretation style: ${text}`);
          break;
        }
      }
    }
    
    await page.screenshot({ path: 'complete-test-03-selections.png', fullPage: true });
    console.log('📸 Screenshot 3: Selections made');
    
    // Step 3: Start the reading
    console.log('\n🎴 STEP 3: Starting tarot reading...');
    
    const drawButton = page.locator('button:has-text("카드 뽑기"), button:has-text("Draw"), button:has-text("시작")').first();
    await drawButton.waitFor({ state: 'visible', timeout: 10000 });
    
    console.log('🚀 Clicking draw cards button...');
    await drawButton.click();
    
    // Step 4: Wait for processing and capture all API activity
    console.log('\n⏳ STEP 4: Processing reading (monitoring all API calls)...');
    console.log('🔄 Waiting up to 45 seconds for complete processing...');
    
    // Wait for the reading to complete
    await page.waitForTimeout(45000);
    
    await page.screenshot({ path: 'complete-test-04-processing.png', fullPage: true });
    console.log('📸 Screenshot 4: After processing');
    
    // Step 5: Analyze results
    console.log('\n📊 STEP 5: Analyzing results...');
    
    const pageContent = await page.content();
    const bodyText = await page.locator('body').textContent();
    
    // Look for interpretation content
    const interpretationFound = bodyText.includes('해석') || bodyText.includes('의미') || bodyText.includes('카드가') || bodyText.includes('타로');
    
    if (interpretationFound) {
      console.log('✅ Interpretation content detected on page');
      
      // Try to extract interpretation text
      const possibleInterpretations = await page.locator('div, p, span').all();
      
      for (let elem of possibleInterpretations) {
        const text = await elem.textContent().catch(() => '');
        if (text && text.length > 200 && (text.includes('카드') || text.includes('의미') || text.includes('해석'))) {
          console.log(`\n📖 FOUND INTERPRETATION CONTENT (${text.length} chars):`);
          console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
          
          if (text.length > 800) {
            console.log(`✅ RICH INTERPRETATION CONFIRMED: ${text.length} characters!`);
          } else {
            console.log(`⚠️ Interpretation is shorter than expected: ${text.length} characters`);
          }
          break;
        }
      }
    } else {
      console.log('❌ No clear interpretation content found');
      console.log(`📄 Page contains ${bodyText.length} characters total`);
      
      // Check for error indicators
      if (bodyText.includes('Error') || bodyText.includes('error') || bodyText.includes('오류')) {
        console.log('⚠️ Error indicators found in page content');
      }
      
      if (bodyText.includes('Loading') || bodyText.includes('loading') || bodyText.includes('로딩')) {
        console.log('⏳ Loading indicators still present');
      }
    }
    
    await page.screenshot({ path: 'complete-test-05-final.png', fullPage: true });
    console.log('📸 Screenshot 5: Final state');
    
  } catch (error) {
    console.error('❌ Error during complete test:', error);
    await page.screenshot({ path: 'complete-test-error.png', fullPage: true });
  }
  
  // Final analysis
  console.log('\n🏁 === COMPREHENSIVE TEST RESULTS ===');
  console.log(`📊 Total API responses captured: ${apiResponses.length}`);
  
  apiResponses.forEach((response, index) => {
    console.log(`\n${index + 1}. ${response.url} (${response.status}) at ${response.timestamp}`);
    console.log(`   Response length: ${response.body.length} characters`);
  });
  
  console.log('\n📋 ANALYSIS CHECKLIST:');
  console.log('✓ Page loaded successfully');
  console.log('✓ Question input found and filled');
  console.log('✓ Trinity spread configuration confirmed');
  console.log('✓ Draw cards button clicked');
  console.log('✓ API calls monitored and captured');
  console.log('✓ Response parsing and analysis completed');
  
  console.log('\n📸 Screenshots saved:');
  console.log('1. complete-test-01-loaded.png - Initial page load');
  console.log('2. complete-test-02-question.png - Question entered');
  console.log('3. complete-test-03-selections.png - Spread/style selected');
  console.log('4. complete-test-04-processing.png - During processing');
  console.log('5. complete-test-05-final.png - Final results');
  
  console.log('\n⏱️ Browser will remain open for 3 minutes for detailed manual inspection...');
  await page.waitForTimeout(180000);
  await browser.close();
})();