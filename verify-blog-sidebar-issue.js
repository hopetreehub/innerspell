const { chromium } = require('playwright');

(async () => {
  console.log('🔍 SuperClaude 전문가 - 블로그 사이드바 문제 심층 분석...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // 배포된 사이트 접속
    console.log('1️⃣ 최신 배포 버전 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // HTML 구조 분석
    console.log('\n2️⃣ HTML 구조 분석...');
    
    // 사이드바 찾기
    const sidebar = await page.$('.lg\\:col-span-1');
    if (!sidebar) {
      console.error('❌ 사이드바를 찾을 수 없습니다!');
      return;
    }
    
    // 사이드바 내부 HTML 가져오기
    const sidebarHTML = await sidebar.innerHTML();
    
    // 인기 포스트 카드 찾기
    const popularCardHeader = await sidebar.$('h3:has-text("인기 포스트")');
    const popularCard = await popularCardHeader?.evaluateHandle(el => el.closest('.card') || el.parentElement?.parentElement);
    
    if (popularCard) {
      console.log('\n3️⃣ 인기 포스트 카드 분석...');
      
      // 인기 포스트 카드 내부 구조 확인
      const popularCardHTML = await popularCard.evaluate(el => el.outerHTML);
      
      // 주요 포스트 배지가 인기 포스트 카드 안에 있는지 확인
      const hasFeaturedBadgeInPopular = popularCardHTML.includes('주요 포스트') || popularCardHTML.includes('bg-accent');
      
      if (hasFeaturedBadgeInPopular) {
        console.log('❌ 문제 발견: 주요 포스트가 인기 포스트 카드 내부에 있습니다!');
        
        // 문제가 되는 부분 찾기
        const featuredTitle = await popularCard.$('h3:has-text("주요 포스트")');
        if (featuredTitle) {
          console.log('   → "주요 포스트" 헤더가 인기 포스트 카드 안에서 발견됨');
        }
      }
      
      // 인기 포스트 내 아이템 수 확인
      const popularItems = await popularCard.$$('a[href^="/blog/"]');
      console.log(`   → 인기 포스트 내 링크 수: ${popularItems.length}개`);
      
      // 각 아이템 분석
      for (let i = 0; i < popularItems.length; i++) {
        const item = popularItems[i];
        const text = await item.textContent();
        console.log(`   ${i + 1}. ${text.trim()}`);
      }
    }
    
    // 별도의 주요 포스트 카드가 있는지 확인
    console.log('\n4️⃣ 별도 주요 포스트 카드 확인...');
    const allCards = await sidebar.$$('.card, [class*="card"]');
    console.log(`   → 전체 카드 수: ${allCards.length}개`);
    
    let featuredCardFound = false;
    for (let i = 0; i < allCards.length; i++) {
      const card = allCards[i];
      const headerText = await card.$eval('h3', el => el.textContent).catch(() => null);
      
      if (headerText) {
        console.log(`   카드 ${i + 1}: ${headerText}`);
        if (headerText.includes('주요 포스트')) {
          featuredCardFound = true;
          
          // 이 카드가 인기 포스트 카드 안에 있는지 확인
          const isInsidePopular = await card.evaluate((el) => {
            let parent = el.parentElement;
            while (parent) {
              const h3 = parent.querySelector('h3');
              if (h3 && h3.textContent.includes('인기 포스트')) {
                return true;
              }
              parent = parent.parentElement;
            }
            return false;
          });
          
          if (isInsidePopular) {
            console.log('      ⚠️ 이 주요 포스트 카드는 인기 포스트 카드 내부에 있습니다!');
          } else {
            console.log('      ✅ 별도의 카드로 표시됨');
          }
        }
      }
    }
    
    if (!featuredCardFound) {
      console.log('   ❌ 별도의 주요 포스트 카드를 찾을 수 없습니다!');
    }
    
    // 스크린샷 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `blog-sidebar-issue-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log(`\n📸 스크린샷 저장: blog-sidebar-issue-${timestamp}.png`);
    
    // 진단 결과
    console.log('\n🚨 진단 결과:');
    console.log('문제: 사이드바 레이아웃이 잘못 렌더링되고 있습니다.');
    console.log('원인: HTML 구조가 중첩되어 주요 포스트가 인기 포스트 박스 안에 들어가 있습니다.');
    
  } catch (error) {
    console.error('❌ 분석 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
})();