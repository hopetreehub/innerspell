const { chromium } = require('playwright');
const path = require('path');

async function quickLoginCheck() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('로그인 페이지 접속 및 관리자 버튼 확인...');
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(5000); // 더 오래 기다리기
    
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'quick-login-check.png'),
      fullPage: true 
    });

    // 페이지의 모든 텍스트 확인
    const pageText = await page.textContent('body');
    console.log('페이지에 "개발 환경" 텍스트 포함:', pageText.includes('개발 환경'));
    console.log('페이지에 "관리자로 로그인" 텍스트 포함:', pageText.includes('관리자로 로그인'));

    // 모든 요소 확인
    const devElements = await page.locator('*:has-text("개발 환경")').count();
    const adminElements = await page.locator('*:has-text("관리자로 로그인")').count();
    
    console.log(`"개발 환경" 요소 수: ${devElements}`);
    console.log(`"관리자로 로그인" 요소 수: ${adminElements}`);

    // 현재 hostname 확인을 위한 JavaScript 실행
    const hostname = await page.evaluate(() => window.location.hostname);
    console.log(`현재 hostname: ${hostname}`);
    
    // DevAuthHelper 조건 확인
    const shouldShow = await page.evaluate(() => {
      const hostname = window.location.hostname;
      return hostname === 'localhost' || 
             hostname === '127.0.0.1' ||
             hostname.includes('test-studio-firebase.vercel.app');
    });
    console.log(`DevAuthHelper 표시 조건 만족: ${shouldShow}`);

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'quick-login-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

quickLoginCheck();