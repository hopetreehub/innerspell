const { chromium } = require('playwright');
const fs = require('fs');

async function debugAIFlowDirect() {
  console.log('[DEBUG] Starting direct AI flow debugging with working deployment...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Monitor all console logs and network activity
  const logs = [];
  const networkActivity = [];
  
  page.on('console', msg => {
    const logEntry = `[${new Date().toISOString()}] CONSOLE: ${msg.text()}`;
    console.log(logEntry);
    logs.push(logEntry);
  });
  
  page.on('request', request => {
    const requestInfo = {
      timestamp: new Date().toISOString(),
      type: 'REQUEST',
      method: request.method(),
      url: request.url(),
      postData: request.postData()
    };
    console.log(`[${requestInfo.timestamp}] REQUEST: ${requestInfo.method} ${requestInfo.url}`);
    networkActivity.push(requestInfo);
  });
  
  page.on('response', response => {
    const responseInfo = {
      timestamp: new Date().toISOString(),
      type: 'RESPONSE',
      status: response.status(),
      url: response.url()
    };
    console.log(`[${responseInfo.timestamp}] RESPONSE: ${responseInfo.status} ${responseInfo.url}`);
    networkActivity.push(responseInfo);
  });
  
  try {
    console.log('[DEBUG] Step 1: Accessing working deployment...');
    
    // Use a working deployment that doesn't have SSO
    await page.goto('https://test-studio-firebase-cy4myq04s-johns-projects-bf5e60f3.vercel.app/', { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });
    
    // Check if we're on the login page
    const isLoginPage = await page.locator('text=login', 'text=sign in', 'text=로그인').count() > 0;
    
    if (isLoginPage) {
      console.log('[DEBUG] Detected login page, trying to bypass or skip auth...');
      await page.screenshot({ path: 'ai-debug-auth-page.png', fullPage: true });
      
      // Try to find guest/skip options
      const guestOptions = [
        'text=게스트로 계속',
        'text=Guest',
        'text=Skip',
        'text=Continue without login',
        'button:has-text("시작")',
        'a:has-text("타로")'
      ];
      
      let foundGuestOption = false;
      for (const selector of guestOptions) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.click(selector);
          foundGuestOption = true;
          console.log(`[DEBUG] Used guest option: ${selector}`);
          break;
        } catch (e) {
          // Continue to next option
        }
      }
      
      if (!foundGuestOption) {
        console.log('[DEBUG] No guest option found, trying direct tarot reading URL...');
        await page.goto('https://test-studio-firebase-cy4myq04s-johns-projects-bf5e60f3.vercel.app/tarot-reading', { 
          timeout: 30000 
        });
      }
    }
    
    console.log('[DEBUG] Step 2: Taking initial screenshot...');
    await page.screenshot({ path: 'ai-debug-01-homepage.png', fullPage: true });
    
    console.log('[DEBUG] Step 3: Looking for tarot reading interface...');
    
    // Look for various tarot reading entry points
    const tarotSelectors = [
      'text=타로 리딩 시작하기',
      'text=타로 읽기',
      'text=Start Reading',
      'text=카드 뽑기',
      'text=타로',
      'button:has-text("시작")',
      'a[href*="tarot"]',
      '.tarot-start',
      '#start-reading'
    ];
    
    let tarotButton = null;
    for (const selector of tarotSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        tarotButton = selector;
        console.log(`[DEBUG] Found tarot entry: ${selector}`);
        break;
      } catch (e) {
        console.log(`[DEBUG] Tarot entry not found: ${selector}`);
      }
    }
    
    if (tarotButton) {
      await page.click(tarotButton);
      await page.waitForTimeout(2000);
      console.log('[DEBUG] Clicked tarot reading button');
    }
    
    console.log('[DEBUG] Step 4: Filling question if field exists...');
    const questionField = await page.locator('textarea[name="question"], input[name="question"], textarea[placeholder*="질문"], input[placeholder*="질문"]').first();
    
    if (await questionField.count() > 0) {
      await questionField.fill('AI 해석 테스트를 위한 질문입니다. 내 미래는 어떻게 될까요?');
      console.log('[DEBUG] Filled question field');
      await page.waitForTimeout(1000);
    } else {
      console.log('[DEBUG] No question field found');
    }
    
    console.log('[DEBUG] Step 5: Looking for card drawing interface...');
    await page.screenshot({ path: 'ai-debug-02-before-cards.png', fullPage: true });
    
    // Look for card drawing buttons
    const cardDrawSelectors = [
      'text=카드 뽑기',
      'text=Draw Cards',
      'text=카드 선택',
      'button:has-text("뽑기")',
      'button:has-text("선택")',
      '.draw-cards',
      '#draw-cards'
    ];
    
    let drawButton = null;
    for (const selector of cardDrawSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        drawButton = selector;
        console.log(`[DEBUG] Found draw button: ${selector}`);
        break;
      } catch (e) {
        console.log(`[DEBUG] Draw button not found: ${selector}`);
      }
    }
    
    if (drawButton) {
      await page.click(drawButton);
      await page.waitForTimeout(3000);
      console.log('[DEBUG] Clicked draw cards button');
    }
    
    console.log('[DEBUG] Step 6: Looking for and selecting cards...');
    await page.screenshot({ path: 'ai-debug-03-card-selection.png', fullPage: true });
    
    // Wait for cards to appear and select them
    await page.waitForTimeout(3000);
    
    const cardSelectors = [
      '[data-testid="tarot-card"]',
      '.tarot-card',
      '.card-item',
      '.card',
      'img[alt*="card"]',
      'img[alt*="카드"]',
      '.clickable-card'
    ];
    
    let selectedCards = 0;
    for (const selector of cardSelectors) {
      try {
        const cards = await page.locator(selector).all();
        console.log(`[DEBUG] Found ${cards.length} cards with selector: ${selector}`);
        
        if (cards.length > 0) {
          // Select up to 3 cards
          const maxCards = Math.min(cards.length, 3);
          for (let i = 0; i < maxCards; i++) {
            await cards[i].click();
            selectedCards++;
            await page.waitForTimeout(1000);
            console.log(`[DEBUG] Selected card ${i + 1}`);
          }
          break;
        }
      } catch (e) {
        console.log(`[DEBUG] Error selecting cards with ${selector}: ${e.message}`);
      }
    }
    
    console.log(`[DEBUG] Selected ${selectedCards} cards total`);
    
    console.log('[DEBUG] Step 7: Looking for AI interpretation button...');
    await page.screenshot({ path: 'ai-debug-04-cards-selected.png', fullPage: true });
    
    // Clear logs to focus on AI request
    logs.length = 0;
    networkActivity.length = 0;
    
    // Look for AI interpretation buttons
    const aiButtonSelectors = [
      'text=AI 해석 받기',
      'text=AI 해석',
      'text=해석 받기', 
      'text=해석하기',
      'text=Get Interpretation',
      'button:has-text("AI")',
      'button:has-text("해석")',
      'button:has-text("분석")',
      '.ai-interpret',
      '#ai-interpret'
    ];
    
    let aiButton = null;
    for (const selector of aiButtonSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        aiButton = selector;
        console.log(`[DEBUG] Found AI button: ${selector}`);
        break;
      } catch (e) {
        console.log(`[DEBUG] AI button not found: ${selector}`);
      }
    }
    
    if (aiButton) {
      console.log('[DEBUG] Step 8: Clicking AI interpretation button and monitoring...');
      
      await page.click(aiButton);
      console.log('[DEBUG] Clicked AI interpretation button, monitoring network...');
      
      // Wait for AI interpretation process
      let interpretationResult = null;
      let waitTime = 0;
      const maxWaitTime = 90000; // 90 seconds
      
      while (!interpretationResult && waitTime < maxWaitTime) {
        await page.waitForTimeout(5000);
        waitTime += 5000;
        
        // Check for loading states
        const isLoading = await page.locator('text=해석 중', 'text=loading', 'text=Loading', '.loading', '.spinner', '[data-loading="true"]').count() > 0;
        
        // Check for error messages
        const errorSelectors = [
          'text=오류',
          'text=에러', 
          'text=실패',
          'text=NOT_FOUND',
          'text=not found',
          'text=Model',
          'text=gpt-3.5-turbo',
          '.error',
          '[data-error="true"]'
        ];
        
        let hasError = false;
        let errorText = '';
        for (const errorSelector of errorSelectors) {
          const errorCount = await page.locator(errorSelector).count();
          if (errorCount > 0) {
            hasError = true;
            try {
              errorText = await page.locator(errorSelector).first().textContent();
            } catch (e) {
              // continue
            }
            break;
          }
        }
        
        // Check for successful interpretation
        const successSelectors = [
          'text=## 서론',
          'text=서론',
          'text=본론',
          'text=결론',
          '.interpretation',
          '.result',
          '.tarot-interpretation',
          '[data-interpretation="true"]'
        ];
        
        let hasSuccess = false;
        for (const successSelector of successSelectors) {
          if (await page.locator(successSelector).count() > 0) {
            hasSuccess = true;
            break;
          }
        }
        
        if (hasError) {
          console.log(`[DEBUG] ERROR DETECTED: ${errorText}`);
          await page.screenshot({ path: 'ai-debug-05-error.png', fullPage: true });
          interpretationResult = 'ERROR';
          
          // Get all visible text to capture the full error
          const pageText = await page.textContent('body');
          fs.writeFileSync('ai-debug-error-page-text.txt', pageText);
          
        } else if (hasSuccess && !isLoading) {
          console.log('[DEBUG] SUCCESS DETECTED: Interpretation completed');
          await page.screenshot({ path: 'ai-debug-05-success.png', fullPage: true });
          interpretationResult = 'SUCCESS';
          
        } else {
          console.log(`[DEBUG] Waiting... (${waitTime/1000}s) - Loading: ${isLoading}, Error: ${hasError}, Success: ${hasSuccess}`);
        }
      }
      
      if (!interpretationResult) {
        console.log('[DEBUG] TIMEOUT: No result after maximum wait time');
        await page.screenshot({ path: 'ai-debug-05-timeout.png', fullPage: true });
        interpretationResult = 'TIMEOUT';
      }
      
    } else {
      console.log('[DEBUG] No AI interpretation button found');
      await page.screenshot({ path: 'ai-debug-no-ai-button.png', fullPage: true });
    }
    
    console.log('[DEBUG] Step 9: Final analysis and data collection...');
    await page.screenshot({ path: 'ai-debug-final.png', fullPage: true });
    
    // Analyze network requests for AI-related activity
    const aiRequests = networkActivity.filter(activity => 
      activity.url && (
        activity.url.includes('interpret') ||
        activity.url.includes('ai') ||
        activity.url.includes('generate') ||
        activity.url.includes('tarot') ||
        activity.url.includes('api')
      )
    );
    
    const errorLogs = logs.filter(log => 
      log.toLowerCase().includes('error') ||
      log.toLowerCase().includes('not_found') ||
      log.toLowerCase().includes('gpt-3.5-turbo') ||
      log.toLowerCase().includes('model')
    );
    
    const debugSummary = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      totalLogs: logs.length,
      totalNetworkActivity: networkActivity.length,
      aiRelatedRequests: aiRequests,
      errorLogs: errorLogs,
      allLogs: logs,
      allNetworkActivity: networkActivity
    };
    
    // Save comprehensive debug data
    fs.writeFileSync('ai-debug-comprehensive.json', JSON.stringify(debugSummary, null, 2));
    
    // Save focused error analysis
    const errorAnalysis = {
      errorLogs: errorLogs,
      aiRequests: aiRequests,
      postDataFromAIRequests: aiRequests.filter(req => req.postData).map(req => ({
        url: req.url,
        postData: req.postData
      }))
    };
    fs.writeFileSync('ai-debug-error-analysis.json', JSON.stringify(errorAnalysis, null, 2));
    
    console.log('[DEBUG] Debug analysis complete!');
    console.log(`[DEBUG] Found ${errorLogs.length} error logs`);
    console.log(`[DEBUG] Found ${aiRequests.length} AI-related requests`);
    
    if (errorLogs.length > 0) {
      console.log('[DEBUG] Error logs preview:');
      errorLogs.slice(0, 3).forEach(log => console.log(`  ${log}`));
    }
    
  } catch (error) {
    console.error('[DEBUG] Unexpected error during debugging:', error);
    await page.screenshot({ path: 'ai-debug-unexpected-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the debug
debugAIFlowDirect().catch(console.error);