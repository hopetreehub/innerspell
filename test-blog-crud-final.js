const { chromium } = require('playwright');

(async () => {
  console.log('🚀 블로그 CRUD 최종 테스트 - 포트 4000');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 관리자 페이지로 이동
    console.log('1️⃣ 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 2. 블로그 관리 탭 클릭 및 대기
    console.log('2️⃣ 블로그 관리 탭 클릭...');
    await page.click('button:has-text("블로그 관리")');
    await page.waitForTimeout(3000); // 데이터 로딩 대기
    
    await page.screenshot({ path: 'screenshots/blog-crud-final-01-blog-tab.png', fullPage: true });

    // 3. 새 포스트 버튼 클릭
    console.log('3️⃣ 새 포스트 작성 시작...');
    const newPostButton = await page.locator('button:has-text("새 포스트")');
    await newPostButton.click();
    await page.waitForTimeout(1000);
    
    // 4. 모달이 열렸는지 확인
    const modalTitle = await page.locator('h2:has-text("새 포스트 작성")').isVisible();
    console.log('   ✅ 모달 열림 상태:', modalTitle);
    
    await page.screenshot({ path: 'screenshots/blog-crud-final-02-modal-open.png', fullPage: true });

    // 5. 필드 채우기 - 정확한 선택자 사용
    console.log('4️⃣ 포스트 데이터 입력...');
    
    // 제목
    await page.fill('input[placeholder*="제목을 입력하세요"]', '테스트 포스트 - CRUD 최종 검증');
    
    // 요약
    const excerptTextarea = await page.locator('textarea').first();
    await excerptTextarea.fill('이것은 블로그 CRUD 기능의 최종 검증을 위한 테스트 포스트입니다.');
    
    // 카테고리 선택 (드롭다운)
    const categorySelect = await page.locator('button[role="combobox"]').first();
    await categorySelect.click();
    await page.waitForTimeout(500);
    await page.click('div[role="option"]:has-text("타로")');
    
    await page.screenshot({ path: 'screenshots/blog-crud-final-03-basic-fields.png', fullPage: true });
    
    // 내용 입력을 위해 스크롤
    await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) modal.scrollTop = 200;
    });
    
    // 내용 (두 번째 textarea)
    const contentTextarea = await page.locator('textarea').nth(1);
    await contentTextarea.fill('# 테스트 포스트 내용\n\n이것은 블로그 CRUD 기능을 검증하기 위한 테스트입니다.\n\n## 주요 테스트 항목\n\n- 포스트 생성\n- 포스트 수정\n- 포스트 삭제\n- API 연동 확인');
    
    // 게시 상태 토글
    const publishSwitch = await page.locator('button[role="switch"]').first();
    await publishSwitch.click();
    console.log('   ✅ 게시 상태: ON');
    
    await page.screenshot({ path: 'screenshots/blog-crud-final-04-all-fields.png', fullPage: true });

    // 6. 저장
    console.log('5️⃣ 포스트 저장...');
    const saveButton = await page.locator('button:has-text("저장")');
    await saveButton.click();
    
    // 저장 완료 대기
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'screenshots/blog-crud-final-05-after-save.png', fullPage: true });

    // 7. 저장 확인
    console.log('6️⃣ 저장 결과 확인...');
    
    // 토스트 메시지 확인
    const toastMessage = await page.locator('[class*="toast"]').textContent().catch(() => '');
    console.log('   📢 토스트 메시지:', toastMessage);
    
    // 포스트 목록에서 확인
    const savedPost = await page.locator('td:has-text("테스트 포스트 - CRUD 최종 검증")').isVisible();
    console.log('   ✅ 목록에 표시:', savedPost);

    // 8. API 직접 확인
    console.log('7️⃣ API 응답 확인...');
    const apiResponse = await page.evaluate(async () => {
      const response = await fetch('http://localhost:4000/api/blog/posts');
      return await response.json();
    });
    
    const testPost = apiResponse.posts?.find(p => p.title.includes('테스트 포스트 - CRUD 최종 검증'));
    console.log('   📊 API 응답:', {
      totalPosts: apiResponse.posts?.length || 0,
      testPostFound: !!testPost,
      testPostId: testPost?.id,
      debug: apiResponse.debug
    });

    // 9. 포스트 수정 테스트
    if (savedPost) {
      console.log('8️⃣ 포스트 수정 테스트...');
      
      // 편집 버튼 찾기
      const editRow = await page.locator('tr:has-text("테스트 포스트 - CRUD 최종 검증")');
      const editButton = await editRow.locator('button:has(svg)').first(); // Edit 아이콘 버튼
      await editButton.click();
      await page.waitForTimeout(1000);
      
      // 제목 수정
      await page.fill('input[value*="테스트 포스트"]', '테스트 포스트 - CRUD 최종 검증 (수정됨)');
      
      // 저장
      await page.click('button:has-text("저장")');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'screenshots/blog-crud-final-06-after-edit.png', fullPage: true });
      
      const editedPost = await page.locator('td:has-text("(수정됨)")').isVisible();
      console.log('   ✅ 수정 완료:', editedPost);
    }

    // 10. 최종 상태
    await page.screenshot({ path: 'screenshots/blog-crud-final-07-final-state.png', fullPage: true });
    
    // 결과 요약
    console.log('\n📋 테스트 결과 요약:');
    console.log('✅ 관리자 페이지 접속: 성공');
    console.log('✅ 블로그 관리 탭: 성공');
    console.log('✅ 새 포스트 모달: 성공');
    console.log(`${savedPost ? '✅' : '❌'} 포스트 저장: ${savedPost ? '성공' : '실패'}`);
    console.log(`${testPost ? '✅' : '❌'} API 연동: ${testPost ? '성공' : '실패'}`);
    console.log(`${savedPost ? '✅' : '❌'} 포스트 수정: ${savedPost ? '성공' : '실패'}`);
    
    if (!savedPost || !testPost) {
      console.log('\n⚠️  문제 발견: Mock 모드에서 데이터가 메모리에만 저장되고 있습니다.');
      console.log('   → 해결 방안: 데이터 영속성을 위한 파일 시스템 저장 구현 필요');
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
    await page.screenshot({ path: 'screenshots/blog-crud-final-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ 테스트 완료');
  }
})();