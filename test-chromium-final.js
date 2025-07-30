const { chromium } = require('playwright');

(async () => {
  console.log('🔮 Testing rich tarot interpretation with Chromium...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Wait for Vercel deployment
    console.log('⏳ Waiting for Vercel deployment to be ready...');
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    const VERCEL_URL = 'https://innerspell.vercel.app';
    
    // Navigate to tarot reading page
    console.log('🌐 Navigating to tarot reading page...');
    await page.goto(`${VERCEL_URL}/tarot-reading`, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Take initial screenshot
    await page.screenshot({ path: 'chromium-test-1-initial.png', fullPage: true });
    console.log('📸 Initial screenshot taken');
    
    // Fill in the question
    console.log('✏️ Filling in question...');
    await page.fill('textarea[placeholder*="질문"]', '삼위일체 조망 스프레드와 영적 성장 스타일로 나의 오늘 운세를 알려주세요');
    
    // Select Trinity View spread
    console.log('🎯 Selecting Trinity View spread...');
    await page.selectOption('select:first-of-type', { label: /삼위일체.*Trinity View/ });
    
    // Select Spiritual Growth style
    console.log('🧘 Selecting Spiritual Growth style...');
    await page.selectOption('select:nth-of-type(2)', { label: /영적.*성장.*자기.*성찰/ });
    
    // Take screenshot after selections
    await page.screenshot({ path: 'chromium-test-2-selections.png', fullPage: true });
    console.log('📸 Selections screenshot taken');
    
    // Click draw cards button
    console.log('🎴 Drawing cards...');
    await page.click('button:has-text("카드 뽑기")');
    
    // Wait for cards to be drawn
    await page.waitForTimeout(8000);
    
    // Take screenshot of drawn cards
    await page.screenshot({ path: 'chromium-test-3-cards-drawn.png', fullPage: true });
    console.log('📸 Cards drawn screenshot taken');
    
    // Check if interpret button exists and click it
    const interpretButton = page.locator('button:has-text("타로 해석 받기")');
    const isVisible = await interpretButton.isVisible();
    
    if (isVisible) {
      console.log('🔮 Clicking interpretation button...');
      await interpretButton.click();
      
      // Wait for AI interpretation with longer timeout
      console.log('⏳ Waiting for AI interpretation (up to 60 seconds)...');
      await page.waitForTimeout(60000);
      
      // Take final screenshot
      await page.screenshot({ path: 'chromium-test-4-interpretation.png', fullPage: true });
      console.log('📸 Interpretation screenshot taken');
      
      // Get interpretation text
      const interpretationExists = await page.locator('.prose').isVisible();
      if (interpretationExists) {
        const interpretationText = await page.textContent('.prose');
        
        console.log('\n=== 📋 INTERPRETATION ANALYSIS ===');
        console.log('📏 Length:', interpretationText?.length || 0, 'characters');
        console.log('\n📝 Content Preview:');
        console.log(interpretationText?.substring(0, 500) + '...\n');
        
        // Advanced guideline verification
        const hasSpreadRef = interpretationText?.includes('삼위일체') || 
                            interpretationText?.includes('Trinity') || 
                            interpretationText?.includes('조망');
        const hasPositionRef = interpretationText?.includes('과거') && 
                              interpretationText?.includes('현재') && 
                              interpretationText?.includes('미래');
        const hasSpiritualRef = interpretationText?.includes('영적') || 
                               interpretationText?.includes('영혼') || 
                               interpretationText?.includes('성장') ||
                               interpretationText?.includes('내면');
        const hasDetailedAnalysis = (interpretationText?.length || 0) > 800;
        const hasStructuredFormat = interpretationText?.includes('## 서론') && 
                                   interpretationText?.includes('## 본론') && 
                                   interpretationText?.includes('## 실행') && 
                                   interpretationText?.includes('## 결론');
        
        console.log('=== ✅ GUIDELINE VERIFICATION ===');
        console.log('🎯 Spread reference found:', hasSpreadRef ? '✅' : '❌');
        console.log('🔄 Position references found:', hasPositionRef ? '✅' : '❌');
        console.log('🧘 Spiritual growth elements:', hasSpiritualRef ? '✅' : '❌');
        console.log('📖 Rich detailed analysis (>800 chars):', hasDetailedAnalysis ? '✅' : '❌');
        console.log('📋 Structured format (4 sections):', hasStructuredFormat ? '✅' : '❌');
        
        const successCount = [hasSpreadRef, hasPositionRef, hasSpiritualRef, hasDetailedAnalysis, hasStructuredFormat]
          .filter(Boolean).length;
        
        if (successCount >= 4) {
          console.log('\n🎉 SUCCESS: Rich guideline system is working excellently!');
          console.log(`✨ Passed ${successCount}/5 verification criteria`);
        } else if (successCount >= 3) {
          console.log('\n✅ GOOD: Most guidelines are working properly');
          console.log(`📊 Passed ${successCount}/5 verification criteria`);
        } else {
          console.log('\n⚠️ WARNING: Some guideline elements may be missing');
          console.log(`📊 Passed ${successCount}/5 verification criteria`);
        }
        
        // Show full interpretation if it's rich
        if (hasDetailedAnalysis) {
          console.log('\n=== 📚 FULL RICH INTERPRETATION ===');
          console.log(interpretationText);
        }
      } else {
        console.log('❌ No interpretation found in the page');
      }
    } else {
      console.log('❌ Interpretation button not found - checking for existing interpretation...');
      const proseExists = await page.locator('.prose').isVisible();
      if (proseExists) {
        await page.screenshot({ path: 'chromium-test-4-existing.png', fullPage: true });
        console.log('✅ Found existing interpretation');
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ path: 'chromium-test-error.png', fullPage: true });
  } finally {
    console.log('\n🏁 Test completed! Check screenshots for visual verification.');
    await browser.close();
  }
})();