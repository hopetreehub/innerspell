const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testBlogPageFinal() {
  console.log('=== InnerSpell 블로그 페이지 최종 Playwright 테스트 시작 ===');
  
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

    console.log('1. 메인 페이지 접근...');
    await page.goto('https://innerspell.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    await page.waitForTimeout(3000);
    console.log('2. 메인 페이지 스크린샷');
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-final-01-main.png'),
      fullPage: true 
    });

    // 페이지 내용 확인
    const bodyText = await page.locator('body').textContent();
    console.log('3. 메인 페이지 내용 확인');
    
    if (bodyText.includes('Log in to Vercel') || bodyText.includes('Unauthorized')) {
      console.log('   ⚠ 인증 오류: Vercel 배포에 인증이 활성화되어 있습니다');
      console.log('   → Vercel 프로젝트 설정에서 Password Protection이나 Vercel Authentication이 활성화된 상태입니다');
      
      // 인증 페이지 스크린샷
      await page.screenshot({ 
        path: path.join(screenshotDir, 'blog-final-02-auth-required.png'),
        fullPage: true 
      });
      
      console.log('\n=== 인증 문제로 인한 테스트 제한 ===');
      console.log('현재 Vercel 배포에 다음 중 하나가 활성화되어 있습니다:');
      console.log('1. Password Protection');
      console.log('2. Vercel Authentication (SSO)');
      console.log('3. 기타 접근 제한');
      console.log('\n해결 방법:');
      console.log('- Vercel 대시보드 → 프로젝트 설정 → Security에서 인증 설정 확인');
      console.log('- 또는 테스트용 공개 배포 URL 사용');
      
      return;
    }

    console.log('4. 블로그 페이지 직접 접근 시도');
    await page.goto('https://innerspell.vercel.app/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`   현재 URL: ${currentUrl}`);
    
    const pageTitle = await page.title();
    console.log(`   페이지 제목: ${pageTitle}`);

    console.log('5. 블로그 페이지 스크린샷');
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-final-03-blog-page.png'),
      fullPage: true 
    });

    // 블로그 페이지 내용 분석
    const blogPageText = await page.locator('body').textContent();
    
    if (blogPageText.includes('Log in to Vercel')) {
      console.log('   ⚠ 블로그 페이지도 인증이 필요합니다');
      return;
    }

    console.log('6. 블로그 페이지 요소 분석');
    
    // Featured 포스트 관련 요소 확인
    const featuredSelectors = [
      '[data-testid="featured-posts"]',
      '.featured-posts',
      'h2:has-text("주요 포스트")',
      'h2:has-text("Featured")',
      'text=🌟',
      'text=주요 포스트'
    ];
    
    let featuredFound = false;
    for (const selector of featuredSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`   ✓ Featured 섹션 발견: ${selector}`);
          featuredFound = true;
          break;
        }
      } catch (e) {
        // 요소 없음, 계속 진행
      }
    }
    
    console.log(`   Featured 섹션 상태: ${featuredFound ? '발견됨' : '미발견'}`);

    // 포스트 카드 확인
    const cardSelectors = ['article', '[class*="card"]', '.post', '[data-testid="post"]'];
    let totalCards = 0;
    
    for (const selector of cardSelectors) {
      try {
        const count = await page.locator(selector).count();
        totalCards += count;
      } catch (e) {
        // 선택자 오류 무시
      }
    }
    
    console.log(`   ✓ 총 포스트 카드: ${totalCards}개`);

    // 배지 요소 확인
    const badgeSelectors = ['text=⭐', 'text=추천', '[class*="badge"]', '.featured-badge'];
    let badgeCount = 0;
    
    for (const selector of badgeSelectors) {
      try {
        const count = await page.locator(selector).count();
        badgeCount += count;
      } catch (e) {
        // 선택자 오류 무시
      }
    }
    
    console.log(`   ✓ 배지 요소: ${badgeCount}개`);

    // 헤딩 요소들 확인
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('   페이지 헤딩 요소들:');
    headings.forEach((heading, index) => {
      if (heading.trim()) {
        console.log(`     ${index + 1}. ${heading.trim().substring(0, 50)}...`);
      }
    });

    // 반응형 테스트
    console.log('7. 반응형 디자인 테스트');
    
    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-final-04-tablet.png'),
      fullPage: true 
    });
    console.log('   ✓ 태블릿 뷰 스크린샷 완료');

    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-final-05-mobile.png'),
      fullPage: true 
    });
    console.log('   ✓ 모바일 뷰 스크린샷 완료');

    // 데스크톱으로 복귀
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);

    // 상호작용 테스트
    console.log('8. 상호작용 요소 테스트');
    
    // 버튼이나 링크 요소 찾기
    const interactiveElements = await page.locator('button, a[href], [role="button"]').count();
    console.log(`   ✓ 상호작용 요소: ${interactiveElements}개`);

    // 검색이나 필터 기능 확인
    const searchElements = await page.locator('input[type="search"], [placeholder*="검색"], [placeholder*="search"]').count();
    console.log(`   ✓ 검색 요소: ${searchElements}개`);

    // 최종 상태 스크린샷
    console.log('9. 최종 데스크톱 뷰 스크린샷');
    await page.screenshot({ 
      path: path.join(screenshotDir, 'blog-final-06-desktop-final.png'),
      fullPage: true 
    });

    console.log('\n=== 테스트 완료 ===');
    console.log('모든 스크린샷이 screenshots/ 디렉토리에 저장되었습니다.');

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'blog-final-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testBlogPageFinal().catch(console.error);