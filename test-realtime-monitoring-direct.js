const { chromium } = require('playwright');

async function testRealtimeMonitoringDirect() {
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    page = await context.newPage();
    
    // Step 1: 관리자 페이지로 바로 이동
    console.log('👤 Navigating directly to admin page...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Step 2: 실시간 모니터링 탭 클릭
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
      console.log('\n📊 Real-time Statistics:');
      
      // 활성 사용자
      const activeUsersElement = await page.$('text=활성 사용자 >> xpath=../.. >> .text-2xl');
      if (activeUsersElement) {
        const activeUsers = await activeUsersElement.textContent();
        console.log(`   - Active Users: ${activeUsers}`);
      }
      
      // 활성 세션
      const activeSessionsElement = await page.$('text=활성 세션 >> xpath=../.. >> .text-2xl');
      if (activeSessionsElement) {
        const activeSessions = await activeSessionsElement.textContent();
        console.log(`   - Active Sessions: ${activeSessions}`);
      }
      
      // 오늘 리딩
      const todayReadingsElement = await page.$('text=오늘 리딩 >> xpath=../.. >> .text-2xl');
      if (todayReadingsElement) {
        const todayReadings = await todayReadingsElement.textContent();
        console.log(`   - Today Readings: ${todayReadings}`);
      }
      
      // 평균 응답시간
      const avgResponseElement = await page.$('text=평균 응답시간 >> xpath=../.. >> .text-2xl');
      if (avgResponseElement) {
        const avgResponse = await avgResponseElement.textContent();
        console.log(`   - Average Response Time: ${avgResponse}`);
      }
      
      // 시스템 상태 확인
      const systemStatusBadge = await page.$('text=시스템');
      if (systemStatusBadge) {
        const systemStatus = await systemStatusBadge.textContent();
        console.log(`   - System Status: ${systemStatus}`);
      }
      
      // Mock 데이터 배지 확인
      const mockDataBadge = await page.$('text=Mock 데이터');
      if (mockDataBadge) {
        console.log('   - ⚠️ Mock data mode is active');
      }
      
      // 자동 새로고침 테스트
      console.log('\n⏱️ Testing auto-refresh (waiting 6 seconds)...');
      await page.waitForTimeout(6000);
      
      await page.screenshot({ 
        path: 'screenshots/realtime-monitoring-2-refreshed.png',
        fullPage: true
      });
      console.log('📸 Screenshot captured: realtime-monitoring-2-refreshed.png');
      
      // 새로고침 간격 변경 테스트
      console.log('\n⚙️ Testing refresh interval change...');
      const intervalSelect = await page.$('select');
      if (intervalSelect) {
        await intervalSelect.selectOption('1000'); // 1초로 변경
        console.log('   - Changed refresh interval to 1 second');
        await page.waitForTimeout(3000);
      }
      
      // 수동 새로고침 테스트
      console.log('\n🔄 Testing manual refresh...');
      const refreshButton = await page.$('button:has-text("새로고침")');
      if (refreshButton) {
        await refreshButton.click();
        console.log('   - Manual refresh clicked');
        await page.waitForTimeout(2000);
      }
      
      // 활성 세션 목록 확인
      console.log('\n📋 Checking active sessions list...');
      const sessionsList = await page.$('text=활성 세션 >> xpath=../.. >> text=현재 페이지');
      if (sessionsList) {
        console.log('   - Active sessions list is visible');
        const sessionCount = await page.$$('text=현재 페이지').then(els => els.length);
        console.log(`   - Found ${sessionCount} active sessions`);
      } else {
        const noSessionsText = await page.$('text=현재 활성 세션이 없습니다');
        if (noSessionsText) {
          console.log('   - No active sessions currently');
        }
      }
      
      // 실시간 활동 스트림 확인
      console.log('\n📡 Checking real-time activity stream...');
      const activityStream = await page.$('text=실시간 활동 스트림');
      if (activityStream) {
        console.log('   - Activity stream section found');
        
        const connectionStatus = await page.$('text=연결됨');
        if (connectionStatus) {
          console.log('   - ✅ Stream is connected');
        } else {
          console.log('   - ❌ Stream is disconnected');
        }
      }
      
      // 시스템 성능 대시보드로 스크롤
      console.log('\n📊 Scrolling to system performance dashboard...');
      const performanceSection = await page.$('text=시스템 성능 대시보드');
      if (performanceSection) {
        await performanceSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        // 성능 메트릭 확인
        const cpuUsage = await page.$('text=CPU 사용률 >> xpath=../.. >> text=%');
        if (cpuUsage) {
          const cpu = await cpuUsage.textContent();
          console.log(`   - CPU Usage: ${cpu}`);
        }
        
        const memoryUsage = await page.$('text=메모리 사용률 >> xpath=../.. >> text=%');
        if (memoryUsage) {
          const memory = await memoryUsage.textContent();
          console.log(`   - Memory Usage: ${memory}`);
        }
        
        await page.screenshot({ 
          path: 'screenshots/realtime-monitoring-3-performance.png',
          fullPage: true
        });
        console.log('📸 Screenshot captured: realtime-monitoring-3-performance.png');
      }
      
      // 알림 설정 테스트
      console.log('\n🔔 Testing notification settings...');
      const alertButton = await page.$('button:has-text("알림")');
      if (alertButton) {
        const alertText = await alertButton.textContent();
        console.log(`   - Current alert status: ${alertText}`);
        
        await alertButton.click();
        await page.waitForTimeout(1000);
        
        const newAlertText = await alertButton.textContent();
        console.log(`   - New alert status: ${newAlertText}`);
      }
      
      // 자동 새로고침 토글 테스트
      console.log('\n🔄 Testing auto-refresh toggle...');
      const autoRefreshButton = await page.$('button:has-text("자동 새로고침")');
      if (autoRefreshButton) {
        const refreshText = await autoRefreshButton.textContent();
        console.log(`   - Current auto-refresh: ${refreshText}`);
        
        await autoRefreshButton.click();
        await page.waitForTimeout(1000);
        
        const newRefreshText = await autoRefreshButton.textContent();
        console.log(`   - New auto-refresh: ${newRefreshText}`);
      }
      
      // 최종 스크린샷
      await page.screenshot({ 
        path: 'screenshots/realtime-monitoring-4-final.png',
        fullPage: true
      });
      console.log('📸 Screenshot captured: realtime-monitoring-4-final.png');
    } else {
      console.log('❌ Real-time monitoring tab not found');
    }
    
    // Step 3: 데이터 파일 확인
    console.log('\n📁 Checking data files...');
    const fs = require('fs');
    const path = require('path');
    
    const dataDir = path.join(process.cwd(), 'data');
    if (fs.existsSync(dataDir)) {
      console.log('✅ Data directory exists');
      
      const files = fs.readdirSync(dataDir);
      console.log(`   Found ${files.length} files:`);
      files.forEach(file => {
        const stats = fs.statSync(path.join(dataDir, file));
        console.log(`   - ${file} (${stats.size} bytes)`);
      });
    } else {
      console.log('❌ Data directory not found');
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
testRealtimeMonitoringDirect();