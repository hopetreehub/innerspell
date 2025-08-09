const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📍 포트 4000에서 현재 사이트 상태 확인 시작...\n');

    // 1. 홈페이지 확인
    console.log('1️⃣ 홈페이지 접속...');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'status-01-homepage.png' });
    console.log('✅ 홈페이지 정상 로드\n');

    // 2. 블로그 페이지 확인
    console.log('2️⃣ 블로그 페이지 확인...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'status-02-blog.png' });
    
    const blogPosts = await page.locator('article').count();
    console.log(`✅ 블로그 포스트 개수: ${blogPosts}개\n`);

    // 3. 관리자 페이지 확인
    console.log('3️⃣ 관리자 페이지 확인...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'status-03-admin.png' });
    
    const isLoginPage = await page.locator('text="Google로 로그인"').isVisible();
    console.log(`✅ 관리자 페이지: ${isLoginPage ? '로그인 필요' : '접근 가능'}\n`);

    // 4. 타로 리딩 페이지 확인
    console.log('4️⃣ 타로 리딩 페이지 확인...');
    await page.goto('http://localhost:4000/tarot/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'status-04-tarot-reading.png' });
    console.log('✅ 타로 리딩 페이지 정상\n');

    // 5. 꿈해몽 페이지 확인
    console.log('5️⃣ 꿈해몽 페이지 확인...');
    await page.goto('http://localhost:4000/dream');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'status-05-dream.png' });
    console.log('✅ 꿈해몽 페이지 정상\n');

    // 6. 커뮤니티 페이지 확인
    console.log('6️⃣ 커뮤니티 페이지 확인...');
    await page.goto('http://localhost:4000/community');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'status-06-community.png' });
    console.log('✅ 커뮤니티 페이지 정상\n');

    console.log('🎯 현재 상태 확인 완료!');
    console.log('📸 스크린샷 파일들이 생성되었습니다.');

  } catch (error) {
    console.error('❌ 에러 발생:', error);
    await page.screenshot({ path: 'status-error.png' });
  } finally {
    await browser.close();
  }
})();