const { chromium } = require('playwright');

async function quickTarotTest() {
  console.log('🔍 타로카드 이미지 수정 후 빠른 테스트...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1200,800']
  });
  
  const page = await browser.newContext().then(ctx => ctx.newPage());
  
  // 테스트할 카드들 (각 카테고리에서 1개씩)
  const testCards = [
    { id: 'major-00-fool', name: '바보 (The Fool)' },
    { id: 'major-01-magician', name: '마법사 (The Magician)' },
    { id: 'wands-ace', name: '완드 에이스' },
    { id: 'cups-ace', name: '컵 에이스' },
    { id: 'swords-ace', name: '검 에이스' },
    { id: 'pentacles-ace', name: '펜타클 에이스' }
  ];
  
  for (const card of testCards) {
    try {
      console.log(`\n✨ ${card.name} 테스트 중...`);
      await page.goto(`http://localhost:4000/tarot/${card.id}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      
      // 이미지 체크
      const imageVisible = await page.locator('img[alt*="타로"], img[alt*="Tarot"], img').first().isVisible();
      const titleVisible = await page.locator('h1').first().isVisible();
      const keywordsVisible = await page.locator('text=/키워드|Keywords/i').isVisible();
      
      console.log(`  - 이미지: ${imageVisible ? '✅' : '❌'}`);
      console.log(`  - 제목: ${titleVisible ? '✅' : '❌'}`);
      console.log(`  - 키워드: ${keywordsVisible ? '✅' : '❌'}`);
      
      // 스크린샷
      await page.screenshot({ 
        path: `quick-test-${card.id}.png`,
        fullPage: false
      });
    } catch (error) {
      console.error(`❌ ${card.name} 테스트 실패:`, error.message);
    }
  }
  
  await browser.close();
  console.log('\n✨ 빠른 테스트 완료!');
}

quickTarotTest().catch(console.error);