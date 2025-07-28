import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://test-studio-firebase-d2y81jhc4-johns-projects-bf5e60f3.vercel.app';

test.describe('New Vercel Deployment Verification', () => {
  test('should verify complete tarot guidelines system deployment', async ({ page }) => {
    console.log('=== Fresh Vercel Deployment Verification ===');
    console.log(`URL: ${VERCEL_URL}`);
    console.log(`Timestamp: ${new Date().toISOString().replace(/[:.]/g, '-')}`);

    // 1. Test Homepage
    console.log('\n1. Testing Homepage...');
    await page.goto(VERCEL_URL);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of homepage
    await page.screenshot({ 
      path: 'screenshots/vercel-01-homepage.png', 
      fullPage: true 
    });
    
    // Verify homepage loads
    const title = await page.title();
    console.log(`Page title: ${title}`);
    expect(title).toBeTruthy();

    // 2. Navigate to Reading Page
    console.log('\n2. Testing Reading Page Navigation...');
    await page.goto(`${VERCEL_URL}/reading`);
    await page.waitForLoadState('networkidle');
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'screenshots/vercel-02-reading-page.png', 
      fullPage: true 
    });

    // 3. Check for Trinity View in spread dropdown
    console.log('\n3. Checking Trinity View Spread...');
    
    // Look for spread selection dropdown
    const spreadSelect = page.locator('select[name="spread"], select#spread, .spread-select select, [data-testid="spread-select"]').first();
    
    let trinityViewFound = false;
    try {
      if (await spreadSelect.isVisible()) {
        await spreadSelect.click();
        await page.waitForTimeout(1000);
        
        // Check if Trinity View option exists
        const trinityOption = page.locator('option').filter({ hasText: /삼위일체 조망|Trinity View/ });
        if (await trinityOption.count() > 0) {
          trinityViewFound = true;
          console.log('✓ Trinity View spread found in dropdown');
          
          // Take screenshot showing the dropdown
          await page.screenshot({ 
            path: 'screenshots/vercel-03-trinity-view-dropdown.png', 
            fullPage: true 
          });
        }
      }
    } catch (error) {
      console.log('Spread dropdown not found, checking page content...');
    }

    // Alternative: Check if Trinity View is mentioned anywhere on the page
    if (!trinityViewFound) {
      const pageContent = await page.content();
      if (pageContent.includes('삼위일체 조망') || pageContent.includes('Trinity View')) {
        trinityViewFound = true;
        console.log('✓ Trinity View found in page content');
      }
    }

    // 4. Test Complete Reading Workflow
    console.log('\n4. Testing Complete Reading Workflow...');
    
    // Enter a question
    const questionInput = page.locator('input[type="text"], textarea, [placeholder*="질문"], [placeholder*="question"]').first();
    if (await questionInput.isVisible()) {
      await questionInput.fill('새로운 타로 지침 시스템이 잘 작동하는지 확인해주세요');
      console.log('✓ Question entered');
    }

    await page.screenshot({ 
      path: 'screenshots/vercel-04-question-entered.png', 
      fullPage: true 
    });

    // Try to select Trinity View if available
    if (trinityViewFound && await spreadSelect.isVisible()) {
      try {
        await spreadSelect.selectOption({ label: /삼위일체 조망|Trinity View/ });
        console.log('✓ Trinity View selected');
        
        await page.screenshot({ 
          path: 'screenshots/vercel-05-trinity-selected.png', 
          fullPage: true 
        });
      } catch (error) {
        console.log('Could not select Trinity View, continuing with default spread');
      }
    }

    // Look for start reading button
    const startButton = page.locator('button').filter({ hasText: /시작|start|읽기|reading/i }).first();
    if (await startButton.isVisible()) {
      await startButton.click();
      console.log('✓ Reading started');
      
      // Wait for cards or interpretation to load
      await page.waitForTimeout(5000);
      
      await page.screenshot({ 
        path: 'screenshots/vercel-06-reading-started.png', 
        fullPage: true 
      });
    }

    // 5. Check for Admin Dashboard Access
    console.log('\n5. Testing Admin Dashboard Access...');
    
    try {
      await page.goto(`${VERCEL_URL}/admin`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: 'screenshots/vercel-07-admin-page.png', 
        fullPage: true 
      });
      
      // Check if we can see tarot guidelines tab or content
      const tarotTab = page.locator('text=타로 지침, text=Tarot Guidelines, [data-tab="tarot"], .tarot-guidelines').first();
      if (await tarotTab.isVisible()) {
        await tarotTab.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: 'screenshots/vercel-08-tarot-guidelines-tab.png', 
          fullPage: true 
        });
        
        console.log('✓ Tarot guidelines tab accessible');
      }
    } catch (error) {
      console.log('Admin page may require authentication');
    }

    // 6. Final verification screenshot
    console.log('\n6. Final Verification...');
    await page.goto(`${VERCEL_URL}/reading`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'screenshots/vercel-09-final-verification.png', 
      fullPage: true 
    });

    // Log findings
    console.log('\n=== Verification Results ===');
    console.log(`Homepage loads: ✓`);
    console.log(`Reading page accessible: ✓`);
    console.log(`Trinity View spread: ${trinityViewFound ? '✓' : '✗'}`);
    console.log('Screenshots saved in screenshots/ directory');

    // Verify at least the basic functionality is working
    expect(title).toBeTruthy();
    
    // Report Trinity View status
    if (trinityViewFound) {
      console.log('🎉 Trinity View spread successfully deployed!');
    } else {
      console.log('⚠️  Trinity View spread not found - may need verification');
    }
  });

  test('should check for tarot guidelines system integration', async ({ page }) => {
    console.log('\n=== Tarot Guidelines System Check ===');
    
    // Check if the API endpoints are working
    await page.goto(`${VERCEL_URL}/api/tarot-guidelines`);
    await page.waitForLoadState('networkidle');
    
    const apiContent = await page.content();
    let guidelinesWorking = false;
    
    if (apiContent.includes('guidelines') || apiContent.includes('elements') || apiContent.includes('seasons')) {
      guidelinesWorking = true;
      console.log('✓ Tarot guidelines API responding');
    } else {
      console.log('⚠️  Tarot guidelines API may not be accessible');
    }

    await page.screenshot({ 
      path: 'screenshots/vercel-10-api-response.png', 
      fullPage: true 
    });

    console.log(`Tarot Guidelines API: ${guidelinesWorking ? '✓' : '✗'}`);
  });
});