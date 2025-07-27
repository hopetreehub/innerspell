const { chromium } = require('playwright');

async function finalTarotTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Console log collection
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    // 중요한 로그만 실시간 출력
    if (text.includes('[TAROT]') || text.includes('guideline') || text.includes('trinity-view') || text.includes('psychological') || text.includes('Using guideline')) {
      console.log(`🎯 [IMPORTANT]: ${text}`);
    }
  });
  
  try {
    console.log('=== 최종 타로 지침 테스트 ===');
    
    // 1. 페이지 접속
    console.log('1. 타로 리딩 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/final-01-loaded.png', fullPage: true });
    
    // 2. 페이지 요소들이 로드될 때까지 대기
    await page.waitForSelector('textarea, input[type="text"]', { timeout: 15000 });
    
    // 3. 질문 입력
    console.log('2. 질문 입력...');
    const questionInput = page.locator('textarea').first();
    await questionInput.click();
    await questionInput.fill('새로운 프로젝트 시작에 대한 조언을 주세요');
    await page.screenshot({ path: 'screenshots/final-02-question.png', fullPage: true });
    
    // 4. 해석 스타일 변경
    console.log('3. 해석 스타일을 심리학적 원형 탐구로 변경...');
    
    // 해석 스타일 드롭다운 클릭
    const styleDropdown = page.locator('[data-placeholder="해석 스타일을 선택하세요"] button, button:has-text("전통 RWS")').first();
    await styleDropdown.click();
    await page.waitForTimeout(1000);
    
    // 심리학적 원형 탐구 옵션 선택
    const psychologicalOption = page.locator('text="심리학적 원형 탐구"').first();
    await psychologicalOption.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'screenshots/final-03-style.png', fullPage: true });
    console.log('✓ 해석 스타일 변경 완료');
    
    // 5. 카드 섞기
    console.log('4. 카드 섞기...');
    const shuffleButton = page.locator('button:has-text("카드 섞기")').first();
    await shuffleButton.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/final-04-shuffled.png', fullPage: true });
    
    // 6. 카드 펼치기
    console.log('5. 카드 펼치기...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")').first();
    await spreadButton.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/final-05-spread.png', fullPage: true });
    
    // 7. 카드 선택 (실제 게임 카드들)
    console.log('6. 카드 3장 선택...');
    
    // 실제 게임 화면의 카드들 찾기
    const gameCards = page.locator('.playing-card, .card, [data-card], .cursor-pointer img[alt*="카드"]');
    await page.waitForSelector('.playing-card, .card, [data-card]', { timeout: 10000 });
    
    const cardCount = await gameCards.count();
    console.log(`발견된 게임 카드: ${cardCount}개`);
    
    // 첫 번째 3장 선택
    for (let i = 0; i < Math.min(3, cardCount); i++) {
      await gameCards.nth(i).click();
      console.log(`✓ 카드 ${i + 1} 선택`);
      await page.waitForTimeout(1500);
    }
    
    await page.screenshot({ path: 'screenshots/final-06-selected.png', fullPage: true });
    
    // 8. AI 해석 요청
    console.log('7. AI 해석 요청...');
    const interpretButton = page.locator('button:has-text("AI 해석"), button:has-text("해석"), button:has-text("분석")').first();
    await interpretButton.click();
    console.log('✓ AI 해석 버튼 클릭');
    
    // 9. 해석 과정 모니터링 (60초)
    console.log('8. 해석 과정 모니터링 중...');
    
    let tarotLogsFound = false;
    const startTime = Date.now();
    
    while (Date.now() - startTime < 60000) { // 60초
      // 타로 지침 로그 확인
      const currentTarotLogs = consoleLogs.filter(log => 
        log.includes('[TAROT]') || 
        log.includes('Using guideline') ||
        log.includes('trinity-view') ||
        log.includes('past-present-future') ||
        log.includes('psychological-jungian') ||
        log.includes('clientSpreadId') ||
        log.includes('mappedSpreadId')
      );
      
      if (currentTarotLogs.length > 0 && !tarotLogsFound) {
        console.log('🎯 타로 지침 관련 로그 발견됨!');
        tarotLogsFound = true;
        currentTarotLogs.forEach(log => {
          console.log(`🎯 TAROT LOG: ${log}`);
        });
      }
      
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'screenshots/final-07-interpretation.png', fullPage: true });
    
    // 10. 최종 분석
    console.log('\n=== 최종 로그 분석 ===');
    
    const allTarotLogs = consoleLogs.filter(log => 
      log.includes('[TAROT]') || 
      log.includes('guideline') ||
      log.includes('trinity-view') ||
      log.includes('past-present-future') ||
      log.includes('psychological-jungian') ||
      log.includes('Using guideline')
    );
    
    const mappingLogs = consoleLogs.filter(log =>
      log.includes('clientSpreadId') ||
      log.includes('mappedSpreadId') ||
      log.includes('clientStyleId') ||
      log.includes('mappedStyleId')
    );
    
    console.log(`총 콘솔 로그: ${consoleLogs.length}개`);
    console.log(`타로 지침 관련 로그: ${allTarotLogs.length}개`);
    console.log(`매핑 관련 로그: ${mappingLogs.length}개`);
    
    if (allTarotLogs.length > 0) {
      console.log('\n🎯 === 발견된 타로 지침 로그 ===');
      allTarotLogs.forEach((log, i) => {
        console.log(`${i + 1}. ${log}`);
      });
    }
    
    if (mappingLogs.length > 0) {
      console.log('\n🎯 === 발견된 매핑 로그 ===');
      mappingLogs.forEach((log, i) => {
        console.log(`${i + 1}. ${log}`);
      });
    }
    
    // 예상 매핑 확인
    console.log('\n=== 예상 매핑 확인 ===');
    const expectedChecks = [
      { name: 'trinity-view', found: consoleLogs.some(log => log.includes('trinity-view')) },
      { name: 'past-present-future', found: consoleLogs.some(log => log.includes('past-present-future')) },
      { name: 'psychological-jungian', found: consoleLogs.some(log => log.includes('psychological-jungian')) },
      { name: '[TAROT] 로그', found: consoleLogs.some(log => log.includes('[TAROT]')) }
    ];
    
    expectedChecks.forEach(check => {
      console.log(`${check.found ? '✓' : '❌'} ${check.name}: ${check.found ? '발견됨' : '없음'}`);
    });
    
    // 결과 요약
    console.log('\n=== 테스트 결과 요약 ===');
    console.log('✓ 타로 리딩 페이지 접속 완료');
    console.log('✓ 질문 입력: "새로운 프로젝트 시작에 대한 조언을 주세요"');
    console.log('✓ 스프레드: 삼위일체 조망 (Trinity View) (3장)');
    console.log('✓ 해석 스타일: 심리학적 원형 탐구로 변경');
    console.log('✓ 카드 섞기 및 펼치기 완료');
    console.log('✓ 카드 3장 선택 완료');
    console.log('✓ AI 해석 요청 완료');
    console.log(`✓ 총 ${consoleLogs.length}개의 콘솔 로그 수집`);
    console.log('✓ 스크린샷 7개 저장 완료');
    
    if (allTarotLogs.length > 0) {
      console.log('\n🎯 SUCCESS: 타로 지침이 정상적으로 활용되고 있습니다!');
      console.log('지침 관련 로그가 발견되어 타로 지침 시스템이 작동 중입니다.');
    } else {
      console.log('\n⚠️ WARNING: 타로 지침 관련 로그를 찾을 수 없습니다.');
      console.log('브라우저 개발자 도구에서 수동으로 확인이 필요할 수 있습니다.');
    }
    
    // 브라우저 유지하여 수동 확인
    console.log('\n브라우저에서 F12를 눌러 개발자 도구를 열고 Console 탭을 확인하세요.');
    console.log('다음 키워드들을 검색해보세요: [TAROT], guideline, trinity-view, psychological-jungian');
    console.log('확인 후 Enter를 눌러 종료하세요...');
    
    // 표준 입력 대기
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once('data', () => {
      process.stdin.setRawMode(false);
    });
    
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
    await page.screenshot({ path: 'screenshots/final-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n테스트 완료!');
  }
}

finalTarotTest();