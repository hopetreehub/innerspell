const { chromium } = require('playwright');
const path = require('path');

async function testLoginPage() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('1. 로그인 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    // 로그인 페이지 스크린샷
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'login-page-01-signin.png'),
      fullPage: true 
    });

    console.log('2. 로그인 페이지의 모든 버튼 찾기...');
    const buttons = await page.locator('button').all();
    console.log(`찾은 버튼 수: ${buttons.length}`);
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      const className = await buttons[i].getAttribute('class');
      console.log(`버튼 ${i}: "${text}" (visible: ${isVisible}) class: ${className}`);
    }

    // 관리자 로그인 버튼 찾기
    console.log('3. 관리자 로그인 버튼 찾기...');
    const adminLoginBtn = await page.locator('button:has-text("관리자로 로그인")').first();
    const isAdminBtnVisible = await adminLoginBtn.isVisible().catch(() => false);
    console.log(`관리자 로그인 버튼 표시: ${isAdminBtnVisible}`);

    if (isAdminBtnVisible) {
      console.log('4. 관리자 로그인 버튼 클릭...');
      await adminLoginBtn.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'login-page-02-after-admin-login.png'),
        fullPage: true 
      });

      // 로그인 후 상태 확인
      const currentUrl = page.url();
      console.log(`로그인 후 현재 URL: ${currentUrl}`);
      
      // 네비게이션 바에서 로그인 상태 확인
      const userInfo = await page.locator('nav').textContent();
      console.log(`네비게이션 바 내용: ${userInfo}`);
    } else {
      console.log('관리자 로그인 버튼이 보이지 않습니다.');
      
      // 개발 환경 체크를 위해 다른 방법 시도
      console.log('5. 환경 변수나 개발 모드 확인...');
      
      // JavaScript를 통해 개발 환경 확인
      const isDev = await page.evaluate(() => {
        return {
          nodeEnv: typeof process !== 'undefined' ? process.env.NODE_ENV : 'unknown',
          hostname: window.location.hostname,
          isDevelopment: window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'),
          href: window.location.href
        };
      });
      console.log('환경 정보:', isDev);
    }

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'login-page-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testLoginPage();