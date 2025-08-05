const { chromium } = require('playwright');

// 실제 데이터에 존재하는 4장의 카드 ID
const existingCards = [
  { id: 'the-fool', name: '바보 (The Fool)' },
  { id: 'the-magician', name: '마법사 (The Magician)' },
  { id: 'the-high-priestess', name: '여사제 (The High Priestess)' },
  { id: 'ace-of-wands', name: '완드 에이스 (Ace of Wands)' }
];

async function quickVerify() {
  console.log('🚀 4장 카드 빠른 검증 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1400,900']
  });
  
  const page = await browser.newContext().then(ctx => ctx.newPage());
  
  let success = 0;
  
  for (let i = 0; i < existingCards.length; i++) {
    const card = existingCards[i];
    
    try {
      console.log(`[${i+1}/4] ${card.name} 테스트...`);
      
      const url = `http://localhost:4000/tarot/${card.id}`;
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      // HTTP 상태 코드만 확인
      if (response && response.status() === 200) {
        // 404 텍스트가 있는지 확인
        const bodyText = await page.textContent('body');
        if (!bodyText.includes('404') && !bodyText.includes('페이지를 찾을 수 없습니다')) {
          success++;
          console.log(`  ✅ 성공`);
          
          // 스크린샷 저장
          await page.screenshot({ 
            path: `quick-verify-${i+1}-${card.id}.png`, 
            fullPage: true 
          });
        } else {
          console.log(`  ❌ 404 페이지`);
        }
      } else {
        console.log(`  ❌ HTTP ${response?.status()}`);
      }
      
    } catch (error) {
      console.log(`  ❌ 오류: ${error.message}`);
    }
    
    await page.waitForTimeout(1000);
  }
  
  await browser.close();
  
  console.log(`\n📊 결과: ${success}/4 성공 (${(success/4*100).toFixed(1)}%)`);
  
  if (success === 4) {
    console.log('🎉 모든 기존 카드 정상 작동!');
  } else {
    console.log('⚠️ 일부 카드에 문제가 있습니다.');
  }
  
  return success === 4;
}

quickVerify()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('오류:', error);
    process.exit(1);
  });