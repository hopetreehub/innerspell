const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`Console ${msg.type()}: ${msg.text()}`);
  });
  
  console.log('Navigating to blog page...');
  await page.goto('https://test-studio-firebase.vercel.app/blog', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  console.log('Waiting for blog posts to load...');
  await page.waitForSelector('article', { timeout: 30000 });
  
  // Take screenshot
  const timestamp = new Date().toISOString();
  await page.screenshot({ 
    path: `blog-check-${timestamp}.png`,
    fullPage: true 
  });
  
  // Get all blog posts
  const posts = await page.$$('article');
  console.log(`\nFound ${posts.length} blog posts\n`);
  
  // Extract post details
  const postDetails = await page.evaluate(() => {
    const articles = document.querySelectorAll('article');
    return Array.from(articles).map((article, index) => {
      const titleElement = article.querySelector('h2');
      const dateElement = article.querySelector('time');
      const imageElement = article.querySelector('img');
      
      return {
        index: index + 1,
        title: titleElement?.textContent?.trim() || 'No title',
        date: dateElement?.textContent?.trim() || 'No date',
        imageUrl: imageElement?.getAttribute('src') || 'No image'
      };
    });
  });
  
  // Display post details
  console.log('=== Blog Posts Details ===');
  postDetails.forEach(post => {
    console.log(`\nPost ${post.index}:`);
    console.log(`Title: ${post.title}`);
    console.log(`Date: ${post.date}`);
    console.log(`Image: ${post.imageUrl}`);
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
  recentSEOPosts.forEach(title => {
    const found = postDetails.some(post => post.title === title);
    console.log(`${found ? '✓' : '✗'} ${title}`);
  });
  
  console.log(`\n\nScreenshot saved as: blog-check-${timestamp}.png`);
  
  await browser.close();
})();