const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 타로카드 데이터 (78장 전체)
const tarotCards = [
  // Major Arcana (22장)
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
  
  // Wands (14장)
  { id: 'wands-ace', name: '완드 에이스', category: 'wands' },
  { id: 'wands-two', name: '완드 2', category: 'wands' },
  { id: 'wands-three', name: '완드 3', category: 'wands' },
  { id: 'wands-four', name: '완드 4', category: 'wands' },
  { id: 'wands-five', name: '완드 5', category: 'wands' },
  { id: 'wands-six', name: '완드 6', category: 'wands' },
  { id: 'wands-seven', name: '완드 7', category: 'wands' },
  { id: 'wands-eight', name: '완드 8', category: 'wands' },
  { id: 'wands-nine', name: '완드 9', category: 'wands' },
  { id: 'wands-ten', name: '완드 10', category: 'wands' },
  { id: 'wands-page', name: '완드 페이지', category: 'wands' },
  { id: 'wands-knight', name: '완드 기사', category: 'wands' },
  { id: 'wands-queen', name: '완드 여왕', category: 'wands' },
  { id: 'wands-king', name: '완드 왕', category: 'wands' },
  
  // Cups (14장)
  { id: 'cups-ace', name: '컵 에이스', category: 'cups' },
  { id: 'cups-two', name: '컵 2', category: 'cups' },
  { id: 'cups-three', name: '컵 3', category: 'cups' },
  { id: 'cups-four', name: '컵 4', category: 'cups' },
  { id: 'cups-five', name: '컵 5', category: 'cups' },
  { id: 'cups-six', name: '컵 6', category: 'cups' },
  { id: 'cups-seven', name: '컵 7', category: 'cups' },
  { id: 'cups-eight', name: '컵 8', category: 'cups' },
  { id: 'cups-nine', name: '컵 9', category: 'cups' },
  { id: 'cups-ten', name: '컵 10', category: 'cups' },
  { id: 'cups-page', name: '컵 페이지', category: 'cups' },
  { id: 'cups-knight', name: '컵 기사', category: 'cups' },
  { id: 'cups-queen', name: '컵 여왕', category: 'cups' },
  { id: 'cups-king', name: '컵 왕', category: 'cups' },
  
  // Swords (14장)
  { id: 'swords-ace', name: '검 에이스', category: 'swords' },
  { id: 'swords-two', name: '검 2', category: 'swords' },
  { id: 'swords-three', name: '검 3', category: 'swords' },
  { id: 'swords-four', name: '검 4', category: 'swords' },
  { id: 'swords-five', name: '검 5', category: 'swords' },
  { id: 'swords-six', name: '검 6', category: 'swords' },
  { id: 'swords-seven', name: '검 7', category: 'swords' },
  { id: 'swords-eight', name: '검 8', category: 'swords' },
  { id: 'swords-nine', name: '검 9', category: 'swords' },
  { id: 'swords-ten', name: '검 10', category: 'swords' },
  { id: 'swords-page', name: '검 페이지', category: 'swords' },
  { id: 'swords-knight', name: '검 기사', category: 'swords' },
  { id: 'swords-queen', name: '검 여왕', category: 'swords' },
  { id: 'swords-king', name: '검 왕', category: 'swords' },
  
  // Pentacles (14장)
  { id: 'pentacles-ace', name: '펜타클 에이스', category: 'pentacles' },
  { id: 'pentacles-two', name: '펜타클 2', category: 'pentacles' },
  { id: 'pentacles-three', name: '펜타클 3', category: 'pentacles' },
  { id: 'pentacles-four', name: '펜타클 4', category: 'pentacles' },
  { id: 'pentacles-five', name: '펜타클 5', category: 'pentacles' },
  { id: 'pentacles-six', name: '펜타클 6', category: 'pentacles' },
  { id: 'pentacles-seven', name: '펜타클 7', category: 'pentacles' },
  { id: 'pentacles-eight', name: '펜타클 8', category: 'pentacles' },
  { id: 'pentacles-nine', name: '펜타클 9', category: 'pentacles' },
  { id: 'pentacles-ten', name: '펜타클 10', category: 'pentacles' },
  { id: 'pentacles-page', name: '펜타클 페이지', category: 'pentacles' },
  { id: 'pentacles-knight', name: '펜타클 기사', category: 'pentacles' },
  { id: 'pentacles-queen', name: '펜타클 여왕', category: 'pentacles' },
  { id: 'pentacles-king', name: '펜타클 왕', category: 'pentacles' }
];

// 검증 체크포인트
const checkpoints = {
  image: '이미지 표시',
  title: '카드 제목',
  keywords: '키워드 섹션',
  meaning: '의미 해석',
  navigation: '이전/다음 네비게이션'
};

async function verifyCompleteTarotDeck() {
  console.log('🎯 타로카드 78장 전체 검증 시작...');
  console.log(`📅 검증 일시: ${new Date().toLocaleString('ko-KR')}`);
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1400,900']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // 결과 저장 디렉토리
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const screenshotDir = path.join(__dirname, `tarot-complete-verification-${timestamp}`);
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  // 결과 통계
  const results = {
    total: tarotCards.length,
    success: [],
    warning: [],
    failed: [],
    errors: [],
    categoryStats: {
      major: { total: 22, success: 0, failed: 0 },
      wands: { total: 14, success: 0, failed: 0 },
      cups: { total: 14, success: 0, failed: 0 },
      swords: { total: 14, success: 0, failed: 0 },
      pentacles: { total: 14, success: 0, failed: 0 }
    },
    performance: {
      startTime: Date.now(),
      endTime: null,
      totalDuration: null,
      avgTimePerCard: null
    }
  };
  
  // 각 카드 검증
  for (let i = 0; i < tarotCards.length; i++) {
    const card = tarotCards[i];
    const cardNumber = String(i + 1).padStart(2, '0');
    const startTime = Date.now();
    
    try {
      process.stdout.write(`\r🔍 [${cardNumber}/78] ${card.name} 검증 중...`);
      
      // 카드 페이지 접속
      const url = `http://localhost:4000/tarot/${card.id}`;
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // HTTP 상태 확인
      if (!response || response.status() !== 200) {
        throw new Error(`HTTP ${response?.status() || 'No response'}`);
      }
      
      // 페이지 로딩 대기
      await page.waitForTimeout(1500);
      
      // 각 체크포인트 검증
      const checks = {};
      const checkResults = [];
      
      // 1. 이미지 체크
      try {
        const imageVisible = await page.locator('img').first().isVisible();
        const imageSrc = await page.locator('img').first().getAttribute('src').catch(() => null);
        checks.image = imageVisible && imageSrc && imageSrc.includes(card.id.replace('major-', ''));
        checkResults.push({ name: 'image', passed: checks.image, detail: imageSrc });
      } catch (e) {
        checks.image = false;
        checkResults.push({ name: 'image', passed: false, detail: 'No image found' });
      }
      
      // 2. 제목 체크
      try {
        const titleText = await page.locator('h1').first().textContent();
        checks.title = titleText && titleText.includes(card.name.split(' ')[0]);
        checkResults.push({ name: 'title', passed: checks.title, detail: titleText });
      } catch (e) {
        checks.title = false;
        checkResults.push({ name: 'title', passed: false, detail: 'No title found' });
      }
      
      // 3. 키워드 체크
      try {
        checks.keywords = await page.locator('text=/키워드|Keywords|핵심/i').isVisible();
        checkResults.push({ name: 'keywords', passed: checks.keywords });
      } catch (e) {
        checks.keywords = false;
        checkResults.push({ name: 'keywords', passed: false });
      }
      
      // 4. 의미 해석 체크
      try {
        checks.meaning = await page.locator('text=/정방향|의미|해석/i').isVisible();
        checkResults.push({ name: 'meaning', passed: checks.meaning });
      } catch (e) {
        checks.meaning = false;
        checkResults.push({ name: 'meaning', passed: false });
      }
      
      // 5. 네비게이션 체크
      try {
        const prevButton = await page.locator('button:has-text("이전")').isVisible();
        const nextButton = await page.locator('button:has-text("다음")').isVisible();
        checks.navigation = i === 0 ? !prevButton : prevButton && (i === 77 ? !nextButton : nextButton);
        checkResults.push({ name: 'navigation', passed: checks.navigation });
      } catch (e) {
        checks.navigation = false;
        checkResults.push({ name: 'navigation', passed: false });
      }
      
      // 스크린샷 저장
      const screenshotPath = path.join(screenshotDir, `${cardNumber}-${card.category}-${card.id}.png`);
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      // 결과 판정
      const passedCount = Object.values(checks).filter(v => v === true).length;
      const totalChecks = Object.keys(checks).length;
      const successRate = (passedCount / totalChecks) * 100;
      
      const cardResult = {
        card: card.name,
        id: card.id,
        category: card.category,
        checks,
        checkResults,
        successRate,
        screenshot: screenshotPath,
        duration: Date.now() - startTime
      };
      
      if (successRate === 100) {
        results.success.push(cardResult);
        results.categoryStats[card.category].success++;
      } else if (successRate >= 60) {
        results.warning.push(cardResult);
        results.categoryStats[card.category].success++;
      } else {
        results.failed.push(cardResult);
        results.categoryStats[card.category].failed++;
      }
      
    } catch (error) {
      const errorResult = {
        card: card.name,
        id: card.id,
        category: card.category,
        error: error.message,
        duration: Date.now() - startTime
      };
      results.errors.push(errorResult);
      results.categoryStats[card.category].failed++;
      
      // 에러 스크린샷
      try {
        const errorScreenshot = path.join(screenshotDir, `ERROR-${cardNumber}-${card.id}.png`);
        await page.screenshot({ path: errorScreenshot });
        errorResult.screenshot = errorScreenshot;
      } catch (screenshotError) {
        // 스크린샷 실패 무시
      }
    }
    
    // 진행률 업데이트
    if ((i + 1) % 10 === 0) {
      console.log(` ✓ ${i + 1}/78 완료`);
    }
  }
  
  // 성능 통계
  results.performance.endTime = Date.now();
  results.performance.totalDuration = results.performance.endTime - results.performance.startTime;
  results.performance.avgTimePerCard = Math.round(results.performance.totalDuration / results.total);
  
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 검증 결과 요약');
  console.log('='.repeat(60));
  
  // 전체 통계
  const totalSuccess = results.success.length + results.warning.length;
  const successRate = ((totalSuccess / results.total) * 100).toFixed(1);
  
  console.log(`\n📈 전체 성공률: ${successRate}% (${totalSuccess}/${results.total})`);
  console.log(`  ✅ 완벽: ${results.success.length}장`);
  console.log(`  ⚠️  경고: ${results.warning.length}장`);
  console.log(`  ❌ 실패: ${results.failed.length}장`);
  console.log(`  🚫 에러: ${results.errors.length}장`);
  
  // 카테고리별 통계
  console.log('\n📊 카테고리별 성공률:');
  for (const [category, stats] of Object.entries(results.categoryStats)) {
    const catSuccessRate = ((stats.success / stats.total) * 100).toFixed(1);
    console.log(`  - ${category.padEnd(10)}: ${catSuccessRate}% (${stats.success}/${stats.total})`);
  }
  
  // 성능 통계
  console.log('\n⏱️  성능 통계:');
  console.log(`  - 총 소요시간: ${Math.round(results.performance.totalDuration / 1000)}초`);
  console.log(`  - 카드당 평균: ${results.performance.avgTimePerCard}ms`);
  
  // 문제 카드 상세
  if (results.failed.length > 0) {
    console.log('\n❌ 실패한 카드 상세:');
    results.failed.forEach(item => {
      console.log(`\n  📍 ${item.card} (${item.id})`);
      console.log(`     성공률: ${item.successRate.toFixed(0)}%`);
      item.checkResults.forEach(check => {
        if (!check.passed) {
          console.log(`     - ${checkpoints[check.name]}: ❌ ${check.detail || '실패'}`);
        }
      });
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n🚫 에러 발생 카드:');
    results.errors.forEach(item => {
      console.log(`  - ${item.card} (${item.id}): ${item.error}`);
    });
  }
  
  // 상세 보고서 저장
  const reportPath = path.join(screenshotDir, 'complete-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  // 요약 보고서 생성
  const summary = {
    timestamp: new Date().toISOString(),
    totalCards: results.total,
    successRate: successRate + '%',
    categoryBreakdown: results.categoryStats,
    performance: {
      totalTime: `${Math.round(results.performance.totalDuration / 1000)}초`,
      avgPerCard: `${results.performance.avgTimePerCard}ms`
    },
    screenshotDirectory: screenshotDir,
    detailedReport: reportPath
  };
  
  const summaryPath = path.join(screenshotDir, 'verification-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log('\n📁 결과 파일:');
  console.log(`  - 스크린샷: ${screenshotDir}`);
  console.log(`  - 상세 보고서: ${reportPath}`);
  console.log(`  - 요약 보고서: ${summaryPath}`);
  
  await browser.close();
  
  console.log('\n✨ 타로카드 78장 전체 검증 완료!');
  console.log('='.repeat(60));
  
  return results;
}

// 실행
verifyCompleteTarotDeck()
  .then(results => {
    process.exit(results.errors.length > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('\n❌ 검증 중 치명적 오류:', error);
    process.exit(1);
  });