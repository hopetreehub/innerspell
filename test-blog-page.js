const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testBlogPage() {
  console.log('=== InnerSpell 블로그 페이지 Playwright 테스트 시작 ===');
  
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

    console.log('1. 블로그 페이지 로딩 중...');
    await page.goto('https://innerspell.vercel.app/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // 페이지 로딩 대기
    await page.waitForTimeout(3000);

    console.log('2. 초기 페이지 스크린샷 촬영');
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-01-initial-load.png'),
      fullPage: true 
    });

    // Featured 포스트 섹션 확인
    console.log('3. Featured 포스트 섹션 확인');
    const featuredSection = await page.locator('text=🌟 주요 포스트').first();
    const isFeaturedHeaderVisible = await featuredSection.isVisible();
    console.log(`   ✓ Featured 헤더 표시: ${isFeaturedHeaderVisible}`);

    // Featured 배지 확인
    const featuredBadges = await page.locator('text=⭐ 추천').count();
    console.log(`   ✓ Featured 배지 개수: ${featuredBadges}개`);

    // 일반 포스트 섹션 확인
    const allPostsSection = await page.locator('text=📝 모든 포스트').first();
    const isAllPostsHeaderVisible = await allPostsSection.isVisible();
    console.log(`   ✓ 모든 포스트 헤더 표시: ${isAllPostsHeaderVisible}`);

    // 포스트 카드들 확인
    await page.waitForSelector('[class*="card"], .post-card, article', { timeout: 10000 });
    const postCards = await page.locator('article, [class*="card"], .post-card').count();
    console.log(`   ✓ 총 포스트 카드 개수: ${postCards}개`);

    console.log('4. 데스크톱 뷰 상세 스크린샷');
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-02-desktop-detailed.png'),
      fullPage: true 
    });

    // 카드 호버 효과 테스트
    console.log('5. 카드 호버 효과 테스트');
    const firstCard = page.locator('article, [class*="card"], .post-card').first();
    if (await firstCard.isVisible()) {
      await firstCard.hover();
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: path.join(screenshotDir, 'blog-03-card-hover.png'),
        fullPage: true 
      });
    }

    // 태블릿 뷰 테스트
    console.log('6. 태블릿 뷰 테스트');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-04-tablet-view.png'),
      fullPage: true 
    });

    // 모바일 뷰 테스트
    console.log('7. 모바일 뷰 테스트');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-05-mobile-view.png'),
      fullPage: true 
    });

    // 데스크톱으로 다시 변경
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);

    // 카테고리 필터 테스트
    console.log('8. 카테고리 필터 기능 테스트');
    const categoryButtons = await page.locator('button[class*="category"], .category-filter, [data-category]').count();
    console.log(`   ✓ 카테고리 버튼 개수: ${categoryButtons}개`);
    
    if (categoryButtons > 0) {
      const firstCategoryButton = page.locator('button[class*="category"], .category-filter, [data-category]').first();
      if (await firstCategoryButton.isVisible()) {
        await firstCategoryButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ 
          path: path.join(screenshotDir, 'blog-06-category-filter.png'),
          fullPage: true 
        });
      }
    }

    // 페이지네이션 테스트
    console.log('9. 페이지네이션 기능 테스트');
    const paginationElements = await page.locator('[class*="pagination"], .pagination, button[class*="page"]').count();
    console.log(`   ✓ 페이지네이션 요소 개수: ${paginationElements}개`);

    if (paginationElements > 0) {
      await page.screenshot({ 
        path: path.join(screenshotDir, 'blog-07-pagination.png'),
        fullPage: true 
      });
    }

    // Featured와 일반 포스트 순서 확인
    console.log('10. 포스트 순서 및 구조 분석');
    const allElements = await page.locator('h2, h3, article, [class*="card"]').allTextContents();
    console.log('   페이지 구조:');
    allElements.forEach((text, index) => {
      if (text.includes('주요 포스트') || text.includes('모든 포스트') || text.includes('추천')) {
        console.log(`   ${index + 1}. ${text.substring(0, 50)}...`);
      }
    });

    // 최종 전체 페이지 스크린샷
    console.log('11. 최종 전체 페이지 스크린샷');
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-08-final-state.png'),
      fullPage: true 
    });

    // 페이지 성능 및 로딩 상태 확인
    console.log('12. 페이지 성능 확인');
    const performanceEntries = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: entries.loadEventEnd - entries.loadEventStart,
        domContentLoaded: entries.domContentLoadedEventEnd - entries.domContentLoadedEventStart,
        totalTime: entries.loadEventEnd - entries.fetchStart
      };
    });
    
    console.log(`   ✓ 페이지 로드 시간: ${performanceEntries.loadTime}ms`);
    console.log(`   ✓ DOM 로드 시간: ${performanceEntries.domContentLoaded}ms`);
    console.log(`   ✓ 총 로딩 시간: ${performanceEntries.totalTime}ms`);

    console.log('\n=== 테스트 완료 ===');
    console.log('스크린샷이 screenshots/ 디렉토리에 저장되었습니다.');

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'blog-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testBlogPage().catch(console.error);