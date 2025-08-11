const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ko-KR'
  });
  
  const page = await context.newPage();
  
  // 콘솔 메시지 수집
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  // 페이지 에러 수집
  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push({
      message: err.message,
      stack: err.stack
    });
  });
  
  // 네트워크 요청 모니터링
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      method: request.method(),
      failure: request.failure()
    });
  });
  
  try {
    console.log('1. 타로 리딩 페이지 열기...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(2000);
    
    console.log('2. 질문 입력하기...');
    const questionInput = await page.locator('textarea[placeholder*="질문"]').first();
    await questionInput.fill('나의 미래는 어떻게 될까요?');
    
    console.log('3. 카드 섞기 버튼 클릭...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    await shuffleButton.click();
    
    // 카드 섞기 애니메이션 대기
    await page.waitForTimeout(2000);
    
    console.log('4. 카드 3장 선택하기...');
    // 카드 선택 가능 상태 확인
    await page.waitForSelector('.card-item', { state: 'visible' });
    
    // 첫 3장의 카드 선택
    const cards = await page.locator('.card-item').all();
    console.log(`발견된 카드 수: ${cards.length}`);
    
    for (let i = 0; i < 3 && i < cards.length; i++) {
      await cards[i].click();
      await page.waitForTimeout(500); // 각 선택 사이 대기
    }
    
    console.log('5. AI 해석 받기 버튼 클릭...');
    const interpretButton = await page.locator('button:has-text("AI 해석 받기")').first();
    await interpretButton.click();
    
    console.log('6. 응답 대기 및 오류 확인...');
    // 오류 메시지나 성공 메시지 대기
    await page.waitForTimeout(5000);
    
    // 오류 메시지 확인
    const errorMessages = await page.locator('[role="alert"], .error, .alert-danger, .text-red-500').all();
    console.log(`발견된 오류 메시지 수: ${errorMessages.length}`);
    
    for (const errorEl of errorMessages) {
      const errorText = await errorEl.textContent();
      console.log(`오류 메시지: ${errorText}`);
    }
    
    // 스크린샷 캡처
    console.log('7. 스크린샷 캡처...');
    await page.screenshot({ 
      path: 'error-reproduction.png',
      fullPage: true 
    });
    
    // 콘솔 로그 출력
    console.log('\n=== 브라우저 콘솔 로그 ===');
    consoleLogs.forEach(log => {
      console.log(`[${log.type}] ${log.text}`);
      if (log.location) {
        console.log(`  위치: ${log.location.url}:${log.location.lineNumber}`);
      }
    });
    
    // 페이지 에러 출력
    if (pageErrors.length > 0) {
      console.log('\n=== 페이지 에러 ===');
      pageErrors.forEach(err => {
        console.log(`에러: ${err.message}`);
        if (err.stack) {
          console.log(`스택: ${err.stack}`);
        }
      });
    }
    
    // 실패한 네트워크 요청 출력
    if (failedRequests.length > 0) {
      console.log('\n=== 실패한 네트워크 요청 ===');
      failedRequests.forEach(req => {
        console.log(`URL: ${req.url}`);
        console.log(`메소드: ${req.method}`);
        console.log(`실패 원인: ${req.failure?.errorText || '알 수 없음'}`);
      });
    }
    
    // 네트워크 탭 정보 수집
    console.log('\n=== API 호출 분석 ===');
    const apiCalls = [];
    page.on('response', response => {
      if (response.url().includes('/api/') || response.url().includes('functions')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // 추가 대기 시간
    await page.waitForTimeout(3000);
    
    // API 호출 결과 출력
    apiCalls.forEach(call => {
      console.log(`API: ${call.url}`);
      console.log(`상태: ${call.status} ${call.statusText}`);
    });
    
    // 브라우저 열어둔 채로 대기
    console.log('\n테스트 완료. 브라우저를 닫으려면 Ctrl+C를 누르세요.');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'error-reproduction.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();