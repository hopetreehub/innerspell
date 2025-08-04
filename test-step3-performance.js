const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('⚡ 3단계: 성능 API 오류 해결 확인\n');
    
    // 홈페이지로 이동하여 성능 API 호출 확인
    await page.goto('http://localhost:4000', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('✅ 홈페이지 로드 완료');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForTimeout(5000);
    
    // 네트워크 로그 확인
    const performanceRequests = [];
    page.on('response', response => {
      if (response.url().includes('/api/analytics/performance')) {
        performanceRequests.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // 페이지를 다시 로드하여 성능 API 호출 확인
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    console.log('🔍 성능 API 호출 상태:');
    if (performanceRequests.length === 0) {
      console.log('  - 성능 API 호출 없음 (개발 환경에서 정상적으로 비활성화됨)');
    } else {
      performanceRequests.forEach((req, i) => {
        console.log(`  ${i+1}. ${req.url}`);
        console.log(`     상태: ${req.status} ${req.statusText}`);
      });
    }
    
    // 수동으로 성능 API 테스트
    console.log('\n🧪 성능 API 수동 테스트:');
    
    const testResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/analytics/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metrics: [],
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: Date.now(),
          }),
        });
        
        const data = await response.json();
        return {
          status: response.status,
          data: data
        };
      } catch (error) {
        return {
          status: 'error',
          error: error.message
        };
      }
    });
    
    console.log('  - 테스트 응답:');
    console.log(`    상태: ${testResponse.status}`);
    console.log(`    데이터:`, testResponse.data || testResponse.error);
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'step3-performance-fixed.png', 
      fullPage: true 
    });
    
    console.log('\n📊 결과: step3-performance-fixed.png 저장');
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
  } finally {
    await browser.close();
  }
})();