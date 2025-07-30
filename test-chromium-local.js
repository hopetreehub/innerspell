const { chromium } = require('playwright');

(async () => {
  console.log('🔮 Testing rich tarot interpretation with Chromium (Local)...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    const LOCAL_URL = 'http://localhost:4000';
    
    // Navigate to tarot reading page
    console.log('🌐 Navigating to local tarot reading page...');
    await page.goto(`${LOCAL_URL}/tarot-reading`, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Take initial screenshot
    await page.screenshot({ path: 'chromium-local-1-initial.png', fullPage: true });
    console.log('📸 Initial screenshot taken');
    
    // Wait for page to be ready
    await page.waitForTimeout(3000);
    
    // Try different selectors for the question textarea
    let questionFilled = false;
    const selectors = [
      'textarea[placeholder*="질문"]',
      'textarea[name="question"]', 
      'textarea',
      '[data-testid="question-input"]',
      'input[placeholder*="질문"]'
    ];
    
    for (const selector of selectors) {
      try {
        console.log(`🔍 Trying selector: ${selector}`);
        await page.fill(selector, '삼위일체 조망 스프레드와 영적 성장 스타일로 나의 오늘 운세를 알려주세요');
        questionFilled = true;
        console.log('✅ Question filled successfully');
        break;
      } catch (e) {
        console.log(`❌ Selector ${selector} failed`);
      }
    }
    
    if (!questionFilled) {
      console.log('❌ Could not find question input field');
      await page.screenshot({ path: 'chromium-local-error-no-input.png', fullPage: true });
      return;
    }
    
    // Try to select spread
    try {
      console.log('🎯 Selecting Trinity View spread...');
      await page.selectOption('select', { label: /삼위일체.*Trinity View/ });
      console.log('✅ Spread selected');
    } catch (e) {
      console.log('❌ Could not select spread:', e.message);
    }
    
    // Try to select style
    try {
      console.log('🧘 Selecting Spiritual Growth style...');
      await page.selectOption('select:nth-of-type(2)', { label: /영적.*성장.*자기.*성찰/ });
      console.log('✅ Style selected');
    } catch (e) {
      console.log('❌ Could not select style:', e.message);
    }
    
    // Take screenshot after selections
    await page.screenshot({ path: 'chromium-local-2-selections.png', fullPage: true });
    console.log('📸 Selections screenshot taken');
    
    // Click draw cards button
    console.log('🎴 Looking for card draw button...');
    const drawButtonSelectors = [
      'button:has-text("카드 뽑기")',
      'button:has-text("카드")',
      'button[type="button"]',
      '[data-testid="draw-cards"]'
    ];
    
    let cardDrawn = false;
    for (const selector of drawButtonSelectors) {
      try {
        console.log(`🔍 Trying draw button selector: ${selector}`);
        await page.click(selector);
        cardDrawn = true;
        console.log('✅ Cards drawn successfully');
        break;
      } catch (e) {
        console.log(`❌ Draw button selector ${selector} failed`);
      }
    }
    
    if (!cardDrawn) {
      console.log('❌ Could not find or click draw cards button');
      await page.screenshot({ path: 'chromium-local-error-no-draw.png', fullPage: true });
      return;
    }
    
    // Wait for cards to be drawn
    await page.waitForTimeout(8000);
    
    // Take screenshot of drawn cards
    await page.screenshot({ path: 'chromium-local-3-cards-drawn.png', fullPage: true });
    console.log('📸 Cards drawn screenshot taken');
    
    // Look for interpretation button
    console.log('🔮 Looking for interpretation button...');
    const interpretButtonSelectors = [
      'button:has-text("타로 해석 받기")',
      'button:has-text("해석")',
      '[data-testid="interpret-button"]'
    ];
    
    let interpretClicked = false;
    for (const selector of interpretButtonSelectors) {
      try {
        console.log(`🔍 Trying interpret button selector: ${selector}`);
        const button = page.locator(selector);
        if (await button.isVisible()) {
          await button.click();
          interpretClicked = true;
          console.log('✅ Interpretation button clicked');
          break;
        }
      } catch (e) {
        console.log(`❌ Interpret button selector ${selector} failed`);
      }
    }
    
    if (interpretClicked) {
      // Wait for AI interpretation
      console.log('⏳ Waiting for AI interpretation (up to 60 seconds)...');
      await page.waitForTimeout(60000);
      
      // Take final screenshot
      await page.screenshot({ path: 'chromium-local-4-interpretation.png', fullPage: true });
      console.log('📸 Interpretation screenshot taken');
      
      // Check for interpretation content
      const contentSelectors = ['.prose', '[data-testid="interpretation"]', '.interpretation', '.result'];
      let interpretationText = null;
      
      for (const selector of contentSelectors) {
        try {
          if (await page.locator(selector).isVisible()) {
            interpretationText = await page.textContent(selector);
            console.log(`✅ Found interpretation with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // continue
        }
      }
      
      if (interpretationText) {
        console.log('\n=== 📋 INTERPRETATION ANALYSIS ===');
        console.log('📏 Length:', interpretationText.length, 'characters');
        console.log('\n📝 Content Preview:');
        console.log(interpretationText.substring(0, 500) + '...\n');
        
        // Verification
        const hasSpreadRef = interpretationText.includes('삼위일체') || 
                            interpretationText.includes('Trinity') || 
                            interpretationText.includes('조망');
        const hasPositionRef = interpretationText.includes('과거') && 
                              interpretationText.includes('현재') && 
                              interpretationText.includes('미래');
        const hasSpiritualRef = interpretationText.includes('영적') || 
                               interpretationText.includes('영혼') || 
                               interpretationText.includes('성장') ||
                               interpretationText.includes('내면');
        const hasDetailedAnalysis = interpretationText.length > 800;
        const hasStructuredFormat = interpretationText.includes('서론') && 
                                   interpretationText.includes('본론') && 
                                   interpretationText.includes('실행') && 
                                   interpretationText.includes('결론');
        
        console.log('=== ✅ GUIDELINE VERIFICATION ===');
        console.log('🎯 Spread reference found:', hasSpreadRef ? '✅' : '❌');
        console.log('🔄 Position references found:', hasPositionRef ? '✅' : '❌');
        console.log('🧘 Spiritual growth elements:', hasSpiritualRef ? '✅' : '❌');
        console.log('📖 Rich detailed analysis (>800 chars):', hasDetailedAnalysis ? '✅' : '❌');
        console.log('📋 Structured format:', hasStructuredFormat ? '✅' : '❌');
        
        const successCount = [hasSpreadRef, hasPositionRef, hasSpiritualRef, hasDetailedAnalysis, hasStructuredFormat]
          .filter(Boolean).length;
        
        if (successCount >= 4) {
          console.log('\n🎉 SUCCESS: Rich guideline system is working excellently!');
        } else {
          console.log('\n⚠️ Some elements may need improvement');
        }
        
        console.log(`📊 Verification Score: ${successCount}/5`);
        
      } else {
        console.log('❌ No interpretation content found');
      }
      
    } else {
      console.log('❌ Could not find interpretation button');
      await page.screenshot({ path: 'chromium-local-error-no-interpret.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ path: 'chromium-local-error.png', fullPage: true });
  } finally {
    console.log('\n🏁 Local Chromium test completed!');
    await browser.close();
  }
})();