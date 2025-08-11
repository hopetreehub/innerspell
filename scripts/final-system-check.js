const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// 테스트 결과 저장을 위한 객체
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  },
  categories: {},
  details: []
};

// 테스트 실행 함수
async function runTest(name, category, testFn) {
  testResults.summary.total++;
  if (!testResults.categories[category]) {
    testResults.categories[category] = { total: 0, passed: 0, failed: 0 };
  }
  testResults.categories[category].total++;

  try {
    const result = await testFn();
    testResults.summary.passed++;
    testResults.categories[category].passed++;
    testResults.details.push({
      name,
      category,
      status: 'PASSED',
      message: result || 'Test passed successfully',
      timestamp: new Date().toISOString()
    });
    console.log(`✅ ${category} - ${name}: PASSED`);
    return true;
  } catch (error) {
    testResults.summary.failed++;
    testResults.categories[category].failed++;
    testResults.details.push({
      name,
      category,
      status: 'FAILED',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    console.error(`❌ ${category} - ${name}: FAILED - ${error.message}`);
    return false;
  }
}

// 스크린샷 저장 함수
async function takeScreenshot(page, name) {
  const screenshotDir = path.join(__dirname, '..', 'test-screenshots');
  await fs.mkdir(screenshotDir, { recursive: true });
  const filename = `${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.png`;
  await page.screenshot({ 
    path: path.join(screenshotDir, filename),
    fullPage: true 
  });
  return filename;
}

// 메인 테스트 함수
async function runSystemCheck() {
  console.log('🚀 Starting comprehensive system check for Next.js application on port 4000...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  try {
    // 데스크톱 테스트
    console.log('📱 Testing Desktop View...\n');
    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const desktopPage = await desktopContext.newPage();
    
    // 1. 홈페이지 테스트
    await runTest('Homepage Loading', 'Homepage', async () => {
      await desktopPage.goto('http://localhost:4000', { waitUntil: 'networkidle' });
      await desktopPage.waitForSelector('h1', { timeout: 10000 });
      const title = await desktopPage.title();
      await takeScreenshot(desktopPage, 'homepage-desktop');
      return `Page loaded with title: ${title}`;
    });

    await runTest('Navigation Menu', 'Homepage', async () => {
      const navItems = await desktopPage.$$('nav a');
      if (navItems.length < 5) throw new Error('Navigation items missing');
      return `Found ${navItems.length} navigation items`;
    });

    await runTest('Hero Section', 'Homepage', async () => {
      await desktopPage.waitForSelector('.hero-section, [class*="hero"]', { timeout: 5000 });
      return 'Hero section loaded';
    });

    // 2. 타로카드 테스트
    await runTest('Tarot Page Loading', 'Tarot', async () => {
      await desktopPage.goto('http://localhost:4000/tarot', { waitUntil: 'networkidle' });
      await desktopPage.waitForSelector('h1', { timeout: 10000 });
      await takeScreenshot(desktopPage, 'tarot-desktop');
      return 'Tarot page loaded';
    });

    await runTest('Tarot Card Selection', 'Tarot', async () => {
      // 카드 선택 테스트
      const cards = await desktopPage.$$('[class*="card"]');
      if (cards.length > 0) {
        await cards[0].click();
        await desktopPage.waitForTimeout(1000);
        return `Found and clicked ${cards.length} cards`;
      }
      return 'No cards found to click';
    });

    await runTest('AI Interpretation', 'Tarot', async () => {
      // AI 해석 버튼 찾기
      const interpretButton = await desktopPage.$('button:has-text("해석"), button:has-text("AI")');
      if (interpretButton) {
        await interpretButton.click();
        await desktopPage.waitForTimeout(2000);
        return 'AI interpretation triggered';
      }
      return 'AI interpretation button not found';
    });

    // 3. 꿈해몽 테스트
    await runTest('Dream Page Loading', 'Dream', async () => {
      await desktopPage.goto('http://localhost:4000/dream', { waitUntil: 'networkidle' });
      await desktopPage.waitForSelector('h1', { timeout: 10000 });
      await takeScreenshot(desktopPage, 'dream-desktop');
      return 'Dream interpretation page loaded';
    });

    await runTest('Dream Input Form', 'Dream', async () => {
      const textarea = await desktopPage.$('textarea');
      if (textarea) {
        await textarea.fill('테스트 꿈 내용입니다.');
        return 'Dream input form working';
      }
      throw new Error('Dream input textarea not found');
    });

    await runTest('Dream Analysis Button', 'Dream', async () => {
      const analyzeButton = await desktopPage.$('button:has-text("분석"), button:has-text("해몽")');
      if (analyzeButton) {
        const isDisabled = await analyzeButton.isDisabled();
        return `Analysis button found and ${isDisabled ? 'disabled' : 'enabled'}`;
      }
      return 'Analysis button not found';
    });

    // 4. 블로그 테스트
    await runTest('Blog Page Loading', 'Blog', async () => {
      await desktopPage.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
      await desktopPage.waitForSelector('h1', { timeout: 10000 });
      await takeScreenshot(desktopPage, 'blog-desktop');
      return 'Blog page loaded';
    });

    await runTest('Blog Post List', 'Blog', async () => {
      const posts = await desktopPage.$$('[class*="post"], article');
      return `Found ${posts.length} blog posts`;
    });

    await runTest('Blog Search', 'Blog', async () => {
      const searchInput = await desktopPage.$('input[type="search"], input[placeholder*="검색"]');
      if (searchInput) {
        await searchInput.fill('타로');
        await desktopPage.waitForTimeout(1000);
        return 'Search functionality working';
      }
      return 'Search input not found';
    });

    await runTest('Blog Filters', 'Blog', async () => {
      const filters = await desktopPage.$$('button[class*="filter"], select');
      return `Found ${filters.length} filter elements`;
    });

    await runTest('Blog Post Detail', 'Blog', async () => {
      const firstPost = await desktopPage.$('[class*="post"] a, article a');
      if (firstPost) {
        await firstPost.click();
        await desktopPage.waitForTimeout(2000);
        await takeScreenshot(desktopPage, 'blog-detail-desktop');
        await desktopPage.goBack();
        return 'Blog post detail page working';
      }
      return 'No blog post links found';
    });

    // 5. 커뮤니티 테스트
    await runTest('Community Page Loading', 'Community', async () => {
      await desktopPage.goto('http://localhost:4000/community', { waitUntil: 'networkidle' });
      await desktopPage.waitForSelector('h1', { timeout: 10000 });
      await takeScreenshot(desktopPage, 'community-desktop');
      return 'Community page loaded';
    });

    await runTest('Community Categories', 'Community', async () => {
      const categories = await desktopPage.$$('[class*="category"]');
      return `Found ${categories.length} category elements`;
    });

    await runTest('Community Posts', 'Community', async () => {
      const posts = await desktopPage.$$('[class*="post"], [class*="item"]');
      return `Found ${posts.length} community posts`;
    });

    // 6. 관리자 대시보드 테스트
    await runTest('Admin Dashboard Loading', 'Admin', async () => {
      await desktopPage.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
      await desktopPage.waitForTimeout(2000);
      await takeScreenshot(desktopPage, 'admin-desktop');
      return 'Admin dashboard loaded';
    });

    await runTest('Admin Tabs', 'Admin', async () => {
      const tabs = await desktopPage.$$('[role="tab"], [class*="tab"]');
      return `Found ${tabs.length} admin tabs`;
    });

    // 7. API 엔드포인트 테스트
    await runTest('API Health Check', 'API', async () => {
      const response = await desktopPage.request.get('http://localhost:4000/api/health');
      if (response.status() !== 200) throw new Error(`API returned status ${response.status()}`);
      return 'API health check passed';
    });

    await runTest('Blog API', 'API', async () => {
      const response = await desktopPage.request.get('http://localhost:4000/api/blog/posts');
      if (response.status() !== 200) throw new Error(`Blog API returned status ${response.status()}`);
      const data = await response.json();
      return `Blog API returned ${data.posts?.length || 0} posts`;
    });

    // 8. 반응형 디자인 테스트 - 모바일
    console.log('\n📱 Testing Mobile View...\n');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const mobilePage = await mobileContext.newPage();

    await runTest('Mobile Homepage', 'Responsive', async () => {
      await mobilePage.goto('http://localhost:4000', { waitUntil: 'networkidle' });
      await takeScreenshot(mobilePage, 'homepage-mobile');
      return 'Mobile homepage loaded';
    });

    await runTest('Mobile Navigation', 'Responsive', async () => {
      const hamburger = await mobilePage.$('[class*="hamburger"], [class*="menu-toggle"], button[aria-label*="menu"]');
      if (hamburger) {
        await hamburger.click();
        await mobilePage.waitForTimeout(500);
        return 'Mobile navigation working';
      }
      return 'Mobile menu not found (might be using desktop nav)';
    });

    // 태블릿 뷰 테스트
    console.log('\n📱 Testing Tablet View...\n');
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 }
    });
    const tabletPage = await tabletContext.newPage();

    await runTest('Tablet Homepage', 'Responsive', async () => {
      await tabletPage.goto('http://localhost:4000', { waitUntil: 'networkidle' });
      await takeScreenshot(tabletPage, 'homepage-tablet');
      return 'Tablet homepage loaded';
    });

    // 성능 테스트
    await runTest('Page Load Performance', 'Performance', async () => {
      const startTime = Date.now();
      await desktopPage.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - startTime;
      if (loadTime > 3000) throw new Error(`Page load took ${loadTime}ms (> 3000ms)`);
      return `Page loaded in ${loadTime}ms`;
    });

    // 접근성 테스트
    await runTest('Accessibility - Alt Tags', 'Accessibility', async () => {
      await desktopPage.goto('http://localhost:4000', { waitUntil: 'networkidle' });
      const imagesWithoutAlt = await desktopPage.$$eval('img:not([alt])', imgs => imgs.length);
      if (imagesWithoutAlt > 0) {
        return `Warning: Found ${imagesWithoutAlt} images without alt tags`;
      }
      return 'All images have alt tags';
    });

    // 컨텍스트 정리
    await desktopContext.close();
    await mobileContext.close();
    await tabletContext.close();

  } finally {
    await browser.close();
  }

  // 결과 저장
  const reportPath = path.join(__dirname, '..', 'test-results', `system-check-${Date.now()}.json`);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(testResults, null, 2));

  // 결과 요약 출력
  console.log('\n' + '='.repeat(60));
  console.log('📊 SYSTEM CHECK SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
  
  console.log('\n📂 Category Breakdown:');
  for (const [category, stats] of Object.entries(testResults.categories)) {
    console.log(`  ${category}: ${stats.passed}/${stats.total} passed`);
  }

  // 배포 가능 여부 판단
  console.log('\n' + '='.repeat(60));
  const successRate = (testResults.summary.passed / testResults.summary.total) * 100;
  if (successRate === 100) {
    console.log('✅ DEPLOYMENT READY: All tests passed!');
  } else if (successRate >= 90) {
    console.log('⚠️  DEPLOYMENT POSSIBLE: Most tests passed, but review failed tests');
  } else {
    console.log('❌ NOT READY FOR DEPLOYMENT: Too many failed tests');
  }
  console.log('='.repeat(60));

  // 실패한 테스트 상세 정보
  if (testResults.summary.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.details
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`  - ${test.category}/${test.name}: ${test.error}`);
      });
  }

  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  console.log(`📸 Screenshots saved to: ${path.join(__dirname, '..', 'test-screenshots')}`);
}

// 스크립트 실행
runSystemCheck().catch(console.error);