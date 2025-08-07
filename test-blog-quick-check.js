const { chromium } = require('playwright');

(async () => {
  console.log('🎯 빠른 블로그 포스트 저장 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,  // 브라우저 창을 띄워서 확인
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 }
  });
  
  const page = await context.newPage();
  
  // 네트워크 모니터링
  let apiSuccess = false;
  page.on('response', async response => {
    if (response.url().includes('/api/blog') && response.request().method() === 'POST') {
      console.log(`📡 API 요청: ${response.url()}`);
      console.log(`📊 상태: ${response.status()}`);
      
      if (response.status() === 200 || response.status() === 201) {
        apiSuccess = true;
        console.log('✅ API 호출 성공!');
      } else {
        console.log(`❌ API 실패: ${response.status()}`);
        const text = await response.text();
        console.log('에러 응답:', text.substring(0, 200));
      }
    }
  });

  try {
    console.log('1. 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 20000 
    });
    
    await page.waitForTimeout(3000);
    console.log('관리자 페이지 로드 완료');
    
    console.log('2. 블로그 관리 탭 클릭...');
    await page.click('button:has-text("블로그 관리")');
    await page.waitForTimeout(2000);
    
    console.log('3. 새 포스트 버튼 클릭...');
    await page.click('button:has-text("새 포스트")');
    await page.waitForTimeout(2000);
    
    console.log('4. 필수 필드 입력...');
    
    // 제목 입력
    await page.fill('input#title', 'CSRF 최종 해결 테스트');
    console.log('✓ 제목 입력');
    
    // 요약 입력
    await page.fill('textarea#excerpt', 'CSRF 미들웨어를 수정하여 개발 모드에서 블로그 API 호출이 정상 작동하는지 확인하는 최종 테스트입니다.');
    console.log('✓ 요약 입력');
    
    // 본문 입력
    await page.fill('textarea#content', `# CSRF 문제 최종 해결!

## 성공한 수정사항
- 개발 모드에서 블로그 API CSRF 검증 건너뛰기
- 중복 라우트 제거 ([id], [postId])
- 미들웨어 로직 개선

## 테스트 결과
이제 403 Forbidden 에러 없이 정상적으로 블로그 포스트를 저장할 수 있습니다!`);
    console.log('✓ 본문 입력');
    
    await page.waitForTimeout(1000);
    
    console.log('\n5. 저장 버튼 클릭...');
    await page.click('button:has-text("저장")');
    console.log('저장 버튼 클릭 완료');
    
    // 결과 대기
    await page.waitForTimeout(5000);
    
    // 모달 상태 확인
    const modal = page.locator('[role="dialog"]');
    const isModalVisible = await modal.isVisible();
    
    console.log('\n📋 결과 분석:');
    console.log(`- API 호출 성공: ${apiSuccess}`);
    console.log(`- 모달 열려있음: ${isModalVisible}`);
    
    if (!isModalVisible && apiSuccess) {
      console.log('\n🎉 SUCCESS! 블로그 포스트 저장 성공!');
      
      // 포스트 목록 확인
      const newPost = page.locator('text="CSRF 최종 해결 테스트"');
      const postVisible = await newPost.isVisible();
      console.log(`- 새 포스트 목록에 표시: ${postVisible}`);
      
      if (postVisible) {
        console.log('✅ 완벽! 모든 테스트 통과!');
      }
    } else {
      console.log('\n⚠️ 일부 문제 있음');
      
      // 토스트 메시지 확인
      const toasts = await page.locator('[role="status"]').allTextContents();
      if (toasts.length > 0) {
        console.log('토스트 메시지:', toasts);
      }
    }
    
    console.log('\n👁️  브라우저 창이 열려있어 결과를 직접 확인할 수 있습니다.');
    console.log('확인 후 Enter를 눌러 테스트를 종료하세요...');
    
    // 사용자 입력 대기 (없으면 10초 후 자동 종료)
    await new Promise(resolve => {
      const timeout = setTimeout(resolve, 10000);
      process.stdin.once('data', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 테스트 완료');
  }
})();