const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('실시간 모니터링 잔여 목업 데이터 확인 중...\n');
    
    // 관리자 대시보드로 이동
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // 실시간 모니터링 탭 클릭
    const tabs = await page.locator('button[role="tab"]').all();
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text && text.includes('실시간 모니터링')) {
        await tab.click();
        break;
      }
    }
    
    await page.waitForTimeout(3000);
    
    console.log('=== 실시간 통계 카드 값 확인 ===');
    
    // 모든 통계 카드 확인
    const statCards = [
      { label: '활성 사용자', selector: 'text=/활성 사용자/' },
      { label: '활성 세션', selector: 'text=/활성 세션/' },
      { label: '오늘 리딩', selector: 'text=/오늘 리딩/' },
      { label: '평균 응답시간', selector: 'text=/평균 응답시간/' },
      { label: '오류율', selector: 'text=/오류율/' },
      { label: '처리량', selector: 'text=/처리량/' }
    ];
    
    for (const card of statCards) {
      const cardElement = await page.locator(card.selector).locator('..').locator('..').first();
      const value = await cardElement.locator('.text-2xl').textContent().catch(() => 'N/A');
      console.log(`${card.label}: ${value}`);
      
      // 0이 아닌 값 확인
      if (value !== 'N/A' && value !== '0' && !value.includes('0ms') && !value.includes('0%')) {
        console.log(`  ⚠️  목업 데이터 의심: ${value}`);
      }
    }
    
    console.log('\n=== 시스템 성능 메트릭 확인 ===');
    
    // 성능 메트릭 값 확인
    const performanceMetrics = [
      { label: 'CPU 사용률', pattern: /CPU 사용률.*?(\d+)%/ },
      { label: '메모리 사용률', pattern: /메모리 사용률.*?(\d+)%/ },
      { label: 'API 응답시간', pattern: /API 응답시간.*?(\d+)ms/ }
    ];
    
    const pageText = await page.textContent('body');
    
    for (const metric of performanceMetrics) {
      const match = pageText.match(metric.pattern);
      if (match) {
        const value = match[1];
        console.log(`${metric.label}: ${value}`);
        if (parseInt(value) > 0) {
          console.log(`  ⚠️  목업 데이터 의심: ${value}`);
        }
      }
    }
    
    console.log('\n=== 상세 성능 지표 확인 ===');
    
    // 상세 성능 지표 섹션 찾기
    const detailMetrics = await page.locator('text=/상세 성능 지표/').locator('..').locator('..').first();
    const detailValues = await detailMetrics.locator('.font-medium').allTextContents();
    const detailLabels = ['오늘 총 요청', '성공률', '평균 세션 시간', '최대 동시 사용자'];
    
    detailValues.forEach((value, index) => {
      if (detailLabels[index]) {
        console.log(`${detailLabels[index]}: ${value}`);
        if (value !== '0' && value !== '0%' && value !== '0분' && !value.includes('100%')) {
          console.log(`  ⚠️  목업 데이터 의심: ${value}`);
        }
      }
    });
    
    console.log('\n=== 차트 데이터 확인 ===');
    
    // 시간별 응답시간 차트 확인
    const hourlyChartExists = await page.locator('text=/시간별 응답시간/').isVisible().catch(() => false);
    console.log('시간별 응답시간 차트:', hourlyChartExists ? '존재' : '없음');
    
    // 엔드포인트 사용량 확인
    const endpointChartExists = await page.locator('text=/엔드포인트별 요청/').isVisible().catch(() => false);
    console.log('엔드포인트별 요청 차트:', endpointChartExists ? '존재' : '없음');
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'realtime-monitoring-mockdata-check.png',
      fullPage: true 
    });
    console.log('\n스크린샷 저장: realtime-monitoring-mockdata-check.png');
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await browser.close();
  }
})();