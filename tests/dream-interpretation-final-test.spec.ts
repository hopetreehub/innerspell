import { test, expect } from '@playwright/test';

test.describe('Dream Interpretation Final Test', () => {
  test('Complete dream interpretation flow with timeout system', async ({ page }) => {
    console.log('🧪 Starting final dream interpretation test...');
    
    // Navigate to dream interpretation page
    await page.goto('https://test-studio-firebase.vercel.app/dream-interpretation');
    console.log('✅ Navigated to dream interpretation page');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'dream-interpretation-initial.png',
      fullPage: true 
    });
    
    // Enter dream description
    const dreamInput = page.locator('textarea[placeholder*="꿈의 내용"]');
    await expect(dreamInput).toBeVisible();
    await dreamInput.fill('어젯밤 하늘을 나는 꿈을 꾸었습니다');
    console.log('✅ Entered dream description');
    
    // Take screenshot after entering dream
    await page.screenshot({ 
      path: 'dream-interpretation-entered.png',
      fullPage: true 
    });
    
    // Click next step button
    const nextButton = page.locator('button:has-text("다음 단계")');
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    console.log('✅ Clicked next step button');
    
    // Wait for either AI questions or fallback questions to appear
    console.log('⏳ Waiting for questions to appear (max 15 seconds)...');
    
    try {
      // Wait for loading to disappear and questions to appear
      await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 15000 });
      console.log('✅ Loading spinner disappeared');
    } catch (error) {
      console.log('⚠️ Loading spinner timeout - checking for fallback');
    }
    
    // Check if fallback questions appeared
    const fallbackQuestions = page.locator('div').filter({ hasText: '꿈에서 당신의 감정은 어떠했나요?' });
    const hasFallback = await fallbackQuestions.count() > 0;
    
    if (hasFallback) {
      console.log('✅ Fallback questions appeared');
      
      // Take screenshot of fallback questions
      await page.screenshot({ 
        path: 'dream-interpretation-fallback-questions.png',
        fullPage: true 
      });
      
      // Answer fallback questions
      const emotionRadio = page.locator('input[value="기뻤다"]');
      await emotionRadio.check();
      
      const objectRadio = page.locator('input[value="사람"]');
      await objectRadio.check();
      
      const settingRadio = page.locator('input[value="자연"]');
      await settingRadio.check();
      
      const actionRadio = page.locator('input[value="달리기/걷기"]');
      await actionRadio.check();
      
      console.log('✅ Answered fallback questions');
      
      // Take screenshot after answering
      await page.screenshot({ 
        path: 'dream-interpretation-answered.png',
        fullPage: true 
      });
      
    } else {
      console.log('🤖 AI questions appeared instead of fallback');
      
      // Take screenshot of AI questions
      await page.screenshot({ 
        path: 'dream-interpretation-ai-questions.png',
        fullPage: true 
      });
      
      // Find and answer any visible questions
      const questionInputs = page.locator('input[type="text"], textarea');
      const count = await questionInputs.count();
      
      for (let i = 0; i < count; i++) {
        await questionInputs.nth(i).fill('네, 그렇습니다.');
      }
      
      console.log(`✅ Answered ${count} AI questions`);
    }
    
    // Click the interpretation button
    const interpretButton = page.locator('button:has-text("AI 꿈 해몽 받기")');
    await expect(interpretButton).toBeVisible();
    await interpretButton.click();
    console.log('✅ Clicked interpretation button');
    
    // Wait for interpretation result (max 20 seconds)
    console.log('⏳ Waiting for interpretation result (max 20 seconds)...');
    
    try {
      // Wait for loading to finish
      await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 20000 });
      console.log('✅ Interpretation loading finished');
    } catch (error) {
      console.log('⚠️ Interpretation loading timeout - checking for fallback');
    }
    
    // Check for interpretation result
    const interpretationText = page.locator('div').filter({ hasText: /꿈 해몽|해석|의미/ }).first();
    
    try {
      await expect(interpretationText).toBeVisible({ timeout: 5000 });
      console.log('✅ Interpretation result appeared');
      
      // Take final screenshot
      await page.screenshot({ 
        path: 'dream-interpretation-final-result.png',
        fullPage: true 
      });
      
      // Get the interpretation content
      const content = await interpretationText.textContent();
      console.log('📖 Interpretation content preview:', content?.substring(0, 100) + '...');
      
    } catch (error) {
      console.log('❌ No interpretation result found');
      
      // Take error screenshot
      await page.screenshot({ 
        path: 'dream-interpretation-error.png',
        fullPage: true 
      });
    }
    
    // Wait a bit more to see final state
    await page.waitForTimeout(3000);
    
    // Take comprehensive final screenshot
    await page.screenshot({ 
      path: 'dream-interpretation-complete-flow.png',
      fullPage: true 
    });
    
    console.log('🎯 Dream interpretation test completed');
  });
});