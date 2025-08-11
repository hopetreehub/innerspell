const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('1. 블로그 페이지로 이동 중...');
    await page.goto('https://test-studio-firebase.vercel.app/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('2. 페이지 새로고침 (F5)...');
    await page.reload({ waitUntil: 'networkidle' });
    
    // 페이지 로드 완료 대기
    await page.waitForTimeout(3000);
    
    console.log('3. 블로그 포스트 확인 중...');
    
    // 블로그 포스트 카드 확인
    const postCards = await page.$$('article, .blog-card, [class*="post"], [class*="card"]');
    console.log(`발견된 포스트 카드 수: ${postCards.length}`);
    
    // 포스트 제목들 가져오기
    const titles = await page.$$eval('h2, h3, .title, [class*="title"]', elements => 
      elements.map(el => el.textContent.trim()).filter(text => text.length > 0)
    );
    console.log('포스트 제목들:', titles);
    
    // 포스트 내용 확인
    const contents = await page.$$eval('p, .content, [class*="description"], [class*="excerpt"]', elements => 
      elements.slice(0, 5).map(el => el.textContent.trim()).filter(text => text.length > 0)
    );
    console.log('포스트 내용 샘플:', contents);
    
    console.log('4. 이미지 확인 중...');
    const images = await page.$$('img');
    console.log(`발견된 이미지 수: ${images.length}`);
    
    // 이미지 src 확인
    const imageSrcs = await page.$$eval('img', imgs => 
      imgs.slice(0, 5).map(img => ({
        src: img.src,
        alt: img.alt,
        displayed: img.offsetWidth > 0 && img.offsetHeight > 0
      }))
    );
    console.log('이미지 정보:', imageSrcs);
    
    console.log('5. 필터와 검색 기능 확인 중...');
    
    // 검색 입력 필드 확인
    const searchInput = await page.$('input[type="search"], input[placeholder*="검색"], input[placeholder*="Search"]');
    if (searchInput) {
      console.log('검색 입력 필드 발견');
      
      // 검색 테스트
      await searchInput.type('test');
      await page.waitForTimeout(1000);
      
      // 검색 결과 확인
      const searchResults = await page.$$('article, .blog-card, [class*="post"]');
      console.log(`검색 후 표시된 포스트 수: ${searchResults.length}`);
      
      // 검색어 지우기
      await searchInput.click({ clickCount: 3 });
      await searchInput.press('Backspace');
      await page.waitForTimeout(1000);
    } else {
      console.log('검색 입력 필드를 찾을 수 없음');
    }
    
    // 필터 버튼들 확인
    const filterButtons = await page.$$('button, [role="button"], .filter, [class*="filter"]');
    console.log(`발견된 필터/버튼 수: ${filterButtons.length}`);
    
    // 버튼 텍스트 확인
    const buttonTexts = await page.$$eval('button, [role="button"]', buttons => 
      buttons.map(btn => btn.textContent.trim()).filter(text => text.length > 0)
    );
    console.log('버튼 텍스트:', buttonTexts);
    
    console.log('6. 스크린샷 캡처 중...');
    await page.screenshot({ 
      path: 'blog-page-current-state.png',
      fullPage: true 
    });
    console.log('전체 페이지 스크린샷 저장됨: blog-page-current-state.png');
    
    // 상단 부분만 스크린샷
    await page.screenshot({ 
      path: 'blog-page-top.png',
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    console.log('상단 스크린샷 저장됨: blog-page-top.png');
    
    // 페이지 HTML 구조 확인
    const pageStructure = await page.evaluate(() => {
      const main = document.querySelector('main, .main, [role="main"]');
      if (main) {
        return {
          tagName: main.tagName,
          className: main.className,
          childCount: main.children.length,
          innerHTML: main.innerHTML.substring(0, 500) + '...'
        };
      }
      return null;
    });
    console.log('메인 컨텐츠 구조:', pageStructure);
    
    // 콘솔 메시지 확인
    page.on('console', msg => console.log('브라우저 콘솔:', msg.text()));
    
    console.log('\n--- 상세 분석 완료 ---');
    console.log('브라우저를 열어둔 채로 대기 중... (30초 후 자동 종료)');
    
    // 사용자가 확인할 수 있도록 대기
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'blog-error-state.png' });
  } finally {
    await browser.close();
  }
})();