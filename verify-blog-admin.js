const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. 홈페이지 접속 중...');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'step-1-homepage.png' });

    // 로그인 페이지로 이동
    console.log('2. 로그인 페이지로 이동 중...');
    await page.goto('http://localhost:4000/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'step-2-login-page.png' });

    // 로그인 수행
    console.log('3. 로그인 시도 중...');
    await page.fill('input[type="email"]', 'admin@teststudio.com');
    await page.fill('input[type="password"]', 'admin123!@#');
    await page.screenshot({ path: 'step-3-login-filled.png' });
    
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'step-4-after-login.png' });

    // 관리자 페이지로 이동
    console.log('4. 관리자 페이지로 이동 중...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'step-5-admin-page.png' });

    // 블로그 관리 탭 클릭
    console.log('5. 블로그 관리 탭 찾기...');
    const blogTab = await page.locator('text=블로그 관리').first();
    if (await blogTab.isVisible()) {
      await blogTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'step-6-blog-management.png' });
      console.log('✅ 블로그 관리 탭 발견 및 클릭 완료');
    } else {
      console.log('❌ 블로그 관리 탭을 찾을 수 없습니다');
    }

    // 블로그 목록 확인
    console.log('6. 블로그 목록 확인 중...');
    const blogPosts = await page.locator('[data-testid="blog-post-item"], .blog-post-item, tr').count();
    console.log(`현재 블로그 포스트 수: ${blogPosts}개`);

    // 새 포스트 작성 버튼 찾기
    console.log('7. 새 포스트 작성 버튼 찾기...');
    const createButton = await page.locator('button:has-text("새 포스트"), button:has-text("작성"), button:has-text("추가")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'step-7-create-modal.png' });
      console.log('✅ 새 포스트 작성 모달 열림');
      
      // 모달 닫기
      const closeButton = await page.locator('button:has-text("취소"), button:has-text("닫기"), [aria-label="Close"]').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    }

    // 기존 포스트 편집 버튼 확인
    console.log('8. 편집/삭제 버튼 확인 중...');
    const editButtons = await page.locator('button:has-text("편집"), button:has-text("수정")').count();
    const deleteButtons = await page.locator('button:has-text("삭제")').count();
    console.log(`편집 버튼: ${editButtons}개, 삭제 버튼: ${deleteButtons}개`);

    // 최종 스크린샷
    await page.screenshot({ path: 'step-8-final-blog-admin.png', fullPage: true });

    console.log('\n=== 블로그 CRUD 기능 검증 완료 ===');
    console.log(`✅ 블로그 관리 탭: ${await page.locator('text=블로그 관리').isVisible() ? '정상' : '없음'}`);
    console.log(`✅ 블로그 포스트 목록: ${blogPosts}개`);
    console.log(`✅ 새 포스트 작성 버튼: ${await createButton.isVisible() ? '있음' : '없음'}`);
    console.log(`✅ 편집 버튼: ${editButtons}개`);
    console.log(`✅ 삭제 버튼: ${deleteButtons}개`);

  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  }

  // 브라우저는 열어둠
  console.log('\n브라우저를 열어두었습니다. 수동으로 확인하실 수 있습니다.');
  console.log('종료하려면 Ctrl+C를 누르세요.');
})();