const { chromium } = require('playwright');

async function checkSEOUpdates() {
  console.log('🔍 SEO 업데이트 후 기능 확인 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const pages = [
    { name: '홈', url: 'http://localhost:4000' },
    { name: '타로', url: 'http://localhost:4000/tarot' },
    { name: '꿈해몽', url: 'http://localhost:4000/dream-interpretation' },
    { name: '블로그', url: 'http://localhost:4000/blog' },
    { name: '커뮤니티', url: 'http://localhost:4000/community' }
  ];
  
  try {
    for (const pageInfo of pages) {
      console.log(`\n📋 ${pageInfo.name} 페이지 확인...`);
      await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
      
      // 메타데이터 확인
      const title = await page.title();
      const description = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
      const keywords = await page.locator('meta[name="keywords"]').getAttribute('content').catch(() => null);
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
      
      console.log(`  Title: ${title}`);
      console.log(`  Description: ${description ? '✅ 있음' : '❌ 없음'}`);
      console.log(`  Keywords: ${keywords ? '✅ 있음' : '❌ 없음'}`);
      console.log(`  OG Title: ${ogTitle ? '✅ 있음' : '❌ 없음'}`);
      
      // JSON-LD 확인
      const jsonLd = await page.locator('script[type="application/ld+json"]').count();
      console.log(`  JSON-LD: ${jsonLd > 0 ? '✅ 있음' : '❌ 없음'}`);
      
      // 페이지 기능 확인
      if (pageInfo.name === '블로그') {
        await page.waitForTimeout(2000);
        const blogPosts = await page.locator('.blog-card').count();
        console.log(`  블로그 포스트: ${blogPosts}개`);
      }
      
      // 스크린샷 저장
      await page.screenshot({ 
        path: `after-seo-${pageInfo.name}.png`, 
        fullPage: false 
      });
    }
    
    console.log('\n✅ SEO 업데이트 확인 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

checkSEOUpdates().catch(console.error);