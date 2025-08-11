const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Admin 페이지 방문 중...');
  
  try {
    // Admin 페이지로 이동
    await page.goto('https://test-studio-firebase.vercel.app/admin', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForTimeout(3000);

    // 전체 페이지 스크린샷
    await page.screenshot({ 
      path: 'admin-page-full.png',
      fullPage: true 
    });
    console.log('전체 페이지 스크린샷 저장: admin-page-full.png');

    // 개발 모드 메시지 확인
    const devModeMessage = await page.locator('text=/개발 모드|Development Mode|Dev Mode/i').count();
    if (devModeMessage > 0) {
      console.log('⚠️ 개발 모드 메시지가 표시되고 있습니다.');
      const devModeElement = page.locator('text=/개발 모드|Development Mode|Dev Mode/i').first();
      await devModeElement.screenshot({ path: 'dev-mode-message.png' });
    } else {
      console.log('✅ 개발 모드 메시지가 표시되지 않습니다.');
    }

    // 실시간 모니터링 섹션 확인
    const monitoringSection = await page.locator('h2:has-text("실시간 모니터링")').count();
    if (monitoringSection > 0) {
      console.log('✅ 실시간 모니터링 섹션이 존재합니다.');
      
      // 차트나 그래프 확인
      const charts = await page.locator('canvas, .recharts-wrapper, [class*="chart"]').count();
      console.log(`  - 차트/그래프 개수: ${charts}개`);
      
      if (charts > 0) {
        await page.locator('h2:has-text("실시간 모니터링")').first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        await page.screenshot({ 
          path: 'monitoring-section.png',
          clip: {
            x: 0,
            y: 200,
            width: 1920,
            height: 600
          }
        });
        console.log('  - 모니터링 섹션 스크린샷 저장: monitoring-section.png');
      }
    }

    // 사용 통계 섹션 확인
    const statsSection = await page.locator('h2:has-text("사용 통계")').count();
    if (statsSection > 0) {
      console.log('✅ 사용 통계 섹션이 존재합니다.');
      
      // 통계 카드나 데이터 확인
      const statCards = await page.locator('[class*="stat"], [class*="card"], [class*="metric"]').count();
      console.log(`  - 통계 카드 개수: ${statCards}개`);
      
      if (statCards > 0) {
        await page.locator('h2:has-text("사용 통계")').first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        await page.screenshot({ 
          path: 'stats-section.png',
          clip: {
            x: 0,
            y: 800,
            width: 1920,
            height: 600
          }
        });
        console.log('  - 통계 섹션 스크린샷 저장: stats-section.png');
      }
    }

    // 실제 데이터 확인
    console.log('\n데이터 표시 상태 확인:');
    
    // 숫자 데이터 찾기
    const numbers = await page.locator('text=/[0-9]+/').allTextContents();
    const hasRealData = numbers.some(num => parseInt(num) > 0);
    
    if (hasRealData) {
      console.log('✅ 실제 데이터가 표시되고 있습니다.');
      console.log(`  - 발견된 숫자 데이터: ${numbers.slice(0, 10).join(', ')}...`);
    } else {
      console.log('⚠️ 실제 데이터가 표시되지 않거나 모두 0입니다.');
    }

    // 로딩 상태나 에러 메시지 확인
    const loadingElements = await page.locator('text=/로딩|Loading|불러오는 중/i').count();
    const errorElements = await page.locator('text=/에러|Error|오류/i').count();
    
    if (loadingElements > 0) {
      console.log('⚠️ 로딩 중인 요소가 있습니다.');
    }
    if (errorElements > 0) {
      console.log('❌ 에러 메시지가 표시되고 있습니다.');
    }

    // 페이지 콘솔 로그 확인
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('콘솔 에러:', msg.text());
      }
    });

    // 네트워크 요청 확인 (Firebase 관련)
    page.on('response', response => {
      const url = response.url();
      if (url.includes('firebase') || url.includes('firestore')) {
        console.log(`Firebase 요청: ${response.status()} - ${url.substring(0, 100)}...`);
      }
    });

    // 잠시 대기하여 네트워크 활동 관찰
    await page.waitForTimeout(5000);

    // 최종 상태 스크린샷
    await page.screenshot({ 
      path: 'admin-final-state.png',
      fullPage: false 
    });
    console.log('\n최종 상태 스크린샷 저장: admin-final-state.png');

  } catch (error) {
    console.error('페이지 확인 중 오류 발생:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  }

  // 브라우저를 열어둔 상태로 10초 대기
  console.log('\n브라우저를 10초간 열어둡니다...');
  await page.waitForTimeout(10000);

  await browser.close();
  console.log('검사 완료');
})();