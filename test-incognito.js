const { chromium } = require('playwright');

async function testIncognito() {
  // 시크릿 모드로 브라우저 실행
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--incognito']
  });
  
  const context = await browser.newContext({
    // 캐시 비활성화
    bypassCSP: true,
    ignoreHTTPSErrors: true,
    // 캐시 및 쿠키 제거
    storageState: undefined
  });
  
  const page = await context.newPage();
  
  console.log('=== 시크릿 모드 테스트 ===\n');
  
  // 캐시 강제 무시하고 페이지 로드
  await page.goto('http://localhost:4000', { 
    waitUntil: 'networkidle',
    // 캐시 무시
    waitForLoadState: 'domcontentloaded'
  });
  
  // 페이지 완전히 로드될 때까지 대기
  await page.waitForTimeout(3000);
  
  // 네비게이션 메뉴 확인
  const navLinks = await page.locator('nav a').allTextContents();
  console.log('네비게이션 메뉴:', navLinks);
  
  // 타로지침 메뉴 존재 여부 확인
  const hasTarotGuidelines = navLinks.some(link => 
    link.includes('타로지침') || link.includes('타로 지침')
  );
  
  if (hasTarotGuidelines) {
    console.log('❌ 타로지침 메뉴가 여전히 표시됨');
    
    // 페이지 소스 확인
    const pageSource = await page.content();
    const matches = pageSource.match(/타로지침/g) || [];
    console.log(`페이지 소스에서 "타로지침" 발견 횟수: ${matches.length}`);
  } else {
    console.log('✅ 타로지침 메뉴가 제거됨');
  }
  
  await page.screenshot({ path: 'test-incognito-result.png' });
  console.log('📸 스크린샷 저장: test-incognito-result.png');
  
  await browser.close();
}

testIncognito().catch(console.error);