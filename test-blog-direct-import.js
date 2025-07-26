const { chromium } = require('playwright');

async function testBlogWithDirectImport() {
  console.log('🔍 블로그 페이지 직접 import 상태 확인...');
  
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    // 콘솔 메시지 캡처
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });
    
    // /blog 페이지 접속
    const url = 'https://test-studio-firebase.vercel.app/blog';
    console.log(`\n📡 블로그 페이지 접속: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // 페이지 소스에서 디버그 정보 찾기
    const pageContent = await page.content();
    
    // style="display: none" 내부의 디버그 정보 찾기
    const debugMatch = pageContent.match(/Debug: Total posts = (\d+)/);
    const firstPostMatch = pageContent.match(/Debug: First post title = ([^<]+)/);
    const timestampMatch = pageContent.match(/Debug: Timestamp = ([^<]+)/);
    
    if (debugMatch || firstPostMatch || timestampMatch) {
      console.log('\n📊 서버 사이드 디버그 정보:');
      console.log(`- Total posts: ${debugMatch ? debugMatch[1] : 'Not found'}`);
      console.log(`- First post: ${firstPostMatch ? firstPostMatch[1] : 'Not found'}`);
      console.log(`- Timestamp: ${timestampMatch ? timestampMatch[1] : 'Not found'}`);
    }
    
    // 블로그 카드 확인
    const blogCards = await page.$$eval('.blog-card, article, [class*="card"]', cards => {
      return cards.map(card => {
        const title = card.querySelector('h2, h3, [class*="title"]')?.textContent || '';
        const excerpt = card.querySelector('p, [class*="excerpt"]')?.textContent || '';
        return { title: title.trim(), excerpt: excerpt.trim().substring(0, 50) + '...' };
      });
    });
    
    console.log(`\n📝 발견된 블로그 카드: ${blogCards.length}개`);
    
    if (blogCards.length > 0) {
      console.log('\n표시된 포스트:');
      blogCards.forEach((card, index) => {
        console.log(`${index + 1}. ${card.title}`);
      });
    }
    
    // 콘솔 로그 확인
    if (consoleLogs.length > 0) {
      console.log('\n🖥️ 브라우저 콘솔 로그:');
      consoleLogs.forEach(log => console.log(`  - ${log}`));
    }
    
    // 스크린샷
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    await page.screenshot({ 
      path: `blog-direct-import-test-${timestamp}.png`,
      fullPage: true 
    });
    console.log(`\n📸 스크린샷 저장: blog-direct-import-test-${timestamp}.png`);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

testBlogWithDirectImport();