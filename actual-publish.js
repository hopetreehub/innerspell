const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 500 
  });
  const page = await browser.newPage();
  
  try {
    console.log('=== ACTUALLY PUBLISHING THE POST ===');
    
    // Step 1: Navigate to blog management
    console.log('Step 1: Going to blog management...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    await page.click('text=블로그 관리');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '/tmp/before-status-change.png', fullPage: true });
    console.log('Before status change screenshot taken');
    
    // Step 2: Find the tarot post and click its status
    console.log('Step 2: Finding and clicking the status button...');
    
    // Find the row containing the tarot post
    const tarotRow = page.locator('tr:has-text("타로카드")').first();
    
    if (await tarotRow.isVisible()) {
      console.log('✓ Found tarot post row');
      
      // Find the status button in that row - look for the purple "미게시" button
      const statusButton = tarotRow.locator('button:has-text("미게시")').or(
        tarotRow.locator('.status-badge').or(
        tarotRow.locator('[class*="badge"]:has-text("미게시")')
      ));
      
      if (await statusButton.isVisible()) {
        console.log('✓ Found status button, clicking...');
        await statusButton.click();
        await page.waitForTimeout(1000);
        
        // Look for dropdown or modal with publish option
        const publishOptions = [
          'text=발행',
          'text=게시',
          'text=Published', 
          'option[value="published"]',
          'button:has-text("발행")'
        ];
        
        for (let option of publishOptions) {
          try {
            const publishElement = page.locator(option).first();
            if (await publishElement.isVisible({ timeout: 2000 })) {
              console.log(`✓ Found publish option: ${option}`);
              await publishElement.click();
              await page.waitForTimeout(1000);
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        // Check if there's a save button
        const saveButtons = [
          'button:has-text("저장")',
          'button:has-text("Save")',
          'button[type="submit"]'
        ];
        
        for (let saveBtn of saveButtons) {
          try {
            const saveElement = page.locator(saveBtn).first();
            if (await saveElement.isVisible({ timeout: 2000 })) {
              console.log(`✓ Found save button: ${saveBtn}`);
              await saveElement.click();
              await page.waitForTimeout(2000);
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
      } else {
        // Try clicking on edit button if status button not directly clickable
        console.log('Status button not found, trying edit approach...');
        const editButton = tarotRow.locator('button').filter({ hasText: /edit|편집|수정/ }).first();
        
        if (await editButton.isVisible({ timeout: 3000 })) {
          console.log('✓ Found edit button');
          await editButton.click();
          await page.waitForLoadState('networkidle');
          
          // In edit mode, look for status field
          const statusField = page.locator('select').filter({ hasText: /status|상태/ }).or(
            page.locator('input[type="checkbox"]').or(
            page.locator('[name*="status"]').or(
            page.locator('[name*="published"]')
          )));
          
          if (await statusField.isVisible({ timeout: 3000 })) {
            console.log('✓ Found status field in edit mode');
            
            // Try to set to published
            if (await statusField.getAttribute('type') === 'checkbox') {
              await statusField.check();
            } else {
              await statusField.selectOption('published');
            }
            
            // Save changes
            const saveBtn = page.locator('button:has-text("저장")').or(
              page.locator('button:has-text("Save")').or(
              page.locator('button[type="submit"]')
            )).first();
            
            if (await saveBtn.isVisible({ timeout: 3000 })) {
              await saveBtn.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      }
      
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/after-status-change.png', fullPage: true });
      console.log('After status change screenshot taken');
      
    } else {
      console.log('✗ Could not find tarot post row');
    }
    
    // Step 3: Refresh and verify
    console.log('Step 3: Refreshing to verify change...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '/tmp/status-verified.png', fullPage: true });
    console.log('Status verification screenshot taken');
    
    // Step 4: Check frontend
    console.log('Step 4: Checking frontend blog...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: '/tmp/final-frontend-check.png', fullPage: true });
    console.log('Final frontend screenshot taken');
    
    // Look for published content
    const content = await page.textContent('body');
    if (content.includes('타로카드') || content.includes('AI 시대')) {
      console.log('✓ SUCCESS! Post is now visible on frontend');
      
      // Try to click on the post
      const postLink = page.locator('a:has-text("타로카드")').or(
        page.locator('a:has-text("AI 시대")').or(
        page.locator('[href*="blog/"]:has-text("타로카드")')
      )).first();
      
      if (await postLink.isVisible({ timeout: 5000 })) {
        console.log('✓ Found post link, clicking...');
        await postLink.click();
        await page.waitForLoadState('networkidle');
        
        await page.screenshot({ path: '/tmp/final-article-view.png', fullPage: true });
        console.log('Final article view screenshot taken');
      }
    } else {
      console.log('✗ Post still not visible on frontend');
    }
    
    console.log('=== PUBLISHING COMPLETE ===');
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: '/tmp/publish-error.png', fullPage: true });
  } finally {
    console.log('Browser staying open...');
  }
})();