const { chromium } = require('playwright');

(async () => {
  console.log('🎯 정확한 필드 찾아서 블로그 포스트 저장 테스트...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 네트워크 모니터링
  let apiCallMade = false;
  page.on('response', async response => {
    if (response.url().includes('/api/blog') && response.request().method() === 'POST') {
      apiCallMade = true;
      console.log(`\n📡 API 호출: ${response.url()}`);
      console.log(`📊 응답 상태: ${response.status()}`);
      
      if (response.status() === 200 || response.status() === 201) {
        console.log('✅ 저장 성공!');
        try {
          const data = await response.json();
          console.log('✅ 저장된 포스트:', data.title || 'Unknown');
        } catch (e) {
          console.log('✅ 응답 파싱 실패하지만 저장 성공');
        }
      } else if (response.status() === 403) {
        console.log('❌ 403 Forbidden - CSRF 문제');
      } else {
        console.log('❌ 저장 실패:', response.status());
      }
    }
  });

  try {
    // 1. 관리자 페이지 접속
    console.log('1. 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    // 2. 블로그 관리 탭 클릭
    console.log('2. 블로그 관리 탭 클릭...');
    await page.locator('button:has-text("블로그 관리")').click();
    await page.waitForTimeout(2000);
    
    // 3. 새 포스트 버튼 클릭
    console.log('3. 새 포스트 버튼 클릭...');
    await page.locator('button:has-text("새 포스트")').click();
    await page.waitForTimeout(2000);
    
    // 4. 모든 필드 확인
    console.log('4. 필드 확인...');
    
    const titleField = await page.locator('input#title').first();
    const excerptField = await page.locator('textarea#excerpt').first();  
    const contentField = await page.locator('textarea#content').first();
    
    console.log(`제목 필드 존재: ${await titleField.isVisible()}`);
    console.log(`요약 필드 존재: ${await excerptField.isVisible()}`);
    console.log(`본문 필드 존재: ${await contentField.isVisible()}`);
    
    // 5. 정확한 필드에 입력
    console.log('\n5. 필수 필드 입력...');
    
    // 제목 입력
    if (await titleField.isVisible()) {
      await titleField.fill('CSRF 문제 완전 해결 테스트');
      console.log('✓ 제목 입력 완료');
    } else {
      console.log('❌ 제목 필드를 찾을 수 없음');
    }
    
    // 요약 입력
    if (await excerptField.isVisible()) {
      await excerptField.fill('CSRF 토큰 문제를 완전히 해결하고 블로그 포스트 저장 기능이 정상 작동하는지 최종 확인하는 테스트입니다.');
      console.log('✓ 요약 입력 완료');
    } else {
      console.log('❌ 요약 필드를 찾을 수 없음');
    }
    
    // 본문 입력
    if (await contentField.isVisible()) {
      await contentField.fill(`# CSRF 문제 완전 해결!

블로그 포스트 저장 기능이 정상적으로 작동합니다.

## 해결 과정
1. CSRF 미들웨어 수정
2. API 라우트 예외 처리
3. 필수 필드 정확한 매핑

## 테스트 결과
- 403 Forbidden 에러 해결 ✅
- 필드 검증 통과 ✅
- API 호출 성공 ✅

이제 블로그 관리 시스템이 완전히 작동합니다!`);
      console.log('✓ 본문 입력 완료');
    } else {
      console.log('❌ 본문 필드를 찾을 수 없음');
    }
    
    // 입력 완료 스크린샷
    await page.screenshot({ 
      path: 'screenshots/correct-fields-filled.png',
      fullPage: true 
    });
    
    // 6. 저장 버튼 클릭
    console.log('\n6. 저장 버튼 클릭...');
    const saveButton = await page.locator('button:has-text("저장")').first();
    await saveButton.click();
    console.log('저장 버튼 클릭 완료');
    
    // 7. 결과 대기
    console.log('\n7. 결과 대기 중...');
    await page.waitForTimeout(5000);
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'screenshots/correct-save-result.png',
      fullPage: true 
    });
    
    // 8. 결과 분석
    const modal = await page.locator('[role="dialog"]').first();
    const isModalVisible = await modal.isVisible();
    
    if (!isModalVisible) {
      console.log('\n🎉 SUCCESS! 모달이 닫혔습니다 - 저장 성공!');
      
      // 포스트 목록 확인
      await page.waitForTimeout(2000);
      const newPost = await page.locator('text="CSRF 문제 완전 해결 테스트"').first();
      if (await newPost.isVisible()) {
        console.log('✅ 새 포스트가 목록에 추가되었습니다!');
        
        await page.screenshot({ 
          path: 'screenshots/post-successfully-added.png',
          fullPage: true 
        });
      } else {
        console.log('⚠️ 포스트가 아직 목록에 보이지 않음 (로딩 중일 수 있음)');
      }
    } else {
      console.log('\n❌ 모달이 여전히 열려있음 - 저장 실패');
      
      // 토스트 메시지 확인
      const toasts = await page.locator('[role="status"]').allTextContents();
      if (toasts.length > 0) {
        console.log('토스트 메시지:', toasts);
      }
    }
    
    // API 호출 여부 확인
    if (apiCallMade) {
      console.log('\n✅ API 호출이 이루어졌습니다');
    } else {
      console.log('\n❌ API 호출이 없었습니다 - 클라이언트 검증 실패');
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
    
    await page.screenshot({ 
      path: 'screenshots/correct-test-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n🏁 테스트 완료');
  }
})();