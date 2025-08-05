const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 정확한 ID로 수정된 전체 78장
const tarotCards = [
  // Major Arcana (22장)
  { id: 'major-00-fool', name: '바보', category: 'major' },
  { id: 'major-01-magician', name: '마법사', category: 'major' },
  { id: 'major-02-high-priestess', name: '여사제', category: 'major' },
  { id: 'major-03-empress', name: '여황제', category: 'major' },
  { id: 'major-04-emperor', name: '황제', category: 'major' },
  { id: 'major-05-hierophant', name: '교황', category: 'major' },
  { id: 'major-06-lovers', name: '연인들', category: 'major' },
  { id: 'major-07-chariot', name: '전차', category: 'major' },
  { id: 'major-08-strength', name: '힘', category: 'major' },
  { id: 'major-09-hermit', name: '은둔자', category: 'major' },
  { id: 'major-10-wheel-of-fortune', name: '운명의 수레바퀴', category: 'major' },
  { id: 'major-11-justice', name: '정의', category: 'major' },
  { id: 'major-12-hanged-man', name: '매달린 사람', category: 'major' },
  { id: 'major-13-death', name: '죽음', category: 'major' },
  { id: 'major-14-temperance', name: '절제', category: 'major' },
  { id: 'major-15-devil', name: '악마', category: 'major' },
  { id: 'major-16-tower', name: '탑', category: 'major' },
  { id: 'major-17-star', name: '별', category: 'major' },
  { id: 'major-18-moon', name: '달', category: 'major' },
  { id: 'major-19-sun', name: '태양', category: 'major' },
  { id: 'major-20-judgement', name: '심판', category: 'major' },
  { id: 'major-21-world', name: '세계', category: 'major' },
  
  // Wands (14장)
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
  
  // Cups (14장)
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
  
  // Swords (14장)
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
  
  // Pentacles (14장)
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

async function finalFullVerification() {
  console.log('🎯 타로카드 78장 최종 전체 검증');
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
    startTime: Date.now(),
    categoryStats: {
      major: { total: 22, success: 0, errors: 0 },
      wands: { total: 14, success: 0, errors: 0 },
      cups: { total: 14, success: 0, errors: 0 },
      swords: { total: 14, success: 0, errors: 0 },
      pentacles: { total: 14, success: 0, errors: 0 }
    },
    errors: []
  };
  
  // 전체 78장 검증
  for (let i = 0; i < tarotCards.length; i++) {
    const card = tarotCards[i];
    const progress = `[${String(i + 1).padStart(2, '0')}/78]`;
    
    try {
      process.stdout.write(`\r🔍 ${progress} ${card.name} 검증 중...`);
      
      const url = `http://localhost:4000/tarot/${card.id}`;
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      
      // HTTP 200 응답 확인
      if (response && response.status() === 200) {
        // 페이지 제목으로 404 여부 확인
        const title = await page.locator('title').textContent();
        if (!title.includes('404')) {
          results.success++;
          results.categoryStats[card.category].success++;
        } else {
          results.errors++;
          results.categoryStats[card.category].errors++;
          results.errors.push({ card: card.name, id: card.id, error: '404 페이지' });
        }
      } else {
        results.errors++;
        results.categoryStats[card.category].errors++;
        results.errors.push({ card: card.name, id: card.id, error: `HTTP ${response?.status()}` });
      }
      
    } catch (error) {
      results.errors++;
      results.categoryStats[card.category].errors++;
      results.errors.push({ card: card.name, id: card.id, error: error.message.substring(0, 50) });
    }
    
    // 진행률 표시
    if ((i + 1) % 10 === 0) {
      console.log(` ✓ ${i + 1}/78 완료`);
    }
    
    await page.waitForTimeout(200); // 서버 부하 방지
  }
  
  const duration = Math.round((Date.now() - results.startTime) / 1000);
  
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 최종 검증 결과');
  console.log('='.repeat(60));
  
  const successRate = ((results.success / results.total) * 100).toFixed(1);
  console.log(`\n📈 전체 성공률: ${successRate}% (${results.success}/${results.total})`);
  console.log(`  ✅ 성공: ${results.success}장`);
  console.log(`  ❌ 실패: ${results.errors}장`);
  console.log(`  ⏱️  소요시간: ${duration}초`);
  
  // 카테고리별 성공률
  console.log('\n📊 카테고리별 성공률:');
  for (const [category, stats] of Object.entries(results.categoryStats)) {
    const catSuccessRate = ((stats.success / stats.total) * 100).toFixed(1);
    console.log(`  - ${category.padEnd(10)}: ${catSuccessRate}% (${stats.success}/${stats.total})`);
  }
  
  // 실패한 카드 목록
  if (results.errors.length > 0) {
    console.log('\n❌ 실패한 카드:');
    results.errors.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.card} (${item.id}): ${item.error}`);
    });
  }
  
  await browser.close();
  
  console.log('\n='.repeat(60));
  if (results.success === results.total) {
    console.log('🎉 완벽! 모든 타로카드가 정상 작동합니다!');
  } else if (successRate >= 95) {
    console.log('✅ 우수! 95% 이상 성공률을 달성했습니다!');
  } else {
    console.log('⚠️  일부 카드에 문제가 있습니다. 추가 수정이 필요합니다.');
  }
  
  return results;
}

// 실행
finalFullVerification()
  .then(results => {
    process.exit(results.success === results.total ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ 검증 중 오류:', error);
    process.exit(1);
  });