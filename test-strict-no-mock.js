const { chromium } = require('playwright');

async function testStrictNoMock() {
  console.log('🔥 엄격한 Mock 제거 검증 테스트...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000 
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    // 모든 콘솔 메시지 캡처
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log(`[콘솔] ${text}`);
    });
    
    // 에러 캡처
    page.on('pageerror', error => {
      console.log(`[에러] ${error.message}`);
    });
    
    console.log('📍 1. 홈페이지 로드...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('📍 2. 타로 리딩 페이지로 이동...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // Mock 관련 로그 검사
    console.log('\\n🔍 Mock 관련 로그 검사:');
    const mockLogs = consoleLogs.filter(log => 
      log.toLowerCase().includes('mock') || 
      log.includes('데모') ||
      log.includes('demo')
    );
    
    if (mockLogs.length > 0) {
      console.log('❌ Mock 관련 로그 발견:');
      mockLogs.forEach(log => console.log(`  - ${log}`));
    } else {
      console.log('✅ Mock 관련 로그 없음');
    }
    
    // Firebase 초기화 로그 확인
    const firebaseLogs = consoleLogs.filter(log => 
      log.includes('Firebase') || 
      log.includes('Real Firebase') ||
      log.includes('initialized')
    );
    
    console.log('\\n🔥 Firebase 초기화 로그:');
    firebaseLogs.forEach(log => console.log(`  ✅ ${log}`));
    
    // 페이지 텍스트에서 데모/Mock 관련 텍스트 검사
    console.log('\\n📄 페이지 텍스트 검사:');
    const pageText = await page.locator('body').textContent();
    
    const prohibitedTexts = [
      '데모 모드',
      '데모 버전',
      '현재 데모',
      'demo mode',
      'mock mode',
      '실제 데이터베이스 연결 후',
      'Mock'
    ];
    
    let foundProhibited = false;
    prohibitedTexts.forEach(text => {
      if (pageText.includes(text)) {
        console.log(`❌ 금지된 텍스트 발견: "${text}"`);
        foundProhibited = true;
      }
    });
    
    if (!foundProhibited) {
      console.log('✅ 데모/Mock 관련 텍스트 없음');
    }
    
    // 실제 저장 기능 테스트
    console.log('\\n💾 저장 기능 실제 테스트:');
    
    // 질문 입력
    const questionInput = page.locator('textarea[placeholder*="카드에게"]');
    if (await questionInput.isVisible()) {
      await questionInput.fill('Mock 제거 후 실제 Firebase 테스트');
      console.log('✅ 질문 입력');
    }
    
    // 카드 섞기
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ 카드 섞기');
    }
    
    // 저장 버튼 확인
    const saveButton = page.locator('button:has-text("저장")');
    const saveExists = await saveButton.isVisible().catch(() => false);
    console.log('💾 저장 버튼 존재:', saveExists);
    
    if (saveExists) {
      console.log('💾 저장 버튼 클릭...');
      await saveButton.click();
      await page.waitForTimeout(5000);
      
      // 저장 후 새로운 콘솔 로그 확인
      const newLogs = consoleLogs.slice(-10); // 최근 10개 로그
      const hasDemoMessage = newLogs.some(log => 
        log.includes('데모') || log.includes('demo')
      );
      
      console.log('💾 저장 후 데모 메시지:', hasDemoMessage ? '❌ 있음' : '✅ 없음');
      
      if (hasDemoMessage) {
        console.log('❌ 저장 후 데모 관련 메시지:');
        newLogs.filter(log => log.includes('데모') || log.includes('demo'))
              .forEach(log => console.log(`  - ${log}`));
      }
    } else {
      console.log('⚠️ 저장 버튼 없음 (로그인 필요할 수 있음)');
    }
    
    // 로그인 상태 확인
    const loginNeeded = await page.locator('button:has-text("로그인")').isVisible().catch(() => false);
    console.log('🔐 로그인 필요:', loginNeeded);
    
    // 최종 결과
    console.log('\\n📊 최종 검증 결과:');
    console.log(`  Mock 로그: ${mockLogs.length === 0 ? '✅ 없음' : '❌ 있음'}`);
    console.log(`  금지된 텍스트: ${!foundProhibited ? '✅ 없음' : '❌ 있음'}`);
    console.log(`  Firebase 초기화: ${firebaseLogs.length > 0 ? '✅ 성공' : '❌ 실패'}`);
    console.log(`  저장 기능: ${saveExists ? '✅ 사용 가능' : '⚠️ 로그인 필요'}`);
    
    if (mockLogs.length === 0 && !foundProhibited && firebaseLogs.length > 0) {
      console.log('\\n🎉 성공! Mock Auth가 완전히 제거되었습니다!');
    } else {
      console.log('\\n⚠️ 아직 문제가 남아있습니다.');
    }
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'strict-no-mock-test.png', 
      fullPage: true 
    });
    
    // 20초간 브라우저 유지
    console.log('\\n⏳ 20초간 수동 확인 시간...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
}

testStrictNoMock();