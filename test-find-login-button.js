const { chromium } = require('playwright');
const path = require('path');

async function findLoginButton() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('1. Vercel 배포 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    // 홈페이지 스크린샷
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'find-login-01-homepage.png'),
      fullPage: true 
    });

    // 모든 버튼 찾기
    console.log('2. 페이지의 모든 버튼 찾기...');
    const buttons = await page.locator('button').all();
    console.log(`찾은 버튼 수: ${buttons.length}`);
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      console.log(`버튼 ${i}: "${text}" (visible: ${isVisible})`);
    }

    // 모든 링크도 찾기
    console.log('3. 페이지의 모든 링크 찾기...');
    const links = await page.locator('a').all();
    console.log(`찾은 링크 수: ${links.length}`);
    
    for (let i = 0; i < Math.min(links.length, 20); i++) { // 최대 20개만
      const text = await links[i].textContent();
      const href = await links[i].getAttribute('href');
      const isVisible = await links[i].isVisible();
      console.log(`링크 ${i}: "${text}" href="${href}" (visible: ${isVisible})`);
    }

    // "관리자", "로그인", "admin" 등의 텍스트가 포함된 요소 찾기
    console.log('4. 관리자/로그인 관련 요소 찾기...');
    const adminElements = await page.locator('*:has-text("관리자")').all();
    console.log(`"관리자" 포함 요소 수: ${adminElements.length}`);
    
    const loginElements = await page.locator('*:has-text("로그인")').all();
    console.log(`"로그인" 포함 요소 수: ${loginElements.length}`);
    
    // 개발 환경 확인을 위해 console 메시지도 확인
    page.on('console', msg => {
      console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
    });

    // 네트워크 요청도 확인
    page.on('request', request => {
      if (request.url().includes('admin') || request.url().includes('login')) {
        console.log(`Network request: ${request.method()} ${request.url()}`);
      }
    });

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'find-login-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

findLoginButton();