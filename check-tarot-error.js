const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 로그 캡처
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  // 페이지 에러 캡처
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });
  
  // 네트워크 요청 모니터링
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      method: request.method(),
      failure: request.failure()
    });
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });
  
  try {
    console.log('1. 타로 리딩 페이지로 이동...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    
    // 페이지 로드 후 잠시 대기
    await page.waitForTimeout(2000);
    
    console.log('2. 질문 입력...');
    await page.fill('textarea[placeholder*="질문"]', '테스트 질문입니다');
    await page.waitForTimeout(1000);
    
    console.log('3. 카드 섞기 버튼 클릭...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(3000); // 섞기 애니메이션 대기
    
    console.log('4. 카드 펼치기 버튼 클릭...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(2000); // 펼치기 애니메이션 대기
    
    console.log('5. 카드 3장 선택...');
    // 카드 선택 (처음 3장)
    const cards = await page.$$('.tarot-card-back');
    for (let i = 0; i < 3 && i < cards.length; i++) {
      await cards[i].click();
      await page.waitForTimeout(500);
    }
    
    console.log('6. AI 해석 받기 버튼 클릭 전 스크린샷...');
    await page.screenshot({ path: 'error-before-click.png', fullPage: true });
    
    console.log('7. AI 해석 받기 버튼 클릭...');
    await page.click('button:has-text("AI 해석 받기")');
    
    // 응답 대기 (최대 10초)
    await page.waitForTimeout(10000);
    
    console.log('8. 오류 발생 후 스크린샷...');
    await page.screenshot({ path: 'error-recheck.png', fullPage: true });
    
    // 화면에 표시된 오류 메시지 찾기
    const errorMessages = await page.$$eval('.error, .alert-danger, [class*="error"]', els => 
      els.map(el => el.textContent.trim())
    );
    
    console.log('\n=== 분석 결과 ===');
    console.log('\n화면에 표시된 오류 메시지:');
    errorMessages.forEach(msg => console.log(' -', msg));
    
    console.log('\n콘솔 에러 로그:');
    consoleLogs.filter(log => log.type === 'error').forEach(log => {
      console.log(' -', log.text);
    });
    
    console.log('\n페이지 에러:');
    pageErrors.forEach(error => {
      console.log(' -', error.message);
    });
    
    console.log('\n네트워크 오류:');
    networkErrors.forEach(error => {
      console.log(' - URL:', error.url);
      console.log('   Status:', error.status || error.failure?.errorText);
    });
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  }
  
  console.log('\n브라우저를 열어둡니다. 수동으로 확인 후 닫아주세요.');
  // 브라우저를 열어둠 (수동 확인용)
  await page.waitForTimeout(60000);
  
  await browser.close();
})();