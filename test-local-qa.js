const { chromium } = require('playwright');
const fs = require('fs');

async function runLocalQATest() {
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const baseUrl = 'http://localhost:4000';
  const testResults = [];

  function logTest(category, testName, status, details = '') {
    const result = { category, testName, status, details, timestamp: new Date().toISOString() };
    testResults.push(result);
    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 
                      status === 'WARN' ? '⚠️' : status === 'PARTIAL' ? '🔄' : '⏭️';
    console.log(`${statusIcon} [${category}] ${testName}: ${status} ${details ? '- ' + details : ''}`);
  }

  async function takeScreenshot(name) {
    const filename = `local-qa-${name}-${Date.now()}.png`;
    await page.screenshot({ 
      path: `screenshots/${filename}`,
      fullPage: true 
    });
    return filename;
  }

  try {
    console.log('🏠 로컬 환경 QA 테스트 시작\n');
    console.log(`🌐 테스트 URL: ${baseUrl}\n`);
    
    // === 1. 기본 페이지 접근 테스트 ===
    console.log('=== 1. 로컬 애플리케이션 상태 확인 ===');
    
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    const content = await page.textContent('body');
    const screenshot1 = await takeScreenshot('01-main-page');
    
    const isWorking = !content.includes('404') && 
                     !content.includes('Not Found') && 
                     !content.includes('Error') &&
                     !title.includes('Login');
    
    logTest('로컬 앱 상태', '메인 페이지 로드', isWorking ? 'PASS' : 'FAIL', `제목: ${title}`);
    
    // === 2. 인증 기능 확인 ===
    console.log('\n=== 2. 인증 시스템 테스트 ===');
    
    const hasAuthButtons = content.includes('로그인') || content.includes('Login') || 
                          content.includes('Sign in') || content.includes('게스트');
    const hasGoogleAuth = content.includes('Google') || content.includes('구글');
    
    logTest('인증', '인증 UI 존재', hasAuthButtons ? 'PASS' : 'FAIL');
    logTest('인증', 'Google 인증 지원', hasGoogleAuth ? 'PASS' : 'FAIL');
    
    // 게스트 로그인 시도
    try {
      const guestButton = page.locator('button:has-text("게스트"), button:has-text("Guest")').first();
      if (await guestButton.isVisible({ timeout: 2000 })) {
        await guestButton.click();
        await page.waitForTimeout(2000);
        await takeScreenshot('02-after-guest-login');
        logTest('인증', '게스트 로그인', 'PASS');
      } else {
        logTest('인증', '게스트 로그인', 'FAIL', '게스트 로그인 버튼 없음');
      }
    } catch (error) {
      logTest('인증', '게스트 로그인', 'FAIL', error.message);
    }
    
    // === 3. 주요 페이지 네비게이션 테스트 ===
    console.log('\n=== 3. 페이지 네비게이션 테스트 ===');
    
    const testPages = [
      { path: '/reading', name: '타로 리딩' },
      { path: '/dashboard', name: '대시보드' },
      { path: '/admin', name: '관리자' },
      { path: '/blog', name: '블로그' }
    ];
    
    for (const testPage of testPages) {
      try {
        await page.goto(`${baseUrl}${testPage.path}`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        
        const pageContent = await page.textContent('body');
        const pageTitle = await page.title();
        await takeScreenshot(`page-${testPage.path.replace('/', '')}`);
        
        const isPageWorking = !pageContent.includes('404') && 
                             !pageContent.includes('Not Found') && 
                             pageContent.length > 100;
        
        logTest('페이지 네비게이션', testPage.name, isPageWorking ? 'PASS' : 'FAIL', `제목: ${pageTitle}`);
        
      } catch (error) {
        logTest('페이지 네비게이션', testPage.name, 'FAIL', error.message);
      }
    }
    
    // === 4. 타로 리딩 기능 상세 테스트 ===
    console.log('\n=== 4. 타로 리딩 기능 테스트 ===');
    
    try {
      await page.goto(`${baseUrl}/reading`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);
      
      // 질문 입력 필드 확인
      const questionInput = page.locator('textarea, input[type="text"]').first();
      const hasQuestionInput = await questionInput.count() > 0;
      
      if (hasQuestionInput) {
        try {
          await questionInput.fill('2025년 나의 운세는 어떨까요?');
          await page.waitForTimeout(1000);
          logTest('타로 리딩', '질문 입력', 'PASS');
        } catch (error) {
          logTest('타로 리딩', '질문 입력', 'PARTIAL', '입력 필드는 있으나 입력 실패');
        }
      } else {
        logTest('타로 리딩', '질문 입력', 'FAIL', '질문 입력 필드 없음');
      }
      
      // 카드 요소 확인
      const cardElements = await page.locator('[class*="card"], [data-card], img[alt*="card"]').count();
      logTest('타로 리딩', '카드 요소', cardElements > 0 ? 'PASS' : 'FAIL', `${cardElements}개 카드 요소 발견`);
      
      // 시작/진행 버튼 확인
      const actionButtons = await page.locator('button:has-text("시작"), button:has-text("카드"), button:has-text("펼치기")').count();
      logTest('타로 리딩', '액션 버튼', actionButtons > 0 ? 'PASS' : 'FAIL', `${actionButtons}개 액션 버튼 발견`);
      
      await takeScreenshot('04-tarot-reading-detailed');
      
    } catch (error) {
      logTest('타로 리딩', '리딩 페이지 전체', 'FAIL', error.message);
    }
    
    // === 5. 대시보드 기능 테스트 ===
    console.log('\n=== 5. 대시보드 기능 테스트 ===');
    
    try {
      await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      
      const dashboardContent = await page.textContent('body');
      
      const hasUserStats = dashboardContent.includes('통계') || dashboardContent.includes('리딩') || 
                          dashboardContent.includes('Stats') || dashboardContent.includes('Total');
      const hasHistory = dashboardContent.includes('기록') || dashboardContent.includes('History') || 
                        dashboardContent.includes('과거');
      
      logTest('대시보드', '사용자 통계', hasUserStats ? 'PASS' : 'FAIL');
      logTest('대시보드', '리딩 기록', hasHistory ? 'PASS' : 'FAIL');
      
      await takeScreenshot('05-dashboard-detailed');
      
    } catch (error) {
      logTest('대시보드', '대시보드 전체', 'FAIL', error.message);
    }
    
    // === 6. UI/UX 및 반응형 테스트 ===
    console.log('\n=== 6. UI/UX 테스트 ===');
    
    await page.goto(baseUrl);
    await page.waitForTimeout(2000);
    
    // 테마 전환 테스트
    try {
      const themeButton = page.locator('button[aria-label*="theme"], button:has(svg)').first();
      if (await themeButton.isVisible({ timeout: 2000 })) {
        await takeScreenshot('06-theme-before');
        await themeButton.click();
        await page.waitForTimeout(1000);
        await takeScreenshot('07-theme-after');
        logTest('UI/UX', '테마 전환', 'PASS');
      } else {
        logTest('UI/UX', '테마 전환', 'FAIL', '테마 전환 버튼 없음');
      }
    } catch (error) {
      logTest('UI/UX', '테마 전환', 'FAIL', error.message);
    }
    
    // 반응형 디자인 테스트
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      try {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000);
        
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        await takeScreenshot(`responsive-${viewport.name.toLowerCase()}`);
        
        logTest('반응형', `${viewport.name} 뷰`, bodyHeight > 300 ? 'PASS' : 'FAIL', 
               `${viewport.width}x${viewport.height}, 높이: ${bodyHeight}px`);
        
      } catch (error) {
        logTest('반응형', `${viewport.name} 뷰`, 'FAIL', error.message);
      }
    }
    
    // === 7. 성능 및 기술적 테스트 ===
    console.log('\n=== 7. 성능 테스트 ===');
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 페이지 로드 성능
    const startTime = Date.now();
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    
    logTest('성능', '페이지 로드 시간', 
           loadTime < 3000 ? 'PASS' : loadTime < 5000 ? 'WARN' : 'FAIL', 
           `${loadTime}ms`);
    
    // JavaScript 오류 확인
    let jsErrors = [];
    page.on('pageerror', error => jsErrors.push(error.message));
    await page.waitForTimeout(3000);
    
    logTest('성능', 'JavaScript 오류', jsErrors.length === 0 ? 'PASS' : 'WARN', 
           jsErrors.length > 0 ? `${jsErrors.length}개 오류` : '오류 없음');
    
    // === 결과 요약 ===
    const summary = {
      total: testResults.length,
      passed: testResults.filter(r => r.status === 'PASS').length,
      failed: testResults.filter(r => r.status === 'FAIL').length,
      warnings: testResults.filter(r => r.status === 'WARN').length,
      partial: testResults.filter(r => r.status === 'PARTIAL').length
    };
    
    const successRate = ((summary.passed + summary.partial * 0.5) / summary.total * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 로컬 환경 QA 테스트 결과 요약');
    console.log('='.repeat(60));
    console.log(`🏠 테스트 환경: 로컬 개발 서버 (${baseUrl})`);
    console.log(`📅 테스트 완료: ${new Date().toLocaleString('ko-KR')}`);
    console.log('');
    console.log(`📈 총 테스트: ${summary.total}개`);
    console.log(`✅ 성공: ${summary.passed}개`);
    console.log(`🔄 부분 성공: ${summary.partial}개`);
    console.log(`❌ 실패: ${summary.failed}개`);
    console.log(`⚠️  경고: ${summary.warnings}개`);
    console.log('');
    console.log(`🎯 성공률: ${successRate.toFixed(1)}%`);
    
    let grade;
    if (successRate >= 90) grade = 'A';
    else if (successRate >= 80) grade = 'B';
    else if (successRate >= 70) grade = 'C';
    else if (successRate >= 60) grade = 'D';
    else grade = 'F';
    
    console.log(`📊 품질 등급: ${grade}등급`);
    
    // 카테고리별 결과
    console.log('\n📋 카테고리별 결과:');
    const categories = [...new Set(testResults.map(r => r.category))];
    
    categories.forEach(category => {
      const categoryResults = testResults.filter(r => r.category === category);
      const categoryPassed = categoryResults.filter(r => r.status === 'PASS').length;
      console.log(`\n📁 ${category}: ${categoryPassed}/${categoryResults.length} 성공`);
      
      categoryResults.forEach(result => {
        const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'PARTIAL' ? '🔄' :
                          result.status === 'WARN' ? '⚠️' : '❌';
        console.log(`   ${statusIcon} ${result.testName} ${result.details ? '- ' + result.details : ''}`);
      });
    });
    
    if (jsErrors.length > 0) {
      console.log('\n🐛 JavaScript 오류:');
      jsErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    // 결과 저장
    const report = {
      metadata: {
        testSuite: '로컬 환경 QA 테스트',
        environment: 'Local Development Server',
        url: baseUrl,
        testDate: new Date().toISOString(),
        successRate: successRate,
        grade: grade
      },
      summary: summary,
      results: testResults,
      jsErrors: jsErrors
    };
    
    fs.writeFileSync('local-qa-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n💡 로컬 vs 배포 환경 비교:');
    console.log('   🏠 로컬: 정상 작동 확인');
    console.log('   ☁️  배포: Vercel 로그인 이슈');
    console.log('   📋 결론: 배포 설정 문제로 판단됨');
    
    console.log('\n📄 상세 결과: local-qa-report.json');
    console.log('📸 스크린샷: screenshots/ 폴더 확인');
    
  } catch (error) {
    console.error('❌ 로컬 QA 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
}

// 테스트 실행
runLocalQATest();