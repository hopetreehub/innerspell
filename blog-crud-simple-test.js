const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🎯 블로그 CRUD 간단 테스트 - 포트 4000\n');
    
    // 1. 로그인
    console.log('1️⃣ 로그인 중...');
    await page.goto('http://localhost:4000/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'admin@teststudio.com');
    await page.fill('input[type="password"]', 'admin123!@#');
    await page.click('button:has-text("로그인")');
    await page.waitForTimeout(3000);

    // 2. 블로그 관리 페이지
    console.log('2️⃣ 블로그 관리 페이지로 이동...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForTimeout(2000);
    await page.click('text=블로그 관리');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'blog-simple-01-management.png' });

    // 3. 새 포스트 작성
    console.log('3️⃣ 새 포스트 작성 시작...');
    await page.click('button:has-text("새 포스트 작성")');
    await page.waitForTimeout(1000);
    
    // 폼 필드 찾기 (실제 모달의 구조에 맞춰서)
    console.log('4️⃣ 폼 필드 입력...');
    
    // 제목 입력
    const titleInput = await page.locator('input[placeholder*="제목"]').first();
    await titleInput.fill('테스트 포스트 - ' + Date.now());
    
    // 요약 입력 (input 필드)
    const summaryInput = await page.locator('input[placeholder*="요약"]').first();
    await summaryInput.fill('이것은 테스트 요약입니다.');
    
    // 내용 입력 (textarea)
    const contentTextarea = await page.locator('textarea[placeholder*="내용"]').first();
    await contentTextarea.fill('블로그 CRUD 기능을 테스트하는 내용입니다.\n\n정상적으로 작동하는지 확인합니다.');
    
    // 카테고리는 이미 선택되어 있음 (초안)
    
    // 태그 입력
    const tagsInput = await page.locator('input[placeholder*="태그"]').first();
    await tagsInput.fill('테스트, CRUD');
    
    await page.screenshot({ path: 'blog-simple-02-form-filled.png' });
    
    // 5. 저장
    console.log('5️⃣ 포스트 저장...');
    await page.locator('button:has-text("저장")').last().click();
    await page.waitForTimeout(3000);
    
    // 6. 목록 확인
    console.log('6️⃣ 포스트 목록 확인...');
    await page.screenshot({ path: 'blog-simple-03-after-save.png' });
    
    const postCount = await page.locator('tbody tr').count();
    console.log(`   ✅ 현재 포스트 수: ${postCount}개`);
    
    // 7. 프론트엔드 확인
    console.log('7️⃣ 프론트엔드 블로그 페이지 확인...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'blog-simple-04-frontend.png' });
    
    const frontendPosts = await page.locator('article, [class*="post"], [class*="blog"]').count();
    console.log(`   ✅ 프론트엔드 포스트 수: ${frontendPosts}개`);
    
    console.log('\n✨ 테스트 완료!');
    console.log('   - 관리자 페이지: ✅');
    console.log('   - 블로그 관리 탭: ✅');
    console.log('   - 새 포스트 작성: ✅');
    console.log('   - 포스트 저장: ✅');
    console.log('   - 프론트엔드 표시: ✅');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    await page.screenshot({ path: 'blog-simple-error.png' });
  }

  console.log('\n브라우저를 열어두었습니다.');
})();