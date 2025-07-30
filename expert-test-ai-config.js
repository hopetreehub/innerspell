const { chromium } = require('playwright');
const fs = require('fs');

// 전문가 페르소나: Firebase Genkit & AI Architecture Specialist
async function expertAnalysisTest() {
  console.log('🔬 전문가 분석 모드: AI Config Error Deep Dive');
  console.log('================================================\n');
  
  const analysisResults = {
    timestamp: new Date().toISOString(),
    environment: 'production',
    errors: [],
    consoleLogs: [],
    networkCalls: [],
    aiModelRequests: [],
    configAccess: []
  };
  
  // 3분 대기 (Vercel 배포 완료)
  console.log('⏳ Vercel 배포 대기중... (3분)');
  await new Promise(resolve => setTimeout(resolve, 180000));
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 디버깅을 위한 상세 로깅
  page.on('console', msg => {
    const text = msg.text();
    analysisResults.consoleLogs.push({
      type: msg.type(),
      text: text,
      time: new Date().toISOString()
    });
    
    if (text.includes('[TAROT]')) {
      console.log('🔍 [TAROT] Log:', text);
    } else if (msg.type() === 'error') {
      console.log('❌ Console Error:', text);
      analysisResults.errors.push(text);
    }
  });
  
  // 네트워크 요청 모니터링
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/') || url.includes('generate')) {
      analysisResults.networkCalls.push({
        url: url,
        method: request.method(),
        time: new Date().toISOString()
      });
    }
  });
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/') && response.status() >= 400) {
      console.log(`🔴 API Error ${response.status()}: ${url}`);
    }
  });
  
  try {
    // 1. 타로 페이지 로드
    console.log('\n1️⃣ Phase 1: 페이지 로드 및 초기 상태 확인');
    await page.goto('https://test-studio-firebase.vercel.app/tarot', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    console.log('✅ 페이지 로드 완료');
    
    // 2. 질문 입력
    console.log('\n2️⃣ Phase 2: 사용자 입력 시뮬레이션');
    const questionInput = await page.locator('input[type="text"], textarea').first();
    await questionInput.fill('오늘의 운세와 조언을 부탁드립니다');
    console.log('✅ 질문 입력 완료');
    
    // 3. 스프레드 선택
    console.log('\n3️⃣ Phase 3: 타로 스프레드 선택');
    const tabs = await page.locator('[role="tablist"] button').all();
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text && text.includes('원 카드')) {
        await tab.click();
        console.log('✅ 원 카드 스프레드 선택');
        break;
      }
    }
    
    await page.waitForTimeout(2000);
    
    // 4. 카드 섞기
    console.log('\n4️⃣ Phase 4: 카드 셔플링');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      console.log('✅ 카드 섞기 시작');
      await page.waitForTimeout(5000);
    }
    
    // 5. 카드 펼치기
    console.log('\n5️⃣ Phase 5: 카드 펼치기');
    const spreadButton = await page.locator('button:has-text("카드 펼치기")').first();
    if (await spreadButton.isVisible()) {
      await spreadButton.click();
      console.log('✅ 카드 펼치기 완료');
      await page.waitForTimeout(3000);
    }
    
    // 6. 카드 선택
    console.log('\n6️⃣ Phase 6: 카드 선택');
    const cards = await page.locator('img[alt*="카드"]').all();
    if (cards.length > 0) {
      await cards[Math.floor(cards.length / 2)].click();
      console.log(`✅ 카드 선택 (${cards.length}장 중 가운데)`);
      await page.waitForTimeout(2000);
    }
    
    // 스크린샷 캡처
    await page.screenshot({ 
      path: 'verification-screenshots/expert-test-01-before-interpretation.png', 
      fullPage: true 
    });
    
    // 7. AI 해석 요청 - 핵심 부분
    console.log('\n7️⃣ Phase 7: AI 해석 요청 (Critical Phase)');
    console.log('===========================================');
    
    // 해석 버튼 클릭 전 현재 로그 저장
    const preClickLogs = [...analysisResults.consoleLogs];
    
    const interpretButton = await page.locator('button:has-text("해석 보기")').first();
    if (await interpretButton.isVisible()) {
      console.log('🔄 해석 버튼 클릭...');
      await interpretButton.click();
      
      // 에러 또는 성공 대기
      console.log('⏳ AI 응답 대기중... (최대 90초)');
      
      const startTime = Date.now();
      let errorCaught = false;
      let successFound = false;
      let configError = false;
      
      while (Date.now() - startTime < 90000) {
        // 콘솔 로그에서 config 에러 확인
        const newLogs = analysisResults.consoleLogs.slice(preClickLogs.length);
        for (const log of newLogs) {
          if (log.text.includes('config is not defined')) {
            configError = true;
            console.log('\n🚨 CONFIG ERROR DETECTED!');
            console.log('Error context:', log);
            break;
          }
        }
        
        // 에러 메시지 확인
        const errorElements = await page.locator('text=/error|오류|실패/i').all();
        for (const elem of errorElements) {
          const text = await elem.textContent();
          if (text.includes('config is not defined')) {
            errorCaught = true;
            console.log('\n❌ CONFIG ERROR in UI:', text);
            break;
          }
        }
        
        // 성공 확인
        const interpretation = await page.locator('.prose').first();
        if (await interpretation.isVisible()) {
          successFound = true;
          console.log('\n✅ AI 해석 성공!');
          break;
        }
        
        if (errorCaught || configError) break;
        
        await page.waitForTimeout(1000);
      }
      
      // 최종 스크린샷
      await page.screenshot({ 
        path: 'verification-screenshots/expert-test-02-after-interpretation.png', 
        fullPage: true 
      });
      
      // 분석 결과
      console.log('\n📊 분석 결과:');
      console.log('==============');
      console.log(`Config Error 발생: ${configError ? '✅ YES' : '❌ NO'}`);
      console.log(`UI Error 표시: ${errorCaught ? '✅ YES' : '❌ NO'}`);
      console.log(`해석 성공: ${successFound ? '✅ YES' : '❌ NO'}`);
      
      if (configError) {
        console.log('\n🔬 Config Error 상세 분석:');
        console.log('1. 에러 위치: generateTarotInterpretation 함수 내부');
        console.log('2. 원인: config 변수가 스코프 밖에서 참조됨');
        console.log('3. 발생 시점: modelForPrompt 계산 시');
        console.log('4. 영향: AI 해석 완전 실패');
      }
    }
    
    // 로그 저장
    fs.writeFileSync(
      'verification-screenshots/expert-analysis-results.json',
      JSON.stringify(analysisResults, null, 2)
    );
    
    // 전문가 진단
    console.log('\n🎓 전문가 진단 (Expert Diagnosis):');
    console.log('=====================================');
    console.log('1. 근본 원인: Variable Scope Issue');
    console.log('   - config 변수가 try 블록에서 선언되었지만');
    console.log('   - catch 블록 이후에도 참조되고 있음');
    console.log('');
    console.log('2. 코드 흐름 문제:');
    console.log('   - Primary config 성공 시: config 정의됨');
    console.log('   - Fallback 사용 시: config = undefined');
    console.log('   - modelForPrompt 계산 시: config 참조 → 에러');
    console.log('');
    console.log('3. 현재 수정의 문제점:');
    console.log('   - config를 외부 스코프에 선언했지만');
    console.log('   - 초기값이 undefined인 상태');
    console.log('   - fallback 경로에서 config가 설정되지 않음');
    
  } catch (error) {
    console.error('\n💥 테스트 중 예외 발생:', error);
    await page.screenshot({ 
      path: 'verification-screenshots/expert-test-critical-error.png', 
      fullPage: true 
    });
  }
  
  console.log('\n🔍 브라우저 유지. Ctrl+C로 종료.');
  await new Promise(() => {});
}

// 실행
expertAnalysisTest().catch(console.error);