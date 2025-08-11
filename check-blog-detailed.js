const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 로그 캡처
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
  });
  
  // 네트워크 요청 캡처
  page.on('request', request => {
    if (request.url().includes('/api/') || request.url().includes('blog')) {
      console.log(`[NETWORK REQUEST] ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/') || response.url().includes('blog')) {
      console.log(`[NETWORK RESPONSE] ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('📍 Navigating to blog page...');
    const response = await page.goto('http://localhost:4000/blog', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log(`📄 Initial response status: ${response.status()}`);
    
    // 스피너가 사라질 때까지 기다리기
    console.log('⏳ Waiting for spinner to disappear...');
    try {
      await page.waitForSelector('.animate-spin', { 
        state: 'hidden', 
        timeout: 10000 
      });
      console.log('✅ Spinner disappeared');
    } catch (e) {
      console.log('⚠️ Spinner timeout or not found');
    }
    
    // 페이지 로드 완료 대기
    await page.waitForLoadState('networkidle');
    console.log('✅ Network idle reached');
    
    // DOM 요소 확인
    console.log('\n🔍 Checking DOM elements...');
    
    // 블로그 헤더
    const header = await page.$('h1');
    if (header) {
      const text = await header.textContent();
      console.log(`✅ Header found: "${text}"`);
    }
    
    // 블로그 포스트 그리드
    const grid = await page.$('.grid');
    if (grid) {
      console.log('✅ Grid container found');
      const gridHTML = await grid.innerHTML();
      console.log(`   Grid HTML length: ${gridHTML.length} characters`);
      
      // 그리드 내부 요소들
      const children = await grid.$$('> *');
      console.log(`   Grid children count: ${children.length}`);
      
      if (children.length > 0) {
        for (let i = 0; i < Math.min(children.length, 3); i++) {
          const child = children[i];
          const className = await child.getAttribute('class');
          const tagName = await child.evaluate(el => el.tagName);
          console.log(`   Child ${i + 1}: <${tagName}> class="${className}"`);
        }
      }
    }
    
    // 빈 상태 확인
    const emptyStates = await page.$$('text=/아직 작성된 포스트가 없습니다/');
    console.log(`\n📝 Empty state messages found: ${emptyStates.length}`);
    
    // 모든 텍스트 요소 확인
    const allTexts = await page.$$eval('p, h1, h2, h3, h4, h5, h6', elements => 
      elements.map(el => ({ 
        tag: el.tagName, 
        text: el.textContent.trim() 
      })).filter(item => item.text.length > 0)
    );
    
    console.log('\n📄 All text elements on page:');
    allTexts.forEach(item => {
      console.log(`   ${item.tag}: "${item.text}"`);
    });
    
    // 스크린샷
    await page.screenshot({ 
      path: 'blog-page-detailed.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved as blog-page-detailed.png');
    
    // HTML 소스 확인
    const bodyHTML = await page.$eval('body', el => el.innerHTML);
    console.log(`\n📄 Body HTML length: ${bodyHTML.length} characters`);
    
    // 주요 컨테이너 확인
    const mainContent = await page.$('main');
    if (mainContent) {
      console.log('✅ Main content area found');
      const mainHTML = await mainContent.innerHTML();
      console.log(`   Main HTML preview: ${mainHTML.substring(0, 200)}...`);
    }
    
    console.log('\n⏳ Waiting for user inspection (15 seconds)...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
    console.log('✅ Browser closed');
  }
})();