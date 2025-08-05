const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 실제 데이터에 존재하는 4장의 카드 ID
const existingCards = [
  { id: 'the-fool', name: '바보 (The Fool)', category: 'major' },
  { id: 'the-magician', name: '마법사 (The Magician)', category: 'major' },
  { id: 'the-high-priestess', name: '여사제 (The High Priestess)', category: 'major' },
  { id: 'ace-of-wands', name: '완드 에이스 (Ace of Wands)', category: 'wands' }
];

async function verifyExisting4Cards() {
  console.log('🔍 실제 존재하는 4장 타로카드 검증');
  console.log(`📅 검증 일시: ${new Date().toLocaleString('ko-KR')}`);
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1400,900']
  });
  
  const page = await browser.newContext().then(ctx => ctx.newPage());
  
  const results = {
    total: existingCards.length,
    success: 0,
    failed: [],
    screenshots: []
  };
  
  for (let i = 0; i < existingCards.length; i++) {
    const card = existingCards[i];
    const progress = `[${i + 1}/4]`;
    
    try {
      console.log(`🔍 ${progress} ${card.name} 검증 중...`);
      
      const url = `http://localhost:4000/tarot/${card.id}`;
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      if (response && response.status() === 200) {
        // 페이지 제목 확인
        const title = await page.locator('title').textContent();
        console.log(`  📄 페이지 제목: ${title}`);
        
        if (!title.includes('404')) {
          results.success++;
          console.log(`  ✅ 성공: ${card.name}`);
          
          // 성공한 카드 스크린샷
          const screenshotPath = `existing-card-${i+1}-${card.id}.png`;
          await page.screenshot({ path: screenshotPath, fullPage: true });
          results.screenshots.push(screenshotPath);
          console.log(`  📸 스크린샷 저장: ${screenshotPath}`);
        } else {
          results.failed.push({ card: card.name, id: card.id, error: '404 페이지 표시' });
          console.log(`  ❌ 실패: 404 페이지`);
        }
      } else {
        results.failed.push({ card: card.name, id: card.id, error: `HTTP ${response?.status()}` });
        console.log(`  ❌ 실패: HTTP ${response?.status()}`);
      }
      
    } catch (error) {
      results.failed.push({ card: card.name, id: card.id, error: error.message });
      console.log(`  ❌ 오류: ${error.message}`);
    }
    
    await page.waitForTimeout(1000);
  }
  
  await browser.close();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 기존 4장 카드 검증 결과');
  console.log('='.repeat(60));
  
  const successRate = ((results.success / results.total) * 100).toFixed(1);
  console.log(`\n📈 성공률: ${successRate}% (${results.success}/${results.total})`);
  console.log(`✅ 성공: ${results.success}장`);
  console.log(`❌ 실패: ${results.failed.length}장`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ 실패한 카드:');
    results.failed.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.card} (${item.id}): ${item.error}`);
    });
  }
  
  if (results.screenshots.length > 0) {
    console.log('\n📸 생성된 스크린샷:');
    results.screenshots.forEach(screenshot => {
      console.log(`  - ${screenshot}`);
    });
  }
  
  console.log('\n='.repeat(60));
  if (results.success === results.total) {
    console.log('🎉 완벽! 현재 존재하는 모든 타로카드가 정상 작동합니다!');
  } else {
    console.log('⚠️  일부 카드에 문제가 있습니다.');
  }
  
  return results;
}

// 실행
verifyExisting4Cards()
  .then(results => {
    console.log('\n📋 검증 완료 - 다음 단계를 위한 보고서가 준비되었습니다.');
    process.exit(results.success === results.total ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ 검증 중 오류:', error);
    process.exit(1);
  });