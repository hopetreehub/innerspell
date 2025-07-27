const { chromium } = require('playwright');

(async () => {
  console.log('Playwright 관리자 페이지 상세 분석 시작...');
  
  const browser = await chromium.launch({
    headless: false,
    viewport: { width: 1400, height: 900 }
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1400, height: 900 }
    });
    const page = await context.newPage();
    
    // 콘솔 메시지 수집
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // 네트워크 요청 모니터링
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });
    
    console.log('\n=== 1단계: /admin 페이지 접속 ===');
    await page.goto('https://test-studio-firebase.vercel.app/admin', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(2000);
    
    // 현재 URL 확인
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);
    console.log('페이지 제목:', await page.title());
    
    // 로그인 페이지 상세 분석
    await page.screenshot({ 
      path: 'detailed-admin-01-login-interface.png',
      fullPage: false 
    });
    
    console.log('\n=== 2단계: 로그인 인터페이스 분석 ===');
    
    // 모든 입력 필드 확인
    const inputs = await page.evaluate(() => {
      const inputElements = document.querySelectorAll('input');
      return Array.from(inputElements).map(input => ({
        type: input.type,
        placeholder: input.placeholder,
        name: input.name,
        id: input.id,
        value: input.value,
        className: input.className
      }));
    });
    
    console.log('입력 필드들:');
    inputs.forEach((input, i) => {
      console.log(`  ${i+1}. 타입: ${input.type}, 플레이스홀더: "${input.placeholder}", 이름: ${input.name}`);
    });
    
    // 모든 버튼 확인
    const buttons = await page.evaluate(() => {
      const buttonElements = document.querySelectorAll('button');
      return Array.from(buttonElements).map(button => ({
        text: button.textContent.trim(),
        className: button.className,
        type: button.type,
        disabled: button.disabled
      }));
    });
    
    console.log('\n버튼들:');
    buttons.forEach((button, i) => {
      console.log(`  ${i+1}. 텍스트: "${button.text}", 타입: ${button.type}, 비활성화: ${button.disabled}`);
    });
    
    // 링크 확인
    const links = await page.evaluate(() => {
      const linkElements = document.querySelectorAll('a');
      return Array.from(linkElements).map(link => ({
        text: link.textContent.trim(),
        href: link.href,
        className: link.className
      }));
    });
    
    console.log('\n링크들:');
    links.forEach((link, i) => {
      console.log(`  ${i+1}. 텍스트: "${link.text}", 링크: ${link.href}`);
    });
    
    console.log('\n=== 3단계: Google 로그인 시도 ===');
    
    // Google 로그인 버튼 찾기 및 클릭
    const googleButton = page.locator('button:has-text("Google로 로그인")');
    if (await googleButton.isVisible()) {
      console.log('Google 로그인 버튼 발견, 클릭 시도...');
      await googleButton.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: 'detailed-admin-02-after-google-click.png',
        fullPage: false 
      });
      
      console.log('Google 로그인 후 URL:', page.url());
    }
    
    console.log('\n=== 4단계: 이메일/비밀번호 로그인 시도 ===');
    
    // 뒤로가기 (필요시)
    if (page.url() !== currentUrl) {
      await page.goBack();
      await page.waitForTimeout(2000);
    }
    
    // 이메일과 비밀번호 입력
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      console.log('이메일/비밀번호 필드 발견, 테스트 정보 입력...');
      
      await emailInput.fill('admin@test.com');
      await passwordInput.fill('test123456');
      
      await page.screenshot({ 
        path: 'detailed-admin-03-form-filled.png',
        fullPage: false 
      });
      
      // 로그인 버튼 클릭
      const loginButton = page.locator('button:has-text("로그인")').first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForTimeout(5000);
        
        await page.screenshot({ 
          path: 'detailed-admin-04-after-login-attempt.png',
          fullPage: false 
        });
        
        console.log('로그인 시도 후 URL:', page.url());
      }
    }
    
    console.log('\n=== 5단계: 최종 상태 분석 ===');
    
    // 현재 페이지의 모든 텍스트 내용 수집
    const pageContent = await page.evaluate(() => {
      const textContent = document.body.innerText;
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.textContent.trim());
      const navigation = Array.from(document.querySelectorAll('nav a, [role="tablist"] button')).map(item => item.textContent.trim());
      
      return {
        headings,
        navigation,
        hasErrorMessage: textContent.includes('오류') || textContent.includes('에러') || textContent.includes('실패'),
        hasSuccessMessage: textContent.includes('성공') || textContent.includes('환영') || textContent.includes('로그인됨'),
        bodyText: textContent.substring(0, 500) // 처음 500자만
      };
    });
    
    console.log('페이지 제목들:', pageContent.headings);
    console.log('네비게이션 요소들:', pageContent.navigation);
    console.log('오류 메시지 존재:', pageContent.hasErrorMessage);
    console.log('성공 메시지 존재:', pageContent.hasSuccessMessage);
    console.log('페이지 내용 (일부):', pageContent.bodyText);
    
    await page.screenshot({ 
      path: 'detailed-admin-05-final-analysis.png',
      fullPage: true 
    });
    
    console.log('\n=== 6단계: 네트워크 및 콘솔 분석 ===');
    console.log('총 네트워크 요청 수:', requests.length);
    console.log('주요 요청들:');
    requests.slice(0, 10).forEach((req, i) => {
      console.log(`  ${i+1}. ${req.method} ${req.url} (${req.resourceType})`);
    });
    
    console.log('\n콘솔 메시지들:');
    consoleMessages.forEach((msg, i) => {
      console.log(`  ${i+1}. ${msg}`);
    });
    
    console.log('\n=== 분석 완료 ===');
    console.log('생성된 스크린샷:');
    console.log('- detailed-admin-01-login-interface.png: 로그인 인터페이스');
    console.log('- detailed-admin-02-after-google-click.png: Google 로그인 클릭 후');
    console.log('- detailed-admin-03-form-filled.png: 폼 입력 후');
    console.log('- detailed-admin-04-after-login-attempt.png: 로그인 시도 후');
    console.log('- detailed-admin-05-final-analysis.png: 최종 분석');
    
  } catch (error) {
    console.error('에러 발생:', error);
    await page.screenshot({ 
      path: 'detailed-admin-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();