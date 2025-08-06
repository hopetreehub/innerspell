const { chromium } = require('playwright');

async function verifyNavigation() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('=== 네비게이션 메뉴 상세 검증 ===\n');
  
  // 메인 페이지 접속
  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // 모든 네비게이션 링크 검색
  const navLinks = await page.locator('nav a').all();
  console.log(`발견된 네비게이션 링크 수: ${navLinks.length}`);
  
  // 각 링크의 텍스트와 href 확인
  for (let i = 0; i < navLinks.length; i++) {
    const text = await navLinks[i].textContent();
    const href = await navLinks[i].getAttribute('href');
    console.log(`${i + 1}. 텍스트: "${text}", href: "${href}"`);
    
    if (text.includes('타로지침') || href === '/tarot-guidelines') {
      console.log('❌ 타로지침 메뉴 발견!');
    }
  }
  
  // 타로카드가 baseNavItems에 있는지 확인
  const tarotCardLink = await page.locator('nav a:has-text("타로카드")').first();
  if (await tarotCardLink.isVisible()) {
    const href = await tarotCardLink.getAttribute('href');
    console.log(`\n✅ 타로카드 메뉴 확인: href="${href}"`);
  }
  
  // 스크린샷 저장
  await page.screenshot({ path: 'verify-navigation-detailed.png', fullPage: false });
  console.log('\n📸 스크린샷 저장: verify-navigation-detailed.png');
  
  await browser.close();
}

verifyNavigation().catch(console.error);