const { chromium } = require('playwright');

async function testFinalQuick() {
  console.log('🚀 최종 빠른 검증 테스트...');
  
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
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      if (text.includes('Firebase') || text.includes('데모') || text.includes('Mock') || text.includes('Real') || text.includes('초기화')) {
        console.log(`[중요] ${text}`);
      }
    });
    
    console.log('📍 타로 리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // Mock/데모 관련 텍스트 확인
    const pageText = await page.locator('body').textContent();
    const hasDemoText = pageText.includes('데모 모드') || pageText.includes('현재 데모');
    
    console.log('\\n📊 핵심 검증:');
    console.log('  데모 모드 텍스트:', hasDemoText ? '❌ 있음' : '✅ 없음');
    
    // Firebase 초기화 확인
    const hasFirebaseInit = logs.some(log => 
      log.includes('Real Firebase initialized') || 
      log.includes('Firebase config validation')
    );
    console.log('  Firebase 초기화:', hasFirebaseInit ? '✅ 성공' : '❌ 실패');
    
    // Mock 로그 확인
    const hasMockLogs = logs.some(log => 
      log.toLowerCase().includes('mock') && !log.includes('no mock')
    );
    console.log('  Mock 로그:', hasMockLogs ? '❌ 있음' : '✅ 없음');
    
    // 간단한 저장 테스트
    console.log('\\n💾 저장 기능 테스트:');
    
    // 질문 입력
    const questionInput = page.locator('textarea[placeholder*="카드에게"]');
    if (await questionInput.isVisible()) {
      await questionInput.fill('최종 Firebase 테스트');
      console.log('✅ 질문 입력');
      
      // 카드 섞기
      const shuffleButton = page.locator('button:has-text("카드 섞기")');
      if (await shuffleButton.isVisible()) {
        await shuffleButton.click();
        await page.waitForTimeout(2000);
        console.log('✅ 카드 섞기');
      }
      
      // 저장 버튼 확인
      const saveButton = page.locator('button:has-text("저장")');
      const saveExists = await saveButton.isVisible().catch(() => false);
      console.log('💾 저장 버튼:', saveExists ? '✅ 존재' : '⚠️ 없음 (로그인 필요)');
      
      if (saveExists) {
        console.log('💾 저장 클릭 테스트...');
        await saveButton.click();
        await page.waitForTimeout(3000);
        
        // 최근 로그에서 데모 메시지 확인
        const recentLogs = logs.slice(-5);
        const hasRecentDemo = recentLogs.some(log => 
          log.includes('데모') || log.includes('demo')
        );
        console.log('💾 저장 후 데모 메시지:', hasRecentDemo ? '❌ 나타남' : '✅ 없음');
      }
    }
    
    // 최종 결과
    console.log('\\n🎯 최종 결과:');
    if (!hasDemoText && hasFirebaseInit && !hasMockLogs) {
      console.log('🎉 성공! 데모 모드가 완전히 제거되고 Real Firebase가 활성화되었습니다!');
      
      // 로그인 상태 확인
      const needsLogin = await page.locator('button:has-text("로그인")').isVisible().catch(() => false);
      if (needsLogin) {
        console.log('🔐 이제 Google 로그인 후 저장 기능을 사용할 수 있습니다!');
      }
    } else {
      console.log('⚠️ 아직 해결되지 않은 문제가 있습니다:');
      if (hasDemoText) console.log('  - 데모 모드 텍스트 여전히 존재');
      if (!hasFirebaseInit) console.log('  - Firebase 초기화 실패');
      if (hasMockLogs) console.log('  - Mock 관련 로그 여전히 존재');
    }
    
    await page.screenshot({ path: 'final-test-result.png', fullPage: true });
    console.log('📸 스크린샷 저장: final-test-result.png');
    
    // 15초간 브라우저 유지
    console.log('\\n⏳ 15초간 확인 시간...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
}

testFinalQuick();