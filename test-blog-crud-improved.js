const { chromium } = require('playwright');

(async () => {
  console.log('🚀 블로그 CRUD 테스트 시작 - 포트 4000 (개선된 버전)');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 관리자 페이지로 이동
    console.log('1️⃣ 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 스크린샷
    await page.screenshot({ path: 'screenshots/blog-crud-v2-01-admin.png', fullPage: true });

    // 2. 블로그 관리 탭 클릭
    console.log('2️⃣ 블로그 관리 탭 클릭...');
    await page.click('button:has-text("블로그 관리")');
    
    // 로딩이 완료될 때까지 충분히 대기
    console.log('   ⏳ 포스트 목록 로딩 대기 중...');
    await page.waitForTimeout(3000);
    
    // 로딩 스피너가 사라질 때까지 대기
    try {
      await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 5000 });
    } catch (e) {
      console.log('   ⏳ 로딩 스피너 대기 완료');
    }
    
    await page.screenshot({ path: 'screenshots/blog-crud-v2-02-blog-tab-loaded.png', fullPage: true });

    // 3. 현재 페이지 상태 확인
    console.log('3️⃣ 현재 페이지 상태 확인...');
    
    // 새 포스트 버튼 찾기 - 다양한 선택자 시도
    const newPostSelectors = [
      'button:has-text("새 포스트 작성")',
      'button:has-text("새 포스트")',
      'button:has-text("포스트 작성")',
      'button:has-text("작성")',
      'button:has-text("추가")',
      'button:has(svg)', // 아이콘 버튼일 수도 있음
      'button.primary', // 주요 버튼 클래스
      'button[class*="primary"]'
    ];
    
    let newPostButton = null;
    for (const selector of newPostSelectors) {
      try {
        const button = await page.locator(selector).first();
        if (await button.isVisible({ timeout: 1000 })) {
          newPostButton = button;
          console.log(`   ✅ 버튼 찾음: ${selector}`);
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }

    if (!newPostButton) {
      console.log('   ❌ 새 포스트 버튼을 찾을 수 없음');
      console.log('   📊 페이지 내 버튼 목록:');
      const buttons = await page.locator('button').allTextContents();
      buttons.forEach((text, i) => {
        if (text.trim()) console.log(`      ${i + 1}. "${text.trim()}"`);
      });
      
      // 테이블 상태 확인
      const tableExists = await page.locator('table').isVisible();
      console.log(`   📊 테이블 존재: ${tableExists}`);
      
      if (tableExists) {
        const rows = await page.locator('tbody tr').count();
        console.log(`   📊 테이블 행 수: ${rows}`);
      }
    } else {
      // 4. 새 포스트 작성
      console.log('4️⃣ 새 포스트 작성 버튼 클릭...');
      await newPostButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'screenshots/blog-crud-v2-03-new-post-modal.png', fullPage: true });

      // 5. 포스트 데이터 입력
      console.log('5️⃣ 포스트 데이터 입력...');
      
      // 제목 입력 - 다양한 선택자 시도
      const titleSelectors = ['input[name="title"]', 'input[placeholder*="제목"]', 'input[type="text"]'];
      for (const selector of titleSelectors) {
        try {
          await page.fill(selector, '테스트 포스트 - CRUD 검증 v2');
          console.log(`   ✅ 제목 입력 성공: ${selector}`);
          break;
        } catch (e) {
          // 다음 선택자 시도
        }
      }
      
      // 요약 입력
      try {
        await page.fill('textarea[name="excerpt"]', '이것은 CRUD 기능 검증을 위한 테스트 포스트입니다.');
      } catch (e) {
        await page.fill('textarea:nth-of-type(1)', '이것은 CRUD 기능 검증을 위한 테스트 포스트입니다.');
      }
      
      // 내용 입력
      try {
        await page.fill('textarea[name="content"]', '# 테스트 내용\n\n이것은 블로그 CRUD 기능을 검증하기 위한 테스트 포스트입니다.\n\n## 주요 기능\n- 생성\n- 읽기\n- 수정\n- 삭제');
      } catch (e) {
        await page.fill('textarea:nth-of-type(2)', '# 테스트 내용\n\n이것은 블로그 CRUD 기능을 검증하기 위한 테스트 포스트입니다.\n\n## 주요 기능\n- 생성\n- 읽기\n- 수정\n- 삭제');
      }
      
      await page.screenshot({ path: 'screenshots/blog-crud-v2-04-form-filled.png', fullPage: true });

      // 6. 저장
      console.log('6️⃣ 포스트 저장...');
      const saveButton = await page.locator('button:has-text("저장")').or(page.locator('button:has-text("작성")'));
      await saveButton.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'screenshots/blog-crud-v2-05-after-save.png', fullPage: true });
    }

    // 7. API 확인
    console.log('7️⃣ API 직접 확인...');
    const apiResponse = await page.evaluate(async () => {
      const response = await fetch('http://localhost:4000/api/blog/posts');
      return await response.json();
    });
    
    console.log('📊 API 응답:', {
      totalPosts: apiResponse.posts?.length || 0,
      hasTestPost: apiResponse.posts?.some(p => p.title.includes('테스트')),
      firstThreeTitles: apiResponse.posts?.slice(0, 3).map(p => p.title),
      debug: apiResponse.debug
    });

    await page.screenshot({ path: 'screenshots/blog-crud-v2-06-final-state.png', fullPage: true });

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
    await page.screenshot({ path: 'screenshots/blog-crud-v2-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ 테스트 완료');
  }
})();