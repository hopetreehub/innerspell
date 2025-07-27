const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    viewport: { width: 1280, height: 800 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('1. 관리자 페이지 접속 중...');
  await page.goto('https://test-studio-firebase.vercel.app/admin', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  // 페이지 로드 대기
  await page.waitForTimeout(3000);
  
  // 초기 로그인 화면 스크린샷
  console.log('2. 로그인 화면 스크린샷 촬영...');
  await page.screenshot({ 
    path: 'admin-01-login-page.png',
    fullPage: true 
  });
  
  // 로그인 방법 확인
  const googleButton = await page.locator('button:has-text("Google로 로그인")').isVisible();
  const emailInput = await page.locator('input[type="email"]').isVisible();
  const passwordInput = await page.locator('input[type="password"]').isVisible();
  
  console.log('로그인 옵션 확인:');
  console.log('- Google 로그인 버튼:', googleButton);
  console.log('- 이메일 입력 필드:', emailInput);
  console.log('- 비밀번호 입력 필드:', passwordInput);
  
  // 테스트 계정으로 로그인 시도
  if (emailInput && passwordInput) {
    console.log('\n3. 이메일/비밀번호로 로그인 시도...');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    
    // 로그인 버튼 찾기
    const loginButton = await page.locator('button:has-text("로그인")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(3000);
      
      // 로그인 후 상태 스크린샷
      await page.screenshot({ 
        path: 'admin-02-after-login-attempt.png',
        fullPage: true 
      });
    }
  }
  
  // 현재 페이지 URL 및 타이틀 확인
  console.log('\n현재 페이지 정보:');
  console.log('- URL:', page.url());
  console.log('- Title:', await page.title());
  
  // 페이지 내 주요 요소 확인
  const elements = await page.evaluate(() => {
    const result = {
      headings: [],
      buttons: [],
      links: [],
      forms: []
    };
    
    // h1, h2, h3 태그 수집
    document.querySelectorAll('h1, h2, h3').forEach(h => {
      result.headings.push({
        tag: h.tagName,
        text: h.textContent.trim()
      });
    });
    
    // 버튼 수집
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.trim()) {
        result.buttons.push(btn.textContent.trim());
      }
    });
    
    // 링크 수집
    document.querySelectorAll('a').forEach(link => {
      if (link.textContent.trim()) {
        result.links.push({
          text: link.textContent.trim(),
          href: link.href
        });
      }
    });
    
    // 폼 요소 수집
    document.querySelectorAll('form').forEach(form => {
      result.forms.push({
        id: form.id,
        class: form.className,
        inputCount: form.querySelectorAll('input').length
      });
    });
    
    return result;
  });
  
  console.log('\n페이지 구조 분석:');
  console.log('제목들:', elements.headings);
  console.log('버튼들:', elements.buttons);
  console.log('링크들:', elements.links);
  console.log('폼들:', elements.forms);
  
  // 개발자 도구로 네트워크 에러 확인
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('콘솔 에러:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('페이지 에러:', error.message);
  });
  
  // 최종 상태 스크린샷
  await page.screenshot({ 
    path: 'admin-03-final-state.png',
    fullPage: true 
  });
  
  console.log('\n스크린샷 저장 완료!');
  console.log('- admin-01-login-page.png: 초기 로그인 화면');
  console.log('- admin-02-after-login-attempt.png: 로그인 시도 후');
  console.log('- admin-03-final-state.png: 최종 상태');
  
  // 브라우저는 열어둠
  console.log('\n브라우저는 계속 열려있습니다. 수동으로 확인하실 수 있습니다.');
  console.log('종료하려면 Ctrl+C를 누르세요.');
  
  // 프로세스 유지
  await new Promise(() => {});
})();