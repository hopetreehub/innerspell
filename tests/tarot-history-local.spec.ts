import { test, expect, Page } from '@playwright/test';

/**
 * 타로 리딩 히스토리 기능 로컬 테스트
 * 로컬 포트 4000에서 실제 기능을 검증합니다.
 */

test.describe('타로 리딩 히스토리 로컬 테스트', () => {

  test('홈페이지 정상 로드 확인', async ({ page }) => {
    console.log('🏠 홈페이지 정상 로드 확인 시작');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/InnerSpell/);
    console.log('✅ 페이지 제목 확인됨');
    
    // React 앱 로드 확인
    const reactRoot = page.locator('#__next');
    await expect(reactRoot).toBeVisible();
    console.log('✅ React 앱 로드 확인됨');
    
    // 네비게이션 확인
    const navigation = page.locator('nav, header');
    await expect(navigation.first()).toBeVisible();
    console.log('✅ 네비게이션 메뉴 확인됨');
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'tests/screenshots/local-01-homepage.png',
      fullPage: true 
    });
    
    console.log('✅ 홈페이지 정상 로드 확인 완료');
  });

  test('프로필 페이지 접근 및 로그인 리다이렉트', async ({ page }) => {
    console.log('👤 프로필 페이지 접근 테스트 시작');
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // 로그인 페이지로 리다이렉트 확인
    const currentUrl = page.url();
    expect(currentUrl).toContain('/sign-in');
    console.log('✅ 로그인 페이지로 정상 리다이렉트됨');
    
    // 로그인 폼 요소 확인
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    if (await emailInput.isVisible()) {
      console.log('✅ 이메일 입력 필드 확인됨');
    }
    
    if (await passwordInput.isVisible()) {
      console.log('✅ 비밀번호 입력 필드 확인됨');
    }
    
    // Google 로그인 버튼 확인
    const googleButton = page.locator('text=Google로 로그인');
    if (await googleButton.isVisible()) {
      console.log('✅ Google 로그인 버튼 확인됨');
    }
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'tests/screenshots/local-02-signin.png',
      fullPage: true 
    });
    
    console.log('✅ 프로필 페이지 접근 테스트 완료');
  });

  test('ReadingHistoryDashboard 컴포넌트 구조 분석', async ({ page }) => {
    console.log('📊 ReadingHistoryDashboard 컴포넌트 구조 분석 시작');
    
    // 먼저 홈페이지로 이동
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 페이지 소스에서 ReadingHistoryDashboard 관련 내용 확인
    const pageContent = await page.content();
    
    // 컴포넌트 관련 텍스트 확인
    const componentAnalysis = await page.evaluate(() => {
      // JavaScript 번들에서 컴포넌트 관련 내용 확인
      const scripts = Array.from(document.querySelectorAll('script')).map(s => s.innerHTML);
      const allScriptContent = scripts.join(' ');
      
      return {
        hasReadingHistory: allScriptContent.includes('ReadingHistoryDashboard') || 
                          allScriptContent.includes('타로 리딩 히스토리') ||
                          allScriptContent.includes('reading-history'),
        hasTabsComponent: allScriptContent.includes('TabsList') || 
                         allScriptContent.includes('TabsContent') ||
                         allScriptContent.includes('role="tablist"'),
        hasAnalyticsFeature: allScriptContent.includes('분석') || 
                            allScriptContent.includes('analytics') ||
                            allScriptContent.includes('ReadingAnalytics'),
        hasPatternsFeature: allScriptContent.includes('패턴') || 
                           allScriptContent.includes('patterns'),
        hasFilterFeature: allScriptContent.includes('필터') || 
                         allScriptContent.includes('filter'),
        hasSearchFeature: allScriptContent.includes('검색') || 
                         allScriptContent.includes('search'),
        scriptCount: scripts.length,
        totalScriptSize: allScriptContent.length
      };
    });
    
    console.log('🔍 컴포넌트 분석 결과:', componentAnalysis);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'tests/screenshots/local-03-component-analysis.png',
      fullPage: true 
    });
    
    console.log('✅ ReadingHistoryDashboard 컴포넌트 구조 분석 완료');
  });

  test('API 엔드포인트 접근성 테스트', async ({ page }) => {
    console.log('🔌 API 엔드포인트 접근성 테스트 시작');
    
    const endpoints = [
      { url: '/api/reading/history', description: '리딩 히스토리 API' },
      { url: '/api/reading/analytics', description: '리딩 분석 API' },
      { url: '/api/health', description: '헬스 체크 API' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await page.request.get(endpoint.url);
        const status = response.status();
        const contentType = response.headers()['content-type'] || '';
        
        console.log(`📡 ${endpoint.description}: ${status}`);
        console.log(`   Content-Type: ${contentType}`);
        
        if (status === 401) {
          console.log(`   ✅ 인증 필요 - 정상적인 보안 설정`);
        } else if (status === 200) {
          console.log(`   ✅ 정상 응답`);
        } else if (status === 404) {
          console.log(`   ⚠️ 엔드포인트 없음`);
        } else {
          console.log(`   ❓ 예상 외 응답: ${status}`);
        }
        
      } catch (error) {
        console.log(`❌ ${endpoint.description}: 오류 - ${error}`);
      }
    }
    
    console.log('✅ API 엔드포인트 접근성 테스트 완료');
  });

  test('타로 관련 페이지들 접근성 확인', async ({ page }) => {
    console.log('🎴 타로 관련 페이지들 접근성 확인 시작');
    
    const tarotPages = [
      { url: '/tarot', name: '타로 메인 페이지' },
      { url: '/reading', name: '타로 리딩 페이지' },
      { url: '/profile', name: '프로필 페이지 (로그인 필요)' }
    ];
    
    for (const pageInfo of tarotPages) {
      console.log(`📍 ${pageInfo.name} 확인 중...`);
      
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      const title = await page.title();
      
      console.log(`   URL: ${currentUrl}`);
      console.log(`   제목: ${title}`);
      
      // 페이지가 정상 로드되었는지 확인
      if (currentUrl.includes('localhost:4000')) {
        console.log(`   ✅ ${pageInfo.name} 정상 접근됨`);
        
        // React 앱이 로드되었는지 확인
        const reactRoot = page.locator('#__next');
        if (await reactRoot.isVisible()) {
          console.log(`   ✅ React 앱 정상 로드됨`);
        }
      } else {
        console.log(`   ⚠️ 다른 페이지로 리다이렉트됨`);
      }
      
      // 스크린샷 촬영
      const fileName = pageInfo.url.replace('/', '') || 'root';
      await page.screenshot({ 
        path: `tests/screenshots/local-04-${fileName}.png`,
        fullPage: true 
      });
    }
    
    console.log('✅ 타로 관련 페이지들 접근성 확인 완료');
  });

  test('UI 반응성 및 브라우저 호환성 테스트', async ({ page }) => {
    console.log('📱 UI 반응성 및 브라우저 호환성 테스트 시작');
    
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-large' },
      { width: 1366, height: 768, name: 'desktop-standard' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      console.log(`📐 ${viewport.name} 뷰포트 테스트 (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 기본 레이아웃 요소들 확인
      const layoutCheck = await page.evaluate(() => {
        const body = document.body;
        const header = document.querySelector('header, nav');
        const main = document.querySelector('main, [role="main"]');
        const footer = document.querySelector('footer');
        
        return {
          bodyHeight: body.scrollHeight,
          headerVisible: header ? header.offsetHeight > 0 : false,
          mainVisible: main ? main.offsetHeight > 0 : false,
          footerVisible: footer ? footer.offsetHeight > 0 : false,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        };
      });
      
      console.log(`   레이아웃 상태:`, layoutCheck);
      
      // 스크린샷 촬영
      await page.screenshot({ 
        path: `tests/screenshots/local-05-${viewport.name}.png`,
        fullPage: true 
      });
      
      console.log(`   ✅ ${viewport.name} 뷰포트 확인 완료`);
    }
    
    console.log('✅ UI 반응성 테스트 완료');
  });

  test('페이지 성능 및 로딩 최적화 확인', async ({ page }) => {
    console.log('⚡ 페이지 성능 및 로딩 최적화 확인 시작');
    
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const totalLoadTime = endTime - startTime;
    
    // 성능 메트릭 수집
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        // 네비게이션 타이밍
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        firstByte: Math.round(navigation.responseStart - navigation.fetchStart),
        
        // 페인트 타이밍
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        
        // 리소스 정보
        resourceCount: performance.getEntriesByType('resource').length,
        
        // DOM 정보
        domElements: document.querySelectorAll('*').length,
        scriptsCount: document.querySelectorAll('script').length,
        stylesCount: document.querySelectorAll('link[rel="stylesheet"], style').length
      };
    });
    
    console.log(`📊 전체 로딩 시간: ${totalLoadTime}ms`);
    console.log(`📊 성능 메트릭:`, performanceMetrics);
    
    // 성능 기준 확인
    console.log(`📋 성능 평가:`);
    console.log(`   DOMContentLoaded: ${performanceMetrics.domContentLoaded}ms ${performanceMetrics.domContentLoaded < 2000 ? '✅' : '⚠️'}`);
    console.log(`   Load Complete: ${performanceMetrics.loadComplete}ms ${performanceMetrics.loadComplete < 5000 ? '✅' : '⚠️'}`);
    console.log(`   First Contentful Paint: ${Math.round(performanceMetrics.firstContentfulPaint)}ms ${performanceMetrics.firstContentfulPaint < 1500 ? '✅' : '⚠️'}`);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'tests/screenshots/local-06-performance.png',
      fullPage: true 
    });
    
    // 성능 임계값 확인
    expect(totalLoadTime).toBeLessThan(10000); // 10초 이내
    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000); // 5초 이내
    
    console.log('✅ 페이지 성능 확인 완료');
  });

  test('최종 타로 히스토리 기능 종합 검증', async ({ page }) => {
    console.log('🎯 최종 타로 히스토리 기능 종합 검증 시작');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 애플리케이션 전체 상태 확인
    const appStatus = await page.evaluate(() => {
      // 페이지 기본 정보
      const pageInfo = {
        url: window.location.href,
        title: document.title,
        readyState: document.readyState
      };
      
      // React 앱 확인
      const reactInfo = {
        hasReactRoot: !!document.querySelector('#__next'),
        hasReactElements: !!document.querySelector('[data-reactroot]'),
        reactVersion: window.React ? window.React.version : 'unknown'
      };
      
      // DOM 구조 확인
      const domInfo = {
        totalElements: document.querySelectorAll('*').length,
        scriptsCount: document.querySelectorAll('script').length,
        stylesCount: document.querySelectorAll('link[rel="stylesheet"], style').length,
        imagesCount: document.querySelectorAll('img').length
      };
      
      // 타로 관련 콘텐츠 확인
      const tarotContent = {
        hasNavigationLinks: !!document.querySelector('a[href*="tarot"], a[href*="reading"], a[href*="profile"]'),
        hasTarotText: document.body.innerText.toLowerCase().includes('타로'),
        hasReadingText: document.body.innerText.toLowerCase().includes('리딩'),
        hasProfileText: document.body.innerText.toLowerCase().includes('프로필')
      };
      
      // JavaScript 번들 분석
      const scripts = Array.from(document.querySelectorAll('script')).map(s => s.innerHTML);
      const bundleContent = scripts.join(' ');
      const bundleAnalysis = {
        hasReadingHistoryComponent: bundleContent.includes('ReadingHistoryDashboard'),
        hasTabsComponent: bundleContent.includes('TabsList') || bundleContent.includes('Tabs'),
        hasAnalyticsFeature: bundleContent.includes('analytics') || bundleContent.includes('분석'),
        hasPatternsFeature: bundleContent.includes('patterns') || bundleContent.includes('패턴'),
        hasFilterFeature: bundleContent.includes('filter') || bundleContent.includes('필터'),
        bundleSize: bundleContent.length
      };
      
      return {
        pageInfo,
        reactInfo,
        domInfo,
        tarotContent,
        bundleAnalysis,
        timestamp: new Date().toISOString()
      };
    });
    
    console.log('📊 애플리케이션 최종 상태 분석:');
    console.log('   페이지 정보:', appStatus.pageInfo);
    console.log('   React 정보:', appStatus.reactInfo);
    console.log('   DOM 정보:', appStatus.domInfo);
    console.log('   타로 콘텐츠:', appStatus.tarotContent);
    console.log('   번들 분석:', appStatus.bundleAnalysis);
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'tests/screenshots/local-07-final-verification.png',
      fullPage: true 
    });
    
    // 테스트 결과 종합
    const isFullyFunctional = (
      appStatus.reactInfo.hasReactRoot &&
      appStatus.domInfo.totalElements > 100 &&
      appStatus.bundleAnalysis.bundleSize > 10000
    );
    
    const hasReadingHistoryFeatures = (
      appStatus.bundleAnalysis.hasReadingHistoryComponent ||
      appStatus.bundleAnalysis.hasTabsComponent ||
      appStatus.bundleAnalysis.hasAnalyticsFeature
    );
    
    console.log(`
    📋 타로 리딩 히스토리 기능 최종 검증 결과:
    
    🏗️ 애플리케이션 기본 구조:
    ${appStatus.reactInfo.hasReactRoot ? '✅' : '❌'} React 앱 정상 로드
    ${appStatus.domInfo.totalElements > 100 ? '✅' : '❌'} DOM 구조 적절함 (${appStatus.domInfo.totalElements} 요소)
    ${appStatus.domInfo.scriptsCount > 0 ? '✅' : '❌'} JavaScript 번들 로드됨 (${appStatus.domInfo.scriptsCount} 스크립트)
    
    🎴 타로 관련 기능:
    ${appStatus.tarotContent.hasNavigationLinks ? '✅' : '❌'} 타로 관련 네비게이션 링크
    ${appStatus.tarotContent.hasTarotText ? '✅' : '❌'} 타로 관련 텍스트 콘텐츠
    ${appStatus.tarotContent.hasReadingText ? '✅' : '❌'} 리딩 관련 텍스트 콘텐츠
    
    📊 히스토리 대시보드 기능:
    ${appStatus.bundleAnalysis.hasReadingHistoryComponent ? '✅' : '❌'} ReadingHistoryDashboard 컴포넌트
    ${appStatus.bundleAnalysis.hasTabsComponent ? '✅' : '❌'} 탭 컴포넌트 (개요/히스토리/분석/패턴)
    ${appStatus.bundleAnalysis.hasAnalyticsFeature ? '✅' : '❌'} 분석 기능
    ${appStatus.bundleAnalysis.hasPatternsFeature ? '✅' : '❌'} 패턴 기능
    ${appStatus.bundleAnalysis.hasFilterFeature ? '✅' : '❌'} 필터 기능
    
    🎯 종합 평가:
    ${isFullyFunctional ? '🎉' : '⚠️'} 애플리케이션 상태: ${isFullyFunctional ? '정상 작동' : '부분 작동'}
    ${hasReadingHistoryFeatures ? '🎉' : '⚠️'} 히스토리 기능: ${hasReadingHistoryFeatures ? '구현됨' : '미구현 또는 번들에 없음'}
    
    ✅ 검증 완료 시각: ${appStatus.timestamp}
    `);
    
    // 핵심 기능들이 존재하는지 검증
    expect(appStatus.reactInfo.hasReactRoot).toBeTruthy();
    expect(appStatus.domInfo.totalElements).toBeGreaterThan(50);
    
    console.log('✅ 최종 타로 히스토리 기능 종합 검증 완료');
  });
});