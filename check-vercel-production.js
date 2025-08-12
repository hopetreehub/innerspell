const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('=== Vercel 프로덕션 환경 검증 ===\n');
  
  const prodUrl = 'https://test-studio-firebase-8o3okzoc5-johns-projects-bf5e60f3.vercel.app';
  
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
    // 1. 블로그 목록 페이지 확인
    console.log('1. 블로그 목록 페이지 확인...');
    await page.goto(`${prodUrl}/blog`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 블로그 포스트 확인
    const posts = await page.$$('article, .blog-post, [data-testid*="post"]');
    console.log(`  ✅ 블로그 포스트 수: ${posts.length}`);
    
    if (posts.length > 0) {
      // 첫 번째 포스트 제목 가져오기
      const firstPostTitle = await page.evaluate(() => {
        const titleElement = document.querySelector('h2, h3, [class*="title"]');
        return titleElement ? titleElement.textContent.trim() : null;
      });
      console.log(`  ✅ 첫 번째 포스트: ${firstPostTitle}`);
      
      // 첫 번째 포스트 클릭
      const firstPost = await page.$('article a, .blog-post a, [href*="/blog/"]');
      if (firstPost) {
        const postUrl = await firstPost.getAttribute('href');
        console.log(`\n2. 블로그 상세 페이지로 이동: ${postUrl}`);
        await firstPost.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // 상세 페이지 내용 확인
        const postTitle = await page.evaluate(() => {
          const h1 = document.querySelector('h1');
          return h1 ? h1.textContent.trim() : null;
        });
        console.log(`  ✅ 포스트 제목: ${postTitle}`);
        
        await page.screenshot({ path: 'vercel-blog-detail.png' });
        console.log('  ✅ 블로그 상세 페이지 스크린샷: vercel-blog-detail.png');
      }
    } else {
      console.log('  ❌ 블로그 포스트가 표시되지 않습니다!');
      await page.screenshot({ path: 'vercel-blog-empty.png' });
    }
    
    // 3. 타로 리딩 페이지 테스트
    console.log('\n3. 타로 리딩 페이지 테스트...');
    await page.goto(`${prodUrl}/reading`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 질문 입력
    await page.fill('textarea', '오늘의 운세를 알려주세요');
    console.log('  ✅ 질문 입력 완료');
    
    // 카드 섞기
    await page.click('button:text("카드 섞기")');
    await page.waitForTimeout(2000);
    console.log('  ✅ 카드 섞기 완료');
    
    // 카드 펼치기
    await page.click('button:text("카드 펼치기")');
    await page.waitForTimeout(3000);
    console.log('  ✅ 카드 펼치기 완료');
    
    // 카드 3장 선택
    const cards = await page.$$('div[role="button"][aria-label*="카드"]');
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      await cards[i].click();
      await page.waitForTimeout(500);
    }
    console.log(`  ✅ 카드 ${Math.min(3, cards.length)}장 선택 완료`);
    
    // AI 해석 버튼 확인
    const interpretButton = await page.$('button:text("AI 해석 받기")');
    if (interpretButton && await interpretButton.isVisible()) {
      console.log('  ✅ AI 해석 받기 버튼 표시됨!');
      
      // API 응답 모니터링
      let apiCalled = false;
      let apiStatus = null;
      
      page.once('response', async response => {
        if (response.url().includes('/api/generate-tarot-interpretation')) {
          apiCalled = true;
          apiStatus = response.status();
          console.log(`\n  🎯 API 호출 감지: ${response.status()} ${response.statusText()}`);
        }
      });
      
      // 버튼 클릭
      await interpretButton.click();
      console.log('  ⏳ AI 해석 요청 중...');
      
      // API 응답 대기 (최대 15초)
      await page.waitForTimeout(15000);
      
      if (apiCalled) {
        if (apiStatus === 200) {
          console.log('  ✅ AI 해석 API 호출 성공!');
        } else {
          console.log(`  ❌ AI 해석 API 오류: ${apiStatus}`);
        }
      } else {
        console.log('  ❓ API 호출이 감지되지 않았습니다.');
      }
      
      // 해석 결과 확인
      const interpretationDialog = await page.$('[role="dialog"], .interpretation-dialog');
      if (interpretationDialog) {
        console.log('  ✅ 해석 결과 다이얼로그 표시됨');
      }
      
      await page.screenshot({ path: 'vercel-tarot-interpretation.png', fullPage: true });
      console.log('  ✅ 타로 해석 스크린샷: vercel-tarot-interpretation.png');
    } else {
      console.log('  ❌ AI 해석 받기 버튼이 표시되지 않습니다!');
      await page.screenshot({ path: 'vercel-tarot-no-button.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('\n테스트 중 오류:', error.message);
    await page.screenshot({ path: 'vercel-error.png', fullPage: true });
  }
  
  console.log('\n\n검증 완료. 브라우저를 15초 후 닫습니다...');
  await page.waitForTimeout(15000);
  await browser.close();
})();