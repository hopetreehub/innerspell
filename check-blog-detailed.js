const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`[Page Error] ${error.message}`);
  });
  
  console.log('Navigating to blog page...');
  await page.goto('https://test-studio-firebase.vercel.app/blog', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  // Wait a bit for content to load
  await page.waitForTimeout(5000);
  
  // Take screenshot
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `blog-check-${timestamp}.png`,
    fullPage: true 
  });
  
  console.log('\nChecking page structure...');
  
  // Check what elements are on the page
  const pageContent = await page.evaluate(() => {
    const body = document.body.innerHTML;
    const hasArticles = document.querySelectorAll('article').length;
    const hasDivs = document.querySelectorAll('div').length;
    const hasH2 = document.querySelectorAll('h2').length;
    const hasImages = document.querySelectorAll('img').length;
    
    // Try different selectors for blog posts
    const possibleSelectors = [
      'article',
      '[data-testid="blog-post"]',
      '.blog-post',
      '.post',
      'div.grid > div',
      'main div > div'
    ];
    
    let foundSelector = null;
    let foundCount = 0;
    
    for (const selector of possibleSelectors) {
      const count = document.querySelectorAll(selector).length;
      if (count > 0) {
        foundSelector = selector;
        foundCount = count;
        break;
      }
    }
    
    // Get all text content from h2 elements
    const h2Texts = Array.from(document.querySelectorAll('h2')).map(h => h.textContent);
    
    return {
      hasArticles,
      hasDivs,
      hasH2,
      hasImages,
      foundSelector,
      foundCount,
      h2Texts,
      bodyLength: body.length
    };
  });
  
  console.log('Page structure:', pageContent);
  
  // Try to find blog posts with a more flexible approach
  const posts = await page.evaluate(() => {
    // Look for h2 elements that might be blog titles
    const h2Elements = document.querySelectorAll('h2');
    const posts = [];
    
    h2Elements.forEach((h2, index) => {
      // Try to find the parent container
      let container = h2.parentElement;
      while (container && !container.querySelector('img') && container.parentElement) {
        container = container.parentElement;
      }
      
      if (container) {
        const img = container.querySelector('img');
        const time = container.querySelector('time');
        const link = container.querySelector('a');
        
        posts.push({
          index: index + 1,
          title: h2.textContent?.trim(),
          imageUrl: img?.getAttribute('src'),
          date: time?.textContent?.trim(),
          hasLink: !!link
        });
      }
    });
    
    return posts;
  });
  
  console.log('\n=== Found Blog Posts ===');
  console.log(`Total posts found: ${posts.length}`);
  
  posts.forEach(post => {
    console.log(`\nPost ${post.index}:`);
    console.log(`Title: ${post.title}`);
    console.log(`Date: ${post.date || 'No date found'}`);
    console.log(`Image: ${post.imageUrl || 'No image found'}`);
    console.log(`Has link: ${post.hasLink}`);
  });
  
  // Check for recent SEO posts
  const recentSEOPosts = [
    'Next.js 15와 React 19로 만드는 모던 웹 애플리케이션',
    'TypeScript 5.0의 새로운 기능과 실전 활용법',
    'Tailwind CSS로 구현하는 반응형 웹 디자인 완벽 가이드',
    'Vercel Edge Functions로 서버리스 아키텍처 구축하기',
    'SvelteKit vs Next.js: 2024년 프레임워크 선택 가이드'
  ];
  
  console.log('\n\n=== Checking for Recent SEO Posts ===');
  const foundTitles = posts.map(p => p.title);
  recentSEOPosts.forEach(title => {
    const found = foundTitles.includes(title);
    console.log(`${found ? '✓' : '✗'} ${title}`);
  });
  
  console.log(`\n\nScreenshot saved as: blog-check-${timestamp}.png`);
  
  await browser.close();
})();