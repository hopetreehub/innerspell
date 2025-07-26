const { chromium } = require('playwright');

(async () => {
  console.log('🎯 수정 후 사이드바 레이아웃 검증...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // 로컬에서 테스트
    console.log('1️⃣ 로컬 개발 서버에서 테스트...');
    await page.goto('http://localhost:4000/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    }).catch(async () => {
      console.log('   → 로컬 서버가 실행중이지 않습니다. 배포 버전으로 테스트합니다.');
      await page.goto('https://test-studio-firebase.vercel.app/blog', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
    });
    
    await page.waitForTimeout(3000);
    
    // 사이드바 구조 확인
    console.log('\n2️⃣ 수정된 사이드바 구조 확인...');
    const sidebar = await page.$('.lg\\:col-span-1');
    
    if (sidebar) {
      const cards = await sidebar.$$('.card, [class*="card"]');
      console.log(`   → 사이드바 카드 수: ${cards.length}개`);
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const headerText = await card.$eval('h3', el => el.textContent).catch(() => null);
        
        if (headerText) {
          console.log(`\n   카드 ${i + 1}: ${headerText}`);
          
          // 각 카드가 독립적인지 확인
          const isIndependent = await card.evaluate((el) => {
            // 부모 요소에 다른 카드의 h3가 있는지 확인
            let parent = el.parentElement;
            while (parent && parent.className !== 'lg:col-span-1') {
              const otherH3 = parent.querySelectorAll('h3');
              if (otherH3.length > 1) {
                return false;
              }
              parent = parent.parentElement;
            }
            return true;
          });
          
          console.log(`      → 독립적인 카드: ${isIndependent ? '✅ 예' : '❌ 아니오'}`);
          
          // 카드 내 아이템 수
          const items = await card.$$('a[href^="/blog/"]');
          console.log(`      → 포함된 포스트: ${items.length}개`);
        }
      }
    }
    
    // 스크린샷 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `sidebar-fixed-test-${timestamp}.png`,
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1000 }
    });
    
    console.log(`\n📸 스크린샷 저장: sidebar-fixed-test-${timestamp}.png`);
    
    console.log('\n✅ 검증 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
})();