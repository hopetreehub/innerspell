const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('블로그 페이지 접속 중...');
    
    // 블로그 페이지 접속
    await page.goto('http://localhost:4000/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 로딩이 완료될 때까지 대기
    await page.waitForTimeout(8000);
    
    // React 컴포넌트 상태 확인
    const componentData = await page.evaluate(() => {
      // React DevTools를 통한 디버깅
      const reactFiber = document.querySelector('#__next')?._reactRootContainer?._internalRoot?.current;
      
      // 카드 요소들 확인
      const cards = document.querySelectorAll('.overflow-hidden.hover\\:shadow-lg');
      const cardInfo = Array.from(cards).map(card => {
        const title = card.querySelector('h3')?.textContent || 'No title';
        const excerpt = card.querySelector('p')?.textContent || 'No excerpt';
        const category = card.querySelector('.badge')?.textContent || 'No category';
        return { title, excerpt, category };
      });
      
      // 렌더링된 요소들 확인
      const elements = {
        mainContainer: !!document.querySelector('.container.mx-auto'),
        gridContainer: !!document.querySelector('.grid.gap-6'),
        blogCards: cards.length,
        cardDetails: cardInfo,
        loadingIndicator: !!document.querySelector('.animate-pulse'),
        errorMessages: Array.from(document.querySelectorAll('[class*="error"]')).map(el => el.textContent),
        // BlogMainWithPagination 컴포넌트가 렌더링하는 특정 요소들
        blogTitle: document.querySelector('h1')?.textContent,
        searchInput: !!document.querySelector('input[placeholder*="검색"]'),
        pagination: !!document.querySelector('[aria-label*="pagination"]'),
        sidebarContent: {
          popularPosts: document.querySelector('h3')?.textContent?.includes('인기'),
          featuredPost: document.querySelectorAll('h3').length
        }
      };
      
      return elements;
    });
    
    console.log('\n=== 컴포넌트 렌더링 상태 ===');
    console.log(JSON.stringify(componentData, null, 2));
    
    // 스크린샷 촬영
    const screenshotPath = `blog-rendering-check-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    console.log(`\n스크린샷 저장: ${screenshotPath}`);
    
    // CSS 스타일 확인
    const styleInfo = await page.evaluate(() => {
      const firstCard = document.querySelector('.overflow-hidden.hover\\:shadow-lg');
      if (!firstCard) return { hasCard: false };
      
      const styles = window.getComputedStyle(firstCard);
      return {
        hasCard: true,
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        position: styles.position,
        width: styles.width,
        height: styles.height
      };
    });
    
    console.log('\n=== CSS 스타일 정보 ===');
    console.log(JSON.stringify(styleInfo, null, 2));
    
    // 페이지 소스 일부 확인
    const pageSource = await page.evaluate(() => {
      const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
      return mainContent.innerHTML.substring(0, 1000);
    });
    
    console.log('\n=== 페이지 소스 (처음 1000자) ===');
    console.log(pageSource);
    
    console.log('\n30초 동안 브라우저를 열어둡니다...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('에러 발생:', error);
    await page.screenshot({ 
      path: `blog-error-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();