const { chromium } = require('playwright');

// 스크린샷 저장 함수
function getScreenshotPath(name) {
  const timestamp = Date.now();
  return `screenshots/admin-mock-auth-${name}-${timestamp}.png`;
}

// Mock 인증 설정
async function setupMockAuth(page) {
  // localStorage에 mock 사용자 설정
  await page.evaluate(() => {
    const mockUser = {
      uid: 'mock-admin-123',
      email: 'admin@example.com',
      displayName: 'Mock Admin',
      role: 'admin',
      isMockUser: true
    };
    
    // Firebase Auth 관련 mock 데이터
    localStorage.setItem('mockAuthUser', JSON.stringify(mockUser));
    localStorage.setItem('useMockAuth', 'true');
    localStorage.setItem('userRole', 'admin');
    
    // 세션 스토리지에도 설정
    sessionStorage.setItem('mockAuthUser', JSON.stringify(mockUser));
    sessionStorage.setItem('useMockAuth', 'true');
  });
  
  console.log('✓ Mock 인증 설정 완료');
}

// 메인 테스트 함수
async function testAdminWithMockAuth() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 200
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();

  console.log('=== Mock 인증을 사용한 관리자 대시보드 테스트 ===\n');

  try {
    // 1. Mock 인증 설정 및 관리자 페이지 접근
    console.log('1. Mock 인증 설정 및 관리자 페이지 접근');
    
    // 먼저 홈페이지 접속
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Mock 인증 설정
    await setupMockAuth(page);
    
    // 관리자 페이지로 이동
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`- 현재 URL: ${currentUrl}`);
    
    // 페이지 콘텐츠 확인
    const pageTitle = await page.title();
    console.log(`- 페이지 타이틀: ${pageTitle}`);
    
    await page.screenshot({ path: getScreenshotPath('admin-initial'), fullPage: true });

    // 2. 관리자 페이지 요소 검색
    console.log('\n2. 관리자 페이지 요소 검색');
    
    // 다양한 선택자로 관리자 요소 찾기
    const adminSelectors = [
      'h1:has-text("관리자")',
      'h1:has-text("Admin")',
      'h1:has-text("대시보드")',
      'h1:has-text("Dashboard")',
      '.admin-container',
      '[data-testid="admin-dashboard"]',
      'main'
    ];
    
    let adminElementFound = false;
    for (const selector of adminSelectors) {
      const element = await page.locator(selector).first().isVisible().catch(() => false);
      if (element) {
        console.log(`✓ 관리자 요소 발견: ${selector}`);
        adminElementFound = true;
        const text = await page.locator(selector).first().textContent().catch(() => '');
        console.log(`  내용: ${text.substring(0, 50)}...`);
        break;
      }
    }
    
    if (!adminElementFound) {
      console.log('❌ 관리자 페이지 요소를 찾을 수 없음');
      
      // 전체 페이지 텍스트 확인
      const bodyText = await page.locator('body').textContent();
      console.log(`- 페이지 텍스트 길이: ${bodyText.length}`);
      console.log(`- 페이지 시작 부분: ${bodyText.substring(0, 200)}...`);
    }

    // 3. 탭 검색 및 테스트
    console.log('\n3. 탭 검색 및 테스트');
    
    const tabSelectors = [
      '[role="tablist"] button',
      '.tab-button',
      'button[data-tab]',
      '.tabs button',
      'nav button'
    ];
    
    let tabsFound = false;
    for (const selector of tabSelectors) {
      const tabs = await page.locator(selector).all();
      if (tabs.length > 0) {
        console.log(`✓ 탭 발견: ${selector} (${tabs.length}개)`);
        tabsFound = true;
        
        // 각 탭 정보 출력
        for (let i = 0; i < tabs.length; i++) {
          const tabText = await tabs[i].textContent();
          console.log(`  탭 ${i + 1}: ${tabText.trim()}`);
          
          // 첫 번째 탭 클릭 테스트
          if (i === 0) {
            await tabs[i].click();
            await page.waitForTimeout(2000);
            console.log(`  → 첫 번째 탭 클릭 완료`);
          }
        }
        break;
      }
    }
    
    if (!tabsFound) {
      console.log('❌ 탭을 찾을 수 없음');
    }

    // 4. 직접 탭 URL 테스트
    console.log('\n4. 직접 탭 URL 테스트');
    
    const tabUrls = [
      { url: 'http://localhost:3000/admin?tab=usage-stats', name: '사용통계' },
      { url: 'http://localhost:3000/admin?tab=real-time-monitoring', name: '실시간 모니터링' },
      { url: 'http://localhost:3000/admin?tab=tarot-guidelines', name: '타로 지침' },
      { url: 'http://localhost:3000/admin?tab=ai-providers', name: 'AI 공급자' }
    ];
    
    for (const tab of tabUrls) {
      console.log(`\n- ${tab.name} 탭 테스트`);
      await page.goto(tab.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      // 탭별 특징적인 요소 확인
      const contentFound = await page.locator('main, .tab-content, [role="tabpanel"]').first().isVisible().catch(() => false);
      if (contentFound) {
        console.log(`  ✓ 탭 콘텐츠 로드됨`);
        
        // 스크린샷 저장
        await page.screenshot({ path: getScreenshotPath(`tab-${tab.name.replace(/\s+/g, '-')}`), fullPage: true });
      } else {
        console.log(`  ❌ 탭 콘텐츠를 찾을 수 없음`);
      }
    }

    // 5. API 직접 호출 테스트
    console.log('\n5. API 직접 호출 테스트');
    
    // Mock 인증 헤더 포함한 API 호출
    const apiTests = [
      { endpoint: '/api/admin/stats', name: '통계 API' },
      { endpoint: '/api/admin/live-stats', name: '실시간 통계 API' },
      { endpoint: '/api/admin/system-status', name: '시스템 상태 API' }
    ];
    
    for (const api of apiTests) {
      const response = await page.evaluate(async (endpoint) => {
        try {
          const res = await fetch(endpoint, {
            headers: {
              'X-Mock-Auth': 'true',
              'X-Mock-Role': 'admin'
            }
          });
          return {
            status: res.status,
            statusText: res.statusText,
            ok: res.ok
          };
        } catch (error) {
          return { error: error.message };
        }
      }, api.endpoint);
      
      console.log(`- ${api.name}: ${response.status || 'Error'} ${response.statusText || response.error || ''}`);
    }

    // 6. 개발자 도구 네트워크 탭 모니터링
    console.log('\n6. 네트워크 요청 모니터링');
    
    const networkRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        networkRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    // 페이지 새로고침
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log(`- 캡처된 API 요청 수: ${networkRequests.length}`);
    networkRequests.slice(0, 5).forEach(req => {
      console.log(`  ${req.method} ${req.url}`);
    });

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
testAdminWithMockAuth().catch(console.error);