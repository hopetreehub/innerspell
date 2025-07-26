const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🔐 CSRF 토큰 수정 후 블로그 저장 테스트...\n');
  
  try {
    // 1. 로그인
    console.log('1️⃣ 관리자 로그인...');
    await page.goto('http://localhost:4000/sign-in');
    await page.waitForLoadState('networkidle');
    
    const devButton = await page.$('button:has-text("관리자로 로그인")');
    if (devButton) {
      await devButton.click();
      await page.waitForTimeout(5000);
      await page.reload();
      await page.waitForTimeout(3000);
    }
    
    // 2. 관리자 대시보드 > 블로그 관리
    console.log('2️⃣ 블로그 관리 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    const blogTab = await page.$('button[role="tab"]:has-text("블로그 관리")');
    if (blogTab) {
      await blogTab.click();
      await page.waitForTimeout(2000);
    }
    
    // 3. 새 글 작성 버튼 클릭
    console.log('3️⃣ 새 블로그 글 작성...');
    const newPostButton = await page.$('button:has-text("새 포스트")');
    if (newPostButton) {
      await newPostButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 4. CSRF 수정된 블로그 글 작성
    console.log('4️⃣ CSRF 수정 테스트 콘텐츠 입력...');
    
    // 제목 입력
    const titleInput = await page.$('input[placeholder*="제목"]');
    if (titleInput) {
      await titleInput.fill('CSRF 수정 테스트 - 블로그 저장 확인');
      console.log('✅ 제목 입력 완료');
    }
    
    // 요약 입력
    const excerptInput = await page.$('textarea[placeholder*="요약"]');
    if (excerptInput) {
      await excerptInput.fill('CSRF 토큰 문제를 수정한 후 블로그 저장이 정상적으로 작동하는지 확인하는 테스트입니다.');
      console.log('✅ 요약 입력 완료');
    }
    
    // 본문 입력
    const contentInput = await page.$('textarea[placeholder*="내용"]');
    if (contentInput) {
      const testContent = `# CSRF 수정 테스트

이 글은 CSRF 토큰 문제를 수정한 후 작성된 테스트 글입니다.

## 수정 내용
- BlogManagement 컴포넌트에 CSRF 토큰 헤더 추가
- getApiHeaders 유틸리티 함수 사용
- 미들웨어의 CSRF 검증 통과 확인

## 예상 결과
이제 블로그 글이 정상적으로 저장되어야 합니다.

테스트 시간: ${new Date().toLocaleString('ko-KR')}`;
      
      await contentInput.fill(testContent);
      console.log('✅ 본문 입력 완료');
    }
    
    // 발행 상태 체크
    const publishCheckbox = await page.$('input[type="checkbox"][name="published"]');
    if (publishCheckbox) {
      await publishCheckbox.check();
      console.log('✅ 발행 상태 체크');
    }
    
    await page.screenshot({ path: 'csrf-fix-01-filled.png', fullPage: true });
    
    // 5. 저장 버튼 클릭
    console.log('5️⃣ 블로그 글 저장 중...');
    const saveButton = await page.$('button:has-text("저장")');
    if (saveButton) {
      await saveButton.click();
      console.log('⏳ 저장 버튼 클릭됨...');
      await page.waitForTimeout(5000);
      
      // 성공 메시지 확인
      const successToast = await page.$('text=/성공|완료|저장됨|created|saved/i');
      if (successToast) {
        console.log('✅ 성공 메시지 발견!');
      } else {
        console.log('⚠️ 성공 메시지를 찾을 수 없음');
      }
      
      await page.screenshot({ path: 'csrf-fix-02-after-save.png', fullPage: true });
    }
    
    // 6. API로 실제 저장 확인
    console.log('6️⃣ API로 실제 저장 확인...');
    await page.goto('http://localhost:4000/api/blog/posts');
    const apiResponse = await page.textContent('body');
    console.log('📡 API 응답:', apiResponse.substring(0, 300) + '...');
    
    if (apiResponse.includes('CSRF 수정 테스트')) {
      console.log('🎉 성공! 블로그 글이 정상적으로 저장되었습니다!');
    } else {
      console.log('❌ 실패: 블로그 글이 저장되지 않았습니다.');
    }
    
    await page.screenshot({ path: 'csrf-fix-03-api-check.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await page.screenshot({ path: 'csrf-fix-error.png', fullPage: true });
  } finally {
    console.log('\n✅ CSRF 수정 테스트 완료!');
    console.log('브라우저를 열어두었습니다. 확인 후 닫아주세요.');
  }
})();