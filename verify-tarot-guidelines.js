const { chromium } = require('playwright');

async function verifyTarotGuidelines() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Console log collection
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({
      text: text,
      timestamp: new Date().toISOString()
    });
    
    // 타로 관련 로그만 강조 표시
    if (text.includes('[TAROT]') || 
        text.includes('guideline') ||
        text.includes('clientSpreadId') ||
        text.includes('mappedSpreadId') ||
        text.includes('trinity-view') ||
        text.includes('past-present-future')) {
      console.log(`🎯 [${new Date().toLocaleTimeString()}] IMPORTANT: ${text}`);
    }
  });
  
  try {
    console.log('=== 타로 지침 활용 최종 검증 ===');
    console.log('이 테스트는 실제로 타로 지침이 활용되는지 확인합니다.\n');
    
    // 1. 페이지 접속
    console.log('1. 타로 리딩 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForLoadState('networkidle');
    
    // 2. 브라우저 개발자 도구 열기
    console.log('2. 개발자 도구 열기...');
    await page.keyboard.press('F12');
    await page.waitForTimeout(2000);
    
    // 3. Console 탭으로 이동하는 JavaScript 실행
    await page.evaluate(() => {
      // 개발자 도구가 열린 후 콘솔 탭 활성화
      if (window.DevTools) {
        window.DevTools.showPanel('console');
      }
    });
    
    // 4. 질문 입력
    console.log('3. 질문 입력...');
    await page.waitForSelector('textarea');
    const questionInput = page.locator('textarea').first();
    await questionInput.fill('새로운 프로젝트 시작에 대한 조언을 주세요');
    
    // 5. 현재 설정 확인
    console.log('4. 현재 설정 확인...');
    console.log('   - 스프레드: 삼위일체 조망 (Trinity View) (3장)');
    console.log('   - 해석 스타일: 전통 RWS (라이더-웨이트-스미스)');
    console.log('   - 예상 매핑:');
    console.log('     * clientSpreadId: "trinity-view"');
    console.log('     * mappedSpreadId: "past-present-future"'); 
    console.log('     * clientStyleId: "traditional-rws"');
    console.log('     * mappedStyleId: "traditional-rws"');
    
    // 6. 카드 섞기
    console.log('\\n5. 카드 섞기...');
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    await page.waitForTimeout(3000);
    
    // 7. 카드 펼치기
    console.log('6. 카드 펼치기...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")');
    await spreadButton.click();
    await page.waitForTimeout(5000);
    
    // 8. 카드 선택 시뮬레이션 (실제로는 선택하지 않고 바로 해석 버튼 찾기)
    console.log('7. 카드 3장이 자동 선택되었다고 가정하고 해석 진행...');
    
    // 9. AI 해석 버튼 클릭 (중요한 순간!)
    console.log('8. AI 해석 버튼 클릭 - 이때 [TAROT] 로그가 출력되어야 합니다!');
    try {
      const interpretButton = page.locator('button:has-text("AI 해석"), button:has-text("해석"), button:has-text("분석")').first();
      await interpretButton.click();
      console.log('   ✓ 해석 버튼 클릭 완료');
    } catch (e) {
      console.log('   ⚠ 해석 버튼 클릭 실패, 다른 방법 시도...');
      
      // 대안: 모든 버튼 중에서 '해석' 텍스트가 있는 것 찾기
      const allButtons = await page.locator('button').all();
      for (const button of allButtons) {
        const text = await button.textContent();
        if (text && text.includes('해석')) {
          await button.click();
          console.log(`   ✓ "${text}" 버튼 클릭 완료`);
          break;
        }
      }
    }
    
    // 10. 타로 지침 로그 모니터링 (60초간)
    console.log('\\n9. 타로 지침 로그 모니터링 시작 (60초간)...');
    console.log('   예상되는 로그:');
    console.log('   - [TAROT] Using guideline IDs: {...}');
    console.log('   - [TAROT] Using tarot guideline: 삼위일체 - 전통 라이더-웨이트 해석');
    
    let foundLogs = {
      guidelineIds: false,
      usingGuideline: false,
      mappingInfo: false
    };
    
    const monitorStartTime = Date.now();
    while (Date.now() - monitorStartTime < 60000) { // 60초
      
      // 현재까지의 로그에서 타로 관련 로그 찾기
      const tarotLogs = consoleLogs.filter(log => 
        log.text.includes('[TAROT]') || 
        log.text.includes('clientSpreadId') ||
        log.text.includes('Using tarot guideline')
      );
      
      // 새로운 로그 발견 시 업데이트
      for (const log of tarotLogs) {
        if (log.text.includes('Using guideline IDs') && !foundLogs.guidelineIds) {
          foundLogs.guidelineIds = true;
          console.log('   ✓ 매핑 로그 발견됨!');
        }
        if (log.text.includes('Using tarot guideline') && !foundLogs.usingGuideline) {
          foundLogs.usingGuideline = true;
          console.log('   ✓ 지침 사용 로그 발견됨!');
        }
        if ((log.text.includes('trinity-view') || log.text.includes('past-present-future')) && !foundLogs.mappingInfo) {
          foundLogs.mappingInfo = true;
          console.log('   ✓ 스프레드 매핑 정보 발견됨!');
        }
      }
      
      // 모든 로그가 발견되면 조기 종료
      if (foundLogs.guidelineIds && foundLogs.usingGuideline && foundLogs.mappingInfo) {
        console.log('   🎯 모든 예상 로그가 발견되었습니다!');
        break;
      }
      
      await page.waitForTimeout(2000);
    }
    
    // 11. 최종 분석
    console.log('\\n=== 최종 검증 결과 ===');
    
    const allTarotLogs = consoleLogs.filter(log => 
      log.text.includes('[TAROT]') || 
      log.text.includes('guideline') ||
      log.text.includes('clientSpreadId') ||
      log.text.includes('trinity-view') ||
      log.text.includes('past-present-future')
    );
    
    console.log(`총 수집된 콘솔 로그: ${consoleLogs.length}개`);
    console.log(`타로 지침 관련 로그: ${allTarotLogs.length}개`);
    
    if (allTarotLogs.length > 0) {
      console.log('\\n🎯 === 발견된 타로 지침 로그 ===');
      allTarotLogs.forEach((log, i) => {
        console.log(`${i + 1}. [${log.timestamp}] ${log.text}`);
      });
    }
    
    // 검증 항목들
    console.log('\\n=== 검증 항목 체크 ===');
    const verificationChecks = [
      { name: '[TAROT] 로그 존재', passed: allTarotLogs.some(log => log.text.includes('[TAROT]')) },
      { name: 'guideline 키워드 발견', passed: allTarotLogs.some(log => log.text.includes('guideline')) },
      { name: 'clientSpreadId 매핑', passed: allTarotLogs.some(log => log.text.includes('clientSpreadId')) },
      { name: 'trinity-view 매핑', passed: allTarotLogs.some(log => log.text.includes('trinity-view')) },
      { name: 'past-present-future 매핑', passed: allTarotLogs.some(log => log.text.includes('past-present-future')) }
    ];
    
    verificationChecks.forEach(check => {
      console.log(`${check.passed ? '✓' : '❌'} ${check.name}: ${check.passed ? '통과' : '실패'}`);
    });
    
    const passedChecks = verificationChecks.filter(check => check.passed).length;
    const totalChecks = verificationChecks.length;
    
    console.log(`\\n전체 검증 점수: ${passedChecks}/${totalChecks} (${Math.round(passedChecks/totalChecks*100)}%)`);
    
    if (passedChecks >= 3) {
      console.log('\\n🎯 SUCCESS: 타로 지침 시스템이 정상적으로 작동하고 있습니다!');
      console.log('타로 지침이 활용되어 더 구체적이고 체계적인 해석이 제공되고 있습니다.');
    } else if (passedChecks >= 1) {
      console.log('\\n⚠️ PARTIAL: 타로 지침 시스템이 부분적으로 작동하고 있습니다.');
      console.log('일부 기능은 정상 작동하지만 완전한 활용을 위해 추가 확인이 필요합니다.');
    } else {
      console.log('\\n❌ FAIL: 타로 지침 관련 로그를 찾을 수 없습니다.');
      console.log('시스템이 정상 작동하지 않거나 로그 출력에 문제가 있을 수 있습니다.');
    }
    
    console.log('\\n브라우저 개발자 도구의 Console 탭에서 직접 확인하세요:');
    console.log('- [TAROT] 키워드로 필터링');
    console.log('- guideline 키워드로 검색');
    console.log('- trinity-view, past-present-future 키워드 확인');
    
    console.log('\\n아무 키나 눌러 테스트를 종료하세요...');
    
    // 자동 종료 타이머 (60초)
    const autoCloseTimer = setTimeout(() => {
      console.log('\\n60초 경과로 자동 종료합니다.');
      browser.close();
      process.exit(0);
    }, 60000);
    
    // 사용자 입력 대기
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once('data', () => {
      clearTimeout(autoCloseTimer);
      process.stdin.setRawMode(false);
      browser.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('\\n❌ 검증 오류:', error.message);
  }
}

verifyTarotGuidelines();