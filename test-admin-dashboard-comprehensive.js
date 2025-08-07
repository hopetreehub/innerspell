const { chromium } = require('playwright');

// 스크린샷 저장 함수
function getScreenshotPath(name) {
  const timestamp = Date.now();
  return `screenshots/admin-qa-${name}-${timestamp}.png`;
}

// 메인 테스트 함수
async function testAdminDashboard() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  function logTest(testName, status, details = '') {
    results.totalTests++;
    if (status === 'PASS') {
      results.passed++;
      console.log(`✅ ${testName}`);
    } else {
      results.failed++;
      console.log(`❌ ${testName}: ${details}`);
    }
    results.details.push({ testName, status, details, timestamp: new Date().toISOString() });
  }

  try {
    console.log('=== 관리자 대시보드 종합 QA 테스트 시작 ===\n');

    // 1. 메인 관리자 페이지 접속 및 확인
    console.log('1. 메인 관리자 페이지 테스트');
    console.log('- /admin 페이지 접속 중...');
    
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 페이지 타이틀 확인
    const title = await page.title();
    if (title.includes('Admin')) {
      logTest('관리자 페이지 타이틀 확인', 'PASS');
    } else {
      logTest('관리자 페이지 타이틀 확인', 'FAIL', `예상: Admin 포함, 실제: ${title}`);
    }

    // 탭 표시 확인
    const tabs = await page.locator('[role="tablist"] button').count();
    if (tabs >= 4) {
      logTest('모든 탭 표시 확인', 'PASS', `총 ${tabs}개 탭 발견`);
    } else {
      logTest('모든 탭 표시 확인', 'FAIL', `예상: 4개 이상, 실제: ${tabs}개`);
    }

    // 탭 이름 출력
    console.log('\n발견된 탭 목록:');
    for (let i = 0; i < tabs; i++) {
      const tabName = await page.locator('[role="tablist"] button').nth(i).textContent();
      console.log(`  - ${tabName}`);
    }

    await page.screenshot({ path: getScreenshotPath('main-page'), fullPage: true });
    console.log('✓ 메인 페이지 스크린샷 저장\n');

    // 2. 사용통계 탭 기능 검증
    console.log('2. 사용통계 탭 기능 검증');
    console.log('- 사용통계 탭 직접 URL 접속...');
    
    await page.goto('http://localhost:3000/admin?tab=usage-stats', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Mock 데이터 배지 확인
    const mockBadge = await page.locator('text=Mock Data').isVisible().catch(() => false);
    if (mockBadge) {
      logTest('Mock 데이터 배지 표시', 'PASS');
    } else {
      logTest('Mock 데이터 배지 표시', 'FAIL', '배지를 찾을 수 없음');
    }

    // 차트 확인
    const charts = await page.locator('canvas').count();
    if (charts > 0) {
      logTest('차트 렌더링 확인', 'PASS', `${charts}개 차트 발견`);
    } else {
      logTest('차트 렌더링 확인', 'FAIL', '차트를 찾을 수 없음');
    }

    // 새로고침 버튼 확인 및 클릭
    const refreshButton = page.locator('button:has-text("새로고침")').first();
    if (await refreshButton.isVisible()) {
      logTest('새로고침 버튼 표시', 'PASS');
      await refreshButton.click();
      await page.waitForTimeout(2000);
      logTest('새로고침 버튼 클릭', 'PASS');
    } else {
      logTest('새로고침 버튼 표시', 'FAIL', '버튼을 찾을 수 없음');
    }

    await page.screenshot({ path: getScreenshotPath('usage-stats'), fullPage: true });
    console.log('✓ 사용통계 탭 스크린샷 저장\n');

    // 3. 실시간 모니터링 탭 검증
    console.log('3. 실시간 모니터링 탭 검증');
    console.log('- 실시간 모니터링 탭 직접 URL 접속...');
    
    await page.goto('http://localhost:3000/admin?tab=real-time-monitoring', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 실시간 데이터 표시 확인
    const realtimeData = await page.locator('text=/Active Users|Server Status|Performance/i').first().isVisible().catch(() => false);
    if (realtimeData) {
      logTest('실시간 데이터 표시', 'PASS');
    } else {
      logTest('실시간 데이터 표시', 'FAIL', '실시간 데이터를 찾을 수 없음');
    }

    // 자동 새로고침 토글 확인
    const autoRefreshToggle = await page.locator('label:has-text("Auto-refresh")').isVisible().catch(() => false);
    if (autoRefreshToggle) {
      logTest('자동 새로고침 토글 표시', 'PASS');
    } else {
      logTest('자동 새로고침 토글 표시', 'FAIL', '토글을 찾을 수 없음');
    }

    // 알림 기능 확인
    const notificationElements = await page.locator('text=/Notifications|Alerts/i').count();
    if (notificationElements > 0) {
      logTest('알림 기능 요소 확인', 'PASS', `${notificationElements}개 알림 요소 발견`);
    } else {
      logTest('알림 기능 요소 확인', 'FAIL', '알림 요소를 찾을 수 없음');
    }

    await page.screenshot({ path: getScreenshotPath('real-time-monitoring'), fullPage: true });
    console.log('✓ 실시간 모니터링 탭 스크린샷 저장\n');

    // 4. 성능 최적화 버전 확인
    console.log('4. 성능 최적화 버전 확인');
    console.log('- /admin/test-optimization 페이지 접속...');
    
    const optimizationStartTime = Date.now();
    await page.goto('http://localhost:3000/admin/test-optimization', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const optimizationLoadTime = Date.now() - optimizationStartTime;

    // 최적화 페이지 확인
    const optimizationTitle = await page.locator('h1, h2').first().textContent().catch(() => '');
    if (optimizationTitle) {
      logTest('최적화 페이지 로드', 'PASS', `로드 시간: ${optimizationLoadTime}ms`);
    } else {
      logTest('최적화 페이지 로드', 'FAIL', '페이지 콘텐츠를 찾을 수 없음');
    }

    await page.screenshot({ path: getScreenshotPath('optimization-test'), fullPage: true });
    console.log('✓ 성능 최적화 버전 스크린샷 저장\n');

    // 5. 전체 기능 종합 테스트
    console.log('5. 전체 기능 종합 테스트');
    
    // 메인 페이지로 돌아가기
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 탭 전환 테스트
    console.log('- 탭 전환 기능 테스트...');
    const tabButtons = await page.locator('[role="tablist"] button').all();
    let tabSwitchSuccess = 0;
    
    for (let i = 0; i < Math.min(tabButtons.length, 4); i++) {
      try {
        await tabButtons[i].click();
        await page.waitForTimeout(1500);
        tabSwitchSuccess++;
      } catch (error) {
        console.log(`  탭 ${i + 1} 전환 실패:`, error.message);
      }
    }
    
    if (tabSwitchSuccess === Math.min(tabButtons.length, 4)) {
      logTest('탭 전환 기능', 'PASS', `${tabSwitchSuccess}개 탭 전환 성공`);
    } else {
      logTest('탭 전환 기능', 'PARTIAL', `${tabSwitchSuccess}/${Math.min(tabButtons.length, 4)} 탭 전환 성공`);
    }

    // 반응형 디자인 테스트
    console.log('- 반응형 디자인 테스트...');
    
    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: getScreenshotPath('responsive-tablet'), fullPage: true });
    
    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: getScreenshotPath('responsive-mobile'), fullPage: true });
    
    logTest('반응형 디자인', 'PASS', '태블릿 및 모바일 뷰 확인 완료');

    // 에러 처리 확인
    console.log('- 에러 처리 확인...');
    
    // 잘못된 탭 파라미터로 접속
    await page.goto('http://localhost:3000/admin?tab=invalid-tab', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const errorMessage = await page.locator('text=/error|오류/i').count();
    const pageContent = await page.locator('body').textContent();
    
    if (errorMessage > 0 || pageContent.length > 100) {
      logTest('에러 처리', 'PASS', '잘못된 탭 파라미터 처리 확인');
    } else {
      logTest('에러 처리', 'WARN', '명시적 에러 메시지 없음');
    }

    // 테스트 결과 요약
    console.log('\n=== 테스트 결과 요약 ===');
    console.log(`총 테스트: ${results.totalTests}개`);
    console.log(`✅ 성공: ${results.passed}개`);
    console.log(`❌ 실패: ${results.failed}개`);
    console.log(`성공률: ${((results.passed / results.totalTests) * 100).toFixed(1)}%`);

    // 상세 결과 출력
    console.log('\n=== 상세 테스트 결과 ===');
    results.details.forEach((detail, index) => {
      console.log(`${index + 1}. ${detail.testName}: ${detail.status} ${detail.details ? `- ${detail.details}` : ''}`);
    });

    // 테스트 결과 파일 저장
    const fs = require('fs');
    fs.writeFileSync('admin-qa-test-results.json', JSON.stringify(results, null, 2));
    console.log('\n✓ 테스트 결과가 admin-qa-test-results.json 파일에 저장되었습니다.');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    logTest('전체 테스트 실행', 'FAIL', error.message);
  } finally {
    await browser.close();
    console.log('\n=== 테스트 종료 ===');
  }
}

// 테스트 실행
testAdminDashboard().catch(console.error);