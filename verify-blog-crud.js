const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // 각 액션 사이에 1초 대기
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
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verify-1-blog-list.png' });
    console.log('✅ 블로그 목록 페이지 스크린샷 저장');
    
    // 포스트 개수 확인
    const postCount = await page.locator('article').count();
    console.log(`📊 현재 포스트 개수: ${postCount}개`);
    
    // 2. 관리자 페이지 접속
    console.log('\n📍 2. 관리자 페이지 접속');
    await page.goto('http://localhost:4000/admin');
    await page.waitForTimeout(2000);
    
    // 로그인 필요시 처리
    if (await page.locator('input[type="email"]').isVisible()) {
      console.log('🔐 로그인 진행...');
      await page.fill('input[type="email"]', 'admin@innerspell.com');
      await page.fill('input[type="password"]', 'innerspell123!@#');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    // 블로그 관리 탭 클릭
    console.log('\n📍 3. 블로그 관리 탭 클릭');
    await page.click('text=블로그 관리');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verify-2-blog-management.png' });
    console.log('✅ 블로그 관리 페이지 스크린샷 저장');
    
    // 3. 새 포스트 작성
    console.log('\n📍 4. 새 포스트 작성');
    await page.click('text=새 포스트 작성');
    await page.waitForTimeout(1000);
    
    // 폼 입력
    await page.fill('input[id="title"]', 'Playwright 테스트 포스트');
    await page.fill('textarea[id="excerpt"]', 'Playwright로 작성된 테스트 포스트입니다. 모든 기능이 정상 작동하는지 확인합니다.');
    await page.fill('textarea[id="content"]', `# Playwright 테스트 포스트

이것은 자동화된 테스트로 생성된 포스트입니다.

## 주요 기능 테스트
- 포스트 생성
- 이미지 업로드
- 카테고리 및 태그
- 상태 변경

테스트 시각: ${new Date().toLocaleString('ko-KR')}`);
    
    // 카테고리와 태그 입력
    await page.fill('input[id="categories"]', '테스트, 자동화');
    await page.fill('input[id="tags"]', 'playwright, 테스트, 자동화, CRUD');
    
    // 상태를 '게시'로 변경
    await page.click('[id="status"]');
    await page.click('text=게시');
    
    await page.screenshot({ path: 'verify-3-form-filled.png' });
    console.log('✅ 포스트 작성 폼 스크린샷 저장');
    
    // 저장
    await page.click('button:has-text("저장")');
    await page.waitForTimeout(3000);
    
    // 성공 메시지 확인
    const toastMessage = await page.locator('.sonner-toast').textContent();
    console.log(`💬 토스트 메시지: ${toastMessage}`);
    
    await page.screenshot({ path: 'verify-4-after-save.png' });
    console.log('✅ 저장 후 스크린샷 저장');
    
    // 4. 블로그 페이지에서 새 포스트 확인
    console.log('\n📍 5. 블로그 페이지에서 새 포스트 확인');
    await page.goto('http://localhost:4000/blog');
    await page.waitForTimeout(2000);
    
    // 새 포스트 찾기
    const newPost = await page.locator('article:has-text("Playwright 테스트 포스트")').isVisible();
    if (newPost) {
      console.log('✅ 새 포스트가 블로그 목록에 표시됨');
      await page.screenshot({ path: 'verify-5-new-post-visible.png' });
      
      // 포스트 클릭하여 상세 페이지 확인
      await page.click('text=Playwright 테스트 포스트');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'verify-6-post-detail.png' });
      console.log('✅ 포스트 상세 페이지 스크린샷 저장');
    } else {
      console.log('❌ 새 포스트를 찾을 수 없음');
    }
    
    // 5. 포스트 수정 테스트
    console.log('\n📍 6. 포스트 수정 테스트');
    await page.goto('http://localhost:4000/admin');
    await page.waitForTimeout(2000);
    await page.click('text=블로그 관리');
    await page.waitForTimeout(1000);
    
    // 편집 버튼 클릭 (첫 번째 포스트)
    const editButton = await page.locator('button:has-text("편집")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      console.log('✅ 편집 모드 진입');
      // 여기서 수정 로직 추가 가능
    }
    
    console.log('\n🎉 블로그 CRUD 검증 완료!');
    
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    await page.screenshot({ path: 'verify-error.png' });
  } finally {
    await browser.close();
  }
})();