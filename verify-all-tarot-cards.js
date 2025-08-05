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

async function verifyAllTarotCards() {
  console.log('🎯 타로카드 전체 검증 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1400,900']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // 스크린샷 디렉토리 생성
  const screenshotDir = path.join(__dirname, 'tarot-verification');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  // 결과 저장을 위한 배열
  const results = {
    success: [],
    failed: [],
    errors: []
  };
  
  // 먼저 메인 타로 페이지 확인
  try {
    console.log('📍 메인 타로 페이지 접속...');
    await page.goto('http://localhost:4000/tarot', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '00-main-tarot-page.png'),
      fullPage: true 
    });
    
    console.log('✅ 메인 타로 페이지 확인 완료');
  } catch (error) {
    console.error('❌ 메인 타로 페이지 접속 실패:', error.message);
  }
  
  // 각 카드별 검증
  for (let i = 0; i < tarotCards.length; i++) {
    const card = tarotCards[i];
    const cardNumber = String(i + 1).padStart(2, '0');
    
    try {
      console.log(`\n🔍 [${cardNumber}/78] ${card.name} 검증 중...`);
      
      // 카드 상세 페이지 접속
      const url = `http://localhost:4000/tarot/${card.id}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // 페이지 로딩 대기
      await page.waitForTimeout(2000);
      
      // 주요 요소 확인
      const checks = {
        title: await page.locator('h1').first().isVisible().catch(() => false),
        image: await page.locator('img[alt*="타로"], img[alt*="Tarot"]').first().isVisible().catch(() => false),
        keywords: await page.locator('text=/키워드|Keywords/i').isVisible().catch(() => false),
        description: await page.locator('p').first().isVisible().catch(() => false)
      };
      
      // 스크린샷 저장
      const screenshotPath = path.join(screenshotDir, `${cardNumber}-${card.id}.png`);
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      // 결과 판정
      const isSuccess = Object.values(checks).every(check => check === true);
      
      if (isSuccess) {
        console.log(`✅ ${card.name} - 모든 요소 정상 렌더링`);
        results.success.push({
          card: card.name,
          id: card.id,
          checks
        });
      } else {
        console.log(`⚠️  ${card.name} - 일부 요소 누락`);
        console.log(`   체크 결과:`, checks);
        results.failed.push({
          card: card.name,
          id: card.id,
          checks,
          screenshot: screenshotPath
        });
      }
      
    } catch (error) {
      console.error(`❌ ${card.name} 검증 실패:`, error.message);
      results.errors.push({
        card: card.name,
        id: card.id,
        error: error.message
      });
    }
    
    // 서버 부하 방지를 위한 대기
    if (i < tarotCards.length - 1) {
      await page.waitForTimeout(500);
    }
  }
  
  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('📊 검증 결과 요약');
  console.log('='.repeat(60));
  console.log(`✅ 성공: ${results.success.length}장`);
  console.log(`⚠️  실패: ${results.failed.length}장`);
  console.log(`❌ 에러: ${results.errors.length}장`);
  console.log(`📁 스크린샷 저장 위치: ${screenshotDir}`);
  
  // 상세 결과 저장
  const reportPath = path.join(screenshotDir, 'verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📝 상세 보고서: ${reportPath}`);
  
  // 실패한 카드 목록 출력
  if (results.failed.length > 0) {
    console.log('\n⚠️  렌더링 실패 카드:');
    results.failed.forEach(item => {
      console.log(`  - ${item.card} (${item.id})`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ 에러 발생 카드:');
    results.errors.forEach(item => {
      console.log(`  - ${item.card} (${item.id}): ${item.error}`);
    });
  }
  
  await browser.close();
  console.log('\n✨ 타로카드 전체 검증 완료!');
}

// 실행
verifyAllTarotCards().catch(console.error);