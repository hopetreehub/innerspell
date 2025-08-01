const { chromium } = require('playwright');

async function testLocal4000() {
  console.log('🚀 로컬 서버 (포트 4000) 테스트 시작\n');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      viewport: { width: 1280, height: 720 }
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'ko-KR'
    });
    const page = await context.newPage();
    
    // 1. 홈페이지 확인
    console.log('1️⃣ 홈페이지 접속');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'local-1-homepage.png' });
    
    const homeTitle = await page.title();
    console.log(`✅ 타이틀: ${homeTitle}`);
    
    // 2. 타로 리딩 페이지로 이동
    console.log('\n2️⃣ 타로 리딩 페이지 이동');
    await page.click('a[href*="tarot/reading"], button:has-text("타로 리딩")');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'local-2-reading.png' });
    
    // 3. 질문 입력
    console.log('\n3️⃣ 질문 입력 및 카드 섞기');
    const questionInput = await page.$('input[placeholder*="질문"], textarea[placeholder*="질문"]');
    if (questionInput) {
      await questionInput.fill('오늘 하루 어떤 일이 일어날까요?');
      console.log('✅ 질문 입력 완료');
    }
    
    // 4. 카드 섞기
    const shuffleButton = await page.$('button:has-text("카드 섞기"), button:has-text("시작")');
    if (shuffleButton) {
      await shuffleButton.click();
      console.log('✅ 카드 섞기 시작');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'local-3-shuffled.png' });
    }
    
    // 5. 카드 펼치기
    console.log('\n4️⃣ 카드 펼치기');
    const spreadButton = await page.$('button:has-text("카드 펼치기"), button:has-text("펼치기")');
    if (spreadButton) {
      await spreadButton.click();
      console.log('✅ 카드 펼치기 완료');
      await page.waitForTimeout(2000);
    }
    
    // 카드 이미지 확인
    const cardImages = await page.$$eval('img[src*="tarot"], img[alt*="카드"]', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        loaded: img.complete && img.naturalHeight > 0,
        size: `${img.naturalWidth}x${img.naturalHeight}`
      }))
    );
    
    console.log(`\n📷 카드 이미지 상태:`);
    console.log(`- 총 카드: ${cardImages.length}개`);
    console.log(`- 로드 완료: ${cardImages.filter(img => img.loaded).length}개`);
    
    await page.screenshot({ path: 'local-4-cards-spread.png' });
    
    // 6. 카드 선택
    console.log('\n5️⃣ 카드 3장 선택');
    const cards = await page.$$('[data-testid*="card"], .card-back, img[alt*="뒷면"]');
    
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      await cards[i].click();
      console.log(`✅ 카드 ${i + 1} 선택`);
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'local-5-cards-selected.png' });
    
    // 7. AI 해석 버튼 확인
    console.log('\n6️⃣ AI 해석 기능 확인');
    const interpretButton = await page.$('button:has-text("AI 해석"), button:has-text("해석"), button:has-text("리딩 시작")');
    
    if (interpretButton) {
      const isDisabled = await interpretButton.isDisabled();
      console.log(`AI 해석 버튼: ${isDisabled ? '❌ 비활성화' : '✅ 활성화'}`);
      
      if (!isDisabled) {
        await interpretButton.click();
        console.log('⏳ AI 해석 요청 중...');
        await page.screenshot({ path: 'local-6-ai-clicked.png' });
      }
    }
    
    // 8. 타로 백과사전 확인
    console.log('\n7️⃣ 타로 백과사전 페이지');
    await page.goto('http://localhost:4000/tarot/encyclopedia');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'local-7-encyclopedia.png' });
    
    const encyclopediaStatus = page.url().includes('404') ? '❌ 404 에러' : '✅ 정상';
    console.log(`백과사전 페이지: ${encyclopediaStatus}`);
    
    // 9. 성능 측정
    console.log('\n8️⃣ 성능 측정');
    const metrics = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart
      };
    });
    
    console.log(`- DOM 로드: ${metrics.domContentLoaded}ms`);
    console.log(`- 전체 로드: ${metrics.loadComplete}ms`);
    
    console.log('\n✅ 로컬 서버 테스트 완료!');
    console.log('📁 스크린샷이 저장되었습니다.');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
    await page?.screenshot({ path: 'local-error.png' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 실행
testLocal4000().catch(console.error);