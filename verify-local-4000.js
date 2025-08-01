const { chromium } = require('playwright');

async function verifyLocal4000() {
  console.log('🚀 포트 4000 로컬 서버 검증 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 30000
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'ko-KR'
    });
    const page = await context.newPage();
    
    console.log('📍 http://localhost:4000 접속 중...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 기본 요소 확인
    const title = await page.textContent('h1');
    console.log(`✅ 메인 제목: ${title}`);
    
    const navLinks = await page.locator('nav a').allTextContents();
    console.log(`✅ 네비게이션 링크: ${navLinks.length}개`);
    
    await page.screenshot({ path: 'local-4000-homepage.png' });
    console.log('📸 스크린샷 저장: local-4000-homepage.png');
    
    // 타로 리딩 페이지 테스트
    console.log('\n📍 타로 리딩 페이지 테스트...');
    await page.click('a:has-text("타로리딩")');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const hasInput = await page.locator('textarea[placeholder*="질문"]').count() > 0;
    console.log(`✅ 질문 입력란: ${hasInput ? '있음' : '없음'}`);
    
    await page.screenshot({ path: 'local-4000-tarot.png' });
    console.log('📸 스크린샷 저장: local-4000-tarot.png');
    
    console.log('\n✅ 포트 4000 로컬 서버가 정상적으로 작동 중입니다!');
    console.log('🌐 접속 URL: http://localhost:4000');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await browser.close();
  }
}

verifyLocal4000().catch(console.error);