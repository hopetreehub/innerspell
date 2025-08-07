const { chromium } = require('playwright');

async function testBlogSaveWithCSRF() {
  console.log('🚀 블로그 포스트 저장 기능 CSRF 토큰 포함 테스트...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Request 인터셉트 설정 - CSRF 토큰 추출 및 추가
    let csrfToken = null;
    
    // Response 모니터링 - CSRF 토큰 쿠키 추출
    page.on('response', async response => {
      const cookies = response.headers()['set-cookie'];
      if (cookies && cookies.includes('csrf-token=')) {
        const match = cookies.match(/csrf-token=([^;]+)/);
        if (match) {
          csrfToken = match[1];
          console.log('📍 CSRF 토큰 감지:', csrfToken);
        }
      }
    });
    
    // Request 인터셉트 - POST 요청에 CSRF 토큰 헤더 추가
    await page.route('**/api/blog/posts', async route => {
      const request = route.request();
      
      if (request.method() === 'POST' && csrfToken) {
        console.log('🔧 POST 요청에 CSRF 토큰 추가:', csrfToken);
        
        await route.continue({
          headers: {
            ...request.headers(),
            'x-csrf-token': csrfToken
          }
        });
      } else {
        await route.continue();
      }
    });
    
    // 1. 관리자 페이지 접속 (CSRF 토큰 쿠키를 받기 위해)
    console.log('📍 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 2. 블로그 탭으로 이동 (API 호출로 CSRF 토큰 생성)
    console.log('📍 블로그 관리 탭 클릭...');
    await page.click('button:has-text("블로그 관리")');
    await page.waitForTimeout(1000);
    
    // CSRF 토큰이 설정되었는지 확인
    if (csrfToken) {
      console.log('✅ CSRF 토큰 준비 완료:', csrfToken);
    } else {
      console.log('⚠️ CSRF 토큰을 아직 받지 못했습니다');
    }
    
    // 3. 새 포스트 모달 열기
    console.log('📍 새 포스트 버튼 클릭...');
    await page.click('button:has-text("새 포스트")');
    await page.waitForTimeout(1000);
    
    // 4. 포스트 정보 입력
    console.log('📍 포스트 정보 입력...');
    
    await page.fill('input[placeholder="포스트 제목을 입력하세요"]', 'CSRF 테스트 포스트 - Playwright');
    await page.fill('textarea[placeholder="포스트 요약을 입력하세요 (검색 결과에 표시됩니다)"]', 
      'CSRF 토큰을 포함한 Playwright 테스트');
    
    // MDX 에디터에 본문 입력
    const textareas = await page.locator('textarea').all();
    if (textareas.length > 1) {
      await textareas[textareas.length - 1].fill('# 테스트 성공\n\nCSRF 토큰이 자동으로 포함되었습니다.');
    }
    
    await page.screenshot({ path: 'screenshots/blog-csrf-before-save.png' });
    
    // 5. API 응답 모니터링
    const apiResponses = [];
    page.on('response', response => {
      if (response.url().includes('/api/blog/posts') && response.request().method() === 'POST') {
        apiResponses.push({
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // 6. 저장 버튼 클릭
    console.log('📍 저장 버튼 클릭...');
    const saveButton = page.locator('button:has-text("저장")').last();
    
    if (await saveButton.isVisible()) {
      await saveButton.click();
      console.log('✅ 저장 버튼 클릭 완료');
      
      // 응답 대기
      await page.waitForTimeout(3000);
      
      // 결과 확인
      console.log('\n📊 API 응답 결과:');
      apiResponses.forEach(res => {
        console.log(`  상태: ${res.status} ${res.statusText}`);
      });
      
      // 성공 메시지 확인
      const toastMessage = await page.locator('[role="alert"], .toast, [class*="toast"]').textContent().catch(() => null);
      if (toastMessage) {
        console.log('📢 토스트 메시지:', toastMessage);
      }
      
      await page.screenshot({ path: 'screenshots/blog-csrf-after-save.png' });
      
      // 모달 상태 확인
      const modalVisible = await page.locator('[role="dialog"]').isVisible();
      console.log(`📍 모달 상태: ${modalVisible ? '열려있음' : '닫힘'}`);
      
      if (!modalVisible) {
        // 포스트 목록에서 확인
        const newPost = await page.locator('text=/CSRF 테스트 포스트/').isVisible();
        console.log(`✅ 새 포스트 목록 표시: ${newPost}`);
      }
    }
    
    console.log('\n✅ 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    console.log('\n브라우저를 열어둡니다.');
  }
}

testBlogSaveWithCSRF();