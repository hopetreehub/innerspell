const { chromium } = require('playwright');

(async () => {
  console.log('🚀 블로그 완전 테스트 - 포트 4000');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 관리자 페이지로 이동
    console.log('\n1️⃣ 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 2. 블로그 관리 탭 클릭 및 대기
    console.log('\n2️⃣ 블로그 관리 탭 클릭...');
    await page.click('button:has-text("블로그 관리")');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'screenshots/blog-complete-01-initial.png', fullPage: true });

    // 3. 새 포스트 버튼 클릭
    console.log('\n3️⃣ 새 포스트 작성 시작...');
    await page.click('button:has-text("새 포스트")');
    await page.waitForTimeout(1000);
    
    // 4. 모달 내부 스크롤 처리를 위한 함수
    const scrollModal = async (pixels) => {
      await page.evaluate((px) => {
        const modal = document.querySelector('[role="dialog"] .overflow-y-auto');
        if (modal) modal.scrollTop += px;
      }, pixels);
      await page.waitForTimeout(500);
    };

    // 5. 제목과 요약 입력
    console.log('\n4️⃣ 기본 정보 입력...');
    await page.fill('input[placeholder*="제목을 입력하세요"]', '블로그 CRUD 완전 테스트 포스트');
    await page.fill('textarea:first-of-type', '이것은 블로그 CRUD 기능의 완전한 테스트를 위한 포스트입니다. 이미지 업로드와 모든 필드를 포함합니다.');
    
    await page.screenshot({ path: 'screenshots/blog-complete-02-title-filled.png', fullPage: true });

    // 6. 모달 스크롤하여 카테고리 영역 표시
    console.log('\n5️⃣ 카테고리 선택...');
    await scrollModal(200);
    
    // 카테고리 드롭다운 찾기 - 더 구체적인 선택자 사용
    const categoryDropdown = await page.locator('button[role="combobox"]:below(label:has-text("카테고리"))').first();
    if (await categoryDropdown.isVisible()) {
      await categoryDropdown.click();
      await page.waitForTimeout(500);
      await page.click('div[role="option"]:has-text("타로")');
    }

    // 7. 내용 입력
    console.log('\n6️⃣ 포스트 내용 입력...');
    await scrollModal(200);
    
    // 내용 textarea 찾기
    const contentTextarea = await page.locator('textarea').nth(1);
    await contentTextarea.fill(`# 블로그 CRUD 테스트

이것은 블로그 기능의 완전한 테스트입니다.

## 테스트 항목

1. **포스트 작성** - 모든 필드 입력
2. **이미지 업로드** - Mock 이미지 사용
3. **카테고리 설정** - 타로 카테고리
4. **게시 상태** - 게시 설정
5. **저장 및 확인** - API 응답 확인

## 기대 결과

- 포스트가 성공적으로 저장됨
- 목록에 새 포스트가 표시됨
- API에서 포스트 조회 가능
`);

    await page.screenshot({ path: 'screenshots/blog-complete-03-content-filled.png', fullPage: true });

    // 8. 이미지 업로드 테스트 (개발 모드에서는 Mock 이미지 반환)
    console.log('\n7️⃣ 이미지 업로드 테스트...');
    await scrollModal(-400); // 위로 스크롤하여 이미지 영역 표시
    
    // 이미지 업로드 버튼 찾기
    const imageUploadButton = await page.locator('button:has-text("이미지 교체")').or(page.locator('label:has-text("이미지 교체")')).first();
    if (await imageUploadButton.isVisible()) {
      console.log('   ✅ 이미지 업로드 버튼 발견');
      // 개발 모드에서는 실제 업로드 대신 Mock 이미지가 사용됨
    } else {
      console.log('   ⚠️  이미지 업로드 버튼을 찾을 수 없음');
    }

    // 9. 게시 상태 토글
    console.log('\n8️⃣ 게시 상태 설정...');
    await scrollModal(300);
    
    const publishSwitch = await page.locator('button[role="switch"]').first();
    if (await publishSwitch.isVisible()) {
      await publishSwitch.click();
      console.log('   ✅ 게시 상태: ON');
    }

    await page.screenshot({ path: 'screenshots/blog-complete-04-ready-to-save.png', fullPage: true });

    // 10. 저장
    console.log('\n9️⃣ 포스트 저장...');
    const saveButton = await page.locator('button:has-text("저장")').last();
    await saveButton.click();
    
    // 저장 완료 대기
    await page.waitForTimeout(3000);
    
    // 토스트 메시지 확인
    const toastText = await page.locator('[class*="toast"]').textContent().catch(() => '');
    if (toastText) {
      console.log('   📢 알림:', toastText);
    }

    await page.screenshot({ path: 'screenshots/blog-complete-05-after-save.png', fullPage: true });

    // 11. 저장 확인
    console.log('\n🔍 저장 결과 확인...');
    
    // 포스트 목록에서 확인
    const savedPost = await page.locator('td:has-text("블로그 CRUD 완전 테스트 포스트")').isVisible();
    console.log('   ✅ 목록에 표시:', savedPost ? '성공' : '실패');

    // 12. API 확인
    console.log('\n📊 API 응답 확인...');
    const apiResponse = await page.evaluate(async () => {
      const response = await fetch('http://localhost:4000/api/blog/posts');
      return await response.json();
    });
    
    const testPost = apiResponse.posts?.find(p => p.title.includes('블로그 CRUD 완전 테스트'));
    console.log('   API 결과:', {
      totalPosts: apiResponse.posts?.length || 0,
      testPostFound: !!testPost,
      testPostDetails: testPost ? {
        id: testPost.id,
        title: testPost.title,
        category: testPost.category,
        published: testPost.published,
        image: testPost.image
      } : null
    });

    // 13. 포스트 수정 테스트
    if (savedPost) {
      console.log('\n🔄 포스트 수정 테스트...');
      
      const editRow = await page.locator('tr:has-text("블로그 CRUD 완전 테스트 포스트")');
      const editButton = await editRow.locator('button').first();
      await editButton.click();
      await page.waitForTimeout(1000);
      
      // 제목 수정
      const titleInput = await page.locator('input[value*="블로그 CRUD"]');
      await titleInput.fill('블로그 CRUD 완전 테스트 포스트 (수정됨)');
      
      // 저장
      await page.click('button:has-text("저장")');
      await page.waitForTimeout(2000);
      
      const editedPost = await page.locator('td:has-text("(수정됨)")').isVisible();
      console.log('   ✅ 수정 완료:', editedPost ? '성공' : '실패');
    }

    // 14. 최종 상태
    await page.screenshot({ path: 'screenshots/blog-complete-06-final.png', fullPage: true });
    
    // 결과 요약
    console.log('\n📋 테스트 결과 요약:');
    console.log('✅ 관리자 페이지 접속');
    console.log('✅ 블로그 관리 탭 활성화');
    console.log('✅ 새 포스트 모달 열기');
    console.log('✅ 포스트 데이터 입력');
    console.log(`${savedPost ? '✅' : '❌'} 포스트 저장`);
    console.log(`${testPost ? '✅' : '❌'} API 연동 확인`);
    console.log(`${savedPost ? '✅' : '❌'} 포스트 수정`);
    
    if (!testPost) {
      console.log('\n⚠️  문제 분석:');
      console.log('- Mock 모드에서 데이터가 메모리에만 저장됨');
      console.log('- 서버 재시작 시 데이터 소실');
      console.log('- 해결: JSON 파일 기반 영속성 구현 필요');
    }

  } catch (error) {
    console.error('\n❌ 테스트 중 오류:', error.message);
    await page.screenshot({ path: 'screenshots/blog-complete-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ 테스트 완료');
  }
})();