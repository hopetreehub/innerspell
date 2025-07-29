const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testBlogPageLocal() {
  console.log('=== InnerSpell 블로그 페이지 로컬 테스트 시작 ===');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    // 스크린샷 저장 디렉토리 생성
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    console.log('1. 로컬 블로그 페이지 접근...');
    await page.goto('http://localhost:4000/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    await page.waitForTimeout(5000); // 충분한 로딩 시간

    console.log('2. 초기 블로그 페이지 스크린샷');
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-local-01-initial.png'),
      fullPage: true 
    });

    const pageTitle = await page.title();
    console.log(`   페이지 제목: ${pageTitle}`);

    // Featured 포스트 섹션 확인
    console.log('3. Featured 포스트 섹션 확인');
    const featuredHeader = await page.locator('text=🌟 주요 포스트').first();
    const isFeaturedVisible = await featuredHeader.isVisible().catch(() => false);
    console.log(`   ✓ "🌟 주요 포스트" 헤더 표시: ${isFeaturedVisible}`);

    // Featured 포스트 대안 검색
    const altFeaturedSelectors = [
      'text=주요 포스트',
      'text=Featured Posts',
      'h2:has-text("주요")',
      '[data-testid*="featured"]',
      '.featured-section'
    ];

    let featuredFound = false;
    for (const selector of altFeaturedSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`   ✓ Featured 섹션 발견: ${selector}`);
          featuredFound = true;
          break;
        }
      } catch (e) {
        // 계속 시도
      }
    }

    // Featured 배지 확인
    console.log('4. Featured 배지 확인');
    const featuredBadgeSelectors = [
      'text=⭐ 추천',
      'text=⭐',
      'text=추천',
      '.featured-badge',
      '[data-featured="true"]'
    ];

    let badgeCount = 0;
    for (const selector of featuredBadgeSelectors) {
      try {
        const count = await page.locator(selector).count();
        badgeCount += count;
        if (count > 0) {
          console.log(`   ✓ "${selector}" 배지 ${count}개 발견`);
        }
      } catch (e) {
        // 계속 시도
      }
    }
    console.log(`   ✓ 총 Featured 배지 개수: ${badgeCount}개`);

    // 일반 포스트 섹션 확인
    console.log('5. 일반 포스트 섹션 확인');
    const allPostsHeader = await page.locator('text=📝 모든 포스트').first();
    const isAllPostsVisible = await allPostsHeader.isVisible().catch(() => false);
    console.log(`   ✓ "📝 모든 포스트" 헤더 표시: ${isAllPostsVisible}`);

    // 포스트 카드 확인
    console.log('6. 포스트 카드 분석');
    const cardSelectors = [
      'article',
      '[class*="card"]',
      '.post-card',
      '[data-testid*="post"]',
      '.blog-post'
    ];

    let totalCards = 0;
    for (const selector of cardSelectors) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`   ✓ "${selector}" 카드 ${count}개`);
          totalCards += count;
        }
      } catch (e) {
        // 계속 시도
      }
    }
    console.log(`   ✓ 총 포스트 카드: ${totalCards}개`);

    // 페이지 구조 분석
    console.log('7. 페이지 구조 분석');
    const headings = await page.locator('h1, h2, h3, h4').allTextContents();
    console.log('   페이지 헤딩 구조:');
    headings.forEach((heading, index) => {
      if (heading.trim()) {
        console.log(`     ${index + 1}. ${heading.trim()}`);
      }
    });

    // 상세 스크린샷
    console.log('8. 데스크톱 상세 스크린샷');
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-local-02-desktop-detailed.png'),
      fullPage: true 
    });

    // 카드 호버 효과 테스트
    console.log('9. 카드 호버 효과 테스트');
    const firstCard = page.locator('article, [class*="card"]').first();
    if (await firstCard.isVisible().catch(() => false)) {
      try {
        await firstCard.hover({ timeout: 5000 });
        await page.waitForTimeout(1000);
        await page.screenshot({ 
          path: path.join(screenshotDir, 'blog-local-03-card-hover.png'),
          fullPage: true 
        });
        console.log('   ✓ 카드 호버 효과 테스트 완료');
      } catch (e) {
        console.log('   ⚠ 카드 호버 효과 테스트 실패:', e.message);
      }
    }

    // 반응형 테스트 - 태블릿
    console.log('10. 태블릿 뷰 테스트');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-local-04-tablet.png'),
      fullPage: true 
    });

    // 반응형 테스트 - 모바일
    console.log('11. 모바일 뷰 테스트');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-local-05-mobile.png'),
      fullPage: true 
    });

    // 데스크톱으로 복귀
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);

    // 상호작용 요소 테스트
    console.log('12. 상호작용 요소 분석');
    const buttons = await page.locator('button').count();
    const links = await page.locator('a[href]').count();
    const forms = await page.locator('form, input').count();
    
    console.log(`   ✓ 버튼: ${buttons}개`);
    console.log(`   ✓ 링크: ${links}개`);
    console.log(`   ✓ 폼 요소: ${forms}개`);

    // 카테고리 필터 기능 확인
    console.log('13. 카테고리 필터 기능 확인');
    const categoryElements = await page.locator('[data-category], .category-filter, button[class*="category"]').count();
    console.log(`   ✓ 카테고리 요소: ${categoryElements}개`);

    // 페이지네이션 확인
    console.log('14. 페이지네이션 확인');
    const paginationElements = await page.locator('[class*="pagination"], .pagination, [data-testid*="pagination"]').count();
    console.log(`   ✓ 페이지네이션 요소: ${paginationElements}개`);

    // 최종 데스크톱 스크린샷
    console.log('15. 최종 데스크톱 스크린샷');
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-local-06-final.png'),
      fullPage: true 
    });

    // 페이지 성능 측정
    console.log('16. 페이지 성능 측정');
    const performanceEntries = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: Math.round(entries.loadEventEnd - entries.loadEventStart),
        domContentLoaded: Math.round(entries.domContentLoadedEventEnd - entries.domContentLoadedEventStart),
        totalTime: Math.round(entries.loadEventEnd - entries.fetchStart)
      };
    });
    
    console.log(`   ✓ 페이지 로드 시간: ${performanceEntries.loadTime}ms`);
    console.log(`   ✓ DOM 로드 시간: ${performanceEntries.domContentLoaded}ms`);
    console.log(`   ✓ 총 로딩 시간: ${performanceEntries.totalTime}ms`);

    console.log('\n=== 로컬 테스트 완료 ===');
    console.log('모든 스크린샷이 screenshots/ 디렉토리에 저장되었습니다.');

    // 종합 결과 정리
    console.log('\n=== 테스트 결과 요약 ===');
    console.log(`Featured 포스트 섹션: ${featuredFound ? '✓ 발견됨' : '✗ 미발견'}`);
    console.log(`Featured 배지: ${badgeCount}개`);
    console.log(`총 포스트 카드: ${totalCards}개`);
    console.log(`모든 포스트 섹션: ${isAllPostsVisible ? '✓ 발견됨' : '✗ 미발견'}`);

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'blog-local-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testBlogPageLocal().catch(console.error);