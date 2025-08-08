const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
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
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });
  
  // 네트워크 실패 수집
  const networkFailures = [];
  page.on('requestfailed', request => {
    networkFailures.push({
      url: request.url(),
      failure: request.failure(),
      resourceType: request.resourceType()
    });
  });
  
  console.log('=== 서버 상태 확인 시작 ===');
  console.log(`대상 URL: http://localhost:4000`);
  console.log(`시작 시간: ${new Date().toISOString()}`);
  
  try {
    // 30초 타임아웃으로 페이지 접속 시도
    const response = await page.goto('http://localhost:4000', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    if (response) {
      console.log('\n=== 응답 정보 ===');
      console.log(`상태 코드: ${response.status()}`);
      console.log(`상태 텍스트: ${response.statusText()}`);
      console.log(`URL: ${response.url()}`);
      
      // 응답 헤더 출력
      const headers = response.headers();
      console.log('\n=== 응답 헤더 ===');
      for (const [key, value] of Object.entries(headers)) {
        console.log(`${key}: ${value}`);
      }
    }
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`\n페이지 제목: ${title}`);
    
    // 페이지 내용 일부 확인
    const bodyText = await page.evaluate(() => {
      const body = document.body;
      return body ? body.innerText.substring(0, 500) : 'No body content';
    });
    console.log(`\n페이지 내용 (처음 500자):\n${bodyText}`);
    
    // 스크린샷 촬영
    const screenshotPath = `/mnt/e/project/test-studio-firebase/server-status-${Date.now()}.png`;
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    console.log(`\n스크린샷 저장: ${screenshotPath}`);
    
  } catch (error) {
    console.error('\n=== 접속 오류 발생 ===');
    console.error(`오류 타입: ${error.name}`);
    console.error(`오류 메시지: ${error.message}`);
    
    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.error('\n서버가 실행되고 있지 않거나 포트 4000에서 리스닝하고 있지 않습니다.');
    } else if (error.message.includes('Timeout')) {
      console.error('\n30초 동안 응답이 없어 타임아웃되었습니다.');
    }
    
    // 오류 상황에서도 스크린샷 시도
    try {
      const errorScreenshotPath = `/mnt/e/project/test-studio-firebase/server-error-${Date.now()}.png`;
      await page.screenshot({ 
        path: errorScreenshotPath,
        fullPage: true 
      });
      console.log(`\n오류 스크린샷 저장: ${errorScreenshotPath}`);
    } catch (screenshotError) {
      console.log('스크린샷 촬영 실패');
    }
  }
  
  // 수집된 정보 출력
  if (consoleLogs.length > 0) {
    console.log('\n=== 콘솔 로그 ===');
    consoleLogs.forEach(log => {
      console.log(`[${log.type}] ${log.text}`);
      if (log.location.url) {
        console.log(`  위치: ${log.location.url}:${log.location.lineNumber}`);
      }
    });
  }
  
  if (pageErrors.length > 0) {
    console.log('\n=== 페이지 에러 ===');
    pageErrors.forEach(error => {
      console.log(`메시지: ${error.message}`);
      if (error.stack) {
        console.log(`스택:\n${error.stack}`);
      }
    });
  }
  
  if (networkFailures.length > 0) {
    console.log('\n=== 네트워크 실패 ===');
    networkFailures.forEach(failure => {
      console.log(`URL: ${failure.url}`);
      console.log(`리소스 타입: ${failure.resourceType}`);
      console.log(`실패 이유: ${failure.failure}`);
    });
  }
  
  console.log('\n=== 서버 상태 확인 완료 ===');
  console.log(`종료 시간: ${new Date().toISOString()}`);
  
  await browser.close();
})();