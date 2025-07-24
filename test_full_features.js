const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  console.log('=== InnerSpell 포트 4000 전체 기능 테스트 시작 ===\n');
  
  try {
    // 1. 메인 페이지 테스트
    console.log('1. 메인 페이지 테스트');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    
    // 히어로 섹션 확인
    const heroTitle = await page.$eval('h1', el => el.textContent);
    console.log(`✓ 히어로 타이틀: ${heroTitle}`);
    
    // CTA 버튼 확인
    const ctaButtons = await page.$$('button:has-text("타로읽기"), a:has-text("타로읽기")');
    console.log(`✓ CTA 버튼 개수: ${ctaButtons.length}`);
    
    await page.screenshot({ path: 'screenshots/test_main_4000.png' });
    
    // 2. 타로 리딩 페이지 테스트
    console.log('\n2. 타로 리딩 페이지 테스트');
    await page.goto('http://localhost:4000/tarot-reading');
    await page.waitForLoadState('networkidle');
    
    // 타로 스프레드 옵션 확인
    const spreadOptions = await page.$$('[class*="spread"]');
    console.log(`✓ 타로 스프레드 옵션: ${spreadOptions.length}개`);
    
    await page.screenshot({ path: 'screenshots/test_tarot_reading_4000.png' });
    
    // 3. 꿈해몽 페이지 테스트
    console.log('\n3. 꿈해몽 페이지 테스트');
    await page.goto('http://localhost:4000/dream-interpretation');
    await page.waitForLoadState('networkidle');
    
    const dreamInput = await page.$('textarea, input[type="text"]');
    console.log(`✓ 꿈 입력 필드: ${dreamInput ? '있음' : '없음'}`);
    
    await page.screenshot({ path: 'screenshots/test_dream_4000.png' });
    
    // 4. 블로그 페이지 테스트
    console.log('\n4. 블로그 페이지 테스트');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle');
    
    const blogPosts = await page.$$('article, [class*="post"], [class*="blog-item"]');
    console.log(`✓ 블로그 포스트 개수: ${blogPosts.length}`);
    
    await page.screenshot({ path: 'screenshots/test_blog_4000.png' });
    
    // 5. 커뮤니티 섹션별 테스트
    console.log('\n5. 커뮤니티 섹션별 테스트');
    
    // 자유 토론
    await page.goto('http://localhost:4000/community');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/test_community_main_4000.png' });
    
    // 토론 참여하기 버튼 클릭
    const discussionButton = await page.$('button:has-text("토론 참여하기")');
    if (discussionButton) {
      await discussionButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/test_community_discussion_4000.png' });
      console.log('✓ 자유 토론 버튼 클릭 성공');
    }
    
    // 6. API 헬스 체크
    console.log('\n6. API 엔드포인트 테스트');
    const healthResponse = await page.evaluate(async () => {
      const res = await fetch('http://localhost:4000/api/health');
      return res.json();
    });
    console.log(`✓ Health API 상태: ${healthResponse.status}`);
    console.log(`✓ 서버 버전: ${healthResponse.version}`);
    console.log(`✓ 데이터베이스 상태: ${healthResponse.services.database}`);
    console.log(`✓ AI 서비스 상태: ${healthResponse.services.ai}`);
    
    // 7. 반응형 디자인 테스트
    console.log('\n7. 반응형 디자인 테스트');
    
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/test_mobile_4000.png' });
    console.log('✓ 모바일 뷰 스크린샷 완료');
    
    // 태블릿 뷰포트
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/test_tablet_4000.png' });
    console.log('✓ 태블릿 뷰 스크린샷 완료');
    
    // 8. 성능 메트릭 수집
    console.log('\n8. 성능 메트릭');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:4000');
    
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    console.log(`✓ DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`✓ Load Complete: ${metrics.loadComplete}ms`);
    console.log(`✓ First Paint: ${metrics.firstPaint}ms`);
    console.log(`✓ First Contentful Paint: ${metrics.firstContentfulPaint}ms`);
    
    console.log('\n=== 모든 테스트 완료 ===');
    console.log('스크린샷이 screenshots 폴더에 저장되었습니다.');
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'screenshots/error_screenshot.png' });
  } finally {
    await browser.close();
  }
})();