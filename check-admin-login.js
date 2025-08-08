const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('관리자 로그인 페이지 접속 중...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 로그인 페이지 스크린샷
    await page.screenshot({ 
      path: 'admin-login-page.png',
      fullPage: true 
    });
    console.log('로그인 페이지 스크린샷 저장: admin-login-page.png');
    
    // 입력 필드 확인
    const emailInputs = await page.$$('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="이메일" i]');
    const passwordInputs = await page.$$('input[type="password"], input[name="password"], input[placeholder*="password" i], input[placeholder*="비밀번호" i]');
    
    console.log(`이메일 입력 필드 수: ${emailInputs.length}`);
    console.log(`비밀번호 입력 필드 수: ${passwordInputs.length}`);
    
    // 모든 input 필드 확인
    const allInputs = await page.$$eval('input', inputs => 
      inputs.map(input => ({
        type: input.type,
        name: input.name,
        placeholder: input.placeholder,
        id: input.id,
        className: input.className
      }))
    );
    
    console.log('\n모든 입력 필드:');
    allInputs.forEach((input, index) => {
      console.log(`${index + 1}. type="${input.type}", name="${input.name}", placeholder="${input.placeholder}", id="${input.id}"`);
    });
    
    // 로그인 시도
    if (emailInputs.length > 0 && passwordInputs.length > 0) {
      console.log('\n로그인 시도 중...');
      await emailInputs[0].fill('admin@example.com');
      await passwordInputs[0].fill('admin123');
      
      // 로그인 버튼 찾기
      const loginButton = await page.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Login"), button:has-text("Sign in")').first();
      if (await loginButton.count() > 0) {
        await loginButton.click();
        console.log('로그인 버튼 클릭됨');
        
        // 로그인 후 대기
        await page.waitForTimeout(3000);
        
        // 로그인 후 URL 확인
        console.log(`현재 URL: ${page.url()}`);
        
        // 로그인 후 페이지 스크린샷
        await page.screenshot({ 
          path: 'admin-after-login.png',
          fullPage: true 
        });
        console.log('로그인 후 스크린샷 저장: admin-after-login.png');
      }
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'admin-login-error.png' });
  }
  
  await browser.close();
})();