const { chromium } = require('playwright');

async function findTarotGuidelinesMenu() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('=== 타로지침 메뉴 소스 추적 ===\n');
  
  // 메인 페이지 접속
  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // 타로지침 링크의 정확한 위치 찾기
  const tarotGuidelineLink = await page.locator('a:has-text("타로지침")').first();
  
  if (await tarotGuidelineLink.isVisible()) {
    console.log('✅ 타로지침 링크 발견!');
    
    // 링크의 HTML 속성들
    const href = await tarotGuidelineLink.getAttribute('href');
    const className = await tarotGuidelineLink.getAttribute('class');
    console.log(`  - href: ${href}`);
    console.log(`  - class: ${className}`);
    
    // 부모 요소들 추적
    let currentElement = tarotGuidelineLink;
    let level = 0;
    
    console.log('\n부모 요소 추적:');
    while (level < 5) {
      currentElement = await currentElement.locator('..').first();
      const tagName = await currentElement.evaluate(el => el.tagName);
      const className = await currentElement.getAttribute('class');
      console.log(`  ${level + 1}. ${tagName} - class: ${className ? className.substring(0, 50) + '...' : 'none'}`);
      level++;
    }
    
    // 주변 링크들 확인
    const parentNav = await tarotGuidelineLink.locator('..').first();
    const siblingLinks = await parentNav.locator('> a').all();
    
    console.log(`\n같은 레벨의 링크들 (총 ${siblingLinks.length}개):`);
    for (let i = 0; i < siblingLinks.length; i++) {
      const text = await siblingLinks[i].textContent();
      const href = await siblingLinks[i].getAttribute('href');
      console.log(`  ${i + 1}. "${text}" -> ${href}`);
    }
  }
  
  // 네비게이션 컴포넌트의 data 속성이나 특별한 마크업 확인
  const navElement = await page.locator('nav').first();
  const navDataAttrs = await navElement.evaluate(el => {
    const attrs = {};
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      if (attr.name.startsWith('data-')) {
        attrs[attr.name] = attr.value;
      }
    }
    return attrs;
  });
  
  if (Object.keys(navDataAttrs).length > 0) {
    console.log('\n네비게이션 data 속성:', navDataAttrs);
  }
  
  await browser.close();
}

findTarotGuidelinesMenu().catch(console.error);