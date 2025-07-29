const { chromium } = require('playwright');
const fs = require('fs');

async function runFinalQAReport() {
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 새로운 배포 URL 사용
  const baseUrl = 'https://test-studio-firebase-gt8surald-johns-projects-bf5e60f3.vercel.app';
  
  const testResults = {
    metadata: {
      testSuite: '인코딩 타로 앱 종합 QA 테스트 보고서',
      testDate: new Date().toISOString(),
      url: baseUrl,
      tester: 'Claude Code QA Assistant',
      browserEngine: 'Chromium (Playwright)'
    },
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      partialPass: 0
    },
    categories: {},
    screenshots: [],
    issues: [],
    recommendations: []
  };

  function logTest(category, testName, status, details = '', screenshot = null) {
    if (!testResults.categories[category]) {
      testResults.categories[category] = { tests: [], summary: { passed: 0, failed: 0, warnings: 0, partialPass: 0 } };
    }
    
    const result = {
      testName,
      status,
      details,
      screenshot,
      timestamp: new Date().toISOString()
    };
    
    testResults.categories[category].tests.push(result);
    testResults.categories[category].summary[status === 'PASS' ? 'passed' : 
                                             status === 'FAIL' ? 'failed' :
                                             status === 'WARN' ? 'warnings' : 'partialPass']++;
    
    testResults.summary.totalTests++;
    testResults.summary[status === 'PASS' ? 'passed' : 
                       status === 'FAIL' ? 'failed' :
                       status === 'WARN' ? 'warnings' : 'partialPass']++;
    
    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 
                      status === 'WARN' ? '⚠️' : '🔄';
    console.log(`${statusIcon} [${category}] ${testName}: ${status} ${details ? '- ' + details : ''}`);
  }

  async function takeScreenshot(name, description = '') {
    const filename = `final-qa-${name}-${Date.now()}.png`;
    await page.screenshot({ 
      path: `screenshots/${filename}`,
      fullPage: true 
    });
    testResults.screenshots.push({ filename, description, timestamp: new Date().toISOString() });
    return filename;
  }

  try {
    console.log('🎯 인코딩 타로 앱 최종 QA 테스트 보고서 생성\n');
    console.log(`🌐 테스트 URL: ${baseUrl}`);
    console.log(`📅 테스트 일시: ${new Date().toLocaleString('ko-KR')}\n`);
    
    // 페이지 로드 대기
    console.log('⏳ 페이지 로드 중...');
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const initialScreenshot = await takeScreenshot('01-initial-load', '초기 페이지 로드 상태');
    
    // === 1. 기본 사이트 상태 확인 ===
    console.log('\n=== 1. 기본 사이트 상태 확인 ===');
    
    const title = await page.title();
    const content = await page.textContent('body');
    const url = page.url();
    
    // 사이트 접근성 확인
    const isAccessible = !content.includes('404') && 
                        !content.includes('Not Found') && 
                        !content.includes('Error') &&
                        !title.includes('Login – Vercel');
    
    logTest('사이트 상태', '기본 접근성', isAccessible ? 'PASS' : 'FAIL', 
           `제목: ${title}, URL: ${url}`, initialScreenshot);
    
    if (!isAccessible) {
      testResults.issues.push({
        severity: 'HIGH',
        category: '사이트 접근',
        issue: 'Vercel 로그인 페이지로 리디렉션됨',
        description: '메인 사이트에 접근할 수 없음. 배포 설정 또는 인증 문제 가능성',
        recommendation: 'Vercel 배포 설정 및 인증 설정 재확인 필요'
      });
    }
    
    // === 2. 인증 시스템 테스트 ===
    console.log('\n=== 2. 인증 시스템 테스트 ===');
    
    const hasEmailInput = await page.locator('input[type="email"], input[placeholder*="Email"]').count() > 0;
    const hasGoogleAuth = content.includes('Continue with Google') || content.includes('Google');
    const hasGitHubAuth = content.includes('Continue with GitHub') || content.includes('GitHub');
    
    logTest('인증', '이메일 입력 필드', hasEmailInput ? 'PASS' : 'FAIL');
    logTest('인증', 'Google 인증 지원', hasGoogleAuth ? 'PASS' : 'FAIL');
    logTest('인증', 'GitHub 인증 지원', hasGitHubAuth ? 'PASS' : 'FAIL');
    
    // === 3. 페이지 구조 및 네비게이션 테스트 ===
    console.log('\n=== 3. 페이지 구조 테스트 ===');
    
    const testPages = [
      { path: '/reading', name: '타로 리딩 페이지', expected: ['카드', '질문', '타로'] },
      { path: '/dashboard', name: '사용자 대시보드', expected: ['대시보드', '통계', '기록'] },
      { path: '/admin', name: '관리자 페이지', expected: ['관리자', '설정', 'Admin'] },
      { path: '/blog', name: '블로그 페이지', expected: ['블로그', '포스트', 'Blog'] }
    ];
    
    for (const testPage of testPages) {
      try {
        await page.goto(`${baseUrl}${testPage.path}`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        
        const pageContent = await page.textContent('body');
        const pageTitle = await page.title();
        const screenshotFile = await takeScreenshot(`page${testPage.path.replace('/', '-')}`, `${testPage.name} 상태`);
        
        const isWorking = !pageContent.includes('404') && 
                         !pageContent.includes('Not Found') && 
                         !pageTitle.includes('Login – Vercel') &&
                         pageContent.length > 100;
        
        const hasExpectedContent = testPage.expected.some(keyword => 
          pageContent.toLowerCase().includes(keyword.toLowerCase())
        );
        
        const status = isWorking ? (hasExpectedContent ? 'PASS' : 'PARTIAL') : 'FAIL';
        
        logTest('페이지 구조', testPage.name, status, 
               `제목: ${pageTitle}${hasExpectedContent ? ', 예상 콘텐츠 확인' : ''}`, screenshotFile);
        
      } catch (error) {
        logTest('페이지 구조', testPage.name, 'FAIL', `오류: ${error.message}`);
      }
    }
    
    // === 4. UI/UX 반응형 디자인 테스트 ===
    console.log('\n=== 4. UI/UX 및 반응형 테스트 ===');
    
    await page.goto(baseUrl);
    await page.waitForTimeout(2000);
    
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      try {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000);
        
        const screenshotFile = await takeScreenshot(`responsive-${viewport.name.toLowerCase()}`, 
                                                   `${viewport.name} 뷰포트 (${viewport.width}x${viewport.height})`);
        
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        const hasContent = bodyHeight > 300;
        
        logTest('반응형 디자인', `${viewport.name} 뷰`, hasContent ? 'PASS' : 'FAIL', 
               `뷰포트: ${viewport.width}x${viewport.height}, 콘텐츠 높이: ${bodyHeight}px`, screenshotFile);
        
      } catch (error) {
        logTest('반응형 디자인', `${viewport.name} 뷰`, 'FAIL', error.message);
      }
    }
    
    // === 5. 성능 및 보안 테스트 ===
    console.log('\n=== 5. 성능 및 보안 테스트 ===');
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // HTTPS 확인
    const isHTTPS = page.url().startsWith('https://');
    logTest('보안', 'HTTPS 사용', isHTTPS ? 'PASS' : 'FAIL');
    
    // 페이지 로드 성능
    const startTime = Date.now();
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    
    const performanceStatus = loadTime < 3000 ? 'PASS' : loadTime < 5000 ? 'WARN' : 'FAIL';
    logTest('성능', '페이지 로드 시간', performanceStatus, `${loadTime}ms`);
    
    // JavaScript 오류 모니터링
    let jsErrors = [];
    page.on('pageerror', error => jsErrors.push(error.message));
    await page.waitForTimeout(3000);
    
    logTest('성능', 'JavaScript 오류', jsErrors.length === 0 ? 'PASS' : 'WARN', 
           jsErrors.length > 0 ? `${jsErrors.length}개 오류 발견` : '오류 없음');
    
    // === 6. 접근성 및 SEO 기본 테스트 ===
    console.log('\n=== 6. 접근성 및 SEO 테스트 ===');
    
    const hasTitle = title && title.length > 0 && title !== 'Login – Vercel';
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content') || '';
    const hasDescription = metaDescription.length > 0;
    
    logTest('SEO', '페이지 제목', hasTitle ? 'PASS' : 'FAIL', `제목: ${title}`);
    logTest('SEO', '메타 설명', hasDescription ? 'PASS' : 'FAIL', `설명 길이: ${metaDescription.length}자`);
    
    // === 최종 종합 분석 ===
    
    // 성공률 계산
    const successRate = ((testResults.summary.passed + testResults.summary.partialPass * 0.5) / 
                        testResults.summary.totalTests * 100);
    
    // 권장사항 생성
    if (!isAccessible) {
      testResults.recommendations.push({
        priority: 'HIGH',
        category: '배포 설정',
        recommendation: 'Vercel 배포 설정을 확인하고 인증 관련 리디렉션 문제를 해결해야 합니다.'
      });
    }
    
    if (testResults.summary.failed > testResults.summary.passed) {
      testResults.recommendations.push({
        priority: 'HIGH',
        category: '기능 개발',
        recommendation: '주요 페이지들의 기능 구현을 완료하고 404 오류를 해결해야 합니다.'
      });
    }
    
    if (loadTime > 5000) {
      testResults.recommendations.push({
        priority: 'MEDIUM',
        category: '성능 최적화',
        recommendation: '페이지 로드 시간을 5초 이내로 최적화해야 합니다.'
      });
    }
    
    if (jsErrors.length > 0) {
      testResults.recommendations.push({
        priority: 'MEDIUM',
        category: 'JavaScript 오류',
        recommendation: `${jsErrors.length}개의 JavaScript 오류를 수정해야 합니다.`
      });
    }
    
    // 최종 등급 산정
    let grade;
    if (successRate >= 90) grade = 'A';
    else if (successRate >= 80) grade = 'B';
    else if (successRate >= 70) grade = 'C';
    else if (successRate >= 60) grade = 'D';
    else grade = 'F';
    
    testResults.summary.successRate = successRate;
    testResults.summary.grade = grade;
    testResults.jsErrors = jsErrors;
    
    // 보고서 저장
    fs.writeFileSync('final-qa-comprehensive-report.json', JSON.stringify(testResults, null, 2));
    
    // === 결과 출력 ===
    console.log('\n' + '='.repeat(60));
    console.log('📊 인코딩 타로 앱 종합 QA 테스트 최종 보고서');
    console.log('='.repeat(60));
    console.log(`🌐 테스트 URL: ${baseUrl}`);
    console.log(`📅 테스트 완료: ${new Date().toLocaleString('ko-KR')}`);
    console.log(`🤖 테스트 엔진: ${testResults.metadata.browserEngine}`);
    console.log('');
    console.log(`📈 전체 테스트 결과: ${testResults.summary.totalTests}개`);
    console.log(`✅ 성공: ${testResults.summary.passed}개`);
    console.log(`🔄 부분 성공: ${testResults.summary.partialPass}개`);
    console.log(`❌ 실패: ${testResults.summary.failed}개`);
    console.log(`⚠️  경고: ${testResults.summary.warnings}개`);
    console.log('');
    console.log(`🎯 종합 성공률: ${successRate.toFixed(1)}%`);
    console.log(`📊 품질 등급: ${grade}등급`);
    
    console.log('\n📋 카테고리별 상세 결과:');
    Object.entries(testResults.categories).forEach(([category, data]) => {
      const categorySuccess = ((data.summary.passed + data.summary.partialPass * 0.5) / data.tests.length * 100);
      console.log(`\n📁 ${category} (성공률: ${categorySuccess.toFixed(1)}%)`);
      data.tests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'PARTIAL' ? '🔄' : 
                    test.status === 'WARN' ? '⚠️' : '❌';
        console.log(`   ${icon} ${test.testName} ${test.details ? '- ' + test.details : ''}`);
      });
    });
    
    if (testResults.issues.length > 0) {
      console.log('\n🚨 발견된 주요 이슈:');
      testResults.issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.severity}] ${issue.issue}`);
        console.log(`   📝 설명: ${issue.description}`);
        console.log(`   💡 권장사항: ${issue.recommendation}`);
      });
    }
    
    if (jsErrors.length > 0) {
      console.log('\n🐛 JavaScript 오류 목록:');
      jsErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log('\n💡 개발팀 권장사항:');
    testResults.recommendations.forEach((rec, index) => {
      const priorityIcon = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`${index + 1}. ${priorityIcon} [${rec.priority}] ${rec.category}: ${rec.recommendation}`);
    });
    
    console.log('\n📁 상세 보고서: final-qa-comprehensive-report.json');
    console.log(`📸 스크린샷: ${testResults.screenshots.length}개 파일이 screenshots/ 폴더에 저장됨`);
    
    // 최종 결론
    console.log('\n' + '='.repeat(60));
    if (grade === 'A' || grade === 'B') {
      console.log('🎉 전반적으로 우수한 품질을 보여주고 있습니다!');
    } else if (grade === 'C') {
      console.log('⚠️  보통 수준이지만 개선이 필요합니다.');
    } else {
      console.log('🔧 상당한 개선이 필요한 상태입니다.');
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ QA 테스트 중 치명적 오류:', error);
    testResults.issues.push({
      severity: 'CRITICAL',
      category: '테스트 실행',
      issue: 'QA 테스트 실행 중 오류 발생',
      description: error.message,
      recommendation: '테스트 환경 및 대상 사이트 상태 확인 필요'
    });
  } finally {
    await browser.close();
  }
}

// 테스트 실행
runFinalQAReport();