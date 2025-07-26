const { chromium } = require('playwright');

async function testMockPostsAPI() {
  console.log('🔍 Mock Posts API 테스트 시작...');
  
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    // 1. API 엔드포인트 직접 호출
    const apiUrl = 'https://test-studio-firebase.vercel.app/api/mock-posts';
    console.log(`\n📡 API 호출: ${apiUrl}`);
    
    const response = await page.goto(apiUrl, { waitUntil: 'networkidle' });
    console.log(`응답 상태: ${response.status()}`);
    
    if (response.status() === 200) {
      const data = await response.json();
      
      console.log('\n✅ API 응답 성공:');
      console.log(`- success: ${data.success}`);
      console.log(`- total published posts: ${data.total}`);
      console.log(`- all posts count: ${data.allTotal}`);
      console.log(`- first post: ${data.firstPost}`);
      console.log(`- timestamp: ${data.timestamp}`);
      
      if (data.posts && data.posts.length > 0) {
        console.log('\n📝 첫 5개 포스트:');
        data.posts.slice(0, 5).forEach((post, index) => {
          console.log(`${index + 1}. ${post.title}`);
          console.log(`   ID: ${post.id}`);
          console.log(`   카테고리: ${post.category}`);
          console.log(`   날짜: ${post.publishedAt}`);
        });
        
        // 새 포스트 확인
        const newPostIds = [
          'tarot-2025-new-year-goals',
          'ai-tarot-reading-guide',
          'dream-interpretation-complete',
          'tarot-78-cards-meaning',
          'spiritual-growth-inner-journey'
        ];
        
        console.log('\n🆕 새 포스트 존재 확인:');
        newPostIds.forEach(id => {
          const found = data.posts.some(post => post.id === id);
          console.log(`  ${found ? '✅' : '❌'} ${id}`);
        });
      }
    } else {
      const text = await response.text();
      console.log('\n❌ API 오류:');
      console.log(text.substring(0, 500));
    }
    
    // 2. /blog-new 페이지도 다시 확인
    console.log('\n\n📡 /blog-new 페이지 재확인...');
    const blogNewUrl = 'https://test-studio-firebase.vercel.app/blog-new';
    const blogNewResponse = await page.goto(blogNewUrl, { waitUntil: 'networkidle' });
    console.log(`/blog-new 응답 상태: ${blogNewResponse.status()}`);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

testMockPostsAPI();