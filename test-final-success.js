const { chromium } = require('playwright');

(async () => {
  console.log('🎯 최종 성공 테스트 - CSRF + API Secret');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 }
  });
  
  const page = await context.newPage();
  
  // 네트워크 모니터링
  let successfulPost = false;
  page.on('response', async response => {
    if (response.url().includes('/api/blog/posts') && response.request().method() === 'POST') {
      console.log(`\n🔗 API 요청: POST ${response.url()}`);
      console.log(`📊 응답 상태: ${response.status()}`);
      
      if (response.status() === 200 || response.status() === 201) {
        successfulPost = true;
        console.log('✅ 블로그 포스트 저장 성공!');
        try {
          const data = await response.json();
          console.log(`📄 생성된 포스트 ID: ${data.postId || data.id || 'Unknown'}`);
          console.log(`📝 메시지: ${data.message || 'Success'}`);
        } catch (e) {
          console.log('📝 응답 파싱 실패하지만 저장 성공');
        }
      } else {
        console.log(`❌ API 실패: ${response.status()}`);
        try {
          const errorData = await response.text();
          console.log(`🚨 에러: ${errorData.substring(0, 100)}`);
        } catch (e) {
          console.log('에러 응답 읽기 실패');
        }
      }
    }
  });

  try {
    console.log('1. 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    console.log('2. 페이지 로딩 완료 대기...');
    await page.waitForTimeout(5000);
    
    console.log('3. 블로그 관리 탭 클릭...');
    await page.click('button:has-text("블로그 관리")');
    await page.waitForTimeout(3000);
    
    console.log('4. 새 포스트 버튼 클릭...');
    await page.click('button:has-text("새 포스트")');
    await page.waitForTimeout(2000);
    
    console.log('5. 필수 필드 입력...');
    
    // 제목 입력
    await page.fill('input#title', 'CSRF + API Secret 성공 테스트');
    
    // 요약 입력  
    await page.fill('textarea#excerpt', 'CSRF 미들웨어 수정과 API Secret 환경변수 추가로 블로그 포스트 저장이 정상 작동하는지 확인');
    
    // 본문 입력
    await page.fill('textarea#content', `# 🎉 CSRF 문제 완전 해결!

## 해결한 문제들
1. ✅ 미들웨어에서 개발 모드 CSRF 검증 건너뛰기
2. ✅ 중복 동적 라우트 제거 ([id] vs [postId])  
3. ✅ NEXT_PUBLIC_BLOG_API_SECRET 환경변수 추가
4. ✅ 클라이언트에서 API Secret 헤더 전송

## 최종 결과
- 403 Forbidden 에러 해결
- 블로그 포스트 정상 저장
- 관리 시스템 완전 복구

이제 블로그 관리 기능이 완벽하게 작동합니다! 🚀`);
    
    console.log('6. 모든 필드 입력 완료');
    await page.waitForTimeout(1000);
    
    console.log('\n7. 저장 버튼 클릭...');
    await page.click('button:has-text("저장")');
    
    console.log('8. 결과 대기...');
    await page.waitForTimeout(10000); // 충분한 대기 시간
    
    // 결과 확인
    const modal = page.locator('[role="dialog"]');
    const isModalVisible = await modal.isVisible();
    
    console.log('\n📋 최종 결과:');
    console.log(`- API 호출 성공: ${successfulPost ? '✅' : '❌'}`);
    console.log(`- 모달 상태: ${isModalVisible ? '아직 열려있음' : '닫힘 (저장 성공)'}`);
    
    if (successfulPost && !isModalVisible) {
      console.log('\n🎉 SUCCESS! 모든 테스트 통과!');
      console.log('✅ CSRF 문제 완전 해결');
      console.log('✅ 블로그 포스트 저장 성공');  
      console.log('✅ 관리 시스템 정상 복구');
    } else if (successfulPost) {
      console.log('\n🟡 부분 성공: API는 성공했지만 UI가 아직 처리 중');
    } else {
      console.log('\n❌ 아직 문제 있음');
      
      // 토스트 메시지 확인
      const toasts = await page.locator('[role="status"]').allTextContents();
      if (toasts.length > 0) {
        console.log('📨 토스트 메시지:', toasts);
      }
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 테스트 완료\n');
  }
})();