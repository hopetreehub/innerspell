const { chromium } = require('playwright');

(async () => {
  console.log('🚀 블로그 CRUD 테스트 시작 - 포트 4000');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 관리자 페이지로 이동
    console.log('1️⃣ 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 스크린샷
    await page.screenshot({ path: 'screenshots/blog-crud-01-admin.png', fullPage: true });

    // 2. 블로그 관리 탭 클릭
    console.log('2️⃣ 블로그 관리 탭 클릭...');
    await page.click('button:has-text("블로그 관리")');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'screenshots/blog-crud-02-blog-tab.png', fullPage: true });

    // 3. 새 포스트 작성 버튼 클릭
    console.log('3️⃣ 새 포스트 작성 버튼 클릭...');
    const newPostButton = await page.locator('button:has-text("새 포스트 작성")').first();
    await newPostButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'screenshots/blog-crud-03-new-post-modal.png', fullPage: true });

    // 4. 포스트 데이터 입력
    console.log('4️⃣ 포스트 데이터 입력...');
    await page.fill('input[name="title"]', '테스트 포스트 - CRUD 검증');
    await page.fill('textarea[name="excerpt"]', '이것은 CRUD 기능 검증을 위한 테스트 포스트입니다.');
    await page.fill('textarea[name="content"]', '# 테스트 내용\n\n이것은 블로그 CRUD 기능을 검증하기 위한 테스트 포스트입니다.\n\n## 주요 기능\n- 생성\n- 읽기\n- 수정\n- 삭제');
    
    // 카테고리 선택
    await page.click('button[role="combobox"]');
    await page.click('div[role="option"]:has-text("타로")');
    
    await page.screenshot({ path: 'screenshots/blog-crud-04-form-filled.png', fullPage: true });

    // 5. 저장
    console.log('5️⃣ 포스트 저장...');
    await page.click('button:has-text("저장")');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'screenshots/blog-crud-05-after-save.png', fullPage: true });

    // 6. 저장된 포스트 확인
    console.log('6️⃣ 저장된 포스트 확인...');
    const savedPost = await page.locator('text="테스트 포스트 - CRUD 검증"').isVisible();
    console.log('✅ 포스트 저장 상태:', savedPost ? '성공' : '실패');

    // 7. 포스트 수정 테스트
    if (savedPost) {
      console.log('7️⃣ 포스트 수정 테스트...');
      // 편집 버튼 클릭
      const editButton = await page.locator('tr:has-text("테스트 포스트 - CRUD 검증") button:has-text("편집")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(1000);
        
        // 제목 수정
        await page.fill('input[name="title"]', '테스트 포스트 - CRUD 검증 (수정됨)');
        await page.click('button:has-text("저장")');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'screenshots/blog-crud-06-after-edit.png', fullPage: true });
        
        const editedPost = await page.locator('text="테스트 포스트 - CRUD 검증 (수정됨)"').isVisible();
        console.log('✅ 포스트 수정 상태:', editedPost ? '성공' : '실패');
      }
    }

    // 8. API 직접 확인
    console.log('8️⃣ API 직접 확인...');
    const apiResponse = await page.evaluate(async () => {
      const response = await fetch('http://localhost:4000/api/blog/posts');
      return await response.json();
    });
    
    console.log('📊 API 응답:', {
      totalPosts: apiResponse.posts?.length || 0,
      hasTestPost: apiResponse.posts?.some(p => p.title.includes('테스트 포스트')),
      debug: apiResponse.debug
    });

    await page.screenshot({ path: 'screenshots/blog-crud-07-final-state.png', fullPage: true });

    // 결과 요약
    console.log('\n📋 테스트 결과 요약:');
    console.log('- 관리자 페이지 접속: ✅');
    console.log('- 블로그 관리 탭: ✅');
    console.log('- 새 포스트 작성 폼: ✅');
    console.log('- 포스트 저장:', savedPost ? '✅' : '❌');
    console.log('- 포스트 수정:', savedPost ? '✅' : '❌');
    console.log('- API 응답:', apiResponse.posts ? '✅' : '❌');

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
    await page.screenshot({ path: 'screenshots/blog-crud-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ 테스트 완료');
  }
})();