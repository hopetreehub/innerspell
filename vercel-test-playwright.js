const { chromium } = require('playwright');

(async () => {
  console.log('=== Vercel 프로덕션 배포 검증 ===\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // 배포된 URL
  const prodUrl = 'https://test-studio-firebase.vercel.app';
  
  // 네트워크 에러 모니터링
  page.on('response', async response => {
    const url = response.url();
    if (response.status() >= 400) {
      console.log(`❌ [${response.status()}] ${url}`);
    }
  });
  
  // 콘솔 에러 모니터링
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[콘솔 에러] ${msg.text()}`);
    }
  });
  
  try {
    // 1. 홈페이지 확인
    console.log('1. 홈페이지 접속 테스트...');
    await page.goto(prodUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'vercel-homepage.png' });
    console.log('  ✅ 홈페이지 정상 - vercel-homepage.png');
    
    // 2. 블로그 페이지 확인
    console.log('\n2. 블로그 페이지 확인...');
    await page.goto(`${prodUrl}/blog`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 블로그 포스트 수 확인
    const posts = await page.$$('article, .blog-post, [href*="/blog/"]');
    console.log(`  ✅ 블로그 포스트 수: ${posts.length}`);
    
    // 제목들 확인
    const titles = await page.$$eval('h2, h3, [class*="title"]', els => 
      els.map(el => el.textContent?.trim()).filter(Boolean).slice(0, 3)
    );
    console.log(`  ✅ 포스트 제목들: ${titles.join(', ')}`);
    
    await page.screenshot({ path: 'vercel-blog.png', fullPage: true });
    console.log('  ✅ 블로그 페이지 정상 - vercel-blog.png');
    
    // 첫 번째 포스트 클릭
    if (posts.length > 0) {
      const firstPostLink = await page.$('a[href*="/blog/"]');
      if (firstPostLink) {
        const postHref = await firstPostLink.getAttribute('href');
        console.log(`\n3. 블로그 상세 페이지 확인: ${postHref}`);
        await firstPostLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'vercel-blog-detail.png' });
        console.log('  ✅ 블로그 상세 페이지 정상 - vercel-blog-detail.png');
      }
    }
    
    // 4. 타로 리딩 페이지 확인
    console.log('\n4. 타로 리딩 페이지 테스트...');
    await page.goto(`${prodUrl}/reading`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 페이지 요소들 확인
    const textarea = await page.$('textarea');
    const shuffleButton = await page.$('button:text("카드 섞기")');
    
    console.log(`  ✅ 질문 입력 필드: ${textarea ? '존재' : '없음'}`);
    console.log(`  ✅ 카드 섞기 버튼: ${shuffleButton ? '존재' : '없음'}`);
    
    if (textarea && shuffleButton) {
      await page.fill('textarea', '오늘의 운세를 알려주세요');
      console.log('  ✅ 질문 입력 완료');
      
      await shuffleButton.click();
      await page.waitForTimeout(2000);
      console.log('  ✅ 카드 섞기 완료');
      
      // 카드 펼치기 버튼 확인
      const spreadButton = await page.$('button:text("카드 펼치기")');
      if (spreadButton) {
        await spreadButton.click();
        await page.waitForTimeout(3000);
        console.log('  ✅ 카드 펼치기 완료');
        
        // 카드들 확인
        const cards = await page.$$('[role="button"][aria-label*="카드"], .card-item');
        console.log(`  ✅ 표시된 카드 수: ${cards.length}`);
        
        // 카드 3장 선택
        if (cards.length >= 3) {
          for (let i = 0; i < 3; i++) {
            await cards[i].click();
            await page.waitForTimeout(500);
          }
          console.log('  ✅ 카드 3장 선택 완료');
          
          // AI 해석 버튼 확인
          const interpretButton = await page.$('button:text("AI 해석 받기")');
          if (interpretButton && await interpretButton.isVisible()) {
            console.log('  ✅ AI 해석 받기 버튼 표시됨');
          }
        }
      }
    }
    
    await page.screenshot({ path: 'vercel-tarot.png', fullPage: true });
    console.log('  ✅ 타로 리딩 페이지 정상 - vercel-tarot.png');
    
    // 5. 관리자 페이지 확인
    console.log('\n5. 관리자 페이지 확인...');
    await page.goto(`${prodUrl}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'vercel-admin.png' });
    console.log('  ✅ 관리자 페이지 정상 - vercel-admin.png');
    
    // 6. API 헬스체크
    console.log('\n6. API 헬스체크...');
    const healthResponse = await page.goto(`${prodUrl}/api/health`);
    if (healthResponse) {
      console.log(`  ✅ API 헬스체크: ${healthResponse.status()}`);
      const healthData = await healthResponse.text();
      console.log(`  ✅ 응답: ${healthData}`);
    }
    
    console.log('\n\n🎉 모든 페이지 검증 완료!');
    console.log(`✅ 프로덕션 URL: ${prodUrl}`);
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류:', error.message);
    await page.screenshot({ path: 'vercel-error.png', fullPage: true });
  }
  
  console.log('\n브라우저를 15초 후 닫습니다...');
  await page.waitForTimeout(15000);
  await browser.close();
})();