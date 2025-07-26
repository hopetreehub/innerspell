const { chromium } = require('playwright');

(async () => {
  console.log('🎯 최종 사이드바 수정 검증...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // 배포된 사이트 접속 (최신 URL)
    console.log('1️⃣ 최신 배포 버전 접속...');
    await page.goto('https://test-studio-firebase-5bxovq46s-johns-projects-bf5e60f3.vercel.app/blog', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(5000);
    
    // 사이드바 구조 확인
    console.log('\n2️⃣ 사이드바 구조 검증...');
    const sidebar = await page.$('.lg\\:col-span-1');
    
    if (!sidebar) {
      console.error('❌ 사이드바를 찾을 수 없습니다!');
      return;
    }
    
    // 모든 카드 찾기
    const cards = await sidebar.$$('[class*="card"]');
    console.log(`\n✅ 사이드바 카드 수: ${cards.length}개`);
    
    // 각 카드 분석
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const h3 = await card.$('h3');
      
      if (h3) {
        const title = await h3.textContent();
        console.log(`\n📦 카드 ${i + 1}: ${title}`);
        
        // 카드의 부모 요소 확인
        const parentClasses = await card.evaluate(el => el.parentElement?.className || '');
        console.log(`   부모 클래스: ${parentClasses}`);
        
        // 카드가 독립적인지 확인
        const isNested = await card.evaluate(el => {
          let parent = el.parentElement;
          while (parent) {
            if (parent.className.includes('card') && parent !== el) {
              return true;
            }
            parent = parent.parentElement;
          }
          return false;
        });
        
        console.log(`   중첩 상태: ${isNested ? '❌ 다른 카드 안에 있음' : '✅ 독립적임'}`);
        
        // 카드 내 포스트 수 확인
        const posts = await card.$$('a[href^="/blog/"]');
        console.log(`   포함된 포스트: ${posts.length}개`);
      }
    }
    
    // 스크린샷 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `sidebar-final-verification-${timestamp}.png`,
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1000 }
    });
    
    console.log(`\n📸 스크린샷 저장: sidebar-final-verification-${timestamp}.png`);
    
    console.log('\n🏆 최종 검증 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
})();