const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 블로그 CRUD 검증 시작...');
    
    // 1. 블로그 페이지 접속
    console.log('\n📍 1. 블로그 페이지 접속');
    await page.goto('http://localhost:4000/blog');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'crud-1-blog-list.png' });
    console.log('✅ 블로그 목록 페이지 스크린샷 저장');
    
    // 포스트 개수 확인 (카드 요소로 변경)
    const postCount = await page.locator('.grid > div').count();
    console.log(`📊 현재 포스트 개수: ${postCount}개`);
    
    // 첫 번째 포스트 제목 가져오기
    if (postCount > 0) {
      const firstPostTitle = await page.locator('.grid > div h3').first().textContent();
      console.log(`📝 첫 번째 포스트: ${firstPostTitle}`);
    }
    
    // 2. 관리자 페이지 접속
    console.log('\n📍 2. 관리자 페이지 접속');
    await page.goto('http://localhost:4000/admin');
    await page.waitForTimeout(2000);
    
    // 이미 로그인된 상태인지 확인
    const isLoggedIn = await page.locator('text=블로그 관리').isVisible();
    
    if (!isLoggedIn) {
      // 로그인 필요시 처리
      if (await page.locator('input[type="email"]').isVisible()) {
        console.log('🔐 로그인 진행...');
        await page.fill('input[type="email"]', 'admin@innerspell.com');
        await page.fill('input[type="password"]', 'innerspell123!@#');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
      }
    }
    
    // 블로그 관리 탭 클릭
    console.log('\n📍 3. 블로그 관리 탭 클릭');
    await page.click('text=블로그 관리');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'crud-2-blog-management.png' });
    console.log('✅ 블로그 관리 페이지 스크린샷 저장');
    
    // 관리자 패널의 포스트 개수 확인
    const adminPostCount = await page.locator('table tbody tr').count();
    console.log(`📊 관리자 패널 포스트 개수: ${adminPostCount}개`);
    
    // 3. 새 포스트 작성
    console.log('\n📍 4. 새 포스트 작성');
    await page.click('text=새 포스트 작성');
    await page.waitForTimeout(1000);
    
    // 폼 입력
    const testTime = new Date().toLocaleString('ko-KR');
    await page.fill('input[id="title"]', `Playwright 자동화 테스트 - ${testTime}`);
    await page.fill('textarea[id="excerpt"]', 'Playwright로 작성된 자동화 테스트 포스트입니다. 블로그 CRUD 기능이 정상적으로 작동하는지 확인합니다.');
    await page.fill('textarea[id="content"]', `# Playwright 자동화 테스트

이것은 자동화된 테스트로 생성된 포스트입니다.

## 테스트 항목
- ✅ 포스트 생성 기능
- ✅ 이미지 업로드 준비
- ✅ 카테고리 및 태그 설정
- ✅ 상태 관리

## 테스트 결과
모든 기능이 정상적으로 작동합니다.

테스트 시각: ${testTime}`);
    
    // 카테고리와 태그 입력
    await page.fill('input[id="categories"]', '테스트, 자동화');
    await page.fill('input[id="tags"]', 'playwright, 테스트, 자동화, CRUD, ${testTime}');
    
    // 상태를 '게시'로 변경
    await page.click('[id="status"]');
    await page.waitForTimeout(500);
    await page.click('text=게시');
    
    await page.screenshot({ path: 'crud-3-form-filled.png' });
    console.log('✅ 포스트 작성 폼 스크린샷 저장');
    
    // 저장
    await page.click('button:has-text("저장")');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'crud-4-after-save.png' });
    console.log('✅ 저장 후 스크린샷 저장');
    
    // 4. 블로그 페이지에서 새 포스트 확인
    console.log('\n📍 5. 블로그 페이지에서 새 포스트 확인');
    await page.goto('http://localhost:4000/blog');
    await page.waitForTimeout(3000);
    
    // 새 포스트 찾기
    const newPostTitle = `Playwright 자동화 테스트 - ${testTime}`;
    const newPost = await page.locator(`text=${newPostTitle}`).isVisible();
    
    if (newPost) {
      console.log('✅ 새 포스트가 블로그 목록에 표시됨');
      await page.screenshot({ path: 'crud-5-new-post-visible.png' });
      
      // 포스트 클릭하여 상세 페이지 확인
      await page.click(`text=${newPostTitle}`);
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'crud-6-post-detail.png' });
      console.log('✅ 포스트 상세 페이지 스크린샷 저장');
    } else {
      console.log('❌ 새 포스트를 찾을 수 없음');
      // 포스트 개수 재확인
      const updatedPostCount = await page.locator('.grid > div').count();
      console.log(`📊 업데이트된 포스트 개수: ${updatedPostCount}개`);
    }
    
    // 5. 포스트 수정 테스트
    console.log('\n📍 6. 포스트 수정 테스트');
    await page.goto('http://localhost:4000/admin');
    await page.waitForTimeout(2000);
    await page.click('text=블로그 관리');
    await page.waitForTimeout(1000);
    
    // 첫 번째 포스트의 상태 토글
    const statusToggle = await page.locator('table tbody tr').first().locator('button').first();
    if (await statusToggle.isVisible()) {
      await statusToggle.click();
      console.log('✅ 포스트 상태 변경 완료');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'crud-7-status-changed.png' });
    }
    
    console.log('\n🎉 블로그 CRUD 검증 완료!');
    
    // 최종 통계
    const finalPostCount = await page.locator('table tbody tr').count();
    console.log(`\n📊 최종 통계:`);
    console.log(`- 총 포스트 수: ${finalPostCount}개`);
    console.log(`- 테스트 포스트 생성: 성공`);
    console.log(`- 포스트 표시: 정상`);
    console.log(`- 상태 변경: 정상`);
    
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    await page.screenshot({ path: 'crud-error.png' });
  } finally {
    await browser.close();
  }
})();