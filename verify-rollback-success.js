// Verify Rollback Success - Complete Testing
const { chromium } = require('playwright');

async function verifyRollbackSuccess() {
  console.log('✅ 롤백 성공 검증 테스트');
  console.log('========================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 모든 콘솔 메시지 수집
  const logs = [];
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      time: new Date().toISOString()
    };
    logs.push(logEntry);
    
    // 중요한 로그만 실시간 출력
    if (msg.type() === 'error' || 
        msg.text().includes('getActiveAIModels') || 
        msg.text().includes('not defined') ||
        msg.text().includes('TAROT') ||
        msg.text().includes('AI') ||
        msg.text().includes('NOT_FOUND')) {
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });
  
  // 페이지 에러 수집
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log(`[PAGE ERROR] ${error.message}`);
  });
  
  let testResults = {
    pageLoad: false,
    questionInput: false,
    cardSelection: false,
    aiButtonClick: false,
    aiResponseReceived: false,
    noGetActiveAIModelsError: false,
    overallSuccess: false
  };
  
  try {
    console.log('1. Vercel 사이트 접속 대기 (배포 완료까지)...');
    
    // 배포 완료까지 최대 2분 대기
    let deploymentReady = false;
    for (let i = 0; i < 12; i++) {
      try {
        await page.goto('https://test-studio-firebase.vercel.app/', { 
          waitUntil: 'networkidle',
          timeout: 15000 
        });
        deploymentReady = true;
        break;
      } catch (e) {
        console.log(`배포 대기 중... ${i + 1}/12`);
        await page.waitForTimeout(10000);
      }
    }
    
    if (!deploymentReady) {
      throw new Error('Vercel 배포가 완료되지 않았습니다.');
    }
    
    testResults.pageLoad = true;
    console.log('✅ 페이지 로드 성공');
    
    console.log('2. 타로 카드 읽기 시작...');
    await page.click('text="무료 타로 카드 뽑기"');
    await page.waitForTimeout(3000);
    
    console.log('3. 질문 입력...');
    await page.fill('textarea[placeholder*="질문"]', '롤백 후 정상 작동 테스트 질문입니다');
    testResults.questionInput = true;
    console.log('✅ 질문 입력 성공');
    
    console.log('4. 카드 선택...');
    await page.click('text="1장 뽑기"');
    await page.waitForTimeout(2000);
    
    const cardBacks = await page.locator('.card-back').all();
    if (cardBacks.length > 0) {
      await cardBacks[0].click();
      await page.waitForTimeout(2000);
      testResults.cardSelection = true;
      console.log('✅ 카드 선택 성공');
    }
    
    console.log('5. AI 해석 버튼 클릭...');
    
    // AI 해석 버튼 찾기
    let aiButton = null;
    const selectors = [
      'button:has-text("AI 해석")',
      'button:has-text("해석")',
      'button:has-text("AI")'
    ];
    
    for (const selector of selectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          aiButton = button;
          break;
        }
      } catch (e) {}
    }
    
    if (aiButton) {
      await aiButton.click();
      testResults.aiButtonClick = true;
      console.log('✅ AI 해석 버튼 클릭 성공');
      
      console.log('6. AI 응답 대기...');
      
      // 30초 동안 AI 응답 확인
      let responseReceived = false;
      for (let i = 0; i < 30; i++) {
        await page.waitForTimeout(1000);
        
        // 성공 응답 확인
        const interpretation = await page.locator('text=/서론|본론|해석|AI.*완료|생성.*완료/').first();
        if (await interpretation.isVisible({ timeout: 100 }).catch(() => false)) {
          responseReceived = true;
          console.log('✅ AI 해석 응답 수신 성공!');
          break;
        }
        
        // 에러 메시지 확인
        const errorMsg = await page.locator('text=/getActiveAIModels.*not defined|AI.*configuration.*error/').first();
        if (await errorMsg.isVisible({ timeout: 100 }).catch(() => false)) {
          console.log('❌ 여전히 getActiveAIModels 에러 발생');
          break;
        }
      }
      
      testResults.aiResponseReceived = responseReceived;
    } else {
      console.log('❌ AI 해석 버튼을 찾을 수 없습니다');
    }
    
    // getActiveAIModels 에러 체크
    const hasGetActiveAIModelsError = logs.some(log => 
      log.text.includes('getActiveAIModels') && log.text.includes('not defined')
    ) || pageErrors.some(error => 
      error.includes('getActiveAIModels') && error.includes('not defined')
    );
    
    testResults.noGetActiveAIModelsError = !hasGetActiveAIModelsError;
    
    // 전체 성공 여부
    testResults.overallSuccess = testResults.pageLoad && 
                                testResults.questionInput && 
                                testResults.cardSelection && 
                                testResults.aiButtonClick && 
                                testResults.aiResponseReceived && 
                                testResults.noGetActiveAIModelsError;
    
    // 스크린샷
    await page.screenshot({ 
      path: `rollback-verification-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('\n=== 롤백 검증 결과 ===');
    console.log('페이지 로드:', testResults.pageLoad ? '✅' : '❌');
    console.log('질문 입력:', testResults.questionInput ? '✅' : '❌');
    console.log('카드 선택:', testResults.cardSelection ? '✅' : '❌');
    console.log('AI 버튼 클릭:', testResults.aiButtonClick ? '✅' : '❌');
    console.log('AI 응답 수신:', testResults.aiResponseReceived ? '✅' : '❌');
    console.log('getActiveAIModels 에러 없음:', testResults.noGetActiveAIModelsError ? '✅' : '❌');
    console.log('=======================');
    console.log('전체 성공:', testResults.overallSuccess ? '✅ 성공!' : '❌ 실패');
    
    if (testResults.overallSuccess) {
      console.log('\n🎉 롤백 성공! AI 해석이 정상 작동합니다.');
    } else {
      console.log('\n⚠️ 여전히 문제가 있습니다. 추가 조치가 필요합니다.');
    }
    
    console.log(`\n수집된 로그: ${logs.length}개`);
    console.log(`페이지 에러: ${pageErrors.length}개`);
    
  } catch (error) {
    console.error('검증 테스트 오류:', error);
  }
  
  console.log('\n브라우저를 열어두고 수동 확인 가능합니다.');
  await new Promise(() => {});
}

verifyRollbackSuccess().catch(console.error);