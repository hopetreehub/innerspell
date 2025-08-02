import { test, expect } from '@playwright/test';

test.describe('Dream Interpretation Fallback System', () => {
  test('Complete dream interpretation flow with fallback system', async ({ page }) => {
    // Navigate to dream interpretation page
    await page.goto('https://test-studio-firebase.vercel.app/dream-interpretation');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'dream-interpretation-initial.png', fullPage: true });
    
    // Enter sample dream description - use the correct placeholder text
    const dreamInput = page.locator('#dream-description');
    await expect(dreamInput).toBeVisible();
    await dreamInput.fill('어젯밤 하늘을 나는 꿈을 꾸었습니다. 새처럼 자유롭게 구름 사이를 날아다니며 아름다운 풍경을 내려다보았습니다.');
    
    // Take screenshot after entering dream
    await page.screenshot({ path: 'dream-interpretation-dream-entered.png', fullPage: true });
    
    // Click next step button
    const nextButton = page.locator('button:has-text("다음 단계 (AI 질문 받기)")');
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    
    // Wait for questions to appear (either AI or fallback)
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of questions page
    await page.screenshot({ path: 'dream-interpretation-questions.png', fullPage: true });
    
    // Check if we're on the clarifying step
    const clarifyingStep = page.locator('text=2단계: 세부 질문');
    const isOnClarifyingStep = await clarifyingStep.isVisible();
    console.log('On clarifying step:', isOnClarifyingStep);
    
    if (isOnClarifyingStep) {
      // Answer radio button questions
      const radioButtons = page.locator('input[type="radio"]');
      const radioCount = await radioButtons.count();
      console.log('Radio buttons found:', radioCount);
      
      // Select first option for each question group
      if (radioCount > 0) {
        // For each question, select the first radio button
        await page.locator('input[type="radio"]').first().click();
        await page.waitForTimeout(500);
        
        if (radioCount > 4) {
          await page.locator('input[type="radio"]').nth(4).click();
          await page.waitForTimeout(500);
        }
        
        if (radioCount > 8) {
          await page.locator('input[type="radio"]').nth(8).click();
          await page.waitForTimeout(500);
        }
      }
      
      // Take screenshot after answering questions
      await page.screenshot({ path: 'dream-interpretation-questions-answered.png', fullPage: true });
      
      // Click AI dream interpretation button
      const interpretButton = page.locator('button:has-text("AI 꿈 해몽 받기")');
      await expect(interpretButton).toBeVisible();
      await interpretButton.click();
      
      // Wait for interpretation to appear
      await page.waitForTimeout(8000);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of interpretation result
      await page.screenshot({ path: 'dream-interpretation-result.png', fullPage: true });
      
      // Check if interpretation appeared
      const interpretationTitle = page.locator('text=AI 꿈 해몽 결과');
      const interpretationExists = await interpretationTitle.isVisible();
      
      console.log('Interpretation appeared:', interpretationExists);
      expect(interpretationExists).toBe(true);
    }
    
    // Verify that the flow completed without errors
    const errorMessages = await page.locator('.error, [class*="error"]').count();
    expect(errorMessages).toBe(0);
    
    // Take final screenshot
    await page.screenshot({ path: 'dream-interpretation-final.png', fullPage: true });
  });
  
  test('Test fallback system activation', async ({ page }) => {
    // Navigate to dream interpretation page
    await page.goto('https://test-studio-firebase.vercel.app/dream-interpretation');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Enter dream description
    const dreamInput = page.locator('textarea[placeholder*="꿈의 내용"]');
    await dreamInput.fill('바다에서 수영하는 꿈을 꾸었습니다.');
    
    // Click next step
    const nextButton = page.locator('button:has-text("다음 단계")');
    await nextButton.click();
    
    // Wait and check for fallback questions
    await page.waitForTimeout(5000);
    
    // Look for fallback question indicators
    const fallbackQuestions = await page.locator('text=/어떤 감정.*느꼈나요?|누구와 함께.*있었나요?|어떤 색깔.*기억나나요?/').count();
    
    if (fallbackQuestions > 0) {
      console.log('Fallback questions detected');
      await page.screenshot({ path: 'dream-interpretation-fallback-questions.png', fullPage: true });
    }
    
    // Check for fallback interpretation
    const fallbackInterpretation = await page.locator('text=/꿈은 우리의 무의식|심리적 상태를 반영|상징적 의미/').count();
    
    if (fallbackInterpretation > 0) {
      console.log('Fallback interpretation detected');
      await page.screenshot({ path: 'dream-interpretation-fallback-result.png', fullPage: true });
    }
  });
});