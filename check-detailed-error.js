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
      args: msg.args()
    });
  });
  
  // 페이지 에러 수집
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  });
  
  console.log('=== 상세 에러 확인 시작 ===');
  
  try {
    await page.goto('http://localhost:4000', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 콘솔 에러 상세 확인
    if (consoleLogs.length > 0) {
      console.log('\n=== 콘솔 로그 상세 ===');
      for (const log of consoleLogs) {
        if (log.type === 'error') {
          console.log(`[ERROR] ${log.text}`);
          // 에러 객체의 상세 정보 확인
          for (const arg of log.args) {
            try {
              const jsonValue = await arg.jsonValue();
              console.log('상세:', JSON.stringify(jsonValue, null, 2));
            } catch (e) {
              // JSON으로 변환할 수 없는 경우 무시
            }
          }
        }
      }
    }
    
    // 페이지 에러 상세 확인
    if (pageErrors.length > 0) {
      console.log('\n=== 페이지 에러 상세 ===');
      for (const error of pageErrors) {
        console.log(`에러 이름: ${error.name}`);
        console.log(`에러 메시지: ${error.message}`);
        if (error.stack) {
          console.log(`스택 트레이스:\n${error.stack}`);
        }
      }
    }
    
    // 네트워크 에러나 리소스 로딩 실패 확인
    page.on('requestfailed', request => {
      console.log(`\n[네트워크 실패] ${request.url()}`);
      console.log(`실패 이유: ${request.failure()?.errorText}`);
    });
    
    // 페이지에서 JavaScript 실행하여 추가 정보 수집
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        errorCount: window.errors ? window.errors.length : 0,
        scripts: Array.from(document.querySelectorAll('script')).map(s => ({
          src: s.src,
          type: s.type,
          hasError: s.error ? true : false
        }))
      };
    });
    
    console.log('\n=== 페이지 정보 ===');
    console.log(JSON.stringify(pageInfo, null, 2));
    
  } catch (error) {
    console.error('\n접속 중 오류:', error.message);
  }
  
  console.log('\n=== 상세 에러 확인 완료 ===');
  
  await browser.close();
})();