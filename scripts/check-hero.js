const { chromium } = require('playwright');

async function checkHero() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4000');
  
  // 다양한 선택자로 Hero Section 찾기
  const selectors = [
    '.hero-section',
    '[class*="hero"]',
    '#hero',
    'section:first-child',
    'main > section:first-child',
    'div[class*="banner"]',
    'div[class*="welcome"]'
  ];
  
  console.log('Checking for hero section...\n');
  
  for (const selector of selectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        console.log(`✅ Found element with selector: ${selector}`);
        const className = await element.getAttribute('class');
        console.log(`   Class: ${className}`);
      }
    } catch (e) {
      console.log(`❌ Not found: ${selector}`);
    }
  }
  
  // 실제 DOM 구조 출력
  console.log('\n📄 Main content structure:');
  const mainContent = await page.$eval('main', el => {
    const children = Array.from(el.children);
    return children.slice(0, 3).map((child, i) => ({
      tag: child.tagName,
      className: child.className,
      id: child.id,
      text: child.textContent?.substring(0, 50) + '...'
    }));
  });
  
  console.log(JSON.stringify(mainContent, null, 2));
  
  await browser.close();
}

checkHero().catch(console.error);