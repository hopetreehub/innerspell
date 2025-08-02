import { test, expect } from '@playwright/test';

test('Verify blog posts on Vercel deployment', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => {
    console.log(`Console ${msg.type()}: ${msg.text()}`);
  });

  // Navigate to blog page
  await page.goto('https://test-studio-firebase.vercel.app/blog');
  
  // Wait for blog posts to load
  await page.waitForSelector('article', { timeout: 30000 });
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'blog-posts-verification.png',
    fullPage: true 
  });

  // Get all blog post articles
  const posts = await page.$$('article');
  console.log(`Found ${posts.length} blog posts`);

  // Extract post details
  const postDetails = await page.evaluate(() => {
    const articles = document.querySelectorAll('article');
    return Array.from(articles).map((article, index) => {
      const titleElement = article.querySelector('h2');
      const dateElement = article.querySelector('time');
      const imageElement = article.querySelector('img');
      const linkElement = article.querySelector('a');
      
      return {
        index: index + 1,
        title: titleElement?.textContent?.trim() || 'No title',
        date: dateElement?.textContent?.trim() || 'No date',
        dateTime: dateElement?.getAttribute('datetime') || 'No datetime',
        imageUrl: imageElement?.getAttribute('src') || 'No image',
        imageAlt: imageElement?.getAttribute('alt') || 'No alt text',
        link: linkElement?.getAttribute('href') || 'No link'
      };
    });
  });

  // Log each post detail
  console.log('\n=== Blog Posts Details ===');
  postDetails.forEach(post => {
    console.log(`\nPost ${post.index}:`);
    console.log(`Title: ${post.title}`);
    console.log(`Date: ${post.date} (${post.dateTime})`);
    console.log(`Image: ${post.imageUrl}`);
    console.log(`Alt text: ${post.imageAlt}`);
    console.log(`Link: ${post.link}`);
  });

  // Check for recent SEO posts
  const recentSEOPosts = [
    'Next.js 15와 React 19로 만드는 모던 웹 애플리케이션',
    'TypeScript 5.0의 새로운 기능과 실전 활용법',
    'Tailwind CSS로 구현하는 반응형 웹 디자인 완벽 가이드',
    'Vercel Edge Functions로 서버리스 아키텍처 구축하기',
    'SvelteKit vs Next.js: 2024년 프레임워크 선택 가이드'
  ];

  console.log('\n=== Checking for Recent SEO Posts ===');
  recentSEOPosts.forEach(title => {
    const found = postDetails.some(post => post.title === title);
    console.log(`${found ? '✓' : '✗'} ${title}`);
  });

  // Take individual screenshots of first few posts
  for (let i = 0; i < Math.min(3, posts.length); i++) {
    await posts[i].scrollIntoViewIfNeeded();
    await posts[i].screenshot({ 
      path: `blog-post-${i + 1}.png` 
    });
  }

  // Check console errors
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  
  if (errors.length > 0) {
    console.log('\n=== Console Errors ===');
    errors.forEach(error => console.log(error));
  }

  // Wait a bit to capture any lazy-loaded content
  await page.waitForTimeout(2000);
  
  // Final screenshot
  await page.screenshot({ 
    path: 'blog-posts-final.png',
    fullPage: true 
  });
});