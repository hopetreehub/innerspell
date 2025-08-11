const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('로그인 페이지 구조 검사 시작...');
  
  try {
    // 로그인 페이지로 이동
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('로그인 페이지 로드 완료');
    await page.waitForTimeout(3000);

    // 페이지 스크린샷
    await page.screenshot({ 
      path: 'login-page-structure.png',
      fullPage: true 
    });
    console.log('로그인 페이지 스크린샷 저장: login-page-structure.png');

    // 입력 필드 찾기
    console.log('\n입력 필드 검사:');
    
    // 이메일 필드
    const emailInputs = await page.locator('input').all();
    console.log(`- 전체 input 개수: ${emailInputs.length}`);
    
    for (let i = 0; i < emailInputs.length; i++) {
      const input = emailInputs[i];
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      console.log(`  Input ${i + 1}: type="${type}", placeholder="${placeholder}", name="${name}", id="${id}"`);
    }

    // 버튼 찾기
    console.log('\n버튼 검사:');
    const buttons = await page.locator('button').all();
    console.log(`- 전체 button 개수: ${buttons.length}`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      console.log(`  Button ${i + 1}: "${text?.trim()}"`);
    }

    // 실제 이메일 필드 선택 시도
    console.log('\n이메일 필드 입력 시도:');
    
    // 다양한 방법으로 이메일 필드 찾기
    const emailField = page.locator('input').first();
    if (await emailField.count() > 0) {
      await emailField.click();
      await emailField.fill('admin@example.com');
      console.log('✅ 첫 번째 input에 이메일 입력 성공');
    }

    // 비밀번호 필드
    const passwordField = page.locator('input').nth(1);
    if (await passwordField.count() > 0) {
      await passwordField.click();
      await passwordField.fill('admin123456');
      console.log('✅ 두 번째 input에 비밀번호 입력 성공');
    }

    await page.waitForTimeout(2000);

    // 입력 후 스크린샷
    await page.screenshot({ 
      path: 'login-form-filled-test.png'
    });
    console.log('\n입력 후 스크린샷 저장: login-form-filled-test.png');

    // 로그인 버튼 찾기
    const loginButton = page.locator('button').first();
    if (await loginButton.count() > 0) {
      const buttonText = await loginButton.textContent();
      console.log(`\n로그인 버튼 발견: "${buttonText?.trim()}"`);
      
      await loginButton.click();
      console.log('로그인 버튼 클릭');
      
      // 로그인 후 대기
      await page.waitForTimeout(5000);
      
      // 현재 URL 확인
      const afterLoginUrl = page.url();
      console.log(`\n로그인 후 URL: ${afterLoginUrl}`);
      
      // 로그인 후 스크린샷
      await page.screenshot({ 
        path: 'after-login-page.png',
        fullPage: true
      });
      console.log('로그인 후 스크린샷 저장: after-login-page.png');
    }

  } catch (error) {
    console.error('검사 중 오류 발생:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  }

  // 브라우저를 열어둔 상태로 10초 대기
  console.log('\n브라우저를 10초간 열어둡니다...');
  await page.waitForTimeout(10000);

  await browser.close();
  console.log('검사 완료');
})();