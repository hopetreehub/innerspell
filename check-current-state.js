const { chromium } = require('playwright');

async function checkCurrentState() {
  console.log('🔍 현재 상태 확인 및 기능 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. 홈페이지
    console.log('1️⃣ 홈페이지 확인...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'before-optimization-home.png', fullPage: true });
    console.log('✅ 홈페이지 스크린샷 저장');
    
    // 2. 타로 페이지
    console.log('\n2️⃣ 타로 페이지 확인...');
    await page.goto('http://localhost:4000/tarot', { waitUntil: 'networkidle' });
    const tarotCategories = await page.locator('.category-card').count();
    await page.screenshot({ path: 'before-optimization-tarot.png', fullPage: true });
    console.log(`✅ 타로 카테고리 수: ${tarotCategories}개`);
    
    // 3. 블로그 페이지
    console.log('\n3️⃣ 블로그 페이지 확인...');
    await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // 데이터 로드 대기
    const blogPosts = await page.locator('.blog-card').count();
    await page.screenshot({ path: 'before-optimization-blog.png', fullPage: true });
    console.log(`✅ 블로그 포스트 수: ${blogPosts}개`);
    
    // 4. 로그인 페이지
    console.log('\n4️⃣ 로그인 페이지 확인...');
    await page.goto('http://localhost:4000/sign-in', { waitUntil: 'networkidle' });
    const kakaoBtn = await page.locator('button:has-text("카카오로 시작하기")').isVisible();
    const googleBtn = await page.locator('button:has-text("Google로 계속하기")').isVisible();
    await page.screenshot({ path: 'before-optimization-signin.png', fullPage: true });
    console.log(`✅ 카카오 로그인: ${kakaoBtn ? '있음' : '없음'}`);
    console.log(`✅ 구글 로그인: ${googleBtn ? '있음' : '없음'}`);
    
    // 5. 메타데이터 확인
    console.log('\n5️⃣ 현재 메타데이터 상태...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
    
    console.log(`\n📋 홈페이지 메타데이터:`);
    console.log(`  Title: ${title}`);
    console.log(`  Description: ${description || '없음'}`);
    console.log(`  OG Title: ${ogTitle || '없음'}`);
    
    console.log('\n✅ 현재 상태 확인 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

checkCurrentState().catch(console.error);