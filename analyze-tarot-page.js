const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 타로 페이지 구조 분석');
    
    await page.goto('http://localhost:4000/tarot');
    await page.waitForTimeout(3000);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);
    
    // 모든 버튼 텍스트 확인
    const buttons = await page.locator('button').all();
    console.log('\n📋 페이지의 모든 버튼들:');
    for (let i = 0; i < buttons.length; i++) {
      try {
        const text = await buttons[i].textContent();
        if (text && text.trim()) {
          console.log(`  ${i + 1}. "${text.trim()}"`);
        }
      } catch (e) {
        console.log(`  ${i + 1}. [텍스트 읽기 실패]`);
      }
    }
    
    // 모든 링크 확인
    const links = await page.locator('a').all();
    console.log('\n🔗 페이지의 모든 링크들:');
    for (let i = 0; i < links.length; i++) {
      try {
        const text = await links[i].textContent();
        const href = await links[i].getAttribute('href');
        if (text && text.trim()) {
          console.log(`  - "${text.trim()}" -> ${href}`);
        }
      } catch (e) {
        // 링크 읽기 실패는 무시
      }
    }
    
    // 메인 콘텐츠 구조 확인
    console.log('\n📄 페이지 메인 콘텐츠:');
    const mainContent = await page.locator('main, [role="main"], .container').first();
    if (await mainContent.isVisible()) {
      const headings = await mainContent.locator('h1, h2, h3').all();
      for (let i = 0; i < headings.length; i++) {
        try {
          const text = await headings[i].textContent();
          const tagName = await headings[i].evaluate(el => el.tagName);
          if (text && text.trim()) {
            console.log(`  ${tagName}: "${text.trim()}"`);
          }
        } catch (e) {
          // 헤딩 읽기 실패는 무시
        }
      }
    }
    
    await page.screenshot({ path: 'screenshots/tarot-page-analysis.png', fullPage: true });
    console.log('\n📸 타로 페이지 스크린샷 저장: screenshots/tarot-page-analysis.png');
    
    // 5초 대기
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 분석 중 오류:', error);
    await page.screenshot({ path: 'screenshots/tarot-page-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();