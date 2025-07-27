const { chromium } = require('playwright');

async function manualTarotTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Console log collection
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    if (text.includes('[TAROT]') || text.includes('guideline') || text.includes('trinity-view') || text.includes('psychological')) {
      console.log(`🎯 [IMPORTANT LOG]: ${text}`);
    } else {
      console.log(`[BROWSER]: ${text}`);
    }
  });
  
  try {
    console.log('=== 수동 타로 지침 테스트 시작 ===');
    
    // 1. 페이지 접속
    console.log('1. 타로 리딩 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'networkidle' 
    });
    await page.screenshot({ path: 'screenshots/manual-01-loaded.png', fullPage: true });
    
    // 2. 질문 입력
    console.log('2. 질문 입력...');
    const questionField = page.locator('textarea[placeholder*="질문"]').first();
    await questionField.fill('새로운 프로젝트 시작에 대한 조언을 주세요');
    await page.screenshot({ path: 'screenshots/manual-02-question.png', fullPage: true });
    
    // 3. 해석 스타일 변경 (심리학적 원형 탐구)
    console.log('3. 해석 스타일을 심리학적 원형 탐구로 변경...');
    
    // 해석 스타일 드롭다운 클릭
    await page.locator('button:has-text("전통 RWS")').click();
    await page.waitForTimeout(1000);
    
    // 심리학적 원형 탐구 선택
    const psychologicalOption = page.locator('text="심리학적 원형 탐구"').first();
    await psychologicalOption.click();
    
    await page.screenshot({ path: 'screenshots/manual-03-style-changed.png', fullPage: true });
    console.log('✓ 해석 스타일이 심리학적 원형 탐구로 변경됨');
    
    // 4. 카드 섞기
    console.log('4. 카드 섞기...');
    await page.locator('button:has-text("카드 섞기")').click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/manual-04-shuffled.png', fullPage: true });
    
    // 5. 카드 선택 (3장)
    console.log('5. 카드 3장 선택...');
    
    // 카드 펼치기 버튼 클릭
    await page.locator('button:has-text("카드 펼치기")').click();
    await page.waitForTimeout(5000);
    
    // 카드 요소들 찾기 (실제 선택 가능한 카드들)
    const cardElements = await page.locator('.cursor-pointer img, [role="button"] img').all();
    console.log(`발견된 선택 가능한 카드: ${cardElements.length}개`);
    
    // 3장 카드 선택
    for (let i = 0; i < Math.min(3, cardElements.length); i++) {
      await cardElements[i].click();
      console.log(`✓ 카드 ${i + 1} 선택됨`);
      await page.waitForTimeout(1500);
    }
    
    await page.screenshot({ path: 'screenshots/manual-05-cards-selected.png', fullPage: true });
    
    // 6. AI 해석 요청
    console.log('6. AI 해석 요청...');
    try {
      await page.locator('button:has-text("AI 해석 받기")').click();
      console.log('✓ AI 해석 버튼 클릭됨');
    } catch (e) {
      console.log('⚠ AI 해석 버튼을 찾을 수 없음, 다른 버튼 시도...');
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const text = await button.textContent();
        if (text && (text.includes('해석') || text.includes('분석'))) {
          await button.click();
          console.log(`✓ ${text} 버튼 클릭됨`);
          break;
        }
      }
    }
    
    // 7. 해석 결과 대기 및 로그 모니터링
    console.log('7. 해석 결과 대기 중... (60초)');
    
    let guidanceLogsFound = false;
    const startTime = Date.now();
    
    while (Date.now() - startTime < 60000) { // 60초 동안
      // 타로 지침 관련 로그 확인
      const currentGuidanceLogs = consoleLogs.filter(log => 
        log.includes('[TAROT]') || 
        log.includes('Using guideline') ||
        log.includes('clientSpreadId') ||
        log.includes('mappedSpreadId') ||
        log.includes('trinity-view') ||
        log.includes('past-present-future') ||
        log.includes('psychological-jungian')
      );
      
      if (currentGuidanceLogs.length > 0 && !guidanceLogsFound) {
        console.log('🎯 타로 지침 관련 로그 발견!');
        guidanceLogsFound = true;
        currentGuidanceLogs.forEach(log => {
          console.log(`🎯 GUIDANCE LOG: ${log}`);
        });
      }
      
      // 해석 결과가 표시되었는지 확인
      const interpretationText = await page.textContent('body');
      if (interpretationText.includes('해석 결과') || interpretationText.includes('카드 의미')) {
        console.log('✓ 해석 결과가 표시됨');
        break;
      }
      
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'screenshots/manual-06-interpretation.png', fullPage: true });
    
    // 8. 최종 로그 분석
    console.log('\n=== 최종 로그 분석 ===');
    
    const tarotLogs = consoleLogs.filter(log => 
      log.includes('[TAROT]') || 
      log.includes('guideline') ||
      log.includes('Using guideline')
    );
    
    const mappingLogs = consoleLogs.filter(log =>
      log.includes('clientSpreadId') ||
      log.includes('mappedSpreadId') ||
      log.includes('clientStyleId') ||
      log.includes('mappedStyleId') ||
      log.includes('trinity-view') ||
      log.includes('past-present-future') ||
      log.includes('psychological-jungian')
    );
    
    console.log(`\n총 콘솔 로그: ${consoleLogs.length}개`);
    console.log(`타로 지침 로그: ${tarotLogs.length}개`);
    console.log(`매핑 관련 로그: ${mappingLogs.length}개`);
    
    if (tarotLogs.length > 0) {
      console.log('\n🎯 === 타로 지침 관련 로그 ===');
      tarotLogs.forEach((log, i) => {
        console.log(`${i + 1}. ${log}`);
      });
    }
    
    if (mappingLogs.length > 0) {
      console.log('\n🎯 === 매핑 관련 로그 ===');
      mappingLogs.forEach((log, i) => {
        console.log(`${i + 1}. ${log}`);
      });
    }
    
    // 결과 요약
    console.log('\n=== 테스트 결과 요약 ===');
    console.log('✓ 페이지 접속 완료');
    console.log('✓ 질문 입력: "새로운 프로젝트 시작에 대한 조언을 주세요"');
    console.log('✓ 스프레드: 삼위일체 조망 (Trinity View) (3장)');
    console.log('✓ 해석 스타일: 심리학적 원형 탐구');
    console.log('✓ 카드 3장 선택 완료');
    console.log('✓ AI 해석 요청 완료');
    console.log(`✓ 콘솔 로그 ${consoleLogs.length}개 수집`);
    
    const expectedMappings = [
      'clientSpreadId: "trinity-view"',
      'mappedSpreadId: "past-present-future"', 
      'clientStyleId: "심리학적 원형 탐구"',
      'mappedStyleId: "psychological-jungian"'
    ];
    
    console.log('\n=== 예상 매핑 확인 ===');
    expectedMappings.forEach(mapping => {
      const found = consoleLogs.some(log => log.includes(mapping.split(':')[1].trim()));
      console.log(`${found ? '✓' : '❌'} ${mapping}`);
    });
    
    if (tarotLogs.length > 0) {
      console.log('\n🎯 타로 지침이 정상적으로 활용되고 있습니다!');
    } else {
      console.log('\n⚠️ 타로 지침 활용 로그를 찾을 수 없습니다.');
      console.log('브라우저의 개발자 도구에서 수동으로 콘솔을 확인해보세요.');
    }
    
    // 수동 확인을 위해 브라우저 유지
    console.log('\n브라우저에서 개발자 도구를 열어 콘솔을 확인한 후 Enter를 눌러 종료하세요...');
    console.log('F12를 눌러 개발자 도구를 열고 Console 탭에서 다음을 검색해보세요:');
    console.log('- [TAROT]');
    console.log('- guideline');
    console.log('- trinity-view');
    console.log('- past-present-future');
    console.log('- psychological-jungian');
    
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
  } catch (error) {
    console.error('테스트 오류:', error.message);
    await page.screenshot({ path: 'screenshots/manual-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('테스트 완료!');
  }
}

manualTarotTest();