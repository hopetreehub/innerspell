const { chromium } = require('playwright');

async function expertDiagnosisTest() {
  console.log('🔬 EXPERT DIAGNOSIS: 포트 4000 에러 재발 분석');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 15000
  });
  
  try {
    const page = await browser.newPage();
    
    // 모든 에러 및 로그 수집
    const errors = [];
    const consoleMessages = [];
    const networkErrors = [];
    
    page.on('pageerror', error => {
      errors.push({
        type: 'Runtime Error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });
    
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
    
    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        failure: request.failure()?.errorText,
        timestamp: new Date().toISOString()
      });
    });
    
    console.log('🏠 1. 홈페이지 접근 테스트...');
    
    try {
      await page.goto('http://localhost:4000/', { 
        waitUntil: 'domcontentloaded',
        timeout: 20000 
      });
      
      const title = await page.title();
      console.log(`✅ 페이지 로드 성공: ${title}`);
      
      // 5초 대기하여 모든 에러 수집
      await page.waitForTimeout(5000);
      
      const timestamp = Date.now();
      await page.screenshot({ 
        path: `expert-diagnosis-homepage-${timestamp}.png`,
        fullPage: true 
      });
      
    } catch (error) {
      console.log(`❌ 홈페이지 로드 실패: ${error.message}`);
    }
    
    console.log('🔮 2. 타로 리딩 페이지 테스트...');
    
    try {
      await page.goto('http://localhost:4000/reading', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      
      await page.waitForTimeout(5000);
      
      const timestamp = Date.now();
      await page.screenshot({ 
        path: `expert-diagnosis-reading-${timestamp}.png`,
        fullPage: true 
      });
      
    } catch (error) {
      console.log(`❌ 타로 리딩 페이지 실패: ${error.message}`);
    }
    
    // 에러 분석
    console.log('\\n🔬 EXPERT ANALYSIS:');
    
    // 1. Runtime 에러 분석
    const webpackErrors = errors.filter(error => 
      error.message.includes("Cannot read properties of undefined (reading 'call')") ||
      error.message.includes("webpack") ||
      error.message.includes("LazyServiceWorkerRegistration")
    );
    
    if (webpackErrors.length > 0) {
      console.log('❌ WEBPACK ERRORS DETECTED:');
      webpackErrors.forEach((error, i) => {
        console.log(`  ${i+1}. ${error.message}`);
        console.log(`     Time: ${error.timestamp}`);
        if (error.stack) {
          console.log(`     Stack: ${error.stack.split('\\n')[0]}`);
        }
      });
    } else {
      console.log('✅ No Webpack Errors Detected');
    }
    
    // 2. 콘솔 에러 분석
    const criticalConsoleErrors = consoleMessages.filter(msg => 
      msg.type === 'error' && 
      !msg.text.includes('404') &&
      !msg.text.includes('Failed to load resource')
    );
    
    if (criticalConsoleErrors.length > 0) {
      console.log('❌ CRITICAL CONSOLE ERRORS:');
      criticalConsoleErrors.forEach((error, i) => {
        console.log(`  ${i+1}. ${error.text}`);
      });
    }
    
    // 3. 인증 관련 에러 분석
    const authErrors = errors.filter(error => 
      error.message.includes('auth') ||
      error.message.includes('toDate') ||
      error.message.includes('createdAt')
    );
    
    if (authErrors.length > 0) {
      console.log('❌ AUTHENTICATION ERRORS:');
      authErrors.forEach((error, i) => {
        console.log(`  ${i+1}. ${error.message}`);
      });
    }
    
    // 4. 네트워크 에러 분석
    if (networkErrors.length > 0) {
      console.log('❌ NETWORK ERRORS:');
      networkErrors.forEach((error, i) => {
        console.log(`  ${i+1}. ${error.url} - ${error.failure}`);
      });
    }
    
    console.log('\\n📊 SUMMARY:');
    console.log(`🔧 Webpack Errors: ${webpackErrors.length}`);
    console.log(`❌ Runtime Errors: ${errors.length}`);
    console.log(`⚠️ Console Errors: ${criticalConsoleErrors.length}`);
    console.log(`🌐 Network Errors: ${networkErrors.length}`);
    console.log(`🔐 Auth Errors: ${authErrors.length}`);
    
    // 진단 결과
    if (webpackErrors.length > 0) {
      console.log('\\n🚨 DIAGNOSIS: Webpack 에러가 재발했습니다.');
      console.log('💡 RECOMMENDATION: Vercel에서 작동하는 코드를 다운로드하여 동기화 필요');
    } else if (authErrors.length > 0) {
      console.log('\\n🚨 DIAGNOSIS: Firebase 인증 시스템에 타입 에러가 있습니다.');
      console.log('💡 RECOMMENDATION: userActions.ts의 createdAt.toDate() 함수 수정 필요');
    } else {
      console.log('\\n✅ DIAGNOSIS: 주요 에러가 감지되지 않았습니다.');
    }
    
    // 상세 로그 저장
    const diagnosticsData = {
      timestamp: new Date().toISOString(),
      errors: errors,
      consoleMessages: consoleMessages,
      networkErrors: networkErrors,
      summary: {
        webpackErrors: webpackErrors.length,
        runtimeErrors: errors.length,
        consoleErrors: criticalConsoleErrors.length,
        networkErrors: networkErrors.length,
        authErrors: authErrors.length
      }
    };
    
    require('fs').writeFileSync(
      `expert-diagnosis-report-${Date.now()}.json`, 
      JSON.stringify(diagnosticsData, null, 2)
    );
    
    return {
      hasWebpackErrors: webpackErrors.length > 0,
      hasAuthErrors: authErrors.length > 0,
      totalErrors: errors.length
    };
    
  } catch (error) {
    console.error('❌ 진단 테스트 실패:', error.message);
    return { hasWebpackErrors: true, hasAuthErrors: true, totalErrors: 999 };
  } finally {
    await browser.close();
  }
}

expertDiagnosisTest()
  .then(result => {
    console.log('\\n🎯 EXPERT CONCLUSION:');
    if (result.hasWebpackErrors) {
      console.log('🔥 CRITICAL: Webpack 에러 재발 - Vercel 동기화 필요');
    } else if (result.hasAuthErrors) {
      console.log('🔧 MODERATE: 인증 시스템 수정 필요');
    } else {
      console.log('✅ NORMAL: 시스템 정상 작동');
    }
  })
  .catch(console.error);