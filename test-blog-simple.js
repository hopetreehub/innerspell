const { chromium } = require('playwright');

async function testBlogSimple() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 콘솔과 네트워크 오류 수집
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });
  
  page.on('requestfailed', request => {
    errors.push(`Network Failed: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      errors.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  });
  
  try {
    console.log('관리자 페이지 접속 시도...');
    
    // 더 짧은 대기 시간과 간단한 로드
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    console.log('✅ 페이지 로드 완료');
    
    // 초기 스크린샷
    await page.screenshot({ path: 'screenshots/admin-initial-load.png' });
    console.log('📸 초기 스크린샷 저장됨');
    
    // 3초 대기
    await page.waitForTimeout(3000);
    
    // 현재 페이지 상태 확인
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);
    
    // 페이지에 있는 모든 버튼 찾기
    console.log('\n현재 페이지의 버튼들:');
    const buttons = await page.locator('button').all();
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      console.log(`- ${text?.trim() || '[텍스트 없음]'} (visible: ${isVisible})`);
    }
    
    // 블로그 관리 관련 요소 찾기
    console.log('\n블로그 관련 요소 찾기...');
    const blogElements = await page.locator('*:has-text("블로그")').all();
    console.log(`블로그 관련 요소 수: ${blogElements.length}`);
    
    // 탭 요소들 찾기
    const tabElements = await page.locator('[role="tab"], .tab, button[data-tab]').all();
    console.log(`탭 요소 수: ${tabElements.length}`);
    
    // 2차 스크린샷 (요소 분석 후)
    await page.screenshot({ path: 'screenshots/admin-after-analysis.png' });
    
    // 에러가 있다면 출력
    if (errors.length > 0) {
      console.log('\n❌ 발견된 오류들:');
      errors.forEach(error => console.log(error));
    } else {
      console.log('\n✅ 현재까지 오류 없음');
    }
    
    // 브라우저 30초 유지
    console.log('\n브라우저를 30초간 열어둡니다...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('테스트 오류:', error.message);
    await page.screenshot({ path: 'screenshots/error-screenshot.png' });
  } finally {
    await browser.close();
  }
}

testBlogSimple();