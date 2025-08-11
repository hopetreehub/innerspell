const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://test-studio-firebase.vercel.app/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // 페이지 로드 완료 대기
    await page.waitForTimeout(3000);

    // 블로그 포스트 찾기 - 다양한 선택자 시도
    const selectors = [
      'article',
      '.blog-post',
      '[class*="blog"]',
      'div[class*="grid"] > div',
      'main div[class*="grid"] > div'
    ];

    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      console.log(`Selector "${selector}": ${count} elements found`);
    }

    // 실제 블로그 포스트 구조 확인
    const blogPosts = await page.evaluate(() => {
      // 블로그 포스트로 보이는 요소들 찾기
      const posts = [];
      const postElements = document.querySelectorAll('div[class*="grid"] > div');
      
      postElements.forEach((el, index) => {
        // 이미지나 제목이 있는 요소 찾기
        const hasImage = el.querySelector('img') !== null;
        const hasTitle = el.querySelector('h2, h3, h4') !== null;
        const hasLink = el.querySelector('a') !== null;
        
        if (hasImage || hasTitle || hasLink) {
          posts.push({
            index,
            hasImage,
            hasTitle,
            hasLink,
            className: el.className,
            innerText: el.innerText.substring(0, 100) + '...'
          });
        }
      });
      
      return posts;
    });

    console.log('\n=== Blog Posts Found ===');
    console.log(`Total blog posts: ${blogPosts.length}`);
    blogPosts.forEach((post, i) => {
      console.log(`\nPost ${i + 1}:`);
      console.log(`  Has Image: ${post.hasImage}`);
      console.log(`  Has Title: ${post.hasTitle}`);
      console.log(`  Has Link: ${post.hasLink}`);
      console.log(`  Class: ${post.className}`);
      console.log(`  Text Preview: ${post.innerText}`);
    });

    // 페이지 구조 확인
    const pageStructure = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return 'No main element found';
      
      const structure = {
        mainClass: main.className,
        childrenCount: main.children.length,
        firstChildTag: main.children[0]?.tagName,
        firstChildClass: main.children[0]?.className
      };
      
      return structure;
    });

    console.log('\n=== Page Structure ===');
    console.log(pageStructure);

    // 스크린샷 저장
    await page.screenshot({ path: 'blog-dom-check.png', fullPage: true });
    console.log('\nScreenshot saved as blog-dom-check.png');

  } catch (error) {
    console.error('Error:', error);
  }

  await browser.close();
})();