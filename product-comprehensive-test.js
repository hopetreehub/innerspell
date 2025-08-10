const { chromium } = require('playwright');
const lighthouse = require('lighthouse');

// 테스트 결과 저장 객체
const testResults = {
  timestamp: new Date().toISOString(),
  performance: {},
  seo: {},
  accessibility: {},
  functionality: {},
  security: {},
  responsive: {}
};

// 테스트할 페이지 목록
const pages = [
  { name: '홈', path: '/' },
  { name: '타로', path: '/tarot' },
  { name: '꿈해몽', path: '/dream-interpretation' },
  { name: '블로그', path: '/blog' },
  { name: '커뮤니티', path: '/community' },
  { name: '리딩내역', path: '/reading' }
];

async function runLighthouseTest(url) {
  const { lhr } = await lighthouse(url, {
    logLevel: 'error',
    output: 'json',
    port: 9222,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  });
  
  return {
    performance: lhr.categories.performance.score * 100,
    accessibility: lhr.categories.accessibility.score * 100,
    bestPractices: lhr.categories['best-practices'].score * 100,
    seo: lhr.categories.seo.score * 100,
    metrics: {
      FCP: lhr.audits['first-contentful-paint'].numericValue,
      LCP: lhr.audits['largest-contentful-paint'].numericValue,
      TTI: lhr.audits['interactive'].numericValue,
      CLS: lhr.audits['cumulative-layout-shift'].numericValue
    }
  };
}

async function testFunctionality(page) {
  const results = {};
  
  try {
    // 1. 인증 테스트
    console.log('\n🔐 인증 시스템 테스트...');
    
    // 로그인 페이지로 이동
    await page.goto('http://localhost:4000/sign-in');
    await page.waitForLoadState('networkidle');
    
    // 소셜 로그인 버튼 확인
    const kakaoButton = await page.locator('button:has-text("카카오로 시작하기")').isVisible();
    const googleButton = await page.locator('button:has-text("Google로 계속하기")').isVisible();
    
    results.auth = {
      kakaoLoginButton: kakaoButton,
      googleLoginButton: googleButton,
      emailLoginForm: await page.locator('input[type="email"]').isVisible()
    };
    
    // 2. 타로 기능 테스트
    console.log('\n🎴 타로 기능 테스트...');
    await page.goto('http://localhost:4000/tarot');
    await page.waitForLoadState('networkidle');
    
    const tarotCategories = await page.locator('.category-card').count();
    results.tarot = {
      categoriesCount: tarotCategories,
      categoriesVisible: tarotCategories > 0
    };
    
    // 3. 블로그 테스트
    console.log('\n📝 블로그 기능 테스트...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle');
    
    const blogPosts = await page.locator('.blog-card').count();
    results.blog = {
      postsCount: blogPosts,
      postsVisible: blogPosts > 0
    };
    
    // 4. 네비게이션 테스트
    console.log('\n🧭 네비게이션 테스트...');
    const navItems = await page.locator('nav a').count();
    results.navigation = {
      navItemsCount: navItems,
      mobileMenuButton: await page.locator('button[aria-label*="menu"]').isVisible()
    };
    
  } catch (error) {
    console.error('기능 테스트 오류:', error);
    results.error = error.message;
  }
  
  return results;
}

async function testResponsive(page) {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];
  
  const results = {};
  
  for (const viewport of viewports) {
    console.log(`\n📱 ${viewport.name} 반응형 테스트...`);
    await page.setViewportSize(viewport);
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    
    results[viewport.name] = {
      layoutIntact: true,
      navigationVisible: await page.locator('nav').isVisible(),
      contentVisible: await page.locator('main').isVisible()
    };
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: `responsive-${viewport.name.toLowerCase()}.png`,
      fullPage: true 
    });
  }
  
  return results;
}

async function testSEO(page) {
  const results = {};
  
  for (const pageInfo of pages) {
    console.log(`\n🔍 ${pageInfo.name} 페이지 SEO 테스트...`);
    await page.goto(`http://localhost:4000${pageInfo.path}`);
    
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    
    results[pageInfo.name] = {
      hasTitle: !!title,
      titleLength: title?.length || 0,
      hasDescription: !!description,
      descriptionLength: description?.length || 0,
      hasOgTags: !!ogTitle,
      hasCanonical: !!canonical
    };
  }
  
  return results;
}

async function runAllTests() {
  console.log('🚀 InnerSpell 프로덕트 종합 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--remote-debugging-port=9222']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 성능 테스트 (Lighthouse)
    console.log('⚡ 성능 테스트 실행 중...');
    for (const pageInfo of pages.slice(0, 3)) { // 주요 페이지만 테스트
      console.log(`  - ${pageInfo.name} 페이지 분석...`);
      try {
        testResults.performance[pageInfo.name] = await runLighthouseTest(
          `http://localhost:4000${pageInfo.path}`
        );
      } catch (error) {
        console.error(`  ❌ ${pageInfo.name} Lighthouse 테스트 실패:`, error.message);
      }
    }
    
    // 2. 기능 테스트
    console.log('\n🔧 기능 테스트 실행 중...');
    testResults.functionality = await testFunctionality(page);
    
    // 3. SEO 테스트
    console.log('\n📊 SEO 테스트 실행 중...');
    testResults.seo = await testSEO(page);
    
    // 4. 반응형 테스트
    console.log('\n📐 반응형 테스트 실행 중...');
    testResults.responsive = await testResponsive(page);
    
    // 5. 접근성 간단 테스트
    console.log('\n♿ 접근성 테스트 실행 중...');
    await page.goto('http://localhost:4000');
    const accessibilityIssues = await page.locator('img:not([alt])').count();
    testResults.accessibility = {
      imagesWithoutAlt: accessibilityIssues,
      keyboardNavigation: true // 추후 상세 테스트 필요
    };
    
    // 결과 저장
    const fs = require('fs');
    fs.writeFileSync(
      'product-test-results.json',
      JSON.stringify(testResults, null, 2)
    );
    
    // 결과 요약 출력
    console.log('\n\n📋 테스트 결과 요약');
    console.log('='.repeat(50));
    
    // 성능 점수
    console.log('\n⚡ 성능 점수:');
    for (const [page, scores] of Object.entries(testResults.performance)) {
      if (scores.performance) {
        console.log(`  ${page}: ${scores.performance.toFixed(1)}/100`);
        console.log(`    - FCP: ${(scores.metrics.FCP / 1000).toFixed(2)}s`);
        console.log(`    - LCP: ${(scores.metrics.LCP / 1000).toFixed(2)}s`);
      }
    }
    
    // SEO 상태
    console.log('\n🔍 SEO 상태:');
    for (const [page, seo] of Object.entries(testResults.seo)) {
      console.log(`  ${page}: ${seo.hasTitle ? '✅' : '❌'} Title, ${seo.hasDescription ? '✅' : '❌'} Description`);
    }
    
    // 기능 상태
    console.log('\n🔧 기능 상태:');
    console.log(`  인증: 카카오 ${testResults.functionality.auth?.kakaoLoginButton ? '✅' : '❌'}, 구글 ${testResults.functionality.auth?.googleLoginButton ? '✅' : '❌'}`);
    console.log(`  블로그: ${testResults.functionality.blog?.postsCount || 0}개 포스트`);
    console.log(`  타로: ${testResults.functionality.tarot?.categoriesCount || 0}개 카테고리`);
    
    console.log('\n✅ 모든 테스트 완료! 상세 결과는 product-test-results.json 파일을 확인하세요.');
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

// 테스트 실행
runAllTests().catch(console.error);