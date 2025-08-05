const { chromium } = require('playwright');
const fs = require('fs');

// 실제 데이터에서 추출한 정확한 78장 타로카드 ID
const allTarotCardIds = [
  // Major Arcana (22장)
  'major-00-fool', 'major-01-magician', 'major-02-high-priestess', 'major-03-empress',
  'major-04-emperor', 'major-05-hierophant', 'major-06-lovers', 'major-07-chariot',
  'major-08-strength', 'major-09-hermit', 'major-10-wheel-of-fortune', 'major-11-justice',
  'major-12-hanged-man', 'major-13-death', 'major-14-temperance', 'major-15-devil',
  'major-16-tower', 'major-17-star', 'major-18-moon', 'major-19-sun',
  'major-20-judgement', 'major-21-world',
  
  // Wands (14장)
  'wands-ace', 'wands-02', 'wands-03', 'wands-04', 'wands-05', 'wands-06', 'wands-07',
  'wands-08', 'wands-09', 'wands-10', 'wands-page', 'wands-knight', 'wands-queen', 'wands-king',
  
  // Cups (14장)
  'cups-ace', 'cups-02', 'cups-03', 'cups-04', 'cups-05', 'cups-06', 'cups-07',
  'cups-08', 'cups-09', 'cups-10', 'cups-page', 'cups-knight', 'cups-queen', 'cups-king',
  
  // Swords (14장)
  'swords-ace', 'swords-02', 'swords-03', 'swords-04', 'swords-05', 'swords-06', 'swords-07',
  'swords-08', 'swords-09', 'swords-10', 'swords-page', 'swords-knight', 'swords-queen', 'swords-king',
  
  // Pentacles (14장)
  'pentacles-ace', 'pentacles-02', 'pentacles-03', 'pentacles-04', 'pentacles-05', 'pentacles-06', 'pentacles-07',
  'pentacles-08', 'pentacles-09', 'pentacles-10', 'pentacles-page', 'pentacles-knight', 'pentacles-queen', 'pentacles-king'
];

function getCardCategory(id) {
  if (id.startsWith('major-')) return 'major';
  if (id.startsWith('wands-')) return 'wands';
  if (id.startsWith('cups-')) return 'cups';
  if (id.startsWith('swords-')) return 'swords';
  if (id.startsWith('pentacles-')) return 'pentacles';
  return 'unknown';
}

async function finalCorrectVerification() {
  console.log('🎯 실제 데이터 기반 78장 타로카드 최종 검증');
  console.log(`📅 검증 일시: ${new Date().toLocaleString('ko-KR')}`);
  console.log(`📊 총 카드 수: ${allTarotCardIds.length}장`);
  console.log('='.repeat(70));
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1400,900']
  });
  
  const page = await browser.newContext().then(ctx => ctx.newPage());
  
  const results = {
    total: allTarotCardIds.length,
    success: 0,
    failed: [],
    categoryStats: {
      major: { total: 22, success: 0, failed: 0 },
      wands: { total: 14, success: 0, failed: 0 },
      cups: { total: 14, success: 0, failed: 0 },
      swords: { total: 14, success: 0, failed: 0 },
      pentacles: { total: 14, success: 0, failed: 0 }
    },
    startTime: Date.now()
  };
  
  for (let i = 0; i < allTarotCardIds.length; i++) {
    const cardId = allTarotCardIds[i];
    const category = getCardCategory(cardId);
    const progress = `[${String(i + 1).padStart(2, '0')}/78]`;
    
    try {
      process.stdout.write(`\\r🔍 ${progress} ${cardId} 검증 중...`);
      
      const url = `http://localhost:4000/tarot/${cardId}`;
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      if (response && response.status() === 200) {
        // 404 페이지인지 확인
        const bodyText = await page.textContent('body');
        if (!bodyText.includes('404') && !bodyText.includes('페이지를 찾을 수 없습니다')) {
          results.success++;
          results.categoryStats[category].success++;
        } else {
          results.failed.push({ id: cardId, category, error: '404 페이지' });
          results.categoryStats[category].failed++;
        }
      } else {
        results.failed.push({ id: cardId, category, error: `HTTP ${response?.status()}` });
        results.categoryStats[category].failed++;
      }
      
    } catch (error) {
      results.failed.push({ id: cardId, category, error: error.message.substring(0, 50) });
      results.categoryStats[category].failed++;
    }
    
    // 진행률 표시
    if ((i + 1) % 10 === 0) {
      console.log(` ✓ ${i + 1}/78 완료`);
    }
    
    await page.waitForTimeout(100); // 빠른 검증
  }
  
  const duration = Math.round((Date.now() - results.startTime) / 1000);
  const successRate = ((results.success / results.total) * 100).toFixed(1);
  
  console.log('\\n\\n' + '='.repeat(70));
  console.log('📊 최종 검증 결과');
  console.log('='.repeat(70));
  
  console.log(`\\n📈 전체 성공률: ${successRate}% (${results.success}/${results.total})`);
  console.log(`  ✅ 성공: ${results.success}장`);
  console.log(`  ❌ 실패: ${results.failed.length}장`);
  console.log(`  ⏱️  소요시간: ${duration}초`);
  
  // 카테고리별 성공률
  console.log('\\n📊 카테고리별 성공률:');
  for (const [category, stats] of Object.entries(results.categoryStats)) {
    const catSuccessRate = ((stats.success / stats.total) * 100).toFixed(1);
    const statusIcon = catSuccessRate === '100.0' ? '✅' : '❌';
    console.log(`  ${statusIcon} ${category.padEnd(10)}: ${catSuccessRate}% (${stats.success}/${stats.total})`);
  }
  
  // 실패한 카드 목록 (처음 10개만)
  if (results.failed.length > 0) {
    console.log(`\\n❌ 실패한 카드 (총 ${results.failed.length}장):`);
    results.failed.slice(0, 10).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.id} (${item.category}): ${item.error}`);
    });
    if (results.failed.length > 10) {
      console.log(`  ... 그리고 ${results.failed.length - 10}장 더`);
    }
  }
  
  // 성공 시 스크린샷 저장
  if (results.success > 0) {
    const sampleCardId = allTarotCardIds[0]; // 첫 번째 카드로 샘플 스크린샷
    try {
      await page.goto(`http://localhost:4000/tarot/${sampleCardId}`);
      await page.screenshot({ 
        path: `final-verification-success-sample.png`, 
        fullPage: true 
      });
      console.log('\\n📸 성공 샘플 스크린샷: final-verification-success-sample.png');
    } catch (error) {
      console.log('\\n⚠️  스크린샷 저장 실패:', error.message);
    }
  }
  
  await browser.close();
  
  console.log('\\n' + '='.repeat(70));
  if (results.success === results.total) {
    console.log('🎉 완벽! 모든 78장 타로카드가 정상 작동합니다!');
  } else if (successRate >= 95) {
    console.log('✅ 우수! 95% 이상 성공률을 달성했습니다!');
  } else if (successRate >= 80) {
    console.log('⚠️  양호! 80% 이상 성공률이지만 개선이 필요합니다.');
  } else {
    console.log('❌ 심각한 문제가 있습니다. 긴급 수정이 필요합니다.');
  }
  
  // 결과를 JSON 파일로 저장
  const resultSummary = {
    timestamp: new Date().toISOString(),
    successRate: `${successRate}%`,
    totalCards: results.total,
    successfulCards: results.success,
    failedCards: results.failed.length,
    categoryBreakdown: results.categoryStats,
    duration: `${duration}초`,
    failedCardIds: results.failed.map(f => f.id)
  };
  
  fs.writeFileSync('final-verification-result.json', JSON.stringify(resultSummary, null, 2));
  console.log('📋 결과 저장: final-verification-result.json');
  
  return results;
}

// 실행
finalCorrectVerification()
  .then(results => {
    process.exit(results.success === results.total ? 0 : 1);
  })
  .catch(error => {
    console.error('\\n❌ 검증 중 오류:', error);
    process.exit(1);
  });