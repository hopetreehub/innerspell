const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('1. 타로 페이지 접속 중...');
  
  // 콘솔 메시지 수집
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
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
    // 페이지 접속
    const response = await page.goto('http://localhost:4000/tarot', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log(`페이지 응답 상태: ${response.status()}`);
    
    // 잠시 대기하여 모든 요소가 로드되도록 함
    await page.waitForTimeout(3000);
    
    // 2. "카드를 불러오는 중..." 메시지 확인
    console.log('\n2. 로딩 메시지 확인 중...');
    const loadingMessage = await page.locator('text="카드를 불러오는 중..."').isVisible();
    console.log(`"카드를 불러오는 중..." 메시지 표시: ${loadingMessage}`);
    
    // 에러 메시지 확인
    const errorMessage = await page.locator('.error-message').isVisible().catch(() => false);
    if (errorMessage) {
      const errorText = await page.locator('.error-message').textContent();
      console.log(`에러 메시지 발견: ${errorText}`);
    }
    
    // 카드 리스트 확인
    const cardGrid = await page.locator('.grid').isVisible().catch(() => false);
    if (cardGrid) {
      const cardCount = await page.locator('.card-item').count();
      console.log(`카드 그리드 표시됨, 카드 수: ${cardCount}`);
    }
    
    // 3. 콘솔 에러 확인
    console.log('\n3. 콘솔 로그 확인:');
    const errors = consoleLogs.filter(log => log.type === 'error');
    if (errors.length > 0) {
      console.log('콘솔 에러 발견:');
      errors.forEach(error => {
        console.log(`- ${error.text}`);
        if (error.location.url) {
          console.log(`  위치: ${error.location.url}:${error.location.lineNumber}`);
        }
      });
    } else {
      console.log('콘솔 에러 없음');
    }
    
    // 4. 실패한 네트워크 요청 확인
    console.log('\n4. 실패한 네트워크 요청:');
    if (failedRequests.length > 0) {
      failedRequests.forEach(req => {
        console.log(`- ${req.method} ${req.url}`);
        console.log(`  실패 이유: ${req.failure.errorText}`);
      });
    } else {
      console.log('실패한 네트워크 요청 없음');
    }
    
    // 5. 스크린샷 촬영
    console.log('\n5. 스크린샷 촬영 중...');
    await page.screenshot({ 
      path: 'tarot-page-current-state.png',
      fullPage: true 
    });
    console.log('스크린샷 저장됨: tarot-page-current-state.png');
    
    // 추가 정보 수집
    console.log('\n추가 정보:');
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);
    
    // 현재 URL 확인
    console.log(`현재 URL: ${page.url()}`);
    
    // 페이지에 있는 모든 텍스트 컨텐츠 요약
    const bodyText = await page.locator('body').textContent();
    console.log(`\n페이지 텍스트 컨텐츠 (첫 200자):\n${bodyText.substring(0, 200)}...`);
    
  } catch (error) {
    console.error('페이지 확인 중 오류 발생:', error);
    await page.screenshot({ path: 'tarot-page-error-state.png' });
  }
  
  // 브라우저 열어둔 상태로 대기
  console.log('\n브라우저를 확인하시고 Enter를 누르면 종료됩니다...');
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  await browser.close();
})();