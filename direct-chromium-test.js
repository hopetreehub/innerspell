const { chromium } = require('playwright');

async function directChromiumTest() {
  console.log('🔍 직접 크로미움 테스트 시작');
  console.log('============================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let modelNotFoundError = false;
  let actualErrorMessage = '';
  let errorTime = '';
  
  // 모든 콘솔 로그와 오류 감지
  page.on('console', msg => {
    const text = msg.text();
    const timestamp = new Date().toISOString();
    
    if (text.includes('NOT_FOUND') && text.includes('Model') && text.includes('gpt-3.5-turbo')) {
      modelNotFoundError = true;
      actualErrorMessage = text;
      errorTime = timestamp;
      console.log('🚨 MODEL ERROR CONFIRMED!');
      console.log('Time:', timestamp);
      console.log('Error:', text);
    }
    
    if (text.includes('[TAROT]')) {
      console.log(`[${timestamp}] ${text}`);
    }
  });
  
  try {
    console.log('🌐 Vercel 사이트 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    console.log('✅ 페이지 로드 완료');
    
    // 실제 사용자 시나리오 따라하기
    console.log('\n🎯 실제 타로 리딩 시작');
    
    // 1. 질문 입력
    console.log('1️⃣ 질문 입력');
    const questionInput = await page.locator('input[type="text"], textarea').first();
    await questionInput.fill('정말로 모델 오류가 해결되었는지 확인해주세요');
    
    // 2. 원 카드 스프레드 선택
    console.log('2️⃣ 원 카드 선택');
    const tabs = await page.locator('[role="tablist"] button').all();
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text && text.includes('원 카드')) {
        await tab.click();
        console.log('✅ 원 카드 스프레드 선택됨');
        break;
      }
    }
    
    await page.waitForTimeout(2000);
    
    // 3. 카드 섞기
    console.log('3️⃣ 카드 섞기');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      console.log('✅ 카드 섞기 시작');
      await page.waitForTimeout(4000); // 충분히 기다리기
    }
    
    // 4. 카드 펼치기
    console.log('4️⃣ 카드 펼치기');
    const spreadButton = await page.locator('button:has-text("카드 펼치기")').first();
    if (await spreadButton.isVisible()) {
      await spreadButton.click();
      console.log('✅ 카드 펼치기 완료');
      await page.waitForTimeout(2000);
    }
    
    // 5. 카드 선택
    console.log('5️⃣ 카드 선택');
    const cards = await page.locator('img[alt*="카드"]').all();
    if (cards.length > 0) {
      await cards[0].click();
      console.log('✅ 첫 번째 카드 선택됨');
      await page.waitForTimeout(2000);
    }
    
    // 스크린샷 (해석 요청 전)
    await page.screenshot({ 
      path: 'verification-screenshots/before-interpretation-request.png', 
      fullPage: true 
    });
    
    // 6. AI 해석 요청 - 가장 중요한 단계
    console.log('\n6️⃣ AI 해석 요청 (핵심 테스트)');
    console.log('=====================================');
    
    const interpretButton = await page.locator('button:has-text("해석 보기")').first();
    
    if (await interpretButton.isVisible()) {
      console.log('🔄 해석 버튼 클릭...');
      
      // 클릭 전 콘솔 로그 개수 기록
      let logCountBefore = 0;
      
      await interpretButton.click();
      
      console.log('⏳ AI 응답 대기 중... (최대 90초)');
      
      // 90초간 실시간 모니터링
      const startTime = Date.now();
      let responseReceived = false;
      
      while (Date.now() - startTime < 90000) {
        // Toast 메시지 확인 (실제 오류가 여기 표시됨)
        const toastElements = await page.locator('[data-sonner-toast]').all();
        for (const toast of toastElements) {
          const toastText = await toast.textContent();
          if (toastText && (toastText.includes('NOT_FOUND') || toastText.includes('gpt-3.5-turbo'))) {
            modelNotFoundError = true;
            actualErrorMessage = toastText;
            console.log('🚨 TOAST ERROR 발견:', toastText);
            responseReceived = true;
            break;
          }
        }
        
        // 성공적인 해석 확인
        const interpretation = await page.locator('.prose').first();
        if (await interpretation.isVisible()) {
          const interpretationText = await interpretation.textContent();
          if (interpretationText && interpretationText.trim().length > 100) {
            console.log('✅ AI 해석 성공!');
            console.log('📝 해석 길이:', interpretationText.length);
            responseReceived = true;
            break;
          }
        }
        
        if (responseReceived || modelNotFoundError) break;
        
        await page.waitForTimeout(1000);
      }
      
      if (!responseReceived && !modelNotFoundError) {
        console.log('⚠️ 90초 대기 후에도 응답 없음');
      }
    } else {
      console.log('❌ 해석 버튼을 찾을 수 없음');
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'verification-screenshots/direct-test-final.png', 
      fullPage: true 
    });
    
    // 결과 출력
    console.log('\n📊 직접 테스트 결과:');
    console.log('===================');
    
    if (modelNotFoundError) {
      console.log('❌ MODEL NOT FOUND 오류 여전히 발생!');
      console.log('🚨 실제 오류 메시지:', actualErrorMessage);
      console.log('⏰ 발생 시간:', errorTime);
      console.log('');
      console.log('🔬 결론: 문제가 아직 해결되지 않았습니다.');
      console.log('추가 수정이 필요합니다.');
    } else {
      console.log('✅ MODEL NOT FOUND 오류 발생하지 않음');
      console.log('🎉 문제가 해결된 것으로 보입니다!');
    }
    
  } catch (error) {
    console.error('\n💥 테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: 'verification-screenshots/direct-test-error.png', 
      fullPage: true 
    });
  }
  
  console.log('\n🔍 브라우저 유지 중. 수동으로 더 확인해보세요.');
  console.log('Ctrl+C로 종료하세요.');
  
  // 브라우저 열어둠
  await new Promise(() => {});
}

directChromiumTest().catch(console.error);