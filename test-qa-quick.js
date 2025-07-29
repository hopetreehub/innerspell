const { chromium } = require('playwright');
const fs = require('fs');

async function runQuickQATest() {
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const testResults = [];
  const baseUrl = 'https://test-studio-firebase-buz4i1pbo-johns-projects-bf5e60f3.vercel.app';
  
  // Helper function to log test results
  function logTest(category, testName, status, details = '') {
    const result = { category, testName, status, details, timestamp: new Date().toISOString() };
    testResults.push(result);
    console.log(`[${category}] ${testName}: ${status} ${details ? '- ' + details : ''}`);
  }

  try {
    console.log('🚀 인코딩 타로 앱 빠른 QA 테스트 시작\n');
    console.log(`🌐 테스트 URL: ${baseUrl}\n`);
    
    // === 1. 기본 페이지 접근 테스트 ===
    console.log('=== 1. 기본 페이지 접근 테스트 ===');
    
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const title = await page.title();
    const content = await page.textContent('body');
    
    await page.screenshot({ path: `screenshots/qa-quick-01-main-${Date.now()}.png`, fullPage: true });
    
    logTest('페이지 접근', '메인 페이지 로드', !content.includes('404') && !content.includes('Error') ? 'PASS' : 'FAIL', `제목: ${title}`);
    
    // === 2. 인증 기능 확인 ===
    console.log('\n=== 2. 인증 기능 확인 ===');
    
    const hasLoginButton = content.includes('로그인') || content.includes('Login') || content.includes('Sign in');
    const hasGoogleAuth = content.includes('Google') || content.includes('구글');
    
    logTest('인증', '로그인 UI 존재', hasLoginButton ? 'PASS' : 'FAIL');
    logTest('인증', '구글 인증 지원', hasGoogleAuth ? 'PASS' : 'FAIL');
    
    // === 3. 주요 페이지들 접근 테스트 ===
    console.log('\n=== 3. 주요 페이지 접근 테스트 ===');
    
    const pages = [
      { path: '/reading', name: '타로 리딩' },
      { path: '/dashboard', name: '대시보드' },
      { path: '/admin', name: '관리자' },
      { path: '/blog', name: '블로그' }
    ];
    
    for (const pageInfo of pages) {
      try {
        await page.goto(`${baseUrl}${pageInfo.path}`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);
        
        const pageContent = await page.textContent('body');
        const pageTitle = await page.title();
        
        await page.screenshot({ 
          path: `screenshots/qa-quick-${pageInfo.path.replace('/', '')}-${Date.now()}.png`, 
          fullPage: true 
        });
        
        const isWorking = !pageContent.includes('404') && 
                         !pageContent.includes('Not Found') && 
                         !pageContent.includes('Error') &&
                         pageContent.length > 100;
        
        logTest('페이지 접근', `${pageInfo.name} 페이지`, isWorking ? 'PASS' : 'FAIL', `제목: ${pageTitle}`);
        
      } catch (error) {
        logTest('페이지 접근', `${pageInfo.name} 페이지`, 'FAIL', `오류: ${error.message}`);
      }
    }
    
    // === 4. 타로 리딩 기본 기능 테스트 ===
    console.log('\n=== 4. 타로 리딩 기본 기능 테스트 ===');
    
    try {
      await page.goto(`${baseUrl}/reading`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      
      const readingContent = await page.textContent('body');
      
      // 기본 UI 요소들 확인
      const hasQuestionInput = await page.locator('textarea, input[type="text"]').count() > 0;
      const hasCards = await page.locator('[class*="card"], img[alt*="card"], [data-card]').count() > 0;
      const hasStartButton = readingContent.includes('시작') || readingContent.includes('Start') || readingContent.includes('카드');
      
      logTest('타로 리딩', '질문 입력 필드', hasQuestionInput ? 'PASS' : 'FAIL');
      logTest('타로 리딩', '카드 요소 존재', hasCards ? 'PASS' : 'FAIL');
      logTest('타로 리딩', '시작 버튼/기능', hasStartButton ? 'PASS' : 'FAIL');
      
    } catch (error) {
      logTest('타로 리딩', '리딩 기능 전체', 'FAIL', error.message);
    }
    
    // === 5. 반응형 디자인 테스트 ===
    console.log('\n=== 5. 반응형 디자인 테스트 ===');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    await page.goto(baseUrl);
    
    for (const viewport of viewports) {
      try {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: `screenshots/qa-quick-responsive-${viewport.name.toLowerCase()}-${Date.now()}.png`,
          fullPage: true 
        });
        
        // 기본적인 레이아웃 확인
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        const isResponsive = bodyHeight > 200; // 최소한의 콘텐츠가 있는지 확인
        
        logTest('반응형', `${viewport.name} 뷰`, isResponsive ? 'PASS' : 'FAIL', `높이: ${bodyHeight}px`);
        
      } catch (error) {
        logTest('반응형', `${viewport.name} 뷰`, 'FAIL', error.message);
      }
    }
    
    // === 6. 성능 및 보안 기본 테스트 ===
    console.log('\n=== 6. 성능 및 보안 테스트 ===');
    
    // HTTPS 확인
    const isHTTPS = page.url().startsWith('https://');
    logTest('보안', 'HTTPS 사용', isHTTPS ? 'PASS' : 'FAIL');
    
    // 페이지 로드 시간 측정
    const startTime = Date.now();
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    
    logTest('성능', '페이지 로드 시간', loadTime < 5000 ? 'PASS' : loadTime < 10000 ? 'WARN' : 'FAIL', `${loadTime}ms`);
    
    // JavaScript 오류 수집
    let jsErrors = [];
    page.on('pageerror', error => jsErrors.push(error.message));
    
    await page.waitForTimeout(3000);
    
    logTest('성능', 'JavaScript 오류', jsErrors.length === 0 ? 'PASS' : 'WARN', 
            jsErrors.length > 0 ? `${jsErrors.length}개 오류` : '오류 없음');
    
    // === 테스트 결과 요약 ===
    const report = {
      testSuite: '인코딩 타로 앱 빠른 QA 테스트',
      testDate: new Date().toISOString(),
      url: baseUrl,
      totalTests: testResults.length,
      passed: testResults.filter(r => r.status === 'PASS').length,
      failed: testResults.filter(r => r.status === 'FAIL').length,
      warnings: testResults.filter(r => r.status === 'WARN').length,
      results: testResults,
      jsErrors: jsErrors
    };
    
    fs.writeFileSync('quick-qa-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n========================================');
    console.log('📊 빠른 QA 테스트 결과 요약');
    console.log('========================================');
    console.log(`🌐 테스트 URL: ${baseUrl}`);
    console.log(`📅 테스트 시간: ${new Date().toLocaleString('ko-KR')}`);
    console.log('');
    console.log(`📈 총 테스트: ${report.totalTests}개`);
    console.log(`✅ 성공: ${report.passed}개 (${(report.passed/report.totalTests*100).toFixed(1)}%)`);
    console.log(`❌ 실패: ${report.failed}개 (${(report.failed/report.totalTests*100).toFixed(1)}%)`);
    console.log(`⚠️  경고: ${report.warnings}개 (${(report.warnings/report.totalTests*100).toFixed(1)}%)`);
    
    // 카테고리별 결과
    console.log('\n📋 카테고리별 결과:');
    const categories = [...new Set(testResults.map(r => r.category))];
    
    categories.forEach(category => {
      const categoryResults = testResults.filter(r => r.category === category);
      const categoryPassed = categoryResults.filter(r => r.status === 'PASS').length;
      console.log(`  📁 ${category}: ${categoryPassed}/${categoryResults.length} 성공`);
      
      categoryResults.forEach(result => {
        const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
        console.log(`    ${statusIcon} ${result.testName} ${result.details ? '- ' + result.details : ''}`);
      });
    });
    
    if (jsErrors.length > 0) {
      console.log('\n🐛 JavaScript 오류 목록:');
      jsErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n📄 상세 결과는 quick-qa-report.json 에 저장되었습니다.');
    console.log('📸 스크린샷은 screenshots/ 폴더에 저장되었습니다.');
    
    // 최종 권장사항
    console.log('\n💡 권장 개선사항:');
    if (report.failed > 0) {
      console.log('  • 실패한 테스트 케이스들을 우선적으로 수정');
    }
    if (jsErrors.length > 0) {
      console.log('  • JavaScript 오류 해결');
    }
    if (loadTime > 5000) {
      console.log('  • 페이지 로드 성능 최적화');
    }
    
    const successRate = (report.passed / report.totalTests * 100);
    if (successRate >= 80) {
      console.log('🎉 전반적으로 양호한 상태입니다!');
    } else if (successRate >= 60) {
      console.log('⚠️  일부 개선이 필요합니다.');
    } else {
      console.log('🔧 많은 부분에서 개선이 필요합니다.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

// 테스트 실행
runQuickQATest();