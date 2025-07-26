const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🔄 컴포넌트 업데이트 테스트...\n');
  
  try {
    // 1. 로그 캐치 설정 (우리가 추가한 디버그 로그 확인)
    const logs = [];
    page.on('console', msg => {
      logs.push(msg.text());
      console.log(`📟 ${msg.text()}`);
    });
    
    // 2. 블로그 페이지 접속
    console.log('1️⃣ 블로그 페이지 접속 및 수정된 컴포넌트 확인...');
    await page.goto('http://localhost:4000/blog');
    
    // 3. 15초 대기 (충분한 로딩 시간)
    console.log('2️⃣ 15초 대기...');
    await page.waitForTimeout(15000);
    
    // 4. 우리가 추가한 디버그 로그 확인
    const hasOurDebugLogs = logs.some(log => 
      log.includes('📝 블로그 포스트 가져오기 시작') ||
      log.includes('📡 API 응답 상태') ||
      log.includes('🔄 로딩 상태 false로 설정됨')
    );
    
    console.log(`3️⃣ 수정된 컴포넌트 로드됨: ${hasOurDebugLogs ? '✅ 성공!' : '❌ 실패'}`);
    
    // 5. Firebase 오류 여전히 발생하는지 확인
    const hasFirebaseErrors = logs.some(log => 
      log.includes('FirebaseError') || 
      log.includes('Missing or insufficient permissions')
    );
    
    console.log(`4️⃣ Firebase 오류 발생: ${hasFirebaseErrors ? '❌ 여전히 있음' : '✅ 해결됨'}`);
    
    // 6. 스크린샷
    await page.screenshot({ path: 'component-update-test.png', fullPage: true });
    
    // 7. 결과 분석
    if (hasOurDebugLogs && !hasFirebaseErrors) {
      console.log('🎉 컴포넌트 수정 완전 성공!');
    } else if (hasOurDebugLogs) {
      console.log('⚠️ 컴포넌트는 업데이트되었지만 아직 Firebase 오류 있음');
    } else {
      console.log('❌ 컴포넌트가 아직 업데이트되지 않음');
    }
    
    // 8. 모든 로그 출력
    console.log('\n📋 모든 브라우저 로그:');
    logs.forEach((log, index) => {
      if (index < 20) { // 처음 20개만
        console.log(`   ${index + 1}. ${log}`);
      }
    });
    
    setTimeout(() => {
      browser.close();
    }, 5000);
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
    await browser.close();
  }
})();