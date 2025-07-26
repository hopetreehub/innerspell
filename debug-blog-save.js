const puppeteer = require('playwright').chromium;

async function testBlogSave() {
  console.log('🚀 블로그 저장 기능 디버깅 시작...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true
  });
  const context = await browser.newContext();
  
  // 네트워크 요청 모니터링
  const page = await context.newPage();
  
  // 네트워크 로그
  page.on('request', request => {
    if (request.url().includes('/api/blog')) {
      console.log('📡 API 요청:', request.method(), request.url());
      console.log('📡 요청 헤더:', request.headers());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/blog')) {
      console.log('📡 API 응답:', response.status(), response.url());
    }
  });
  
  // 콘솔 로그 캡처
  page.on('console', msg => {
    console.log('🖥️ 브라우저 콘솔:', msg.text());
  });
  
  try {
    // 홈페이지 접속
    console.log('1. 홈페이지 접속...');
    await page.goto('http://localhost:4000');
    await page.waitForTimeout(2000);
    
    // 로그인 페이지로 이동
    console.log('2. 로그인 페이지로 이동...');
    await page.goto('http://localhost:4000/signin');
    await page.waitForTimeout(2000);
    
    // Mock 관리자 로그인
    console.log('3. Mock 관리자 로그인...');
    await page.fill('input[type="email"]', 'admin@innerspell.com');
    await page.fill('input[type="password"]', 'password123');
    
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    await page.waitForTimeout(3000);
    
    // 관리자 페이지 접속
    console.log('4. 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForTimeout(3000);
    
    // 블로그 관리 탭 클릭
    console.log('5. 블로그 관리 탭 클릭...');
    const blogTab = page.locator('button[data-state="inactive"]').filter({ hasText: '블로그' });
    if (await blogTab.count() > 0) {
      await blogTab.click();
      await page.waitForTimeout(2000);
    }
    
    // 새 포스트 버튼 클릭
    console.log('6. 새 포스트 버튼 클릭...');
    const newPostButton = page.locator('button').filter({ hasText: '새 포스트' });
    await newPostButton.click();
    await page.waitForTimeout(2000);
    
    // 포스트 데이터 입력
    console.log('7. 포스트 데이터 입력...');
    await page.fill('input[id="title"]', '테스트 포스트 - ' + new Date().toISOString());
    await page.fill('textarea[id="excerpt"]', '테스트용 포스트 요약입니다.');
    await page.fill('textarea[id="content"]', '# 테스트 포스트\n\n이것은 테스트용 포스트입니다.\n\n내용을 작성합니다.');
    await page.fill('input[id="tags"]', '테스트, 디버깅');
    
    // 게시 설정
    console.log('8. 게시 설정...');
    const publishSwitch = page.locator('input[id="published"]');
    await publishSwitch.click();
    
    // 저장 전 네트워크 요청 모니터링 시작
    console.log('9. 저장 시작...');
    
    // 저장 버튼 클릭
    const saveButton = page.locator('button').filter({ hasText: '저장' }).first();
    
    // 응답 대기
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/blog/posts') && response.request().method() === 'POST'
    );
    
    await saveButton.click();
    
    try {
      const response = await responsePromise;
      const responseBody = await response.json();
      
      console.log('✅ API 응답 수신:');
      console.log('  - 상태:', response.status());
      console.log('  - 응답 데이터:', JSON.stringify(responseBody, null, 2));
      
      if (response.ok()) {
        console.log('✅ 포스트 저장 성공!');
        
        // 토스트 메시지 확인
        await page.waitForTimeout(1000);
        const toastMessage = page.locator('[data-radix-toast-title]');
        if (await toastMessage.count() > 0) {
          const toastText = await toastMessage.textContent();
          console.log('📢 토스트 메시지:', toastText);
        }
        
        // 다이얼로그 닫기 확인
        await page.waitForTimeout(2000);
        const dialogOpen = await page.locator('[role="dialog"]').count();
        console.log('📝 다이얼로그 상태:', dialogOpen > 0 ? '열림' : '닫힘');
        
        // 포스트 목록 새로고침 확인
        await page.waitForTimeout(2000);
        const postRows = await page.locator('table tbody tr').count();
        console.log('📋 포스트 목록 개수:', postRows);
        
      } else {
        console.error('❌ 포스트 저장 실패:', responseBody);
      }
      
    } catch (error) {
      console.error('❌ 응답 대기 중 에러:', error);
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'blog-save-debug-result.png', fullPage: true });
    console.log('📸 스크린샷 저장: blog-save-debug-result.png');
    
  } catch (error) {
    console.error('❌ 테스트 중 에러:', error);
    await page.screenshot({ path: 'blog-save-debug-error.png', fullPage: true });
  }
  
  console.log('⏰ 10초 대기 후 브라우저 종료...');
  await page.waitForTimeout(10000);
  await browser.close();
}

// 실행
testBlogSave().catch(console.error);