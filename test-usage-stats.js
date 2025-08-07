const { chromium } = require('playwright');

async function captureScreenshot(page, name) {
  await page.screenshot({ 
    path: `screenshots/usage-stats-test-${name}.png`,
    fullPage: true
  });
  console.log(`📸 Screenshot captured: usage-stats-test-${name}.png`);
}

async function testUsageStats() {
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    page = await context.newPage();
    
    // Step 1: 타로 리딩 페이지로 이동
    console.log('🌐 Navigating to http://localhost:4000/reading...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    await captureScreenshot(page, '01-reading-page');
    
    // Step 2: 질문 입력
    console.log('📝 Entering question...');
    await page.fill('textarea[placeholder*="질문"]', '오늘의 운세는 어떨까요?');
    
    // Step 3: 카드 셔플
    console.log('🎴 Shuffling cards...');
    const shuffleButton = await page.$('button:has-text("카드 섞기")');
    if (shuffleButton) {
      await shuffleButton.click();
      await page.waitForTimeout(3000);
    }
    
    // Step 4: 스프레드에서 카드 선택
    console.log('🃏 Selecting cards...');
    const spreadCards = await page.$$('[alt="카드 뒷면"]');
    if (spreadCards.length >= 3) {
      // 3장 선택
      for (let i = 0; i < 3; i++) {
        await spreadCards[i].click();
        await page.waitForTimeout(500);
      }
    }
    
    await captureScreenshot(page, '02-cards-selected');
    
    // Step 5: 해석 요청
    console.log('🔮 Requesting interpretation...');
    const interpretButton = await page.$('button:has-text("AI 해석 받기")');
    if (interpretButton) {
      await interpretButton.click();
      console.log('✅ Tarot reading activity should be recorded!');
      await page.waitForTimeout(3000);
    }
    
    // Step 6: 블로그 페이지로 이동
    console.log('📚 Navigating to blog...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle');
    
    // Step 7: 블로그 포스트 클릭
    console.log('📖 Clicking blog post...');
    const firstPost = await page.$('article a');
    if (firstPost) {
      await firstPost.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Blog view activity should be recorded!');
      await captureScreenshot(page, '03-blog-post-view');
    }
    
    // Step 8: 관리자 페이지로 이동
    console.log('👤 Navigating to admin page...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // Step 9: 사용통계 탭 클릭
    console.log('📊 Clicking usage stats tab...');
    await page.click('[role="tab"]:has-text("사용통계")');
    await page.waitForTimeout(3000);
    
    await captureScreenshot(page, '04-usage-stats');
    
    // Step 10: 실시간 모니터링 탭 클릭
    console.log('📈 Clicking real-time monitoring tab...');
    await page.click('[role="tab"]:has-text("실시간 모니터링")');
    await page.waitForTimeout(2000);
    
    await captureScreenshot(page, '05-realtime-monitoring');
    
    // Step 11: 데이터 파일 확인
    console.log('\n📁 Checking data files...');
    const fs = require('fs');
    const path = require('path');
    
    // 사용 통계 파일 확인
    const statsPath = path.join(process.cwd(), 'data', 'usage-stats.json');
    if (fs.existsSync(statsPath)) {
      const statsData = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
      console.log('✅ Usage stats file exists!');
      console.log(`   Total Users: ${statsData.stats.totalUsers}`);
      console.log(`   Total Sessions: ${statsData.stats.totalSessions}`);
      console.log(`   Total Readings: ${statsData.stats.totalReadings}`);
      console.log(`   Active Users: ${statsData.stats.activeUsers}`);
      console.log(`   Last Updated: ${statsData.lastUpdated}`);
    } else {
      console.log('❌ Usage stats file not found');
    }
    
    // 사용자 활동 파일 확인
    const activitiesPath = path.join(process.cwd(), 'data', 'user-activities.json');
    if (fs.existsSync(activitiesPath)) {
      const activitiesData = JSON.parse(fs.readFileSync(activitiesPath, 'utf-8'));
      console.log('\n✅ User activities file exists!');
      console.log(`   Total Activities: ${activitiesData.activities.length}`);
      
      if (activitiesData.activities.length > 0) {
        console.log('\n   Recent Activities:');
        activitiesData.activities.slice(0, 5).forEach(activity => {
          console.log(`   - ${activity.action} by ${activity.userId} at ${activity.timestamp}`);
          if (activity.details) {
            console.log(`     Details: ${JSON.stringify(activity.details)}`);
          }
        });
      }
    } else {
      console.log('❌ User activities file not found');
    }
    
    console.log('\n✅ Usage stats test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (page) {
      await captureScreenshot(page, 'error-state');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testUsageStats();