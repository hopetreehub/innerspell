const { chromium } = require('playwright');
const fs = require('fs');

// 테스트 결과 저장 객체
const testResults = {
  timestamp: new Date().toISOString(),
  performance: {},
  seo: {},
  functionality: {},
  responsive: {},
  summary: {}
};

// 테스트할 페이지 목록
const pages = [
  { name: '홈', path: '/' },
  { name: '타로', path: '/tarot' },
  { name: '꿈해몽', path: '/dream-interpretation' },
  { name: '블로그', path: '/blog' },
  { name: '커뮤니티', path: '/community' }
];

async function measurePageLoad(page, url) {
  const startTime = Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });
  const loadTime = Date.now() - startTime;
  
  // 페이지 크기 측정
  const metrics = await page.evaluate(() => {
    const getSize = (html) => new Blob([html]).size;
    return {
      htmlSize: getSize(document.documentElement.outerHTML),
      scripts: document.querySelectorAll('script').length,
      styles: document.querySelectorAll('link[rel="stylesheet"]').length,
      images: document.querySelectorAll('img').length
    };
  });
  
  return { loadTime, ...metrics };
}

async function testFunctionality(page) {
  const results = {};
  
  try {
    // 1. 인증 시스템 테스트
    console.log('\n🔐 인증 시스템 테스트...');
    await page.goto('http://localhost:4000/sign-in');
    await page.waitForLoadState('networkidle');
    
    // 소셜 로그인 버튼 확인
    const kakaoButton = await page.locator('button:has-text("카카오로 시작하기")').count();
    const googleButton = await page.locator('button:has-text("Google로 계속하기")').count();
    const emailInput = await page.locator('input[type="email"]').count();
    
    results.auth = {
      kakaoLoginButton: kakaoButton > 0,
      googleLoginButton: googleButton > 0,
      emailLoginForm: emailInput > 0
    };
    
    // 2. 타로 기능 테스트
    console.log('🎴 타로 기능 테스트...');
    await page.goto('http://localhost:4000/tarot');
    await page.waitForLoadState('networkidle');
    
    const tarotCategories = await page.locator('.category-card').count();
    results.tarot = {
      categoriesCount: tarotCategories,
      categoriesVisible: tarotCategories > 0
    };
    
    // 3. 블로그 테스트
    console.log('📝 블로그 기능 테스트...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 데이터 로드 대기
    
    const blogPosts = await page.locator('.blog-card').count();
    const categories = await page.locator('[role="tab"]').count();
    
    results.blog = {
      postsCount: blogPosts,
      postsVisible: blogPosts > 0,
      categoriesCount: categories
    };
    
    // 4. 네비게이션 테스트
    console.log('🧭 네비게이션 테스트...');
    const desktopNav = await page.locator('nav.hidden.lg\\:flex a').count();
    const mobileMenuButton = await page.locator('button[aria-label*="menu"], button:has-text("메뉴")').count();
    
    results.navigation = {
      desktopNavItems: desktopNav,
      hasMobileMenu: mobileMenuButton > 0
    };
    
  } catch (error) {
    console.error('기능 테스트 오류:', error);
    results.error = error.message;
  }
  
  return results;
}

async function testSEO(page) {
  const results = {};
  
  for (const pageInfo of pages) {
    console.log(`🔍 ${pageInfo.name} 페이지 SEO 테스트...`);
    await page.goto(`http://localhost:4000${pageInfo.path}`);
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
    const h1Count = await page.locator('h1').count();
    
    results[pageInfo.name] = {
      hasTitle: !!title && title.length > 0,
      titleLength: title?.length || 0,
      hasDescription: !!description,
      descriptionLength: description?.length || 0,
      hasOgTags: !!ogTitle,
      h1Count: h1Count
    };
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
    console.log(`📱 ${viewport.name} 반응형 테스트...`);
    await page.setViewportSize(viewport);
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    
    const mainContent = await page.locator('main').count();
    const navigation = await page.locator('nav').count();
    
    results[viewport.name] = {
      hasMainContent: mainContent > 0,
      hasNavigation: navigation > 0,
      viewport: viewport
    };
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: `test-responsive-${viewport.name.toLowerCase()}.png`,
      fullPage: false 
    });
  }
  
  return results;
}

async function runAllTests() {
  console.log('🚀 InnerSpell 프로덕트 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 성능 테스트 (페이지 로드 시간)
    console.log('⚡ 성능 테스트 실행 중...');
    for (const pageInfo of pages) {
      console.log(`  - ${pageInfo.name} 페이지 측정...`);
      const perf = await measurePageLoad(page, `http://localhost:4000${pageInfo.path}`);
      testResults.performance[pageInfo.name] = perf;
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
    console.log('\n♿ 접근성 기본 테스트...');
    await page.goto('http://localhost:4000');
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    const buttonsWithoutText = await page.locator('button:not(:has-text(""))').count();
    
    testResults.accessibility = {
      imagesWithoutAlt: imagesWithoutAlt,
      totalImages: await page.locator('img').count(),
      buttons: buttonsWithoutText
    };
    
    // 결과 요약 생성
    testResults.summary = {
      totalPages: pages.length,
      avgLoadTime: Object.values(testResults.performance).reduce((sum, p) => sum + p.loadTime, 0) / pages.length,
      authSystemOK: testResults.functionality.auth?.kakaoLoginButton && testResults.functionality.auth?.googleLoginButton,
      blogPostsFound: testResults.functionality.blog?.postsCount > 0,
      responsiveOK: Object.values(testResults.responsive).every(r => r.hasMainContent && r.hasNavigation),
      seoBasicsOK: Object.values(testResults.seo).every(s => s.hasTitle && s.titleLength > 0)
    };
    
    // 결과 저장
    fs.writeFileSync(
      'product-test-results.json',
      JSON.stringify(testResults, null, 2)
    );
    
    // 결과 요약 출력
    console.log('\n\n📋 테스트 결과 요약');
    console.log('='.repeat(50));
    
    // 성능
    console.log('\n⚡ 페이지 로드 성능:');
    for (const [pageName, perf] of Object.entries(testResults.performance)) {
      console.log(`  ${pageName}: ${(perf.loadTime / 1000).toFixed(2)}초 (HTML: ${(perf.htmlSize / 1024).toFixed(1)}KB)`);
    }
    console.log(`  평균 로드 시간: ${(testResults.summary.avgLoadTime / 1000).toFixed(2)}초`);
    
    // 기능
    console.log('\n🔧 기능 상태:');
    console.log(`  ✅ 카카오 로그인: ${testResults.functionality.auth?.kakaoLoginButton ? '정상' : '문제'}`);
    console.log(`  ✅ 구글 로그인: ${testResults.functionality.auth?.googleLoginButton ? '정상' : '문제'}`);
    console.log(`  ✅ 블로그 포스트: ${testResults.functionality.blog?.postsCount || 0}개`);
    console.log(`  ✅ 타로 카테고리: ${testResults.functionality.tarot?.categoriesCount || 0}개`);
    
    // SEO
    console.log('\n🔍 SEO 상태:');
    let seoScore = 0;
    for (const [pageName, seo] of Object.entries(testResults.seo)) {
      const score = (seo.hasTitle ? 1 : 0) + (seo.hasDescription ? 1 : 0) + (seo.hasOgTags ? 1 : 0);
      seoScore += score;
      console.log(`  ${pageName}: ${score}/3 (Title: ${seo.hasTitle ? '✅' : '❌'}, Desc: ${seo.hasDescription ? '✅' : '❌'}, OG: ${seo.hasOgTags ? '✅' : '❌'})`);
    }
    
    // 반응형
    console.log('\n📱 반응형 디자인:');
    for (const [device, responsive] of Object.entries(testResults.responsive)) {
      console.log(`  ${device}: ${responsive.hasMainContent && responsive.hasNavigation ? '✅ 정상' : '❌ 문제'}`);
    }
    
    // 접근성
    console.log('\n♿ 접근성:');
    console.log(`  이미지 alt 텍스트: ${testResults.accessibility.totalImages - testResults.accessibility.imagesWithoutAlt}/${testResults.accessibility.totalImages}`);
    
    // 전체 점수
    console.log('\n🎯 전체 평가:');
    const overallScore = {
      performance: testResults.summary.avgLoadTime < 3000 ? '우수' : testResults.summary.avgLoadTime < 5000 ? '양호' : '개선필요',
      functionality: testResults.summary.authSystemOK && testResults.summary.blogPostsFound ? '정상' : '문제있음',
      seo: seoScore >= pages.length * 2 ? '양호' : '개선필요',
      responsive: testResults.summary.responsiveOK ? '정상' : '문제있음'
    };
    
    console.log(`  - 성능: ${overallScore.performance}`);
    console.log(`  - 기능: ${overallScore.functionality}`);
    console.log(`  - SEO: ${overallScore.seo}`);
    console.log(`  - 반응형: ${overallScore.responsive}`);
    
    console.log('\n✅ 테스트 완료! 상세 결과는 product-test-results.json 파일을 확인하세요.');
    
    // 브라우저는 10초간 열어둠
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

// 테스트 실행
runAllTests().catch(console.error);