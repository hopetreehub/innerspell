const { chromium } = require('playwright');

// 스크린샷 저장 함수
function getScreenshotPath(name) {
  const timestamp = Date.now();
  return `screenshots/admin-qa-v2-${name}-${timestamp}.png`;
}

// 로그인 함수
async function performLogin(page) {
  console.log('\n=== 관리자 로그인 수행 ===');
  
  // 이메일 입력
  await page.fill('input[type="email"]', 'testadmin@example.com');
  console.log('✓ 이메일 입력 완료');
  
  // 비밀번호 입력
  await page.fill('input[type="password"]', 'password123');
  console.log('✓ 비밀번호 입력 완료');
  
  // 로그인 버튼 클릭
  await page.click('button:has-text("로그인")');
  console.log('✓ 로그인 버튼 클릭');
  
  // 로그인 처리 대기
  await page.waitForTimeout(3000);
  
  // 로그인 후 URL 확인
  const currentUrl = page.url();
  console.log(`✓ 현재 URL: ${currentUrl}`);
  
  return currentUrl.includes('admin');
}

// 메인 테스트 함수
async function testAdminDashboard() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 // 시각적 확인을 위해 천천히 실행
  });
  
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
    console.log('=== 관리자 대시보드 종합 QA 테스트 V2 시작 ===\n');

    // 1. 메인 관리자 페이지 접속 및 로그인
    console.log('1. 관리자 페이지 접속 및 로그인');
    
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 로그인 페이지인지 확인
    const isLoginPage = await page.locator('input[type="email"]').isVisible().catch(() => false);
    
    if (isLoginPage) {
      console.log('- 로그인 페이지 감지됨, 로그인 시도...');
      const loginSuccess = await performLogin(page);
      
      if (loginSuccess) {
        logTest('관리자 로그인', 'PASS');
      } else {
        logTest('관리자 로그인', 'FAIL', '로그인 후에도 관리자 페이지로 이동하지 않음');
      }
    }
    
    // 관리자 페이지 요소 확인
    await page.waitForTimeout(3000);
    const adminTitle = await page.locator('h1:has-text("관리자"), h2:has-text("Admin"), h1:has-text("대시보드")').first().isVisible().catch(() => false);
    
    if (adminTitle) {
      logTest('관리자 페이지 로드', 'PASS');
    } else {
      logTest('관리자 페이지 로드', 'FAIL', '관리자 페이지 제목을 찾을 수 없음');
    }
    
    // 현재 페이지 상태 스크린샷
    await page.screenshot({ path: getScreenshotPath('after-login'), fullPage: true });
    console.log('✓ 로그인 후 페이지 스크린샷 저장');
    
    // 탭 확인
    const tabs = await page.locator('[role="tablist"] button, .tab-button, button[data-tab]').all();
    const tabCount = tabs.length;
    
    if (tabCount >= 4) {
      logTest('탭 표시 확인', 'PASS', `${tabCount}개 탭 발견`);
      
      // 탭 이름 출력
      console.log('\n발견된 탭 목록:');
      for (let i = 0; i < tabCount; i++) {
        const tabText = await tabs[i].textContent();
        console.log(`  ${i + 1}. ${tabText.trim()}`);
      }
    } else if (tabCount > 0) {
      logTest('탭 표시 확인', 'PARTIAL', `${tabCount}개 탭만 발견됨 (예상: 4개 이상)`);
    } else {
      logTest('탭 표시 확인', 'FAIL', '탭을 찾을 수 없음');
    }

    // 2. 사용통계 탭 테스트
    console.log('\n2. 사용통계 탭 기능 검증');
    
    // 사용통계 탭 찾기 및 클릭
    const usageStatsTab = await page.locator('button:has-text("사용통계"), button:has-text("Usage Stats"), button:has-text("통계")').first();
    
    if (await usageStatsTab.isVisible()) {
      await usageStatsTab.click();
      await page.waitForTimeout(3000);
      logTest('사용통계 탭 클릭', 'PASS');
      
      // Mock 데이터 배지 확인
      const mockBadge = await page.locator('text=Mock Data, text=모의 데이터, .mock-badge').first().isVisible().catch(() => false);
      if (mockBadge) {
        logTest('Mock 데이터 배지', 'PASS');
      } else {
        logTest('Mock 데이터 배지', 'FAIL', '배지를 찾을 수 없음');
      }
      
      // 차트 확인
      const charts = await page.locator('canvas, .chart-container, .recharts-wrapper').count();
      if (charts > 0) {
        logTest('차트 렌더링', 'PASS', `${charts}개 차트 요소 발견`);
      } else {
        logTest('차트 렌더링', 'FAIL', '차트를 찾을 수 없음');
      }
      
      // 새로고침 버튼
      const refreshButton = await page.locator('button:has-text("새로고침"), button:has-text("Refresh"), button[aria-label*="refresh"]').first();
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        await page.waitForTimeout(2000);
        logTest('새로고침 기능', 'PASS');
      } else {
        logTest('새로고침 기능', 'FAIL', '새로고침 버튼을 찾을 수 없음');
      }
      
      await page.screenshot({ path: getScreenshotPath('usage-stats-tab'), fullPage: true });
      console.log('✓ 사용통계 탭 스크린샷 저장');
    } else {
      logTest('사용통계 탭', 'FAIL', '탭을 찾을 수 없음');
    }

    // 3. 실시간 모니터링 탭 테스트
    console.log('\n3. 실시간 모니터링 탭 검증');
    
    const monitoringTab = await page.locator('button:has-text("실시간 모니터링"), button:has-text("Real-time"), button:has-text("모니터링")').first();
    
    if (await monitoringTab.isVisible()) {
      await monitoringTab.click();
      await page.waitForTimeout(3000);
      logTest('실시간 모니터링 탭 클릭', 'PASS');
      
      // 실시간 데이터 요소 확인
      const realtimeElements = await page.locator('text=/Active Users|활성 사용자|Server Status|서버 상태/i').count();
      if (realtimeElements > 0) {
        logTest('실시간 데이터 표시', 'PASS', `${realtimeElements}개 실시간 요소 발견`);
      } else {
        logTest('실시간 데이터 표시', 'FAIL', '실시간 데이터를 찾을 수 없음');
      }
      
      // 자동 새로고침 토글
      const autoRefresh = await page.locator('input[type="checkbox"], label:has-text("Auto"), label:has-text("자동")').first().isVisible().catch(() => false);
      if (autoRefresh) {
        logTest('자동 새로고침 토글', 'PASS');
      } else {
        logTest('자동 새로고침 토글', 'FAIL', '토글을 찾을 수 없음');
      }
      
      await page.screenshot({ path: getScreenshotPath('monitoring-tab'), fullPage: true });
      console.log('✓ 실시간 모니터링 탭 스크린샷 저장');
    } else {
      logTest('실시간 모니터링 탭', 'FAIL', '탭을 찾을 수 없음');
    }

    // 4. 타로 지침 탭 테스트
    console.log('\n4. 타로 지침 탭 검증');
    
    const tarotTab = await page.locator('button:has-text("타로 지침"), button:has-text("Tarot Guidelines"), button:has-text("지침")').first();
    
    if (await tarotTab.isVisible()) {
      await tarotTab.click();
      await page.waitForTimeout(3000);
      logTest('타로 지침 탭 클릭', 'PASS');
      
      // 지침 목록 확인
      const guidelines = await page.locator('.guideline-item, [data-guideline], article').count();
      if (guidelines > 0) {
        logTest('타로 지침 표시', 'PASS', `${guidelines}개 지침 발견`);
      } else {
        logTest('타로 지침 표시', 'FAIL', '지침을 찾을 수 없음');
      }
      
      await page.screenshot({ path: getScreenshotPath('tarot-guidelines-tab'), fullPage: true });
      console.log('✓ 타로 지침 탭 스크린샷 저장');
    } else {
      logTest('타로 지침 탭', 'FAIL', '탭을 찾을 수 없음');
    }

    // 5. 반응형 디자인 테스트
    console.log('\n5. 반응형 디자인 테스트');
    
    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: getScreenshotPath('responsive-tablet'), fullPage: true });
    logTest('태블릿 뷰', 'PASS');
    
    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: getScreenshotPath('responsive-mobile'), fullPage: true });
    logTest('모바일 뷰', 'PASS');
    
    // 원래 크기로 복원
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 6. 직접 URL 접근 테스트
    console.log('\n6. 직접 URL 접근 테스트');
    
    // 사용통계 직접 접근
    await page.goto('http://localhost:3000/admin?tab=usage-stats', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const isUsageStats = await page.locator('canvas, .chart-container, text=/차트|Chart/i').first().isVisible().catch(() => false);
    if (isUsageStats) {
      logTest('사용통계 직접 URL 접근', 'PASS');
    } else {
      logTest('사용통계 직접 URL 접근', 'FAIL', '페이지가 올바르게 로드되지 않음');
    }
    
    // 실시간 모니터링 직접 접근
    await page.goto('http://localhost:3000/admin?tab=real-time-monitoring', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const isMonitoring = await page.locator('text=/실시간|Real-time|모니터링/i').first().isVisible().catch(() => false);
    if (isMonitoring) {
      logTest('실시간 모니터링 직접 URL 접근', 'PASS');
    } else {
      logTest('실시간 모니터링 직접 URL 접근', 'FAIL', '페이지가 올바르게 로드되지 않음');
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
    fs.writeFileSync('admin-qa-test-results-v2.json', JSON.stringify(results, null, 2));
    console.log('\n✓ 테스트 결과가 admin-qa-test-results-v2.json 파일에 저장되었습니다.');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    logTest('전체 테스트 실행', 'FAIL', error.message);
  } finally {
    await page.waitForTimeout(5000); // 최종 상태 확인을 위해 대기
    await browser.close();
    console.log('\n=== 테스트 종료 ===');
  }
}

// 테스트 실행
testAdminDashboard().catch(console.error);