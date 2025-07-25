const { chromium } = require('playwright');

async function testAdminFunctionality() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'] 
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📋 관리자 기능 테스트 시작...');
    
    // 1. 홈페이지 접속
    console.log('1. 홈페이지 접속...');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'admin-test-01-homepage.png' });
    
    // 2. 로그인 페이지로 직접 이동
    console.log('2. 로그인 페이지로 직접 이동...');
    await page.goto('http://localhost:4000/sign-in');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'admin-test-02-signin.png' });
    
    // 3. admin@innerspell.com으로 로그인 시뮬레이션
    console.log('3. 관리자 이메일로 로그인...');
    // placeholder로 이메일 필드 찾기
    await page.fill('input[placeholder*="email"]', 'admin@innerspell.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("로그인")');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'admin-test-03-login-attempt.png' });
    
    // 4. 관리자 페이지 접근 시도
    console.log('4. 관리자 페이지 접근 시도...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'admin-test-04-admin-page.png' });
    
    // 5. 현재 사용자 정보 확인
    console.log('5. LocalStorage 확인...');
    const localStorage = await page.evaluate(() => {
      return Object.keys(localStorage).reduce((result, key) => {
        result[key] = localStorage.getItem(key);
        return result;
      }, {});
    });
    console.log('LocalStorage:', localStorage);
    
    // 6. API 직접 테스트
    console.log('6. API 직접 테스트...');
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/test-admin?email=admin@innerspell.com');
      return await res.json();
    });
    console.log('API Response:', response);
    
    console.log('✅ 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
    await page.screenshot({ path: 'admin-test-error.png' });
  } finally {
    await browser.close();
  }
}

testAdminFunctionality();