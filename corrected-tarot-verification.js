const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 실제 데이터에서 사용되는 정확한 ID로 수정
const tarotCards = [
  // Major Arcana (22장) - 실제 ID 사용
  { id: 'major-00-fool', name: '바보 (The Fool)', category: 'major' },
  { id: 'major-01-magician', name: '마법사 (The Magician)', category: 'major' },
  { id: 'major-02-high-priestess', name: '여사제 (The High Priestess)', category: 'major' },
  { id: 'major-03-empress', name: '여황제 (The Empress)', category: 'major' },
  { id: 'major-04-emperor', name: '황제 (The Emperor)', category: 'major' },
  { id: 'major-05-hierophant', name: '교황 (The Hierophant)', category: 'major' },
  { id: 'major-06-lovers', name: '연인들 (The Lovers)', category: 'major' },
  { id: 'major-07-chariot', name: '전차 (The Chariot)', category: 'major' },
  { id: 'major-08-strength', name: '힘 (Strength)', category: 'major' },
  { id: 'major-09-hermit', name: '은둔자 (The Hermit)', category: 'major' },
  { id: 'major-10-wheel-of-fortune', name: '운명의 수레바퀴 (Wheel of Fortune)', category: 'major' },
  { id: 'major-11-justice', name: '정의 (Justice)', category: 'major' },
  { id: 'major-12-hanged-man', name: '매달린 사람 (The Hanged Man)', category: 'major' },
  { id: 'major-13-death', name: '죽음 (Death)', category: 'major' },
  { id: 'major-14-temperance', name: '절제 (Temperance)', category: 'major' },
  { id: 'major-15-devil', name: '악마 (The Devil)', category: 'major' },
  { id: 'major-16-tower', name: '탑 (The Tower)', category: 'major' },
  { id: 'major-17-star', name: '별 (The Star)', category: 'major' },
  { id: 'major-18-moon', name: '달 (The Moon)', category: 'major' },
  { id: 'major-19-sun', name: '태양 (The Sun)', category: 'major' },
  { id: 'major-20-judgement', name: '심판 (Judgement)', category: 'major' },
  { id: 'major-21-world', name: '세계 (The World)', category: 'major' },
  
  // Wands (14장) - 수정된 ID
  { id: 'wands-ace', name: '완드 에이스', category: 'wands' },
  { id: 'wands-02', name: '완드 2', category: 'wands' },
  { id: 'wands-03', name: '완드 3', category: 'wands' },
  { id: 'wands-04', name: '완드 4', category: 'wands' },
  { id: 'wands-05', name: '완드 5', category: 'wands' },
  { id: 'wands-06', name: '완드 6', category: 'wands' },
  { id: 'wands-07', name: '완드 7', category: 'wands' },
  { id: 'wands-08', name: '완드 8', category: 'wands' },
  { id: 'wands-09', name: '완드 9', category: 'wands' },
  { id: 'wands-10', name: '완드 10', category: 'wands' },
  { id: 'wands-page', name: '완드 페이지', category: 'wands' },
  { id: 'wands-knight', name: '완드 기사', category: 'wands' },
  { id: 'wands-queen', name: '완드 여왕', category: 'wands' },
  { id: 'wands-king', name: '완드 왕', category: 'wands' },
  
  // Cups (14장) - 수정된 ID
  { id: 'cups-ace', name: '컵 에이스', category: 'cups' },
  { id: 'cups-02', name: '컵 2', category: 'cups' },
  { id: 'cups-03', name: '컵 3', category: 'cups' },
  { id: 'cups-04', name: '컵 4', category: 'cups' },
  { id: 'cups-05', name: '컵 5', category: 'cups' },
  { id: 'cups-06', name: '컵 6', category: 'cups' },
  { id: 'cups-07', name: '컵 7', category: 'cups' },
  { id: 'cups-08', name: '컵 8', category: 'cups' },
  { id: 'cups-09', name: '컵 9', category: 'cups' },
  { id: 'cups-10', name: '컵 10', category: 'cups' },
  { id: 'cups-page', name: '컵 페이지', category: 'cups' },
  { id: 'cups-knight', name: '컵 기사', category: 'cups' },
  { id: 'cups-queen', name: '컵 여왕', category: 'cups' },
  { id: 'cups-king', name: '컵 왕', category: 'cups' },
  
  // Swords (14장) - 수정된 ID
  { id: 'swords-ace', name: '검 에이스', category: 'swords' },
  { id: 'swords-02', name: '검 2', category: 'swords' },
  { id: 'swords-03', name: '검 3', category: 'swords' },
  { id: 'swords-04', name: '검 4', category: 'swords' },
  { id: 'swords-05', name: '검 5', category: 'swords' },
  { id: 'swords-06', name: '검 6', category: 'swords' },
  { id: 'swords-07', name: '검 7', category: 'swords' },
  { id: 'swords-08', name: '검 8', category: 'swords' },
  { id: 'swords-09', name: '검 9', category: 'swords' },
  { id: 'swords-10', name: '검 10', category: 'swords' },
  { id: 'swords-page', name: '검 페이지', category: 'swords' },
  { id: 'swords-knight', name: '검 기사', category: 'swords' },
  { id: 'swords-queen', name: '검 여왕', category: 'swords' },
  { id: 'swords-king', name: '검 왕', category: 'swords' },
  
  // Pentacles (14장) - 수정된 ID
  { id: 'pentacles-ace', name: '펜타클 에이스', category: 'pentacles' },
  { id: 'pentacles-02', name: '펜타클 2', category: 'pentacles' },
  { id: 'pentacles-03', name: '펜타클 3', category: 'pentacles' },
  { id: 'pentacles-04', name: '펜타클 4', category: 'pentacles' },
  { id: 'pentacles-05', name: '펜타클 5', category: 'pentacles' },
  { id: 'pentacles-06', name: '펜타클 6', category: 'pentacles' },
  { id: 'pentacles-07', name: '펜타클 7', category: 'pentacles' },
  { id: 'pentacles-08', name: '펜타클 8', category: 'pentacles' },
  { id: 'pentacles-09', name: '펜타클 9', category: 'pentacles' },
  { id: 'pentacles-10', name: '펜타클 10', category: 'pentacles' },
  { id: 'pentacles-page', name: '펜타클 페이지', category: 'pentacles' },
  { id: 'pentacles-knight', name: '펜타클 기사', category: 'pentacles' },
  { id: 'pentacles-queen', name: '펜타클 여왕', category: 'pentacles' },
  { id: 'pentacles-king', name: '펜타클 왕', category: 'pentacles' }
];

async function verifyErrorFix() {
  console.log('🔧 404 에러 수정 후 재검증 시작...');
  console.log(`📅 검증 일시: ${new Date().toLocaleString('ko-KR')}`);
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1400,900']
  });
  
  const page = await browser.newContext().then(ctx => ctx.newPage());
  
  // 결과 통계
  const results = {
    total: tarotCards.length,
    success: 0,
    errors: 0,
    failed: [],
    categoryStats: {
      major: { total: 22, success: 0, errors: 0 },
      wands: { total: 14, success: 0, errors: 0 },
      cups: { total: 14, success: 0, errors: 0 },
      swords: { total: 14, success: 0, errors: 0 },
      pentacles: { total: 14, success: 0, errors: 0 }
    }
  };
  
  // 샘플 테스트 (각 카테고리별 2장씩)
  const sampleCards = [
    tarotCards[0], tarotCards[5],        // major
    tarotCards[22], tarotCards[25],      // wands
    tarotCards[36], tarotCards[39],      // cups
    tarotCards[50], tarotCards[53],      // swords
    tarotCards[64], tarotCards[67]       // pentacles
  ];
  
  for (let i = 0; i < sampleCards.length; i++) {
    const card = sampleCards[i];
    
    try {
      process.stdout.write(`\r🔍 [${i+1}/10] ${card.name} 테스트 중...`);
      
      const url = `http://localhost:4000/tarot/${card.id}`;
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      if (response && response.status() === 200) {
        // 404가 아닌지 확인
        const title = await page.locator('title').textContent();
        if (!title.includes('404')) {
          results.success++;
          results.categoryStats[card.category].success++;
          console.log(` ✅`);
        } else {
          results.errors++;
          results.categoryStats[card.category].errors++;
          results.failed.push({ card: card.name, id: card.id, error: '404 페이지' });
          console.log(` ❌ 404`);
        }
      } else {
        results.errors++;
        results.categoryStats[card.category].errors++;
        results.failed.push({ card: card.name, id: card.id, error: 'HTTP 에러' });
        console.log(` ❌ HTTP ${response?.status()}`);
      }
      
    } catch (error) {
      results.errors++;
      results.categoryStats[card.category].errors++;
      results.failed.push({ card: card.name, id: card.id, error: error.message });
      console.log(` ❌ ${error.message.substring(0, 20)}`);
    }
    
    await page.waitForTimeout(500);
  }
  
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 수정 후 검증 결과');
  console.log('='.repeat(60));
  
  const successRate = ((results.success / sampleCards.length) * 100).toFixed(1);
  console.log(`\n📈 성공률: ${successRate}% (${results.success}/${sampleCards.length})`);
  console.log(`  ✅ 성공: ${results.success}장`);
  console.log(`  ❌ 실패: ${results.errors}장`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ 실패한 카드:');
    results.failed.forEach(item => {
      console.log(`  - ${item.card} (${item.id}): ${item.error}`);
    });
  }
  
  await browser.close();
  
  if (results.success === sampleCards.length) {
    console.log('\n✅ 모든 샘플 카드 정상 작동! 전체 검증을 진행할 수 있습니다.');
    return true;
  } else {
    console.log('\n⚠️  일부 카드에 여전히 문제가 있습니다.');
    return false;
  }
}

// 실행
verifyErrorFix()
  .then(success => {
    if (success) {
      console.log('\n🎯 다음 단계: 전체 78장 검증을 진행하시겠습니까?');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ 검증 중 오류:', error);
    process.exit(1);
  });