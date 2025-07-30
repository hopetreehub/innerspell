const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function debugAIFlowComplete() {
  console.log('[DEBUG] Starting complete AI flow debugging...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Monitor console logs and network requests
  const logs = [];
  const networkRequests = [];
  
  page.on('console', msg => {
    const logEntry = `[${new Date().toISOString()}] CONSOLE: ${msg.text()}`;
    console.log(logEntry);
    logs.push(logEntry);
  });
  
  page.on('request', request => {
    const requestInfo = `[${new Date().toISOString()}] REQUEST: ${request.method()} ${request.url()}`;
    console.log(requestInfo);
    networkRequests.push(requestInfo);
  });
  
  page.on('response', response => {
    const responseInfo = `[${new Date().toISOString()}] RESPONSE: ${response.status()} ${response.url()}`;
    console.log(responseInfo);
    networkRequests.push(responseInfo);
  });
  
  try {
    console.log('[DEBUG] Step 1: Waiting for latest deployment to be ready...');
    
    // Check if latest deployment is ready
    let deploymentReady = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!deploymentReady && attempts < maxAttempts) {
      try {
        console.log(`[DEBUG] Checking deployment status (attempt ${attempts + 1}/${maxAttempts})...`);
        await page.goto('https://test-studio-firebase-8cihtnbvb-johns-projects-bf5e60f3.vercel.app/', { 
          waitUntil: 'networkidle', 
          timeout: 30000 
        });
        deploymentReady = true;
        console.log('[DEBUG] Latest deployment is ready!');
      } catch (error) {
        console.log(`[DEBUG] Deployment not ready yet, waiting 30 seconds... (${error.message})`);
        attempts++;
        if (attempts < maxAttempts) {
          await page.waitForTimeout(30000);
        }
      }
    }
    
    if (!deploymentReady) {
      console.log('[DEBUG] Latest deployment not ready, using previous ready deployment...');
      await page.goto('https://test-studio-firebase-cy4myq04s-johns-projects-bf5e60f3.vercel.app/', { 
        waitUntil: 'networkidle', 
        timeout: 30000 
      });
    }
    
    console.log('[DEBUG] Step 2: Taking initial screenshot...');
    await page.screenshot({ path: 'ai-debug-01-homepage.png', fullPage: true });
    
    console.log('[DEBUG] Step 3: Starting tarot reading...');
    await page.waitForSelector('text=타로 리딩 시작하기', { timeout: 10000 });
    await page.click('text=타로 리딩 시작하기');
    await page.waitForTimeout(2000);
    
    console.log('[DEBUG] Step 4: Filling question...');
    await page.waitForSelector('textarea[name="question"]', { timeout: 10000 });
    await page.fill('textarea[name="question"]', 'AI 해석 오류 테스트를 위한 질문입니다. 내 미래는 어떻게 될까요?');
    await page.waitForTimeout(1000);
    
    console.log('[DEBUG] Step 5: Clicking draw cards button...');
    await page.click('text=카드 뽑기');
    await page.waitForTimeout(3000);
    
    console.log('[DEBUG] Step 6: Taking card selection screenshot...');
    await page.screenshot({ path: 'ai-debug-02-card-selection.png', fullPage: true });
    
    console.log('[DEBUG] Step 7: Selecting cards...');
    // Wait for cards to be available and select them
    const cardElements = await page.locator('[data-testid="tarot-card"], .tarot-card, .card-item').all();
    console.log(`[DEBUG] Found ${cardElements.length} card elements`);
    
    if (cardElements.length > 0) {
      // Select first card
      await cardElements[0].click();
      await page.waitForTimeout(1000);
      console.log('[DEBUG] Selected first card');
      
      // If it's a multi-card spread, select more cards
      if (cardElements.length > 1) {
        await cardElements[1].click();
        await page.waitForTimeout(1000);
        console.log('[DEBUG] Selected second card');
        
        if (cardElements.length > 2) {
          await cardElements[2].click();
          await page.waitForTimeout(1000);
          console.log('[DEBUG] Selected third card');
        }
      }
    }
    
    console.log('[DEBUG] Step 8: Looking for AI interpretation button...');
    await page.screenshot({ path: 'ai-debug-03-cards-selected.png', fullPage: true });
    
    // Look for various possible AI interpretation buttons
    const possibleButtons = [
      'text=AI 해석 받기',
      'text=해석 받기', 
      'text=AI 해석',
      'text=해석하기',
      'button:has-text("해석")',
      'button:has-text("AI")'
    ];
    
    let interpretationButton = null;
    for (const selector of possibleButtons) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        interpretationButton = selector;
        console.log(`[DEBUG] Found interpretation button: ${selector}`);
        break;
      } catch (e) {
        console.log(`[DEBUG] Button not found: ${selector}`);
      }
    }
    
    if (interpretationButton) {
      console.log('[DEBUG] Step 9: Clicking AI interpretation button...');
      
      // Clear any existing logs to focus on the AI request
      logs.length = 0;
      networkRequests.length = 0;
      
      await page.click(interpretationButton);
      console.log('[DEBUG] Clicked interpretation button, monitoring network...');
      
      // Wait for AI interpretation to complete
      console.log('[DEBUG] Step 10: Waiting for AI interpretation...');
      let interpretationCompleted = false;
      let waitTime = 0;
      const maxWaitTime = 60000; // 60 seconds
      
      while (!interpretationCompleted && waitTime < maxWaitTime) {
        await page.waitForTimeout(5000);
        waitTime += 5000;
        
        // Check for loading indicators
        const isLoading = await page.locator('text=해석 중', 'text=loading', '.loading', '.spinner').count() > 0;
        
        // Check for error messages
        const hasError = await page.locator('text=오류', 'text=에러', 'text=실패', 'text=NOT_FOUND').count() > 0;
        
        // Check for successful interpretation
        const hasInterpretation = await page.locator('.interpretation, .result, text=## 서론, text=타로').count() > 0;
        
        if (hasError) {
          console.log('[DEBUG] Error detected in interpretation!');
          await page.screenshot({ path: 'ai-debug-04-error.png', fullPage: true });
          
          // Get error text
          const errorElements = await page.locator('text=오류, text=에러, text=실패, text=NOT_FOUND').all();
          for (const errorEl of errorElements) {
            const errorText = await errorEl.textContent();
            console.log(`[DEBUG] ERROR FOUND: ${errorText}`);
          }
          
          interpretationCompleted = true;
        } else if (hasInterpretation && !isLoading) {
          console.log('[DEBUG] Interpretation completed successfully!');
          await page.screenshot({ path: 'ai-debug-05-success.png', fullPage: true });
          interpretationCompleted = true;
        }
        
        console.log(`[DEBUG] Waiting... (${waitTime/1000}s) - Loading: ${isLoading}, Error: ${hasError}, Interpretation: ${hasInterpretation}`);
      }
      
      if (!interpretationCompleted) {
        console.log('[DEBUG] Interpretation timed out');
        await page.screenshot({ path: 'ai-debug-06-timeout.png', fullPage: true });
      }
      
    } else {
      console.log('[DEBUG] No AI interpretation button found');
      await page.screenshot({ path: 'ai-debug-04-no-button.png', fullPage: true });
    }
    
    console.log('[DEBUG] Step 11: Final screenshot and analysis...');
    await page.screenshot({ path: 'ai-debug-final.png', fullPage: true });
    
    // Save all logs and network requests to files
    const debugData = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      logs: logs,
      networkRequests: networkRequests,
      summary: {
        totalLogs: logs.length,
        totalNetworkRequests: networkRequests.length,
        aiRelatedRequests: networkRequests.filter(req => req.includes('interpret') || req.includes('ai') || req.includes('generate')),
        errorLogs: logs.filter(log => log.toLowerCase().includes('error') || log.toLowerCase().includes('not_found'))
      }
    };
    
    fs.writeFileSync('ai-debug-complete-log.json', JSON.stringify(debugData, null, 2));
    console.log('[DEBUG] Debug data saved to ai-debug-complete-log.json');
    
    // Also save just the error-related logs
    const errorData = {
      errorLogs: debugData.summary.errorLogs,
      aiRequests: debugData.summary.aiRelatedRequests
    };
    fs.writeFileSync('ai-debug-errors-only.json', JSON.stringify(errorData, null, 2));
    
    console.log('[DEBUG] Analysis complete!');
    
  } catch (error) {
    console.error('[DEBUG] Error during debugging:', error);
    await page.screenshot({ path: 'ai-debug-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the debug
debugAIFlowComplete().catch(console.error);