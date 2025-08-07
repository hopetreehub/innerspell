const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 브라우저 시작 및 블로그 페이지 접속...');
    
    // 블로그 페이지 접속
    await page.goto('http://localhost:4000/blog');
    console.log('✅ 블로그 페이지 로딩 완료');

    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 1. 초기 상태 스크린샷
    await page.screenshot({ path: 'test-screenshots/blog-sidebar-initial.png', fullPage: true });
    console.log('📸 초기 상태 스크린샷 완료');

    // 2. 사이드바 요소들 확인
    const popularPostsCard = await page.locator('[data-testid="popular-posts-card"]').first();
    const keyPostsCard = await page.locator('[data-testid="key-posts-card"]').first();
    
    if (await popularPostsCard.count() > 0) {
      console.log('✅ "인기 포스트" 카드 발견');
    } else {
      console.log('❌ "인기 포스트" 카드를 찾을 수 없음');
    }

    if (await keyPostsCard.count() > 0) {
      console.log('✅ "주요 포스트" 카드 발견');
    } else {
      console.log('❌ "주요 포스트" 카드를 찾을 수 없음');
    }

    // 3. 카드 위치 확인
    if (await popularPostsCard.count() > 0 && await keyPostsCard.count() > 0) {
      const popularBox = await popularPostsCard.boundingBox();
      const keyBox = await keyPostsCard.boundingBox();
      
      if (popularBox && keyBox) {
        console.log(`📍 인기 포스트 카드 위치: y=${popularBox.y}`);
        console.log(`📍 주요 포스트 카드 위치: y=${keyBox.y}`);
        
        if (popularBox.y < keyBox.y) {
          console.log('✅ 인기 포스트 카드가 위에, 주요 포스트 카드가 아래에 올바르게 배치됨');
        } else {
          console.log('❌ 카드 순서가 올바르지 않음');
        }
      }
    }

    // 4. 스크롤 테스트 - 천천히 스크롤하면서 sticky 동작 확인
    console.log('🔄 스크롤 테스트 시작...');
    
    // 작은 단위로 스크롤
    for (let i = 1; i <= 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 200));
      await page.waitForTimeout(1000);
      
      // 각 스크롤 단계에서 스크린샷
      await page.screenshot({ 
        path: `test-screenshots/blog-sidebar-scroll-${i}.png`, 
        fullPage: true 
      });
      console.log(`📸 스크롤 ${i * 200}px 스크린샷 완료`);
    }

    // 5. 더 많이 스크롤해서 카드가 겹치는지 확인
    console.log('🔄 추가 스크롤 테스트...');
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-screenshots/blog-sidebar-scroll-final.png', 
      fullPage: true 
    });
    console.log('📸 최종 스크롤 스크린샷 완료');

    // 6. CSS 스타일 확인
    if (await popularPostsCard.count() > 0) {
      const popularStyles = await popularPostsCard.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          zIndex: styles.zIndex,
          top: styles.top
        };
      });
      console.log('🎨 인기 포스트 카드 스타일:', popularStyles);
    }

    if (await keyPostsCard.count() > 0) {
      const keyStyles = await keyPostsCard.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          zIndex: styles.zIndex,
          top: styles.top
        };
      });
      console.log('🎨 주요 포스트 카드 스타일:', keyStyles);
    }

    // 맨 위로 스크롤
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    console.log('✅ 블로그 사이드바 레이아웃 테스트 완료');
    console.log('📂 스크린샷들은 test-screenshots/ 폴더에 저장되었습니다');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }

  // 브라우저는 수동으로 닫을 수 있도록 유지
  console.log('🔍 브라우저가 열린 상태로 유지됩니다. 수동으로 확인 후 터미널에서 Ctrl+C로 종료하세요.');
})();