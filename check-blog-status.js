const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('📋 블로그 상태 확인 시작...\n');
  
  try {
    // 1. 로그인
    console.log('1️⃣ 관리자 로그인...');
    await page.goto('http://localhost:4000/sign-in');
    await page.waitForLoadState('networkidle');
    
    const devButton = await page.$('button:has-text("관리자로 로그인")');
    if (devButton) {
      await devButton.click();
      await page.waitForTimeout(5000);
      await page.reload();
      await page.waitForTimeout(3000);
    }
    
    // 2. 관리자 대시보드 > 블로그 관리
    console.log('2️⃣ 블로그 관리 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    const blogTab = await page.$('button[role="tab"]:has-text("블로그 관리")');
    if (blogTab) {
      await blogTab.click();
      await page.waitForTimeout(2000);
    }
    
    // 3. 블로그 글 목록 확인
    console.log('3️⃣ 블로그 글 목록 확인...');
    await page.screenshot({ path: 'blog-status-01-list.png', fullPage: true });
    
    // 테이블에서 블로그 글 찾기
    const blogPosts = await page.$$eval('table tbody tr', rows => 
      rows.map(row => {
        const cells = row.querySelectorAll('td');
        return {
          title: cells[0]?.textContent?.trim(),
          slug: cells[1]?.textContent?.trim(),
          category: cells[2]?.textContent?.trim(),
          published: cells[3]?.textContent?.trim(),
          date: cells[4]?.textContent?.trim()
        };
      })
    );
    
    console.log('📝 발견된 블로그 글:', blogPosts.length, '개');
    blogPosts.forEach((post, index) => {
      console.log(`\n[${index + 1}] ${post.title}`);
      console.log(`   - Slug: ${post.slug}`);
      console.log(`   - 카테고리: ${post.category}`);
      console.log(`   - 발행 상태: ${post.published}`);
      console.log(`   - 날짜: ${post.date}`);
    });
    
    // 4. Vercel URL 확인 (환경변수에서)
    console.log('\n4️⃣ Vercel 배포 URL 확인...');
    const vercelUrl = process.env.VERCEL_URL || 'test-studio-firebase.vercel.app';
    console.log('Vercel URL:', vercelUrl);
    
    // 5. 블로그 API 엔드포인트 확인
    console.log('\n5️⃣ 블로그 API 상태 확인...');
    await page.goto('http://localhost:4000/api/blog/posts');
    const apiResponse = await page.textContent('body');
    console.log('API 응답:', apiResponse.substring(0, 200) + '...');
    
    await page.screenshot({ path: 'blog-status-02-api.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await page.screenshot({ path: 'blog-status-error.png', fullPage: true });
  } finally {
    console.log('\n브라우저를 열어두었습니다. 확인 후 닫아주세요.');
  }
})();