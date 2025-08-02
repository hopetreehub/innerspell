import { test, expect } from '@playwright/test';

test.describe('Dream Interpretation Final Test - Simple', () => {
  test('Test dream interpretation page step by step', async ({ page }) => {
    console.log('🧪 Starting dream interpretation final test...');
    
    // Navigate to dream interpretation page
    await page.goto('https://test-studio-firebase.vercel.app/dream-interpretation');
    console.log('✅ Navigated to dream interpretation page');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot to see the page
    await page.screenshot({ 
      path: 'dream-interpretation-loaded.png', 
      fullPage: true 
    });
    
    // Check page title
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Look for any textarea or input field
    const textareas = await page.locator('textarea').count();
    const inputs = await page.locator('input[type="text"]').count();
    console.log(`📝 Found ${textareas} textareas and ${inputs} text inputs`);
    
    // Get page content to debug
    const content = await page.content();
    console.log('📄 Page contains "꿈":', content.includes('꿈'));
    console.log('📄 Page contains "해몽":', content.includes('해몽'));
    
    // Look for common dream-related elements
    const dreamElements = await page.locator('*').filter({ hasText: /꿈|해몽|드림/ }).count();
    console.log(`🔍 Found ${dreamElements} dream-related elements`);
    
    // Try to find any input field
    const allInputs = page.locator('textarea, input[type="text"], input:not([type])');
    const inputCount = await allInputs.count();
    console.log(`🔍 Total input fields found: ${inputCount}`);
    
    if (inputCount > 0) {
      // Get the first input field
      const firstInput = allInputs.first();
      const placeholder = await firstInput.getAttribute('placeholder');
      console.log('📝 First input placeholder:', placeholder);
      
      // Try to enter dream text
      await firstInput.fill('어젯밤 하늘을 나는 꿈을 꾸었습니다');
      console.log('✅ Entered dream description');
      
      // Take screenshot after entering
      await page.screenshot({ 
        path: 'dream-interpretation-entered-text.png', 
        fullPage: true 
      });
      
      // Look for next button
      const buttons = await page.locator('button').count();
      console.log(`🔘 Found ${buttons} buttons`);
      
      // Try to click next button
      const nextButton = page.locator('button').filter({ hasText: /다음|Next/ }).first();
      const hasNextButton = await nextButton.count() > 0;
      
      if (hasNextButton) {
        await nextButton.click();
        console.log('✅ Clicked next button');
        
        // Wait and see what happens
        await page.waitForTimeout(10000);
        
        // Take screenshot after clicking
        await page.screenshot({ 
          path: 'dream-interpretation-after-next.png', 
          fullPage: true 
        });
        
        // Check for questions or loading
        const loading = await page.locator('.animate-spin').count();
        const questions = await page.locator('*').filter({ hasText: /질문|감정|어떠했나요/ }).count();
        
        console.log(`⏳ Loading spinners: ${loading}`);
        console.log(`❓ Question elements: ${questions}`);
        
        // If there are questions, try to answer them
        if (questions > 0) {
          console.log('✅ Questions appeared - attempting to answer');
          
          // Look for radio buttons or input fields
          const radios = await page.locator('input[type="radio"]').count();
          const newInputs = await page.locator('input[type="text"], textarea').count();
          
          console.log(`🔘 Radio buttons: ${radios}`);
          console.log(`📝 Input fields: ${newInputs}`);
          
          if (radios > 0) {
            // Click first radio option in each group
            const radioGroups = await page.locator('input[type="radio"]').all();
            const uniqueNames = new Set();
            
            for (const radio of radioGroups) {
              const name = await radio.getAttribute('name');
              if (name && !uniqueNames.has(name)) {
                await radio.check();
                uniqueNames.add(name);
                console.log(`✅ Selected radio in group: ${name}`);
              }
            }
            
            // Take screenshot after answering
            await page.screenshot({ 
              path: 'dream-interpretation-answered.png', 
              fullPage: true 
            });
            
            // Look for interpretation button
            const interpretButton = page.locator('button').filter({ hasText: /해몽|해석|분석/ }).first();
            const hasInterpretButton = await interpretButton.count() > 0;
            
            if (hasInterpretButton) {
              await interpretButton.click();
              console.log('✅ Clicked interpretation button');
              
              // Wait for result
              await page.waitForTimeout(15000);
              
              // Take final screenshot
              await page.screenshot({ 
                path: 'dream-interpretation-result.png', 
                fullPage: true 
              });
              
              // Check for interpretation result
              const resultText = await page.locator('*').filter({ hasText: /해몽|해석|의미/ }).count();
              console.log(`📖 Interpretation result elements: ${resultText}`);
            }
          }
        }
      }
    }
    
    console.log('🎯 Test completed - check screenshots for results');
  });
});