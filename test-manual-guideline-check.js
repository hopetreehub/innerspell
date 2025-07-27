const { chromium } = require('playwright');

async function manualGuidelineCheck() {
  console.log('🎯 수동 타로 지침 확인 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 모든 콘솔 메시지 캡처
  const allLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    allLogs.push({ type, text, timestamp: new Date().toISOString() });
    
    // 중요한 로그만 즉시 출력
    if (
      text.includes('TAROT') || 
      text.includes('guideline') || 
      text.includes('instruction') ||
      text.includes('enhanced') ||
      text.includes('card-specific') ||
      text.includes('getTarotInterpretationPrompt') ||
      text.includes('generateTarotInterpretation')
    ) {
      console.log(`🔥 중요 로그: [${type}] ${text}`);
    }
  });
  
  // 네트워크 요청 모니터링
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/') && request.method() === 'POST') {
      console.log(`🌐 API 요청: ${request.method()} ${url}`);
    }
  });
  
  try {
    console.log('📍 1. /reading 페이지 접속');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    console.log('✅ 페이지 로드 완료');
    
    console.log('📍 2. 간단한 질문 입력');
    await page.fill('textarea', '타로 지침 테스트');
    
    console.log('📍 3. 해석 스타일을 "심리학적 원형 탐구"로 설정');
    await page.click('[id="interpretation-method"]');
    await page.waitForTimeout(500);
    await page.click('text=심리학적 원형 탐구');
    
    console.log('📍 4. 개발자 콘솔 열기');
    await page.keyboard.press('F12');
    await page.waitForTimeout(2000);
    
    // 콘솔 탭 클릭
    const consoleTab = page.locator('text=Console').first();
    if (await consoleTab.count() > 0) {
      await consoleTab.click();
      await page.waitForTimeout(1000);
    }
    
    console.log('📍 5. 브라우저 콘솔에 타로 관련 로그 확인');
    await page.screenshot({ path: 'screenshots/manual-01-console-ready.png', fullPage: true });
    
    console.log('\n=== 브라우저를 수동으로 조작하여 타로 리딩을 진행하세요 ===');
    console.log('1. 카드 섞기 버튼 클릭');
    console.log('2. 카드 펼치기 버튼 클릭');
    console.log('3. 3장의 카드 선택');
    console.log('4. "AI 해석 받기" 버튼 클릭');
    console.log('5. 개발자 콘솔에서 다음 키워드들을 확인하세요:');
    console.log('   - [TAROT]');
    console.log('   - guideline');
    console.log('   - instruction');
    console.log('   - enhanced');
    console.log('   - getTarotInterpretationPrompt');
    console.log('   - generateTarotInterpretation');
    console.log('=======================================================\n');
    
    // 30초마다 현재 캡처된 로그 출력
    let totalWaitTime = 0;
    const maxWaitTime = 300000; // 5분
    const interval = 30000; // 30초
    
    while (totalWaitTime < maxWaitTime) {
      await page.waitForTimeout(interval);
      totalWaitTime += interval;
      
      console.log(`\n📊 ${totalWaitTime/1000}초 경과 - 현재까지 수집된 로그:`);
      
      // 타로 관련 로그 필터링
      const tarotLogs = allLogs.filter(log => 
        log.text.includes('TAROT') || 
        log.text.includes('guideline') || 
        log.text.includes('instruction') ||
        log.text.includes('enhanced') ||
        log.text.includes('getTarotInterpretationPrompt') ||
        log.text.includes('generateTarotInterpretation')
      );
      
      console.log(`- 전체 로그: ${allLogs.length}개`);
      console.log(`- 타로 관련 로그: ${tarotLogs.length}개`);
      
      if (tarotLogs.length > 0) {
        console.log('🔥 발견된 타로 관련 로그:');
        tarotLogs.slice(-5).forEach((log, i) => { // 최신 5개만 표시
          console.log(`  ${i + 1}. [${log.type}] ${log.text.substring(0, 100)}...`);
        });
      }
      
      // 스크린샷 촬영
      await page.screenshot({ 
        path: `screenshots/manual-check-${totalWaitTime/1000}s.png`, 
        fullPage: true 
      });
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
    await page.screenshot({ path: 'screenshots/manual-error.png', fullPage: true });
  } finally {
    console.log('\n📊 최종 로그 요약:');
    console.log(`- 총 수집된 로그: ${allLogs.length}개`);
    
    // 타로 관련 로그 전체 분석
    const tarotLogs = allLogs.filter(log => 
      log.text.includes('TAROT') || 
      log.text.includes('guideline') || 
      log.text.includes('instruction') ||
      log.text.includes('enhanced') ||
      log.text.includes('card-specific') ||
      log.text.includes('getTarotInterpretationPrompt') ||
      log.text.includes('generateTarotInterpretation')
    );
    
    console.log(`- 타로 지침 관련 로그: ${tarotLogs.length}개`);
    
    if (tarotLogs.length > 0) {
      console.log('\n🔥 모든 타로 관련 로그:');
      tarotLogs.forEach((log, i) => {
        console.log(`  ${i + 1}. [${log.type}] ${log.text}`);
      });
    } else {
      console.log('❌ 타로 지침 관련 로그를 찾을 수 없습니다.');
    }
    
    console.log('\n브라우저를 닫습니다...');
    await browser.close();
    console.log('✅ 수동 타로 지침 확인 테스트 완료!');
  }
}

manualGuidelineCheck();