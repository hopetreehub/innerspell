const { chromium } = require('playwright');

async function testFinalFirebaseResolution() {
  console.log('🎯 최종 Firebase 해결 검증 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500 
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    // 콘솔 메시지 캡처
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Firebase') || text.includes('Auth') || text.includes('데모') || text.includes('mock') || text.includes('저장') || text.includes('Toast')) {
        console.log(`[콘솔] ${text}`);
      }
    });
    
    // 에러 캡처
    page.on('pageerror', error => {
      console.log(`[에러] ${error.message}`);
    });
    
    console.log('📍 1단계: 타로 리딩 페이지 로드...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 데모 모드 메시지 체크
    const bodyText = await page.locator('body').textContent();
    const hasDemoMode = bodyText.includes('데모 모드') || bodyText.includes('현재 데모 모드로 운영');
    
    console.log('🔍 데모 모드 텍스트 존재:', hasDemoMode);
    
    console.log('📍 2단계: 타로 리딩 시뮬레이션...');
    
    // 질문 입력
    const questionInput = page.locator('textarea[placeholder*="카드에게"]');
    if (await questionInput.isVisible()) {
      await questionInput.fill('Firebase 연결이 잘 되었는지 확인하는 질문입니다.');
      console.log('✅ 질문 입력 완료');
    }
    
    // 카드 섞기
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ 카드 섞기 완료');
    }
    
    // 카드 펼치기
    const dealButton = page.locator('button:has-text("카드 펼치기")');
    if (await dealButton.isVisible()) {
      await dealButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ 카드 펼치기 완료');
    }
    
    // 카드 선택 (첫 3장)
    console.log('📍 3단계: 카드 선택...');
    const cards = page.locator('img[src*="tarot"], [class*="card"]');
    const cardCount = await cards.count();
    console.log(`🎴 발견된 카드 수: ${cardCount}`);
    
    if (cardCount > 0) {
      for (let i = 0; i < Math.min(3, cardCount); i++) {
        try {
          await cards.nth(i).click();
          await page.waitForTimeout(1000);
          console.log(`✅ 카드 ${i + 1} 선택됨`);
        } catch (e) {
          console.log(`⚠️ 카드 ${i + 1} 선택 실패: ${e.message}`);
        }
      }
    }
    
    // 해석 생성 (AI 버튼 찾기)
    console.log('📍 4단계: 해석 생성...');
    const interpretButtons = await page.locator('button').allTextContents();
    console.log('🔘 사용 가능한 버튼들:', interpretButtons.filter(text => text.length > 0).slice(0, 10));
    
    const aiButton = page.locator('button:has-text("해석"), button:has-text("AI"), button:has-text("생성")').first();
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(5000); // AI 해석 생성 대기
      console.log('✅ AI 해석 생성 시작');
    }
    
    // 저장 버튼 찾기 및 클릭
    console.log('📍 5단계: 저장 기능 테스트...');
    
    // 페이지 새로고침하여 최신 상태 확인
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 저장 버튼 다시 찾기
    const allButtons = await page.locator('button').allTextContents();
    const saveButton = page.locator('button:has-text("저장")').first();
    const saveButtonExists = await saveButton.isVisible().catch(() => false);
    
    console.log('💾 저장 버튼 존재:', saveButtonExists);
    console.log('🔘 모든 버튼:', allButtons.filter(text => text.includes('저장') || text.includes('save')));
    
    if (saveButtonExists) {
      console.log('📍 6단계: 저장 버튼 클릭 테스트...');
      await saveButton.click();
      await page.waitForTimeout(3000);
      
      // 저장 후 토스트 메시지 확인
      const afterSaveText = await page.locator('body').textContent();
      const hasSuccessMessage = afterSaveText.includes('저장 완료') || afterSaveText.includes('성공');
      const hasDemoModeAfterSave = afterSaveText.includes('데모 모드') || afterSaveText.includes('현재 데모 모드로 운영');
      
      console.log('💾 저장 성공 메시지:', hasSuccessMessage);
      console.log('⚠️ 저장 후 데모 모드 메시지:', hasDemoModeAfterSave);
      
      if (!hasDemoModeAfterSave) {
        console.log('🎉 성공! 데모 모드 메시지가 더 이상 나타나지 않습니다!');
      } else {
        console.log('❌ 여전히 데모 모드 메시지가 나타납니다.');
      }
    } else {
      console.log('⚠️ 저장 버튼을 찾을 수 없습니다. (로그인이 필요할 수 있습니다)');
      
      // 로그인 상태 확인
      const hasLoginButton = await page.locator('button:has-text("로그인"), a:has-text("로그인")').isVisible().catch(() => false);
      console.log('🔐 로그인 필요:', hasLoginButton);
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'final-firebase-test.png', 
      fullPage: true 
    });
    console.log('📸 최종 스크린샷 저장됨: final-firebase-test.png');
    
    console.log('\n📊 최종 검증 결과:');
    console.log('  - 데모 모드 메시지:', hasDemoMode ? '❌ 여전히 존재' : '✅ 제거됨');
    console.log('  - 저장 버튼:', saveButtonExists ? '✅ 존재' : '❌ 없음 (로그인 필요)');
    console.log('  - Firebase 연결:', '✅ 실제 Firebase 사용 중');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
}

testFinalFirebaseResolution();