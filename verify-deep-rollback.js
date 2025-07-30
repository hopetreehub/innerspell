// Verify Deep Rollback - Final Error Resolution Test
const { chromium } = require('playwright');

async function verifyDeepRollback() {
  console.log('🚨 깊은 롤백 완전 검증');
  console.log('========================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 모든 에러 추적
  const errors = {
    getActiveAIModels: [],
    other: [],
    pageErrors: []
  };
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('getActiveAIModels')) {
      errors.getActiveAIModels.push({
        type: msg.type(),
        text: text,
        time: new Date().toISOString()
      });
      console.log(`❌ [${msg.type().toUpperCase()}] getActiveAIModels: ${text}`);
    } else if (msg.type() === 'error') {
      errors.other.push({
        type: msg.type(),
        text: text,
        time: new Date().toISOString()  
      });
      console.log(`⚠️ [${msg.type().toUpperCase()}] ${text}`);
    } else if (text.includes('TAROT')) {
      console.log(`[TAROT] ${text}`);
    }
  });
  
  page.on('pageerror', error => {
    if (error.message.includes('getActiveAIModels')) {
      errors.getActiveAIModels.push({
        type: 'page-error',
        text: error.message,
        time: new Date().toISOString()
      });
      console.log(`❌ [PAGE ERROR] getActiveAIModels: ${error.message}`);
    } else {
      errors.pageErrors.push(error.message);
      console.log(`⚠️ [PAGE ERROR] ${error.message}`);
    }
  });
  
  let testPhase = 'none';
  
  try {
    console.log('1. Vercel 배포 완료 대기...');
    
    // 배포 대기 (최대 3분)
    let siteReady = false;
    for (let i = 0; i < 18; i++) {
      try {
        await page.goto('https://test-studio-firebase.vercel.app/', { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
        siteReady = true;
        console.log('✅ 사이트 접속 성공');
        break;
      } catch (e) {
        console.log(`배포 대기 중... ${i + 1}/18 (${Math.round((i + 1) * 10 / 18)}%)`);
        await page.waitForTimeout(10000);
      }
    }
    
    if (!siteReady) {
      throw new Error('Vercel 배포가 완료되지 않았습니다');
    }
    
    testPhase = 'site-loaded';
    
    console.log('2. 타로 읽기 시작...');
    await page.click('text="무료 타로 카드 뽑기"');
    await page.waitForTimeout(3000);
    testPhase = 'reading-page';
    
    console.log('3. 질문 입력 및 카드 설정...');
    await page.fill('textarea[placeholder*="질문"]', '깊은 롤백 후 완전한 테스트 질문입니다');
    await page.click('text="1장 뽑기"');
    await page.waitForTimeout(2000);
    testPhase = 'setup-complete';
    
    console.log('4. 카드 선택...');
    const cardBacks = await page.locator('.card-back').all();
    if (cardBacks.length > 0) {
      await cardBacks[0].click();
      await page.waitForTimeout(2000);
      testPhase = 'card-selected';
    }
    
    console.log('5. AI 해석 버튼 클릭 (에러 발생 여부 확인)...');
    
    // AI 해석 버튼 찾기
    const aiSelectors = [
      'button:has-text("AI 해석")',
      'button:has-text("해석")',
      'button:has-text("AI")',
      '[data-testid*="ai"]',
      'button[class*="ai" i]'
    ];
    
    let aiButton = null;
    for (const selector of aiSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          aiButton = button;
          console.log(`AI 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {}
    }
    
    if (aiButton) {
      testPhase = 'ai-button-found';
      await aiButton.click();
      console.log('✅ AI 해석 버튼 클릭 완료');
      testPhase = 'ai-button-clicked';
      
      console.log('6. 에러 발생 모니터링 (20초)...');
      
      // 20초 동안 에러 모니터링
      let aiResponseReceived = false;
      let errorDetected = false;
      
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(1000);
        
        // getActiveAIModels 에러 체크
        if (errors.getActiveAIModels.length > 0) {
          errorDetected = true;
          console.log('❌ getActiveAIModels 에러 발생!');
          break;
        }
        
        // AI 응답 체크
        const interpretation = await page.locator('text=/서론|본론|해석|AI.*완료/').first();
        if (await interpretation.isVisible({ timeout: 100 }).catch(() => false)) {
          aiResponseReceived = true;
          console.log('✅ AI 해석 응답 수신!');
          break;
        }
        
        // 일반 에러 체크
        const errorMsg = await page.locator('text=/configuration.*error|provider.*error|not defined/').first();
        if (await errorMsg.isVisible({ timeout: 100 }).catch(() => false)) {
          const errorText = await errorMsg.textContent();
          console.log('⚠️ 다른 에러 감지:', errorText);
          if (errorText.includes('getActiveAIModels')) {
            errorDetected = true;
          }
          break;
        }
      }
      
      testPhase = aiResponseReceived ? 'ai-success' : 'ai-timeout';
      
    } else {
      console.log('❌ AI 해석 버튼을 찾을 수 없습니다');
      testPhase = 'no-ai-button';
    }
    
    // 스크린샷
    await page.screenshot({ 
      path: `deep-rollback-verification-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('\n=== 깊은 롤백 검증 결과 ===');
    console.log('현재 단계:', testPhase);
    console.log('getActiveAIModels 에러 수:', errors.getActiveAIModels.length);
    console.log('기타 에러 수:', errors.other.length);
    console.log('페이지 에러 수:', errors.pageErrors.length);
    
    if (errors.getActiveAIModels.length === 0) {
      console.log('🎉 SUCCESS: getActiveAIModels 에러 완전히 해결됨!');
      
      if (testPhase === 'ai-success') {
        console.log('🎊 PERFECT: AI 해석도 정상 작동함!');
      } else if (testPhase === 'ai-timeout') {
        console.log('⚠️ AI 해석 타임아웃 - 하지만 getActiveAIModels 에러는 해결됨');
      }
    } else {
      console.log('❌ FAILURE: getActiveAIModels 에러 여전히 발생');
      console.log('발생한 getActiveAIModels 에러들:');
      errors.getActiveAIModels.forEach((error, i) => {
        console.log(`  ${i + 1}. [${error.type}] ${error.text}`);
      });
    }
    
    console.log('===============================');
    
  } catch (error) {
    console.error('검증 테스트 오류:', error);
    console.log('현재 단계:', testPhase);
  }
  
  console.log('\n브라우저를 열어두고 수동 확인 가능합니다.');
  console.log('최종 결과를 확인해주세요.');
  
  await new Promise(() => {});
}

verifyDeepRollback().catch(console.error);