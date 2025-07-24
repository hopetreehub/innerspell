const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  console.log('1. 메인 페이지 접속 중...');
  await page.goto('http://localhost:4000');
  await page.waitForLoadState('networkidle');
  
  // 스크린샷 저장
  await page.screenshot({ path: 'screenshots/main_page.png', fullPage: true });
  console.log('메인 페이지 스크린샷 저장됨: screenshots/main_page.png');
  
  // 주요 UI 요소 확인
  console.log('\n2. 주요 UI 요소 확인:');
  
  // 타이틀 확인
  const title = await page.title();
  console.log(`- 페이지 타이틀: ${title}`);
  
  // 네비게이션 메뉴 확인
  const navItems = await page.$$eval('nav a', links => links.map(a => a.textContent));
  console.log(`- 네비게이션 메뉴: ${navItems.join(', ')}`);
  
  // 히어로 섹션 텍스트
  const heroText = await page.$eval('h1', el => el.textContent).catch(() => '히어로 텍스트 없음');
  console.log(`- 히어로 텍스트: ${heroText}`);
  
  // 타로 카드 섹션 확인
  console.log('\n3. 타로 카드 기능 확인:');
  const tarotCards = await page.$$('[class*="card"]');
  console.log(`- 타로 카드 개수: ${tarotCards.length}`);
  
  // Community 페이지로 이동
  console.log('\n4. Community 페이지 확인:');
  await page.click('a[href="/community/reading-share"]').catch(async () => {
    console.log('직접 Community 페이지로 이동');
    await page.goto('http://localhost:4000/community/reading-share');
  });
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/community_page.png', fullPage: true });
  console.log('Community 페이지 스크린샷 저장됨: screenshots/community_page.png');
  
  // 리딩 경험 리스트 확인
  const readingItems = await page.$$('[class*="reading-card"], [class*="experience-item"]');
  console.log(`- 리딩 경험 아이템 개수: ${readingItems.length}`);
  
  // 로그인 페이지 확인
  console.log('\n5. 로그인 페이지 확인:');
  await page.goto('http://localhost:4000/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/login_page.png', fullPage: true });
  console.log('로그인 페이지 스크린샷 저장됨: screenshots/login_page.png');
  
  // 로그인 폼 요소 확인
  const emailInput = await page.$('input[type="email"]');
  const passwordInput = await page.$('input[type="password"]');
  console.log(`- 이메일 입력 필드: ${emailInput ? '있음' : '없음'}`);
  console.log(`- 비밀번호 입력 필드: ${passwordInput ? '있음' : '없음'}`);
  
  console.log('\n테스트 완료!');
  await browser.close();
})();