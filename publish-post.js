const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    console.log('=== PUBLISHING THE BLOG POST ===');
    
    // Step 1: Navigate to admin and blog management
    console.log('Step 1: Navigating to blog management...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Click on 블로그 관리
    await page.click('text=블로그 관리');
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    
    await page.screenshot({ 
      path: '/tmp/before-publish.png',
      fullPage: true 
    });
    console.log('Screenshot: before-publish.png');
    
    // Step 2: Find the tarot post row
    console.log('Step 2: Finding the tarot post...');
    
    // Look for the row containing the tarot post
    const tarotRow = page.locator('tr:has-text("타로카드")').first();
    
    if (await tarotRow.isVisible({ timeout: 5000 })) {
      console.log('✓ Found the tarot post row');
      
      // Look for the status button/dropdown in that row
      const statusButton = tarotRow.locator('button:has-text("미게시")').or(
        tarotRow.locator('.status').or(
        tarotRow.locator('[data-status="unpublished"]').or(
        tarotRow.locator('select')
      )));
      
      if (await statusButton.isVisible({ timeout: 3000 })) {
        console.log('✓ Found status control, clicking to change...');
        await statusButton.click();
        await page.waitForTimeout(1000);
        
        // Look for publish option
        const publishOption = page.locator('text=발행').or(
          page.locator('text=게시').or(
          page.locator('text=Published')
        )).first();
        
        if (await publishOption.isVisible({ timeout: 3000 })) {
          console.log('✓ Found publish option, clicking...');
          await publishOption.click();
          await page.waitForTimeout(2000);
        }
      } else {
        console.log('Looking for edit button...');
        // Try to find an edit button
        const editButton = tarotRow.locator('button').or(tarotRow.locator('a[href*="edit"]')).first();
        
        if (await editButton.isVisible({ timeout: 3000 })) {
          console.log('✓ Found edit button, clicking...');
          await editButton.click();
          await page.waitForLoadState('networkidle', { timeout: 5000 });
          
          // In edit mode, look for publish controls
          const publishControl = page.locator('select').or(
            page.locator('input[type="checkbox"]').or(
            page.locator('button:has-text("발행")').or(
            page.locator('button:has-text("Publish")')
          )));
          
          if (await publishControl.isVisible({ timeout: 3000 })) {
            console.log('✓ Found publish control in edit mode');
            await publishControl.click();
            
            // Save the changes
            const saveButton = page.locator('button:has-text("저장")').or(
              page.locator('button:has-text("Save")').or(
              page.locator('button[type="submit"]')
            )).first();
            
            if (await saveButton.isVisible({ timeout: 3000 })) {
              console.log('✓ Saving changes...');
              await saveButton.click();
              await page.waitForLoadState('networkidle', { timeout: 5000 });
            }
          }
        }
      }
      
      // Take screenshot after attempting to publish
      await page.screenshot({ 
        path: '/tmp/after-publish-attempt.png',
        fullPage: true 
      });
      console.log('Screenshot: after-publish-attempt.png');
      
    } else {
      console.log('✗ Could not find the tarot post row');
    }
    
    // Step 3: Verify the status change
    console.log('Step 3: Verifying status change...');
    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    
    await page.screenshot({ 
      path: '/tmp/status-verification.png',
      fullPage: true 
    });
    console.log('Screenshot: status-verification.png');
    
    // Step 4: Check frontend
    console.log('Step 4: Checking frontend...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: '/tmp/frontend-after-publish.png',
      fullPage: true 
    });
    console.log('Screenshot: frontend-after-publish.png');
    
    // Look for the published post
    const publishedPost = page.locator('a:has-text("타로카드")').or(
      page.locator('a:has-text("AI 시대")').or(
      page.locator('[class*="post"]:has-text("타로카드")')
    ));
    
    if (await publishedPost.isVisible({ timeout: 5000 })) {
      console.log('✓ Found published post on frontend!');
      await publishedPost.click();
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      await page.screenshot({ 
        path: '/tmp/published-article-content.png',
        fullPage: true 
      });
      console.log('Screenshot: published-article-content.png');
    } else {
      console.log('✗ Post not yet visible on frontend');
    }
    
    console.log('=== PUBLISHING PROCESS COMPLETE ===');
    
  } catch (error) {
    console.error('Error during publishing:', error);
    await page.screenshot({ 
      path: '/tmp/publish-error.png',
      fullPage: true 
    });
  } finally {
    console.log('Browser will remain open for inspection...');
    // await browser.close();
  }
})();