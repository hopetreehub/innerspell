const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // 개발자 도구 열기
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 모든 네트워크 요청 추적
  const networkRequests = [];
  
  page.on('request', request => {
    const url = request.url();
    if (url.includes('localhost:4000') && !url.includes('_next/') && !url.includes('.png') && !url.includes('.jpg')) {
      console.log(`[REQUEST] ${request.method()} ${url}`);
      networkRequests.push({
        method: request.method(),
        url: url,
        headers: request.headers(),
        postData: request.postData()
      });
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('localhost:4000') && !url.includes('_next/') && !url.includes('.png') && !url.includes('.jpg')) {
      console.log(`[RESPONSE] ${response.status()} ${url}`);
      
      // API 응답 상세 정보
      if (response.status() >= 400 || url.includes('api/')) {
        try {
          const body = await response.text();
          console.log(`[BODY] ${body.substring(0, 500)}`);
        } catch (e) {
          console.log('[BODY] Could not read response body');
        }
      }
    }
  });
  
  // 콘솔 로그
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });
  
  try {
    console.log('=== 타로 API 디버깅 ===\n');
    
    // 1. 페이지 접속
    console.log('1. 페이지 접속...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    // 2. 간단한 플로우 실행
    console.log('\n2. 타로 리딩 플로우 실행...');
    
    // 질문 입력
    await page.fill('textarea', '테스트 질문입니다');
    
    // 카드 섞기
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(2000);
    
    // 카드 펼치기
    try {
      await page.click('button:has-text("카드 펼치기")');
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('카드 펼치기 버튼 없음');
    }
    
    // 카드 3장 선택
    const cards = await page.$$('div[role="button"][aria-label*="카드"]');
    for (let i = 0; i < 3 && i < cards.length; i++) {
      await cards[i].click({ force: true });
      await page.waitForTimeout(500);
    }
    
    console.log('\n3. AI 해석 받기 클릭...');
    
    // 네트워크 요청 초기화
    networkRequests.length = 0;
    
    // AI 해석 버튼 클릭
    await page.click('button:has-text("AI 해석 받기")');
    
    // 30초 대기
    console.log('30초 동안 네트워크 활동 모니터링...');
    await page.waitForTimeout(30000);
    
    // 네트워크 요청 분석
    console.log('\n=== 네트워크 요청 분석 ===');
    const apiRequests = networkRequests.filter(req => 
      req.url.includes('api/') || 
      req.url.includes('generate') || 
      req.url.includes('tarot')
    );
    
    if (apiRequests.length > 0) {
      apiRequests.forEach(req => {
        console.log(`\n${req.method} ${req.url}`);
        if (req.postData) {
          console.log('POST Data:', req.postData.substring(0, 200));
        }
      });
    } else {
      console.log('API 요청이 감지되지 않았습니다.');
    }
    
    // 현재 페이지 상태 확인
    console.log('\n=== 현재 페이지 상태 ===');
    
    // 버튼 상태
    const interpretButton = await page.$('button:has-text("해석 중")');
    if (interpretButton) {
      console.log('버튼 상태: 해석 중...');
    } else {
      const aiButton = await page.$('button:has-text("AI 해석")');
      if (aiButton) {
        const buttonText = await aiButton.textContent();
        console.log(`버튼 텍스트: ${buttonText}`);
      }
    }
    
    // 오류 메시지 확인
    const errorElements = await page.$$('[role="alert"], .error, .toast-error');
    if (errorElements.length > 0) {
      console.log('\n오류 메시지:');
      for (const el of errorElements) {
        const text = await el.textContent();
        if (text) console.log(`- ${text}`);
      }
    }
    
    // 스크린샷
    await page.screenshot({ path: 'api-debug.png', fullPage: true });
    
    console.log('\n브라우저를 닫으려면 Ctrl+C를 누르세요.');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('테스트 오류:', error);
  } finally {
    await browser.close();
  }
})();