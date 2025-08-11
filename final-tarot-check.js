const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 모든 콘솔 메시지 캡처
  const consoleLogs = [];
  page.on('console', msg => {
    const logEntry = `[${msg.type()}] ${msg.text()}`;
    console.log(logEntry);
    consoleLogs.push(logEntry);
  });
  
  // 네트워크 응답 모니터링
  const apiResponses = [];
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const responseData = {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers()
      };
      
      // 에러 응답인 경우 body도 캡처
      if (response.status() >= 400) {
        try {
          responseData.body = await response.text();
        } catch (e) {
          responseData.body = 'Could not read body';
        }
      }
      
      apiResponses.push(responseData);
      console.log(`\n[API 응답] ${response.url()}`);
      console.log(`Status: ${response.status()} ${response.statusText()}`);
      if (responseData.body) {
        console.log(`Body: ${responseData.body}`);
      }
    }
  });
  
  try {
    console.log('\n=== 타로 리딩 오류 점검 시작 ===\n');
    
    // 1. 페이지 이동
    console.log('1. 타로 리딩 페이지로 이동...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 2. 질문 입력
    console.log('\n2. 질문 입력...');
    const questionArea = await page.waitForSelector('textarea', { timeout: 5000 });
    await questionArea.fill('테스트 질문입니다');
    
    // 3. 카드 섞기
    console.log('\n3. 카드 섞기 버튼 클릭...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(3000);
    
    // 4. 카드 펼치기
    console.log('\n4. 카드 펼치기 버튼 클릭...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(3000);
    
    // 5. 카드 선택 (더 안정적인 방법)
    console.log('\n5. 카드 3장 선택...');
    
    // 카드 컨테이너를 먼저 찾기
    const cardContainer = await page.waitForSelector('.flex.gap-4.overflow-x-auto', { timeout: 5000 });
    
    // 카드 선택 (첫 3장)
    for (let i = 0; i < 3; i++) {
      const card = await page.locator(`.flex.gap-4.overflow-x-auto > div:nth-child(${i + 1})`);
      if (await card.count() > 0) {
        await card.click();
        console.log(`  - ${i + 1}번째 카드 선택`);
        await page.waitForTimeout(1000);
      }
    }
    
    // 선택 후 스크린샷
    await page.screenshot({ path: 'cards-selected.png', fullPage: true });
    
    // 6. AI 해석 받기
    console.log('\n6. AI 해석 받기 버튼 클릭...');
    const interpretButton = await page.waitForSelector('button:has-text("AI 해석 받기")', { timeout: 5000 });
    
    // 버튼 클릭
    await interpretButton.click();
    console.log('  - 버튼 클릭 완료, 응답 대기 중...');
    
    // 10초 대기 (API 응답 시간)
    await page.waitForTimeout(10000);
    
    // 7. 최종 상태 캡처
    console.log('\n7. 최종 상태 스크린샷 저장...');
    await page.screenshot({ path: 'error-recheck.png', fullPage: true });
    
    // 8. 오류 메시지 확인
    console.log('\n8. 화면 오류 메시지 확인...');
    const errorSelectors = [
      '.text-red-500',
      '.text-red-600',
      '.alert-danger',
      '.error',
      '[class*="error"]',
      'div:has-text("오류")',
      'div:has-text("Error")',
      'div:has-text("실패")'
    ];
    
    for (const selector of errorSelectors) {
      const errorElements = await page.$$(selector);
      for (const element of errorElements) {
        const text = await element.textContent();
        if (text && text.trim()) {
          console.log(`  [오류 메시지] ${text.trim()}`);
        }
      }
    }
    
    // 9. 결과 요약
    console.log('\n=== 결과 요약 ===');
    console.log(`\nAPI 응답 수: ${apiResponses.length}`);
    apiResponses.forEach(resp => {
      console.log(`\n- URL: ${resp.url}`);
      console.log(`  Status: ${resp.status} ${resp.statusText}`);
      if (resp.body) {
        console.log(`  Body: ${resp.body.substring(0, 200)}...`);
      }
    });
    
    console.log('\n\n브라우저를 20초간 열어둡니다. 수동으로 확인하세요...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('\n[스크립트 오류]:', error.message);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  }
  
  await browser.close();
  console.log('\n테스트 완료');
})();