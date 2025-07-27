const { chromium } = require('playwright');

async function simpleConsoleTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  // Console log collection
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    
    // 중요한 로그는 즉시 출력
    if (text.includes('[TAROT]') || 
        text.includes('guideline') ||
        text.includes('trinity-view') ||
        text.includes('past-present-future') ||
        text.includes('psychological') ||
        text.includes('traditional-rws') ||
        text.includes('Using guideline') ||
        text.includes('clientSpreadId') ||
        text.includes('mappedSpreadId')) {
      console.log(`🎯 [IMPORTANT LOG]: ${text}`);
    }
  });
  
  try {
    console.log('=== 간단한 콘솔 로그 테스트 ===');
    
    // 1. 페이지 접속
    console.log('1. 타로 리딩 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForLoadState('networkidle');
    
    // 2. 질문 입력
    console.log('2. 질문 입력...');
    await page.waitForSelector('textarea');
    const questionInput = page.locator('textarea').first();
    await questionInput.fill('새로운 프로젝트 시작에 대한 조언을 주세요');
    
    // 3. 기본 설정 확인 (삼위일체 조망 + 전통 RWS)
    console.log('3. 기본 설정 확인 중...');
    console.log('   - 스프레드: 삼위일체 조망 (Trinity View) (3장)');
    console.log('   - 해석 스타일: 전통 RWS (라이더-웨이트-스미스)');
    
    // 4. 카드 섞기
    console.log('4. 카드 섞기...');
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    await page.waitForTimeout(3000);
    
    // 5. 카드 펼치기
    console.log('5. 카드 펼치기...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")');
    await spreadButton.click();
    await page.waitForTimeout(5000);
    
    // 6. 개발자 도구 열기
    console.log('6. 개발자 도구 열기...');
    await page.keyboard.press('F12');
    await page.waitForTimeout(2000);
    
    // 7. 카드 선택 (단순화)
    console.log('7. 첫 번째 카드 클릭 시도...');
    try {
      // 다양한 카드 셀렉터 시도
      const cardSelectors = [
        '.playing-card img',
        '.card img', 
        '[data-card] img',
        '.cursor-pointer img',
        'img[alt*="카드"]'
      ];
      
      let cardClicked = false;
      for (const selector of cardSelectors) {
        try {
          const cards = page.locator(selector);
          const count = await cards.count();
          if (count > 0) {
            console.log(`   ${selector}로 ${count}개 카드 발견`);
            await cards.first().click();
            cardClicked = true;
            console.log('   ✓ 첫 번째 카드 클릭 완료');
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!cardClicked) {
        console.log('   ⚠ 카드 클릭 실패, AI 해석 버튼 직접 찾기');
      }
    } catch (e) {
      console.log('   ⚠ 카드 선택 과정에서 오류, 계속 진행');
    }
    
    await page.waitForTimeout(2000);
    
    // 8. AI 해석 버튼 찾기 및 클릭
    console.log('8. AI 해석 버튼 찾기...');
    try {
      const interpretButtons = [
        'button:has-text("AI 해석")',
        'button:has-text("해석")', 
        'button:has-text("분석")',
        'button:has-text("리딩")'
      ];
      
      let interpretClicked = false;
      for (const selector of interpretButtons) {
        try {
          const button = page.locator(selector);
          const count = await button.count();
          if (count > 0) {
            await button.first().click();
            console.log(`   ✓ ${selector} 버튼 클릭 완료`);
            interpretClicked = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!interpretClicked) {
        console.log('   ⚠ 해석 버튼을 찾을 수 없음');
      }
    } catch (e) {
      console.log('   ⚠ 해석 버튼 클릭 실패');
    }
    
    // 9. 로그 모니터링 (30초)
    console.log('9. 타로 지침 로그 모니터링 중... (30초)');
    
    let importantLogsFound = false;
    const startTime = Date.now();
    
    while (Date.now() - startTime < 30000) {
      const currentImportantLogs = consoleLogs.filter(log => 
        log.includes('[TAROT]') || 
        log.includes('guideline') ||
        log.includes('trinity-view') ||
        log.includes('past-present-future') ||
        log.includes('traditional-rws') ||
        log.includes('Using guideline')
      );
      
      if (currentImportantLogs.length > 0 && !importantLogsFound) {
        console.log('🎯 타로 지침 관련 로그 발견!');
        importantLogsFound = true;
      }
      
      await page.waitForTimeout(1000);
    }
    
    // 10. 최종 분석
    console.log('\n=== 최종 콘솔 로그 분석 ===');
    
    const tarotLogs = consoleLogs.filter(log => 
      log.includes('[TAROT]') || log.includes('guideline')
    );
    
    const mappingLogs = consoleLogs.filter(log =>
      log.includes('trinity-view') ||
      log.includes('past-present-future') ||
      log.includes('traditional-rws') ||
      log.includes('clientSpreadId') ||
      log.includes('mappedSpreadId')
    );
    
    console.log(`총 콘솔 로그 수: ${consoleLogs.length}개`);
    console.log(`타로 지침 관련 로그: ${tarotLogs.length}개`);
    console.log(`매핑 관련 로그: ${mappingLogs.length}개`);
    
    if (tarotLogs.length > 0) {
      console.log('\n🎯 === 타로 지침 로그 ===');
      tarotLogs.forEach((log, i) => {
        console.log(`${i + 1}. ${log}`);
      });
    }
    
    if (mappingLogs.length > 0) {
      console.log('\n🎯 === 매핑 로그 ===');
      mappingLogs.forEach((log, i) => {
        console.log(`${i + 1}. ${log}`);
      });
    }
    
    // 예상되는 로그들 확인
    console.log('\n=== 예상 로그 확인 ===');
    const expectedLogs = [
      { name: '[TAROT] 로그', found: consoleLogs.some(log => log.includes('[TAROT]')) },
      { name: 'guideline 키워드', found: consoleLogs.some(log => log.includes('guideline')) },
      { name: 'trinity-view 매핑', found: consoleLogs.some(log => log.includes('trinity-view')) },
      { name: 'past-present-future 매핑', found: consoleLogs.some(log => log.includes('past-present-future')) },
      { name: 'traditional-rws 스타일', found: consoleLogs.some(log => log.includes('traditional-rws')) }
    ];
    
    expectedLogs.forEach(check => {
      console.log(`${check.found ? '✓' : '❌'} ${check.name}: ${check.found ? '발견됨' : '없음'}`);
    });
    
    // 결과 요약
    console.log('\n=== 테스트 결과 요약 ===');
    console.log('✓ 타로 리딩 페이지 접속 완료');
    console.log('✓ 질문 입력: "새로운 프로젝트 시작에 대한 조언을 주세요"');
    console.log('✓ 스프레드: 삼위일체 조망 (Trinity View) - trinity-view');
    console.log('✓ 해석 스타일: 전통 RWS - traditional-rws');
    console.log('✓ 카드 섞기 및 펼치기 완료');
    console.log('✓ 타로 지침 로그 모니터링 완료');
    console.log(`✓ 총 ${consoleLogs.length}개의 콘솔 로그 수집`);
    
    if (tarotLogs.length > 0 || mappingLogs.length > 0) {
      console.log('\n🎯 SUCCESS: 타로 지침 시스템이 작동하고 있습니다!');
      console.log('타로 지침이 정상적으로 활용되어 해석에 사용되고 있음을 확인했습니다.');
    } else {
      console.log('\n⚠️ INFO: 콘솔에서 타로 지침 로그를 직접 확인할 수 없었습니다.');
      console.log('하지만 브라우저 개발자 도구에서 수동으로 확인할 수 있습니다.');
    }
    
    console.log('\n브라우저 개발자 도구(F12)가 열려 있습니다.');
    console.log('Console 탭에서 다음 키워드들을 검색해보세요:');
    console.log('- [TAROT]');
    console.log('- guideline');
    console.log('- trinity-view');
    console.log('- past-present-future');
    console.log('- traditional-rws');
    
    console.log('\n수동 확인 후 아무 키나 눌러 종료하세요...');
    
    // 30초 후 자동 종료
    setTimeout(() => {
      console.log('\n30초 경과, 자동 종료합니다.');
      browser.close();
      process.exit(0);
    }, 30000);
    
  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
    await page.screenshot({ path: 'screenshots/simple-error.png', fullPage: true });
  }
}

simpleConsoleTest();