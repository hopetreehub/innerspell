const { chromium } = require('playwright');

async function testBlogPostSave() {
  console.log('🚀 블로그 포스트 저장 기능 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // 개발자 도구 자동 열기
  });
  
  let page;
  
  try {
    const context = await browser.newContext();
    page = await context.newPage();
    
    // 1. 관리자 페이지 접속
    console.log('📍 관리자 페이지 접속 중...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 초기 상태 스크린샷
    await page.screenshot({ 
      path: 'screenshots/blog-test-1-admin-page.png',
      fullPage: true 
    });
    
    // 2. 블로그 관리 탭 클릭
    console.log('📍 블로그 관리 탭으로 이동...');
    await page.click('button:has-text("블로그 관리")');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'screenshots/blog-test-2-blog-tab.png',
      fullPage: true 
    });
    
    // 3. 새 포스트 버튼 클릭
    console.log('📍 새 포스트 버튼 클릭...');
    const newPostButton = page.locator('button:has-text("새 포스트")');
    await newPostButton.waitFor({ state: 'visible' });
    await newPostButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'screenshots/blog-test-3-new-post-form.png',
      fullPage: true 
    });
    
    // 4. 포스트 정보 입력
    console.log('📍 포스트 정보 입력 중...');
    
    // 제목 입력
    await page.fill('input[placeholder="포스트 제목을 입력하세요"]', '테스트 포스트 - PM 검증');
    
    // 요약 입력
    await page.fill('textarea[placeholder="포스트 요약을 입력하세요 (검색 결과에 표시됩니다)"]', 'SWARM PM이 작성한 테스트 포스트입니다.');
    
    // 카테고리 선택
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption({ label: '타로' });
    
    // 본문 입력은 대표 이미지 섹션 아래에 있으므로 먼저 스크롤
    await page.evaluate(() => {
      // 모달 내부에서 스크롤
      const modal = document.querySelector('[role="dialog"]') || document.querySelector('.fixed');
      if (modal) {
        modal.scrollTop = modal.scrollHeight;
      }
    });
    await page.waitForTimeout(500);
    
    // MDX 에디터 찾기 - 모달 내부의 textarea 찾기
    console.log('📍 MDX 에디터 찾는 중...');
    const textareas = await page.locator('textarea').all();
    console.log(`발견된 textarea 개수: ${textareas.length}`);
    
    // 본문 입력 시도 - 일반적으로 마지막 textarea가 MDX 에디터
    if (textareas.length > 1) {
      const mdxContent = `# 테스트 포스트

이것은 포스트 저장 기능을 테스트하기 위한 내용입니다.

## 기능 테스트
- 포스트 생성
- 이미지 업로드  
- 저장 기능

### 테스트 시간
${new Date().toLocaleString('ko-KR')}`;
      
      // 마지막 textarea에 입력 시도
      await textareas[textareas.length - 1].fill(mdxContent);
    }
    
    await page.screenshot({ 
      path: 'screenshots/blog-test-4-filled-form.png',
      fullPage: true 
    });
    
    // 5. 네트워크 요청 모니터링 설정
    console.log('📍 네트워크 모니터링 시작...');
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/blog')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        });
      }
    });
    
    // 6. 저장 버튼 찾기 및 클릭
    console.log('📍 저장 버튼 찾는 중...');
    
    // 다양한 방법으로 저장 버튼 찾기
    let saveButton = await page.locator('button').filter({ hasText: /저장|생성|추가|확인|Save|Create/i }).first();
    
    if (!await saveButton.isVisible()) {
      // 모달 내에서 버튼 찾기
      saveButton = await page.locator('[role="dialog"] button, .fixed button').filter({ hasText: /저장|생성|추가|확인/i }).first();
    }
    
    console.log('저장 버튼 찾음, 클릭 시도...');
    
    // 저장 전 상태
    await page.screenshot({ 
      path: 'screenshots/blog-test-5-before-save.png',
      fullPage: true 
    });
    
    if (await saveButton.isVisible()) {
      await saveButton.click();
      console.log('✅ 저장 버튼 클릭 완료');
    } else {
      console.log('❌ 저장 버튼을 찾을 수 없습니다');
    }
    
    // 저장 응답 대기
    await page.waitForTimeout(3000);
    
    // 7. 결과 확인
    console.log('📍 저장 결과 확인...');
    await page.screenshot({ 
      path: 'screenshots/blog-test-6-after-save.png',
      fullPage: true 
    });
    
    // 성공 메시지 확인
    const successMessage = await page.locator('text=/포스트가 성공적으로|성공적으로 저장|저장되었습니다/').isVisible();
    console.log('✅ 성공 메시지 표시:', successMessage);
    
    // 에러 메시지 확인
    const errorMessage = await page.locator('text=/오류|에러|실패/').isVisible();
    if (errorMessage) {
      console.log('❌ 에러 메시지가 표시되었습니다');
      const errorTexts = await page.locator('text=/오류|에러|실패/').allTextContents();
      console.log('에러 내용:', errorTexts);
    }
    
    // 8. 네트워크 요청 결과 출력
    console.log('\n📊 네트워크 요청 결과:');
    responses.forEach(res => {
      console.log(`- ${res.method} ${res.url} : ${res.status}`);
    });
    
    // 9. 모달이 닫혔는지 확인
    await page.waitForTimeout(2000);
    const modalClosed = !(await page.locator('[role="dialog"], .fixed').isVisible());
    console.log('✅ 모달 닫힘 상태:', modalClosed);
    
    // 10. 포스트 목록 확인
    if (modalClosed) {
      console.log('\n📍 포스트 목록 확인...');
      await page.screenshot({ 
        path: 'screenshots/blog-test-7-post-list.png',
        fullPage: true 
      });
      
      // 새로 생성된 포스트 확인
      const newPost = await page.locator('text=/테스트 포스트 - PM 검증/').isVisible();
      console.log('✅ 새 포스트 목록에 표시:', newPost);
    }
    
    console.log('\n✅ 테스트 완료!');
    console.log('📸 스크린샷이 screenshots 폴더에 저장되었습니다.');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    // page가 정의되어 있는지 확인
    if (typeof page !== 'undefined' && page) {
      await page.screenshot({ 
        path: 'screenshots/blog-test-error.png',
        fullPage: true 
      });
    }
  } finally {
    console.log('\n브라우저를 열어둡니다. 수동으로 확인 후 닫아주세요.');
    // await browser.close();
  }
}

// 테스트 실행
testBlogPostSave();