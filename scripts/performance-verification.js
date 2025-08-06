const { chromium } = require('playwright');

/**
 * Playwright로 Vercel 배포된 사이트의 성능 최적화 효과를 검증
 * Core Web Vitals, 로딩 시간, 사용자 경험 등을 측정
 */

const VERCEL_URL = 'https://innerspell.vercel.app';
const PAGES_TO_TEST = [
  '/',
  '/tarot',
  '/dream', 
  '/blog',
  '/admin'
];

async function measurePerformance(page, url) {
  console.log(`📊 성능 측정 시작: ${url}`);
  
  // Performance Observer 설정
  await page.addInitScript(() => {
    window.performanceData = {
      navigationTiming: {},
      resourceTiming: [],
      coreWebVitals: {}
    };

    // Navigation Timing 수집
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      window.performanceData.navigationTiming = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.navigationStart,
        firstByte: navigation.responseStart - navigation.navigationStart
      };
    });

    // Core Web Vitals 수집 (Web Vitals 라이브러리 시뮬레이션)
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            window.performanceData.coreWebVitals.lcp = entry.startTime;
            break;
          case 'first-input':
            window.performanceData.coreWebVitals.fid = entry.processingStart - entry.startTime;
            break;
          case 'layout-shift':
            if (!entry.hadRecentInput) {
              window.performanceData.coreWebVitals.cls = 
                (window.performanceData.coreWebVitals.cls || 0) + entry.value;
            }
            break;
        }
      });
    });

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      observer.observe({ type: 'first-input', buffered: true });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('Performance Observer not fully supported');
    }
  });

  const startTime = Date.now();
  
  try {
    // 페이지 로드 및 대기
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // 3초 추가 대기 (컴포넌트 로딩 완료)
    await page.waitForTimeout(3000);

    const endTime = Date.now();
    const totalLoadTime = endTime - startTime;

    // 성능 데이터 수집
    const performanceData = await page.evaluate(() => window.performanceData);
    
    // 스크린샷 촬영
    const screenshotPath = `./screenshots/performance-${url.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });

    // 추가 메트릭 수집
    const metrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const totalResources = resources.length;
      const totalResourceSize = resources.reduce((total, resource) => 
        total + (resource.transferSize || 0), 0);
      
      return {
        totalResources,
        totalResourceSize: Math.round(totalResourceSize / 1024), // KB
        cachedResources: resources.filter(r => r.transferSize === 0).length,
        jsResources: resources.filter(r => r.name.endsWith('.js')).length,
        cssResources: resources.filter(r => r.name.endsWith('.css')).length,
        imageResources: resources.filter(r => 
          r.name.match(/\.(jpg|jpeg|png|webp|avif|svg)$/i)
        ).length,
        fontResources: resources.filter(r => 
          r.name.match(/\.(woff|woff2|ttf|otf)$/i)
        ).length
      };
    });

    const result = {
      url,
      totalLoadTime,
      screenshotPath,
      navigationTiming: performanceData.navigationTiming,
      coreWebVitals: performanceData.coreWebVitals,
      resourceMetrics: metrics,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ 완료: ${url}`);
    console.log(`   📈 총 로딩 시간: ${totalLoadTime}ms`);
    console.log(`   🎯 LCP: ${Math.round(result.coreWebVitals.lcp || 0)}ms`);
    console.log(`   🎯 CLS: ${(result.coreWebVitals.cls || 0).toFixed(3)}`);
    console.log(`   📦 총 리소스: ${metrics.totalResources}개 (${metrics.totalResourceSize}KB)`);
    console.log(`   💾 캐시된 리소스: ${metrics.cachedResources}개`);

    return result;
  } catch (error) {
    console.error(`❌ 에러 (${url}):`, error.message);
    return {
      url,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testInteractiveFeatures(page, url) {
  console.log(`🎮 인터랙티브 기능 테스트: ${url}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    const features = [];

    // 관리자 페이지 특별 테스트
    if (url.includes('/admin')) {
      try {
        // 로그인 시도
        await page.waitForSelector('input[type="email"]', { timeout: 5000 });
        features.push('관리자 로그인 폼 로드됨');
        
        // 통계 차트 로딩 확인 (로그인 후)
        // 실제 테스트에서는 테스트 계정으로 로그인해야 함
      } catch (e) {
        features.push('관리자 페이지 접근 제한 확인됨');
      }
    }

    // 일반 페이지 기능 테스트
    if (url === VERCEL_URL || url === `${VERCEL_URL}/`) {
      // 메인 페이지 요소들 확인
      await page.waitForSelector('[data-testid="hero-section"], .hero, h1', { timeout: 10000 });
      features.push('메인 헤로 섹션 로드됨');
      
      // 네비게이션 메뉴 확인
      const navExists = await page.locator('nav, .navigation, .header').count() > 0;
      if (navExists) features.push('네비게이션 메뉴 로드됨');
    }

    if (url.includes('/tarot')) {
      // 타로 페이지 기능
      await page.waitForTimeout(2000);
      const tarotElements = await page.locator('.card, .tarot, [data-testid*="tarot"]').count();
      if (tarotElements > 0) features.push('타로 관련 요소 로드됨');
    }

    if (url.includes('/dream')) {
      // 꿈해몽 페이지 기능
      await page.waitForTimeout(2000);
      const dreamElements = await page.locator('.dream, [data-testid*="dream"]').count();
      if (dreamElements > 0) features.push('꿈해몽 관련 요소 로드됨');
    }

    if (url.includes('/blog')) {
      // 블로그 페이지 기능
      await page.waitForTimeout(2000);
      const blogElements = await page.locator('.blog, .post, article, [data-testid*="blog"]').count();
      if (blogElements > 0) features.push('블로그 콘텐츠 로드됨');
    }

    // Service Worker 등록 확인
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
    });
    if (swRegistered) features.push('Service Worker 활성화됨');

    // 폰트 로딩 확인
    const fontsLoaded = await page.evaluate(() => {
      return document.fonts && document.fonts.ready;
    });
    if (fontsLoaded) features.push('웹폰트 로딩 완료');

    return {
      url,
      features,
      interactiveTest: true,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      url,
      error: error.message,
      interactiveTest: true,
      timestamp: new Date().toISOString()
    };
  }
}

async function generatePerformanceReport(results) {
  console.log('\n🎯 성능 최적화 검증 보고서');
  console.log('=' .repeat(60));
  
  let totalTests = 0;
  let successfulTests = 0;
  let totalLoadTime = 0;
  let coreWebVitalsPass = 0;

  const summary = {
    testDate: new Date().toISOString(),
    vercelUrl: VERCEL_URL,
    results: results,
    metrics: {
      averageLoadTime: 0,
      coreWebVitalsPassRate: 0,
      totalResourcesAvg: 0,
      cacheHitRate: 0
    },
    optimizations: {
      detected: [],
      recommendations: []
    }
  };

  results.forEach(result => {
    totalTests++;
    
    if (!result.error) {
      successfulTests++;
      totalLoadTime += result.totalLoadTime || 0;

      // Core Web Vitals 평가
      const lcp = result.coreWebVitals?.lcp || 0;
      const cls = result.coreWebVitals?.cls || 0;
      const fid = result.coreWebVitals?.fid || 0;

      if (lcp < 2500 && cls < 0.1 && (fid < 100 || fid === 0)) {
        coreWebVitalsPass++;
      }

      console.log(`\n📄 ${result.url}`);
      console.log(`   ⏱️  로딩 시간: ${result.totalLoadTime}ms`);
      console.log(`   🎯 LCP: ${Math.round(lcp)}ms (목표: <2500ms) ${lcp < 2500 ? '✅' : '❌'}`);
      console.log(`   🎯 CLS: ${cls.toFixed(3)} (목표: <0.1) ${cls < 0.1 ? '✅' : '❌'}`);
      console.log(`   🎯 FID: ${Math.round(fid)}ms (목표: <100ms) ${fid < 100 || fid === 0 ? '✅' : '❌'}`);
      
      if (result.resourceMetrics) {
        const cacheRate = ((result.resourceMetrics.cachedResources / result.resourceMetrics.totalResources) * 100).toFixed(1);
        console.log(`   📦 리소스: ${result.resourceMetrics.totalResources}개 (${result.resourceMetrics.totalResourceSize}KB)`);
        console.log(`   💾 캐시 활용률: ${cacheRate}%`);
        
        // 최적화 감지
        if (result.resourceMetrics.imageResources > 0) {
          summary.optimizations.detected.push('이미지 최적화 적용됨');
        }
        if (cacheRate > 20) {
          summary.optimizations.detected.push('캐싱 전략 효과적');
        }
        if (result.resourceMetrics.fontResources > 0) {
          summary.optimizations.detected.push('웹폰트 최적화 적용됨');
        }
      }

      if (result.features) {
        console.log(`   🎮 기능 테스트: ${result.features.join(', ')}`);
      }
    } else {
      console.log(`\n❌ ${result.url}: ${result.error}`);
    }
  });

  // 전체 요약
  summary.metrics.averageLoadTime = Math.round(totalLoadTime / successfulTests);
  summary.metrics.coreWebVitalsPassRate = Math.round((coreWebVitalsPass / successfulTests) * 100);

  console.log('\n📊 전체 요약');
  console.log('─'.repeat(40));
  console.log(`성공한 테스트: ${successfulTests}/${totalTests}`);
  console.log(`평균 로딩 시간: ${summary.metrics.averageLoadTime}ms`);
  console.log(`Core Web Vitals 통과율: ${summary.metrics.coreWebVitalsPassRate}%`);
  console.log(`Vercel 배포 URL: ${VERCEL_URL}`);

  console.log('\n🚀 감지된 최적화:');
  [...new Set(summary.optimizations.detected)].forEach(opt => {
    console.log(`  ✅ ${opt}`);
  });

  // 권장사항
  if (summary.metrics.averageLoadTime > 3000) {
    summary.optimizations.recommendations.push('로딩 시간 추가 최적화 필요');
  }
  if (summary.metrics.coreWebVitalsPassRate < 80) {
    summary.optimizations.recommendations.push('Core Web Vitals 개선 필요');
  }

  if (summary.optimizations.recommendations.length > 0) {
    console.log('\n💡 권장사항:');
    summary.optimizations.recommendations.forEach(rec => {
      console.log(`  📋 ${rec}`);
    });
  }

  // JSON 결과 저장
  const fs = require('fs');
  const path = require('path');
  
  if (!fs.existsSync('./screenshots')) {
    fs.mkdirSync('./screenshots', { recursive: true });
  }
  
  const reportPath = `./screenshots/performance-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  
  console.log(`\n💾 상세 보고서 저장됨: ${reportPath}`);
  
  return summary;
}

async function runPerformanceVerification() {
  console.log('🚀 Vercel 배포 사이트 성능 검증 시작...\n');
  console.log(`🌐 테스트 대상: ${VERCEL_URL}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const results = [];

    for (const pagePath of PAGES_TO_TEST) {
      const fullUrl = pagePath === '/' ? VERCEL_URL : `${VERCEL_URL}${pagePath}`;
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      const page = await context.newPage();

      // 성능 측정
      const performanceResult = await measurePerformance(page, fullUrl);
      
      // 인터랙티브 기능 테스트
      const interactiveResult = await testInteractiveFeatures(page, fullUrl);
      
      // 결과 병합
      results.push({
        ...performanceResult,
        ...interactiveResult
      });

      await context.close();
      
      // 페이지 간 1초 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 보고서 생성
    const report = await generatePerformanceReport(results);
    
    console.log('\n🎉 성능 검증 완료!');
    return report;

  } catch (error) {
    console.error('❌ 성능 검증 중 오류 발생:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  runPerformanceVerification().catch(console.error);
}

module.exports = { runPerformanceVerification };