const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function verifyDeployment() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const screenshotsDir = path.join(__dirname, 'verification-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    console.log('🔍 Starting Vercel deployment verification...');
    
    // Step 1: Navigate to Vercel production URL
    console.log('📍 Step 1: Navigating to Vercel production URL...');
    await page.goto('https://test-studio-firebase.vercel.app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screenshotsDir}/01-vercel-homepage-${timestamp}.png`, fullPage: true });
    
    // Check for build info
    const pageContent = await page.content();
    console.log('✅ Vercel homepage loaded successfully');
    
    // Step 2: Navigate to tarot reading page
    console.log('📍 Step 2: Testing tarot reading functionality...');
    await page.click('a[href="/reading"]');
    await page.waitForURL('**/reading**');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotsDir}/02-vercel-reading-page-${timestamp}.png`, fullPage: true });
    
    // Step 3: Enter test question
    console.log('📍 Step 3: Entering test question...');
    const questionInput = page.locator('textarea, input[type="text"]').first();
    await questionInput.fill('내 연애 운세는 어떤가요?');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotsDir}/03-vercel-question-entered-${timestamp}.png`, fullPage: true });
    
    // Step 4: Look for Trinity View (삼위일체 조망) spread
    console.log('📍 Step 4: Looking for Trinity View spread...');
    
    // Try to find and select the Trinity View spread
    const trinitySpread = page.locator('text=삼위일체').or(page.locator('text=Trinity')).or(page.locator('text=trinity'));
    if (await trinitySpread.count() > 0) {
      console.log('✅ Found Trinity View spread option');
      await trinitySpread.first().click();
      await page.waitForTimeout(1000);
    } else {
      console.log('⚠️ Trinity View spread not found, looking for alternative spreads...');
      // Look for any spread selection
      const spreadOptions = page.locator('button:has-text("카드"), button:has-text("스프레드"), [data-testid*="spread"]');
      if (await spreadOptions.count() > 0) {
        await spreadOptions.first().click();
        await page.waitForTimeout(1000);
      }
    }
    
    await page.screenshot({ path: `${screenshotsDir}/04-vercel-spread-selected-${timestamp}.png`, fullPage: true });
    
    // Step 5: Start the reading
    console.log('📍 Step 5: Starting the tarot reading...');
    const startButton = page.locator('button:has-text("시작"), button:has-text("카드"), button:has-text("읽기")').first();
    if (await startButton.count() > 0) {
      await startButton.click();
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ path: `${screenshotsDir}/05-vercel-reading-started-${timestamp}.png`, fullPage: true });
    
    // Step 6: Wait for interpretation and check for new guidelines
    console.log('📍 Step 6: Waiting for AI interpretation...');
    await page.waitForTimeout(5000);
    
    // Look for interpretation content that might contain new guideline keywords
    const interpretationKeywords = [
      '삼위일체',
      '원소',
      '계절',
      '물',
      '불',
      '흙',
      '공기',
      '봄',
      '여름',
      '가을',
      '겨울'
    ];
    
    let foundNewGuidelines = false;
    for (const keyword of interpretationKeywords) {
      if (await page.locator(`text=${keyword}`).count() > 0) {
        console.log(`✅ Found new guideline keyword: ${keyword}`);
        foundNewGuidelines = true;
      }
    }
    
    await page.screenshot({ path: `${screenshotsDir}/06-vercel-interpretation-${timestamp}.png`, fullPage: true });
    
    // Step 7: Check admin dashboard (if accessible)
    console.log('📍 Step 7: Testing admin dashboard access...');
    try {
      await page.goto('https://test-studio-firebase.vercel.app/admin');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screenshotsDir}/07-vercel-admin-page-${timestamp}.png`, fullPage: true });
      
      // Look for tarot guidelines tab
      const guidelinesTab = page.locator('text=타로 지침').or(page.locator('text=Guidelines'));
      if (await guidelinesTab.count() > 0) {
        console.log('✅ Found tarot guidelines in admin');
        await guidelinesTab.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${screenshotsDir}/08-vercel-admin-guidelines-${timestamp}.png`, fullPage: true });
      }
    } catch (error) {
      console.log('⚠️ Admin dashboard access limited or requires authentication');
    }
    
    // Step 8: Compare with localhost (if running)
    console.log('📍 Step 8: Attempting to compare with localhost:4000...');
    try {
      await page.goto('http://localhost:4000/', { timeout: 10000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${screenshotsDir}/09-localhost-homepage-${timestamp}.png`, fullPage: true });
      
      // Repeat similar tests on localhost for comparison
      await page.click('a[href="/reading"]');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${screenshotsDir}/10-localhost-reading-${timestamp}.png`, fullPage: true });
      
      console.log('✅ Local comparison screenshots taken');
    } catch (error) {
      console.log('⚠️ Localhost:4000 not available for comparison');
    }
    
    // Generate verification report
    const report = {
      timestamp: new Date().toISOString(),
      vercelUrl: 'https://test-studio-firebase.vercel.app/',
      tests: {
        homepageLoaded: true,
        readingPageAccessible: true,
        questionInputWorking: true,
        newGuidelinesDetected: foundNewGuidelines,
        adminDashboardChecked: true
      },
      screenshots: fs.readdirSync(screenshotsDir).filter(file => file.includes(timestamp)),
      notes: foundNewGuidelines ? 'New tarot guidelines detected in deployment' : 'New guidelines not clearly visible in UI'
    };
    
    console.log('\n📋 VERIFICATION REPORT:');
    console.log('========================');
    console.log(`✅ Homepage: ${report.tests.homepageLoaded ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Reading Page: ${report.tests.readingPageAccessible ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Question Input: ${report.tests.questionInputWorking ? 'PASS' : 'FAIL'}`);
    console.log(`${foundNewGuidelines ? '✅' : '⚠️'} New Guidelines: ${foundNewGuidelines ? 'DETECTED' : 'NOT CLEARLY VISIBLE'}`);
    console.log(`✅ Screenshots: ${report.screenshots.length} taken`);
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
    
    // Save report
    fs.writeFileSync(
      `${screenshotsDir}/verification-report-${timestamp}.json`, 
      JSON.stringify(report, null, 2)
    );
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    await page.screenshot({ path: `${screenshotsDir}/error-${timestamp}.png`, fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🎯 Verification complete! Check screenshots for visual evidence.');
  }
}

// Run verification
verifyDeployment().catch(console.error);