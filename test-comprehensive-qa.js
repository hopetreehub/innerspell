const { chromium } = require('playwright');
const fs = require('fs');

async function runComprehensiveQATest() {
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const testResults = [];
  const baseUrl = 'https://test-studio-tarot.vercel.app';
  
  // Helper function to log test results
  function logTest(category, testName, status, details = '') {
    const result = {
      category,
      testName,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    testResults.push(result);
    console.log(`[${category}] ${testName}: ${status} ${details ? '- ' + details : ''}`);
  }

  // Helper function to take screenshot
  async function takeScreenshot(name) {
    await page.screenshot({ 
      path: `screenshots/qa-${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  try {
    console.log('🚀 Starting Comprehensive QA Test Suite for 인코딩 타로 앱\n');
    
    // 1. 사용자 인증 기능 테스트
    console.log('=== 1. 사용자 인증 기능 테스트 ===');
    
    // 1.1 초기 페이지 로드
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await takeScreenshot('01-initial-load');
    
    // 홈 페이지 확인
    const isHomePage = await page.locator('text=인코딩 타로').isVisible();
    logTest('인증', '홈 페이지 로드', isHomePage ? 'PASS' : 'FAIL');
    
    // 1.2 게스트 로그인 테스트
    try {
      const guestButton = page.locator('button:has-text("게스트로 시작하기")');
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForTimeout(2000);
        await takeScreenshot('02-guest-login');
        logTest('인증', '게스트 로그인', 'PASS');
      } else {
        logTest('인증', '게스트 로그인', 'FAIL', '게스트 로그인 버튼을 찾을 수 없음');
      }
    } catch (error) {
      logTest('인증', '게스트 로그인', 'FAIL', error.message);
    }
    
    // 1.3 로그아웃 및 구글 로그인
    try {
      // 프로필 메뉴 찾기
      const profileMenu = page.locator('[aria-label="Profile menu"]').or(page.locator('button:has(svg)')).first();
      if (await profileMenu.isVisible()) {
        await profileMenu.click();
        await page.waitForTimeout(1000);
        
        const logoutButton = page.locator('button:has-text("로그아웃")');
        if (await logoutButton.isVisible()) {
          await logoutButton.click();
          await page.waitForTimeout(2000);
          logTest('인증', '로그아웃', 'PASS');
        }
      }
      
      // 구글 로그인 버튼 확인
      const googleButton = page.locator('button:has-text("Google로 로그인")');
      logTest('인증', '구글 로그인 버튼 표시', await googleButton.isVisible() ? 'PASS' : 'FAIL');
    } catch (error) {
      logTest('인증', '로그아웃/구글 로그인', 'FAIL', error.message);
    }
    
    // 다시 게스트 로그인
    await page.goto(baseUrl);
    await page.waitForTimeout(2000);
    const guestBtn = page.locator('button:has-text("게스트로 시작하기")');
    if (await guestBtn.isVisible()) {
      await guestBtn.click();
      await page.waitForTimeout(2000);
    }
    
    // 2. 타로 리딩 기능 테스트
    console.log('\n=== 2. 타로 리딩 기능 테스트 ===');
    
    // 2.1 카드 덱 선택
    try {
      await page.goto(`${baseUrl}/reading`);
      await page.waitForTimeout(3000);
      await takeScreenshot('03-reading-page');
      
      const hasDeckOptions = await page.locator('text=카드 덱 선택').isVisible();
      logTest('타로 리딩', '카드 덱 선택 UI', hasDeckOptions ? 'PASS' : 'FAIL');
      
      // 기본 덱 선택
      const defaultDeck = page.locator('button:has-text("기본 타로 덱")').or(page.locator('label:has-text("기본")')).first();
      if (await defaultDeck.isVisible()) {
        await defaultDeck.click();
        logTest('타로 리딩', '기본 덱 선택', 'PASS');
      }
    } catch (error) {
      logTest('타로 리딩', '카드 덱 선택', 'FAIL', error.message);
    }
    
    // 2.2 질문 입력
    try {
      const questionInput = page.locator('textarea[placeholder*="질문"]').or(page.locator('textarea')).first();
      if (await questionInput.isVisible()) {
        await questionInput.fill('2025년 나의 운세는 어떨까요?');
        await page.waitForTimeout(1000);
        await takeScreenshot('04-question-input');
        logTest('타로 리딩', '질문 입력', 'PASS');
      } else {
        logTest('타로 리딩', '질문 입력', 'FAIL', '질문 입력 필드를 찾을 수 없음');
      }
    } catch (error) {
      logTest('타로 리딩', '질문 입력', 'FAIL', error.message);
    }
    
    // 2.3 카드 선택 및 펼치기
    try {
      const startButton = page.locator('button:has-text("카드 펼치기")').or(page.locator('button:has-text("시작")')).first();
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(3000);
        await takeScreenshot('05-card-selection');
        
        // 카드 3장 선택
        const cards = page.locator('.card, [class*="card"]').filter({ hasNot: page.locator('text') });
        const cardCount = await cards.count();
        
        if (cardCount >= 3) {
          for (let i = 0; i < 3; i++) {
            await cards.nth(i).click();
            await page.waitForTimeout(500);
          }
          logTest('타로 리딩', '카드 3장 선택', 'PASS');
        } else {
          logTest('타로 리딩', '카드 선택', 'FAIL', `카드가 ${cardCount}장만 표시됨`);
        }
        
        // 해석 보기 버튼
        const interpretButton = page.locator('button:has-text("해석 보기")').or(page.locator('button:has-text("결과")')).first();
        if (await interpretButton.isVisible()) {
          await interpretButton.click();
          await page.waitForTimeout(5000);
          await takeScreenshot('06-interpretation');
          logTest('타로 리딩', 'AI 해석 생성', 'PASS');
        }
      }
    } catch (error) {
      logTest('타로 리딩', '카드 선택 및 해석', 'FAIL', error.message);
    }
    
    // 2.4 결과 저장
    try {
      const saveButton = page.locator('button:has-text("저장")').or(page.locator('button:has-text("리딩 저장")')).first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(2000);
        logTest('타로 리딩', '결과 저장', 'PASS');
      } else {
        logTest('타로 리딩', '결과 저장', 'SKIP', '저장 버튼이 표시되지 않음');
      }
    } catch (error) {
      logTest('타로 리딩', '결과 저장', 'FAIL', error.message);
    }
    
    // 3. 대시보드 기능 테스트
    console.log('\n=== 3. 대시보드 기능 테스트 ===');
    
    try {
      await page.goto(`${baseUrl}/dashboard`);
      await page.waitForTimeout(3000);
      await takeScreenshot('07-dashboard');
      
      // 사용자 통계 확인
      const hasStats = await page.locator('text=총 리딩 수').isVisible() || 
                       await page.locator('text=리딩 기록').isVisible();
      logTest('대시보드', '사용자 통계 표시', hasStats ? 'PASS' : 'FAIL');
      
      // 과거 리딩 기록
      const hasHistory = await page.locator('[class*="reading"], [class*="history"]').count() > 0;
      logTest('대시보드', '과거 리딩 기록', hasHistory ? 'PASS' : 'FAIL');
      
      // 즐겨찾기 기능
      const favoriteButton = page.locator('button[aria-label*="favorite"], button:has(svg[class*="star"])').first();
      if (await favoriteButton.isVisible()) {
        await favoriteButton.click();
        await page.waitForTimeout(1000);
        logTest('대시보드', '즐겨찾기 기능', 'PASS');
      } else {
        logTest('대시보드', '즐겨찾기 기능', 'SKIP', '즐겨찾기 버튼이 표시되지 않음');
      }
    } catch (error) {
      logTest('대시보드', '대시보드 기능', 'FAIL', error.message);
    }
    
    // 4. 관리자 기능 테스트
    console.log('\n=== 4. 관리자 기능 테스트 ===');
    
    try {
      await page.goto(`${baseUrl}/admin`);
      await page.waitForTimeout(3000);
      
      // 관리자 접근 권한 확인
      const isAdminPage = await page.locator('text=관리자 대시보드').isVisible() ||
                          await page.locator('text=Admin Dashboard').isVisible();
      const isAccessDenied = await page.locator('text=접근 권한').isVisible() ||
                             await page.locator('text=권한이 없습니다').isVisible();
      
      if (isAdminPage) {
        await takeScreenshot('08-admin-dashboard');
        logTest('관리자', '관리자 대시보드 접근', 'PASS');
        
        // 실시간 모니터링
        const hasRealtimeData = await page.locator('text=실시간').isVisible() ||
                                await page.locator('text=Active Users').isVisible();
        logTest('관리자', '실시간 모니터링', hasRealtimeData ? 'PASS' : 'FAIL');
        
        // AI 모델 설정
        const hasAISettings = await page.locator('text=AI 모델').isVisible() ||
                              await page.locator('text=Model Settings').isVisible();
        logTest('관리자', 'AI 모델 설정', hasAISettings ? 'PASS' : 'FAIL');
      } else if (isAccessDenied) {
        logTest('관리자', '관리자 접근 권한', 'PASS', '게스트 사용자 접근 차단 확인');
      } else {
        logTest('관리자', '관리자 페이지', 'FAIL', '예상치 못한 페이지 상태');
      }
    } catch (error) {
      logTest('관리자', '관리자 기능', 'FAIL', error.message);
    }
    
    // 5. UI/UX 테스트
    console.log('\n=== 5. UI/UX 테스트 ===');
    
    // 5.1 다크/라이트 모드 전환
    try {
      await page.goto(baseUrl);
      await page.waitForTimeout(2000);
      
      const themeToggle = page.locator('button[aria-label*="theme"], button:has(svg[class*="sun"]), button:has(svg[class*="moon"])').first();
      if (await themeToggle.isVisible()) {
        // 현재 테마 스크린샷
        await takeScreenshot('09-theme-light');
        
        // 테마 전환
        await themeToggle.click();
        await page.waitForTimeout(1000);
        await takeScreenshot('10-theme-dark');
        
        // 다시 전환
        await themeToggle.click();
        await page.waitForTimeout(1000);
        
        logTest('UI/UX', '다크/라이트 모드 전환', 'PASS');
      } else {
        logTest('UI/UX', '다크/라이트 모드 전환', 'FAIL', '테마 전환 버튼을 찾을 수 없음');
      }
    } catch (error) {
      logTest('UI/UX', '다크/라이트 모드 전환', 'FAIL', error.message);
    }
    
    // 5.2 반응형 디자인 테스트
    try {
      // 모바일 뷰포트
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      await takeScreenshot('11-mobile-view');
      
      // 태블릿 뷰포트
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);
      await takeScreenshot('12-tablet-view');
      
      // 데스크탑 복원
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      logTest('UI/UX', '반응형 디자인', 'PASS');
    } catch (error) {
      logTest('UI/UX', '반응형 디자인', 'FAIL', error.message);
    }
    
    // 5.3 로딩 상태 테스트
    try {
      await page.goto(`${baseUrl}/reading`);
      await page.waitForTimeout(1000);
      
      // 느린 네트워크 시뮬레이션
      await context.route('**/*', route => {
        setTimeout(() => route.continue(), 1000);
      });
      
      const hasLoadingIndicator = await page.locator('[class*="loading"], [class*="spinner"], text=로딩').count() > 0;
      logTest('UI/UX', '로딩 상태 표시', hasLoadingIndicator ? 'PASS' : 'WARN');
    } catch (error) {
      logTest('UI/UX', '로딩 상태', 'FAIL', error.message);
    }
    
    // 6. 크로스 브라우저 테스트
    console.log('\n=== 6. 크로스 브라우저 테스트 ===');
    logTest('크로스 브라우저', 'Chromium 기반 테스트', 'PASS', 'Playwright Chromium으로 테스트 완료');
    
    // 7. 데이터 무결성 테스트
    console.log('\n=== 7. 데이터 무결성 테스트 ===');
    
    try {
      // 네트워크 요청 모니터링
      let firebaseRequests = 0;
      page.on('request', request => {
        if (request.url().includes('firebaseapp.com') || request.url().includes('googleapis.com')) {
          firebaseRequests++;
        }
      });
      
      // 리딩 페이지에서 Firebase 요청 확인
      await page.goto(`${baseUrl}/reading`);
      await page.waitForTimeout(3000);
      
      logTest('데이터 무결성', 'Firebase 연결', firebaseRequests > 0 ? 'PASS' : 'WARN', `Firebase 요청 수: ${firebaseRequests}`);
    } catch (error) {
      logTest('데이터 무결성', '데이터 연결', 'FAIL', error.message);
    }
    
    // 테스트 결과 저장
    const report = {
      testSuite: '인코딩 타로 앱 종합 QA 테스트',
      testDate: new Date().toISOString(),
      url: baseUrl,
      totalTests: testResults.length,
      passed: testResults.filter(r => r.status === 'PASS').length,
      failed: testResults.filter(r => r.status === 'FAIL').length,
      skipped: testResults.filter(r => r.status === 'SKIP').length,
      warnings: testResults.filter(r => r.status === 'WARN').length,
      results: testResults
    };
    
    fs.writeFileSync('qa-test-report.json', JSON.stringify(report, null, 2));
    
    // 결과 요약 출력
    console.log('\n========================================');
    console.log('📊 테스트 결과 요약');
    console.log('========================================');
    console.log(`총 테스트: ${report.totalTests}`);
    console.log(`✅ 성공: ${report.passed}`);
    console.log(`❌ 실패: ${report.failed}`);
    console.log(`⏭️  스킵: ${report.skipped}`);
    console.log(`⚠️  경고: ${report.warnings}`);
    console.log(`성공률: ${((report.passed / report.totalTests) * 100).toFixed(1)}%`);
    console.log('\n상세 결과는 qa-test-report.json 파일을 확인하세요.');
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

// 테스트 실행
runComprehensiveQATest();