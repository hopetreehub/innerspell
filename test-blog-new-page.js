const { chromium } = require('playwright');

async function testBlogNewPage() {
  console.log('🔍 /blog-new 테스트 페이지 확인 시작...');
  
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    // 1. /blog-new 페이지 접속
    const url = 'https://test-studio-firebase.vercel.app/blog-new';
    console.log(`\n📡 새 테스트 페이지 접속: ${url}`);
    
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    console.log(`응답 상태: ${response.status()}`);
    
    if (response.status() === 404) {
      console.log('❌ 404 에러 - 페이지가 아직 배포되지 않았습니다.');
      return;
    }
    
    // 2. 디버그 정보 확인
    const debugInfo = await page.evaluate(() => {
      const totalPosts = document.body.textContent.match(/Total mockPosts: (\d+)/);
      const publishedPosts = document.body.textContent.match(/Published posts: (\d+)/);
      const renderTime = document.body.textContent.match(/Render time: ([^\s]+)/);
      
      return {
        total: totalPosts ? totalPosts[1] : null,
        published: publishedPosts ? publishedPosts[1] : null,
        time: renderTime ? renderTime[1] : null
      };
    });
    
    console.log('\n📊 디버그 정보:');
    console.log(`- Total mockPosts: ${debugInfo.total || '확인 불가'}`);
    console.log(`- Published posts: ${debugInfo.published || '확인 불가'}`);
    console.log(`- Render time: ${debugInfo.time || '확인 불가'}`);
    
    // 3. 블로그 포스트 목록 확인
    const posts = await page.$$eval('article', articles => {
      return articles.map(article => {
        const title = article.querySelector('h2')?.textContent || '';
        const excerpt = article.querySelector('p')?.textContent || '';
        const id = article.textContent.match(/ID: ([^\n]+)/)?.[1] || '';
        const category = article.textContent.match(/카테고리: ([^\n]+)/)?.[1] || '';
        
        return { title, excerpt: excerpt.substring(0, 50) + '...', id, category };
      });
    });
    
    console.log(`\n📝 표시된 포스트 수: ${posts.length}`);
    
    if (posts.length > 0) {
      console.log('\n첫 5개 포스트:');
      posts.slice(0, 5).forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   ID: ${post.id}`);
        console.log(`   카테고리: ${post.category}`);
        console.log(`   내용: ${post.excerpt}`);
      });
    }
    
    // 4. 새로 추가한 포스트 확인
    const newPostKeywords = [
      '2025년 새해 운세',
      'AI 타로 리딩',
      '꿈해몽 완벽 가이드',
      '타로 카드 78장',
      '영적 성장과 내면 탐구'
    ];
    
    console.log('\n🆕 새 포스트 키워드 검색:');
    for (const keyword of newPostKeywords) {
      const found = posts.some(post => 
        post.title.includes(keyword) || post.excerpt.includes(keyword)
      );
      console.log(`  ${found ? '✅' : '❌'} "${keyword}"`);
    }
    
    // 5. 스크린샷 저장
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    await page.screenshot({ 
      path: `blog-new-test-${timestamp}.png`,
      fullPage: true 
    });
    console.log(`\n📸 스크린샷 저장: blog-new-test-${timestamp}.png`);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

testBlogNewPage();