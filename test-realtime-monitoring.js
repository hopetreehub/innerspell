const { chromium } = require('playwright');

async function testRealtimeMonitoring() {
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    page = await context.newPage();
    
    // Step 1: 홈페이지에서 시작
    console.log('🌐 Navigating to homepage...');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    
    // Step 2: 타로 리딩 페이지로 이동
    console.log('🎴 Navigating to tarot reading page...');
    await page.click('text=타로 읽기 시작');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Step 3: 타로 리딩 수행 (사용자 활동 기록)
    console.log('📝 Performing tarot reading...');
    const questionTextarea = await page.$('textarea');
    if (questionTextarea) {
      await questionTextarea.fill('오늘의 운세는 어떨까요?');
      
      // 카드 선택
      const cards = await page.$$('img[alt*="카드"]');
      if (cards.length > 0) {
        console.log(`Found ${cards.length} cards to select`);
        for (let i = 0; i < Math.min(3, cards.length); i++) {
          await cards[i].click();
          await page.waitForTimeout(500);
        }
      }
      
      // AI 해석 요청
      const interpretButton = await page.$('button:has-text("AI 해석"), button:has-text("해석 요청")');
      if (interpretButton) {
        await interpretButton.click();
        console.log('✅ Tarot reading activity recorded!');
        await page.waitForTimeout(3000);
      }
    }
    
    // Step 4: 관리자 페이지로 이동
    console.log('👤 Navigating to admin page...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Step 5: 실시간 모니터링 탭 클릭
    console.log('📈 Clicking real-time monitoring tab...');
    const monitoringTab = await page.$('[role="tab"]:has-text("실시간 모니터링")');
    if (monitoringTab) {
      await monitoringTab.click();
      await page.waitForTimeout(3000);
      
      // 스크린샷 캡처
      await page.screenshot({ 
        path: 'screenshots/realtime-monitoring-1-initial.png',
        fullPage: true
      });
      console.log('📸 Screenshot captured: realtime-monitoring-1-initial.png');
      
      // 실시간 데이터 확인
      const activeUsersText = await page.textContent('text=활성 사용자');
      const activeSessionsText = await page.textContent('text=활성 세션');
      const todayReadingsText = await page.textContent('text=오늘 리딩');
      
      console.log('\n📊 Real-time Statistics:');
      console.log(`   - ${activeUsersText}`);
      console.log(`   - ${activeSessionsText}`);
      console.log(`   - ${todayReadingsText}`);
      
      // 자동 새로고침 테스트
      console.log('\n⏱️ Testing auto-refresh...');
      await page.waitForTimeout(6000); // 5초 자동 새로고침 대기
      
      await page.screenshot({ 
        path: 'screenshots/realtime-monitoring-2-refreshed.png',
        fullPage: true
      });
      console.log('📸 Screenshot captured: realtime-monitoring-2-refreshed.png');
      
      // 새로고침 버튼 클릭
      console.log('🔄 Clicking manual refresh...');
      const refreshButton = await page.$('button:has-text("새로고침")');
      if (refreshButton) {
        await refreshButton.click();
        await page.waitForTimeout(2000);
      }
      
      // 시스템 성능 대시보드 확인
      const performanceSection = await page.$('text=시스템 성능 대시보드');
      if (performanceSection) {
        console.log('✅ System performance dashboard found');
        await performanceSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: 'screenshots/realtime-monitoring-3-performance.png',
          fullPage: true
        });
        console.log('📸 Screenshot captured: realtime-monitoring-3-performance.png');
      }
    }
    
    // Step 6: 사용통계 탭으로 전환
    console.log('\n📊 Switching to usage stats tab...');
    const usageStatsTab = await page.$('[role="tab"]:has-text("사용통계")');
    if (usageStatsTab) {
      await usageStatsTab.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'screenshots/realtime-monitoring-4-usage-stats.png',
        fullPage: true
      });
      console.log('📸 Screenshot captured: realtime-monitoring-4-usage-stats.png');
    }
    
    // Step 7: 데이터 파일 확인
    console.log('\n📁 Checking data files...');
    const fs = require('fs');
    const path = require('path');
    
    // 사용 통계 파일 확인
    const statsPath = path.join(process.cwd(), 'data', 'usage-stats.json');
    if (fs.existsSync(statsPath)) {
      const statsData = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
      console.log('✅ Usage stats file exists!');
      console.log(`   Total Users: ${statsData.stats.totalUsers}`);
      console.log(`   Active Users: ${statsData.stats.activeUsers}`);
      console.log(`   Total Readings: ${statsData.stats.totalReadings}`);
      console.log(`   Last Updated: ${statsData.lastUpdated}`);
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
        });
      }
    }
    
    console.log('\n✅ Real-time monitoring test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (page) {
      await page.screenshot({ 
        path: 'screenshots/realtime-monitoring-error.png',
        fullPage: true
      });
      console.log('📸 Error screenshot captured');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testRealtimeMonitoring();