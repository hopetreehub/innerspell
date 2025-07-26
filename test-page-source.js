const { chromium } = require('playwright');

async function testPageSource() {
  console.log('🔍 Vercel 블로그 페이지 소스 확인 시작...');
  
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    const url = 'https://test-studio-firebase.vercel.app/blog';
    console.log(`📡 URL 접속: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // 페이지 소스 가져오기
    const pageSource = await page.content();
    
    // 디버그 정보 검색
    const debugMatch = pageSource.match(/Debug:.*?Total posts = (\d+)/);
    const titleMatch = pageSource.match(/Debug:.*?First post title = ([^<]+)/);
    const timestampMatch = pageSource.match(/Debug:.*?Timestamp = ([^<]+)/);
    
    console.log('\n📊 디버그 정보:');
    console.log(`- Total posts: ${debugMatch ? debugMatch[1] : 'Not found'}`);
    console.log(`- First post: ${titleMatch ? titleMatch[1] : 'Not found'}`);
    console.log(`- Timestamp: ${timestampMatch ? timestampMatch[1] : 'Not found'}`);
    
    // 블로그 포스트 제목 검색
    console.log('\n📝 페이지에서 발견된 포스트 제목들:');
    const titlePattern = /<h[1-3][^>]*>([^<]+)<\/h[1-3]>/g;
    let match;
    let count = 0;
    
    while ((match = titlePattern.exec(pageSource)) && count < 10) {
      const title = match[1].trim();
      if (title && !title.includes('InnerSpell') && !title.includes('블로그')) {
        console.log(`  ${++count}. ${title}`);
      }
    }
    
    // 새로 추가한 포스트 키워드 검색
    console.log('\n🆕 새 포스트 키워드 검색:');
    const newKeywords = [
      '2025년 새해 운세',
      'AI 타로 리딩',
      '꿈해몽 완벽 가이드',
      '타로 카드 78장',
      '영적 성장과 내면 탐구'
    ];
    
    newKeywords.forEach(keyword => {
      const found = pageSource.includes(keyword);
      console.log(`  ${found ? '✅' : '❌'} "${keyword}"`);
    });
    
    // mockPosts 관련 에러 검색
    const hasError = pageSource.includes('error') || pageSource.includes('Error');
    if (hasError) {
      console.log('\n⚠️ 페이지에 에러 메시지가 있을 수 있습니다.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

testPageSource();