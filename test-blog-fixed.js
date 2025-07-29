const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testBlogPageFixed() {
  console.log('=== InnerSpell 블로그 페이지 (수정된) Playwright 테스트 시작 ===');
  
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

    console.log('1. 메인 페이지로 먼저 접근...');
    await page.goto('https://innerspell.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    await page.waitForTimeout(3000);
    console.log('2. 메인 페이지 스크린샷');
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-fixed-01-main-page.png'),
      fullPage: true 
    });

    // 블로그 링크 찾기 및 클릭
    console.log('3. 블로그 링크 찾기...');
    const blogLink = page.locator('a[href*="blog"], text=블로그, text=Blog').first();
    if (await blogLink.isVisible()) {
      console.log('   ✓ 블로그 링크 발견, 클릭 시도');
      await blogLink.click();
      await page.waitForTimeout(3000);
    } else {
      console.log('   ⚠ 블로그 링크 미발견, 직접 URL로 접근 시도');
      await page.goto('https://innerspell.vercel.app/blog');
      await page.waitForTimeout(3000);
    }

    console.log('4. 현재 페이지 URL 확인');
    const currentUrl = page.url();
    console.log(`   현재 URL: ${currentUrl}`);

    console.log('5. 블로그 페이지 상태 스크린샷');
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-fixed-02-blog-page.png'),
      fullPage: true 
    });

    // 페이지 제목 확인
    const pageTitle = await page.title();
    console.log(`   페이지 제목: ${pageTitle}`);

    // 페이지 내용 확인
    console.log('6. 페이지 내용 분석');
    const bodyText = await page.locator('body').textContent();
    
    if (bodyText.includes('Log in to Vercel') || bodyText.includes('Unauthorized')) {
      console.log('   ⚠ 인증 오류: Vercel 로그인 필요');
      console.log('   → 배포 설정에서 인증이 활성화되어 있는 것 같습니다.');
    } else {
      // Featured 포스트 섹션 확인
      console.log('7. Featured 포스트 섹션 확인');
      const featuredElements = [
        'text=🌟 주요 포스트',
        'text=주요 포스트',
        'text=Featured',
        '[class*="featured"]',
        '.featured'
      ];
      
      let featuredFound = false;
      for (const selector of featuredElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`   ✓ Featured 섹션 발견: ${selector}`);
          featuredFound = true;
          break;
        }
      }
      
      if (!featuredFound) {
        console.log('   ✗ Featured 섹션을 찾을 수 없습니다');
      }

      // Featured 배지 확인
      const badgeSelectors = [
        'text=⭐ 추천',
        'text=추천',
        'text=Featured',
        '[class*="badge"]',
        '.badge'
      ];
      
      let badgeCount = 0;
      for (const selector of badgeSelectors) {
        const count = await page.locator(selector).count();
        badgeCount += count;
      }
      console.log(`   ✓ 배지 요소 총 개수: ${badgeCount}개`);

      // 포스트 카드 확인
      const cardSelectors = [
        'article',
        '[class*="card"]',
        '.post-card',
        '.blog-post',
        '[class*="post"]'
      ];
      
      let totalCards = 0;
      for (const selector of cardSelectors) {
        const count = await page.locator(selector).count();
        totalCards += count;
      }
      console.log(`   ✓ 포스트 카드 총 개수: ${totalCards}개`);

      // 모든 포스트 섹션 확인
      const allPostsElements = [
        'text=📝 모든 포스트',
        'text=모든 포스트',
        'text=All Posts'
      ];
      
      let allPostsFound = false;
      for (const selector of allPostsElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`   ✓ 모든 포스트 섹션 발견: ${selector}`);
          allPostsFound = true;
          break;
        }
      }
      
      if (!allPostsFound) {
        console.log('   ✗ 모든 포스트 섹션을 찾을 수 없습니다');
      }
    }

    // 반응형 테스트 (태블릿)
    console.log('8. 태블릿 뷰 테스트');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-fixed-03-tablet.png'),
      fullPage: true 
    });

    // 반응형 테스트 (모바일)
    console.log('9. 모바일 뷰 테스트');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-fixed-04-mobile.png'),
      fullPage: true 
    });

    // 데스크톱으로 복귀
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);

    // 최종 상태 스크린샷
    console.log('10. 최종 상태 스크린샷');
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-fixed-05-final.png'),
      fullPage: true 
    });

    console.log('\n=== 테스트 완료 ===');
    console.log('스크린샷이 screenshots/ 디렉토리에 저장되었습니다.');

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'blog-fixed-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testBlogPageFixed().catch(console.error);