const { chromium } = require('playwright');

// 스크린샷 저장 함수
function getScreenshotPath(name) {
  const timestamp = Date.now();
  return `screenshots/admin-mock-${name}-${timestamp}.png`;
}

// 메인 테스트 함수
async function testAdminDashboardMockMode() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();

  console.log('=== 관리자 대시보드 Mock 모드 테스트 ===\n');

  try {
    // 1. 개발 환경 확인
    console.log('1. 개발 환경 설정 확인');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('- 홈페이지 정상 로드 확인');
    await page.screenshot({ path: getScreenshotPath('homepage'), fullPage: true });

    // 2. 관리자 페이지 직접 접근 시도
    console.log('\n2. 관리자 페이지 직접 접근 시도');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`- 현재 URL: ${currentUrl}`);
    
    // 리다이렉트 확인
    if (currentUrl.includes('sign-in') || currentUrl.includes('login')) {
      console.log('✓ 예상대로 로그인 페이지로 리다이렉트됨');
      await page.screenshot({ path: getScreenshotPath('login-redirect'), fullPage: true });
      
      // 로그인 페이지 요소 확인
      const loginForm = await page.locator('form, input[type="email"], input[type="password"]').first().isVisible().catch(() => false);
      if (loginForm) {
        console.log('✓ 로그인 폼 발견');
      }
    } else if (currentUrl.includes('admin')) {
      console.log('✓ 관리자 페이지 직접 접근 성공 (개발 모드?)');
      await page.screenshot({ path: getScreenshotPath('admin-direct-access'), fullPage: true });
    }

    // 3. 개발자 모드 관리자 접근 시도
    console.log('\n3. 개발자 모드 관리자 접근 시도');
    
    // Mock 데이터로 관리자 페이지 접근
    await page.goto('http://localhost:3000/admin?dev=true&mock=true', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 페이지 콘텐츠 확인
    const pageContent = await page.locator('body').textContent();
    console.log('- 페이지 콘텐츠 길이:', pageContent.length);
    
    // 관리자 관련 텍스트 검색
    const adminKeywords = ['admin', '관리자', '대시보드', 'dashboard', '통계', 'stats'];
    const foundKeywords = adminKeywords.filter(keyword => 
      pageContent.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (foundKeywords.length > 0) {
      console.log('✓ 관리자 관련 키워드 발견:', foundKeywords.join(', '));
    } else {
      console.log('❌ 관리자 관련 키워드를 찾을 수 없음');
    }
    
    await page.screenshot({ path: getScreenshotPath('admin-dev-mode'), fullPage: true });

    // 4. API 엔드포인트 테스트
    console.log('\n4. API 엔드포인트 테스트');
    
    // 사용 통계 API 테스트
    const statsResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        return { status: response.status, data };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('- 사용 통계 API 응답:', statsResponse.status || 'Error');
    
    // 실시간 모니터링 API 테스트
    const monitoringResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/admin/real-time-monitoring');
        const data = await response.json();
        return { status: response.status, data };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('- 실시간 모니터링 API 응답:', monitoringResponse.status || 'Error');

    // 5. 페이지 요소 상세 분석
    console.log('\n5. 페이지 요소 상세 분석');
    
    // 모든 버튼 찾기
    const buttons = await page.locator('button').all();
    console.log(`- 발견된 버튼 수: ${buttons.length}`);
    
    if (buttons.length > 0) {
      console.log('- 버튼 텍스트 목록:');
      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        const text = await buttons[i].textContent();
        if (text && text.trim()) {
          console.log(`  ${i + 1}. ${text.trim()}`);
        }
      }
    }
    
    // 탭 관련 요소 찾기
    const tabs = await page.locator('[role="tablist"], .tabs, .tab-container').count();
    console.log(`- 탭 컨테이너 발견: ${tabs > 0 ? '예' : '아니오'}`);
    
    // 차트 관련 요소 찾기
    const charts = await page.locator('canvas, svg.chart, .chart-container').count();
    console.log(`- 차트 요소 발견: ${charts}개`);

    // 6. 콘솔 로그 확인
    console.log('\n6. 브라우저 콘솔 로그 확인');
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('- 콘솔 에러:', msg.text());
      } else if (msg.text().includes('Admin') || msg.text().includes('Mock')) {
        console.log('- 관련 로그:', msg.text());
      }
    });
    
    // 페이지 새로고침하여 로그 캡처
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 최종 스크린샷
    await page.screenshot({ path: getScreenshotPath('final-state'), fullPage: true });
    
    console.log('\n✓ 모든 테스트 완료');
    console.log('✓ 스크린샷이 screenshots 폴더에 저장되었습니다.');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ path: getScreenshotPath('error'), fullPage: true });
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
    console.log('\n=== 테스트 종료 ===');
  }
}

// 테스트 실행
testAdminDashboardMockMode().catch(console.error);