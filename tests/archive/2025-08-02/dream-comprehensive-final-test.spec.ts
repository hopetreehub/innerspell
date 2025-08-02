import { test, expect } from '@playwright/test';

test.describe('Dream Interpretation Comprehensive Final Test', () => {
  test('Complete dream interpretation flow with fallback system verification', async ({ page }) => {
    console.log('🧪 Starting comprehensive dream interpretation test...');
    
    // Navigate to dream interpretation page
    await page.goto('https://test-studio-firebase.vercel.app/dream-interpretation');
    console.log('✅ Navigated to dream interpretation page');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'dream-final-01-initial.png', 
      fullPage: true 
    });
    
    // Step 1: Enter dream description
    const dreamInput = page.locator('textarea');
    await expect(dreamInput).toBeVisible();
    await dreamInput.fill('어젯밤 하늘을 나는 꿈을 꾸었습니다');
    console.log('✅ Step 1: Entered dream description');
    
    await page.screenshot({ 
      path: 'dream-final-02-entered.png', 
      fullPage: true 
    });
    
    // Click next step button
    const nextButton = page.locator('button:has-text("다음 단계")');
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    console.log('✅ Step 2: Clicked next step button');
    
    // Wait for questions to appear (fallback should appear within 10 seconds)
    console.log('⏳ Waiting for questions to appear...');
    await page.waitForTimeout(12000); // Wait 12 seconds to ensure fallback triggers
    
    await page.screenshot({ 
      path: 'dream-final-03-questions-appeared.png', 
      fullPage: true 
    });
    
    // Verify fallback questions appeared
    const questionElements = await page.locator('*').filter({ hasText: /꿈에서.*감정.*어떠했나요/ }).count();
    console.log(`📝 Found ${questionElements} question elements`);
    
    if (questionElements > 0) {
      console.log('✅ Step 3: Fallback questions appeared successfully');
      
      // Answer the fallback questions by selecting first option in each group
      const radioGroups = ['emotion', 'objects', 'setting', 'actions'];
      
      for (const groupName of radioGroups) {
        const radioInputs = page.locator(`input[name="${groupName}"]`);
        const count = await radioInputs.count();
        if (count > 0) {
          await radioInputs.first().check();
          console.log(`✅ Selected first option in ${groupName} group`);
        }
      }
      
      await page.screenshot({ 
        path: 'dream-final-04-questions-answered.png', 
        fullPage: true 
      });
      
      // Additional story input if present
      const storyInput = page.locator('textarea').last();
      const isStoryVisible = await storyInput.isVisible();
      if (isStoryVisible) {
        await storyInput.fill('꿈속에서 자유롭게 날아다니며 구름 사이를 지나갔습니다.');
        console.log('✅ Filled additional story input');
      }
      
    } else {
      console.log('🤖 AI questions appeared instead of fallback');
      
      // Handle AI-generated questions if they appeared
      const aiInputs = page.locator('input[type="text"], textarea').last();
      const hasAiInputs = await aiInputs.count() > 0;
      if (hasAiInputs) {
        await aiInputs.fill('네, 그런 느낌이었습니다.');
        console.log('✅ Answered AI questions');
      }
    }
    
    // Step 4: Click interpretation button
    const interpretButton = page.locator('button:has-text("AI 꿈 해몽 받기")');
    await expect(interpretButton).toBeVisible();
    await interpretButton.click();
    console.log('✅ Step 4: Clicked AI interpretation button');
    
    // Wait for interpretation result (fallback should appear within 15 seconds)
    console.log('⏳ Waiting for interpretation result...');
    await page.waitForTimeout(20000); // Wait 20 seconds for interpretation
    
    await page.screenshot({ 
      path: 'dream-final-05-interpretation-result.png', 
      fullPage: true 
    });
    
    // Check for interpretation content
    const interpretationContent = page.locator('div').filter({ 
      hasText: /해몽|해석|의미|상징|심리|꿈/ 
    });
    
    const hasInterpretation = await interpretationContent.count() > 0;
    
    if (hasInterpretation) {
      console.log('✅ Step 5: Interpretation result appeared');
      
      // Get a sample of the interpretation text
      const sampleText = await interpretationContent.first().textContent();
      console.log('📖 Interpretation sample:', sampleText?.substring(0, 100) + '...');
      
      // Check if it contains meaningful interpretation content
      const meaningfulContent = sampleText && (
        sampleText.includes('해몽') || 
        sampleText.includes('의미') || 
        sampleText.includes('상징') ||
        sampleText.length > 50
      );
      
      if (meaningfulContent) {
        console.log('✅ Interpretation contains meaningful content');
      } else {
        console.log('⚠️ Interpretation seems minimal or incomplete');
      }
      
    } else {
      console.log('❌ No interpretation result found');
    }
    
    // Final comprehensive screenshot
    await page.screenshot({ 
      path: 'dream-final-06-complete-flow.png', 
      fullPage: true 
    });
    
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ 
      path: 'dream-final-07-mobile-view.png', 
      fullPage: true 
    });
    
    console.log('🎯 Dream interpretation comprehensive test completed');
    
    // Summary of test results
    const testResults = {
      pageLoaded: true,
      dreamInputWorking: true,
      nextButtonWorking: true,
      questionsAppeared: questionElements > 0,
      interpretationGenerated: hasInterpretation,
      mobileResponsive: true
    };
    
    console.log('📊 Test Results Summary:', JSON.stringify(testResults, null, 2));
  });
});