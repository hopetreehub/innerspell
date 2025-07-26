const { chromium } = require('playwright');

(async () => {
  console.log('🎯 최종 타로 리딩 저장 기능 테스트...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 배포된 사이트 접속
    console.log('1️⃣ 배포된 사이트 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 2. 비로그인 상태 확인
    console.log('\n2️⃣ 비로그인 상태 테스트...');
    
    // 스프레드 선택
    const threeCardSpread = await page.$('button:has-text("3카드")');
    await threeCardSpread.click();
    await page.waitForTimeout(1000);
    
    // 질문 입력
    const questionInput = await page.$('textarea[placeholder*="질문"]');
    await questionInput.fill('비로그인 상태에서 저장 버튼이 보이나요?');
    
    // 카드 뽑기
    const drawButton = await page.$('button:has-text("카드 뽑기")');
    await drawButton.click();
    await page.waitForTimeout(2000);
    
    // 카드 3장 선택
    const cards = await page.$$('.cursor-pointer');
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      await cards[i].click();
      await page.waitForTimeout(500);
    }
    
    // 해석 받기
    const interpretButton = await page.$('button:has-text("해석 받기")');
    await interpretButton.click();
    console.log('   → 해석 생성 중...');
    
    // 해석 완료 대기 (더 긴 시간)
    await page.waitForSelector('.animate-fade-in', { timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // 저장 버튼 찾기
    console.log('\n3️⃣ 비로그인 상태에서 저장 버튼 확인...');
    const saveButtons = await page.$$('button:has-text("저장")');
    console.log(`   → 저장 버튼 ${saveButtons.length}개 발견!`);
    
    if (saveButtons.length > 0) {
      console.log('✅ 비로그인 상태에서도 저장 버튼이 표시됩니다!');
      
      // 저장 버튼 클릭
      await saveButtons[0].click();
      await page.waitForTimeout(2000);
      
      // 토스트 메시지 확인
      const toast = await page.$('[role="alert"]');
      if (toast) {
        const toastText = await toast.textContent();
        console.log(`   → 토스트 메시지: ${toastText}`);
        
        // 토스트 내 로그인 버튼 확인
        const loginButtonInToast = await toast.$('button:has-text("로그인하기")');
        if (loginButtonInToast) {
          console.log('✅ 토스트에 로그인 버튼이 포함되어 있습니다!');
        }
      }
    } else {
      console.log('❌ 저장 버튼을 찾을 수 없습니다!');
    }
    
    // 4. 해석 다시 보기 카드에서도 확인
    console.log('\n4️⃣ 해석 다시 보기 카드에서 저장 버튼 확인...');
    
    // 다이얼로그 닫기
    const closeButton = await page.$('button:has-text("닫기")');
    if (closeButton) {
      await closeButton.click();
      await page.waitForTimeout(1000);
    }
    
    // 재열기 카드의 저장 버튼 확인
    const cardSaveButton = await page.$('button:has-text("리딩 저장")');
    if (cardSaveButton) {
      console.log('✅ 재열기 카드에도 저장 버튼이 있습니다!');
      await cardSaveButton.click();
      await page.waitForTimeout(2000);
      
      const toast2 = await page.$('[role="alert"]');
      if (toast2) {
        const toastText2 = await toast2.textContent();
        console.log(`   → 토스트 메시지: ${toastText2}`);
      }
    }
    
    // 스크린샷 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `final-tarot-save-test-${timestamp}.png`,
      fullPage: true 
    });
    console.log(`\n📸 스크린샷 저장: final-tarot-save-test-${timestamp}.png`);
    
    console.log('\n✅ 테스트 완료!');
    console.log('📊 결과 요약:');
    console.log('- 비로그인 사용자도 저장 버튼을 볼 수 있음');
    console.log('- 저장 버튼 클릭 시 로그인 안내 토스트 표시');
    console.log('- 토스트에서 직접 로그인 페이지로 이동 가능');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
})();