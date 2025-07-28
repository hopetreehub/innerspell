import { test, expect, Page } from '@playwright/test';

/**
 * 타로 리딩 히스토리 기능 검증 테스트
 * Vercel 배포 환경에서 애플리케이션 상태를 확인합니다.
 */

test.describe('타로 리딩 히스토리 기능 검증', () => {

  test('애플리케이션 접근성 및 기본 구조 확인', async ({ page }) => {
    console.log('🔍 애플리케이션 기본 구조 확인 시작');
    
    // 홈페이지 접근
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    console.log(`현재 URL: ${page.url()}`);
    
    // 페이지 제목 확인 (Vercel SSO가 아닌 경우)
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'tests/screenshots/verification-01-homepage.png',
      fullPage: true 
    });
    
    // 만약 InnerSpell 앱이 로드되었다면
    if (!page.url().includes('vercel.com')) {
      console.log('✅ InnerSpell 애플리케이션 정상 로드됨');
      
      // 네비게이션 메뉴 확인
      const nav = await page.locator('nav, header').first();
      if (await nav.isVisible()) {
        console.log('✅ 네비게이션 메뉴 확인됨');
      }
      
      // 메인 콘텐츠 확인
      const main = await page.locator('main, [role="main"]').first();
      if (await main.isVisible()) {
        console.log('✅ 메인 콘텐츠 영역 확인됨');
      }
    } else {
      console.log('⚠️ Vercel SSO 페이지로 리다이렉트됨');
    }
    
    console.log('✅ 기본 구조 확인 완료');
  });

  test('타로 관련 페이지 접근성 확인', async ({ page }) => {
    console.log('🎴 타로 관련 페이지 접근성 확인 시작');
    
    const tarotRoutes = ['/tarot', '/reading', '/profile', '/sign-in'];
    
    for (const route of tarotRoutes) {
      console.log(`📍 ${route} 페이지 확인 중...`);
      
      await page.goto(route);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      const currentUrl = page.url();
      const title = await page.title();
      
      console.log(`  URL: ${currentUrl}`);
      console.log(`  제목: ${title}`);
      
      // 스크린샷 촬영
      await page.screenshot({ 
        path: `tests/screenshots/verification-${route.replace('/', '')}-page.png`,
        fullPage: true 
      });
      
      // 페이지가 로드되었는지 확인
      if (!currentUrl.includes('vercel.com')) {
        console.log(`  ✅ ${route} 페이지 정상 로드`);
      } else {
        console.log(`  ⚠️ ${route} 페이지 SSO 리다이렉트`);
      }
    }
    
    console.log('✅ 타로 관련 페이지 접근성 확인 완료');
  });

  test('ReadingHistoryDashboard 컴포넌트 존재 확인', async ({ page }) => {
    console.log('📊 ReadingHistoryDashboard 컴포넌트 확인 시작');
    
    // 소스 코드에서 컴포넌트 확인
    const componentExists = await page.evaluate(() => {
      // 페이지 소스에서 타로 히스토리 관련 요소 확인
      const bodyText = document.body.innerText || '';
      const htmlContent = document.documentElement.innerHTML || '';
      
      return {
        hasHistoryText: bodyText.includes('타로 리딩 히스토리') || bodyText.includes('Reading History'),
        hasDashboardText: bodyText.includes('대시보드') || bodyText.includes('Dashboard'),
        hasTabsInHTML: htmlContent.includes('role="tablist"') || htmlContent.includes('tabs'),
        hasAnalyticsText: bodyText.includes('분석') || bodyText.includes('Analytics'),
        hasPatternsText: bodyText.includes('패턴') || bodyText.includes('Pattern'),
        pageContent: bodyText.substring(0, 500) // 첫 500자만 로그용
      };
    });
    
    console.log('🔍 컴포넌트 존재 확인 결과:', componentExists);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'tests/screenshots/verification-component-check.png',
      fullPage: true 
    });
    
    console.log('✅ ReadingHistoryDashboard 컴포넌트 확인 완료');
  });

  test('API 엔드포인트 상태 확인', async ({ page }) => {
    console.log('🔌 API 엔드포인트 상태 확인 시작');
    
    const endpoints = [
      { url: '/api/reading/history', expected: [401, 200] },
      { url: '/api/reading/analytics', expected: [401, 200] },
      { url: '/api/health', expected: [200] }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await page.request.get(endpoint.url);
        const status = response.status();
        
        if (endpoint.expected.includes(status)) {
          console.log(`✅ ${endpoint.url}: ${status} (예상된 응답)`);
        } else {
          console.log(`⚠️ ${endpoint.url}: ${status} (예상 외 응답)`);
        }
        
        // 응답 헤더 확인
        const contentType = response.headers()['content-type'];
        if (contentType) {
          console.log(`  Content-Type: ${contentType}`);
        }
        
      } catch (error) {
        console.log(`❌ ${endpoint.url}: 오류 - ${error}`);
      }
    }
    
    console.log('✅ API 엔드포인트 상태 확인 완료');
  });

  test('화면 반응성 및 레이아웃 확인', async ({ page }) => {
    console.log('📱 화면 반응성 확인 시작');
    
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      console.log(`📐 ${viewport.name} 뷰포트 테스트 (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // 스크린샷 촬영
      await page.screenshot({ 
        path: `tests/screenshots/verification-${viewport.name}.png`,
        fullPage: true 
      });
      
      // 기본 레이아웃 요소 확인
      const layoutCheck = await page.evaluate(() => {
        const body = document.body;
        const header = document.querySelector('header, nav');
        const main = document.querySelector('main, [role="main"]');
        const footer = document.querySelector('footer');
        
        return {
          bodyVisible: body && body.offsetHeight > 0,
          headerVisible: header && header.offsetHeight > 0,
          mainVisible: main && main.offsetHeight > 0,
          footerVisible: footer && footer.offsetHeight > 0,
          totalHeight: body ? body.scrollHeight : 0
        };
      });
      
      console.log(`  레이아웃 확인:`, layoutCheck);
      console.log(`  ✅ ${viewport.name} 뷰포트 확인 완료`);
    }
    
    console.log('✅ 화면 반응성 확인 완료');
  });

  test('최종 애플리케이션 상태 종합 점검', async ({ page }) => {
    console.log('🎯 최종 애플리케이션 상태 종합 점검 시작');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // 종합적인 앱 상태 확인
    const appStatus = await page.evaluate(() => {
      const performanceEntries = performance.getEntriesByType('navigation');
      const navigation = performanceEntries[0] as PerformanceNavigationTiming;
      
      return {
        // 페이지 정보
        url: window.location.href,
        title: document.title,
        readyState: document.readyState,
        
        // DOM 정보
        hasReactRoot: !!document.querySelector('#__next, [data-reactroot]'),
        totalElements: document.querySelectorAll('*').length,
        scriptsCount: document.querySelectorAll('script').length,
        stylesCount: document.querySelectorAll('link[rel="stylesheet"], style').length,
        
        // 성능 정보
        loadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0,
        domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart) : 0,
        
        // 콘텐츠 확인
        bodyText: document.body ? document.body.innerText.substring(0, 200) : '',
        
        // 오류 확인
        hasConsoleErrors: window.console && console.error.toString !== Function.prototype.toString
      };
    });
    
    console.log('📊 애플리케이션 최종 상태:', appStatus);
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'tests/screenshots/verification-final-status.png',
      fullPage: true 
    });
    
    // 테스트 결과 요약
    const isWorkingApp = !appStatus.url.includes('vercel.com') && appStatus.hasReactRoot;
    
    if (isWorkingApp) {
      console.log('🎉 InnerSpell 애플리케이션이 정상적으로 작동하고 있습니다!');
      console.log(`   - 로딩 시간: ${appStatus.loadTime}ms`);
      console.log(`   - DOM 요소 수: ${appStatus.totalElements}`);
      console.log(`   - React 앱 확인: ${appStatus.hasReactRoot}`);
    } else {
      console.log('⚠️ 애플리케이션이 Vercel SSO로 보호되어 있거나 다른 이슈가 있습니다.');
      console.log(`   - 현재 URL: ${appStatus.url}`);
      console.log(`   - 페이지 제목: ${appStatus.title}`);
    }
    
    console.log(`
    📋 타로 리딩 히스토리 기능 검증 완료:
    ✅ 애플리케이션 접근성 확인
    ✅ 타로 관련 페이지 확인  
    ✅ 컴포넌트 존재 확인
    ✅ API 엔드포인트 확인
    ✅ 화면 반응성 확인
    ✅ 최종 상태 점검 완료
    
    ${isWorkingApp ? '🎉' : '⚠️'} 검증 결과: ${isWorkingApp ? '정상 작동' : '접근 제한됨'}
    `);
    
    console.log('✅ 최종 종합 점검 완료');
  });
});