const { chromium } = require('playwright');

(async () => {
  console.log('🔍 블로그 사이드바 레이아웃 검증 중...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // 배포된 사이트 접속
    await page.goto('https://test-studio-firebase.vercel.app/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 사이드바 영역 찾기
    const sidebar = await page.$('.lg\\:col-span-1');
    
    if (!sidebar) {
      console.error('❌ 사이드바를 찾을 수 없습니다!');
      return;
    }
    
    // 사이드바 내의 카드들 찾기
    const cards = await sidebar.$$('.card, [class*="card"]');
    console.log(`📊 사이드바에서 발견된 카드 수: ${cards.length}개\n`);
    
    // 각 카드의 제목 확인
    console.log('🎯 사이드바 카드 순서:');
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const headerText = await card.$eval('h3', el => el.textContent).catch(() => null);
      
      if (headerText) {
        console.log(`${i + 1}. ${headerText}`);
        
        // 인기 포스트 카드인 경우
        if (headerText.includes('인기 포스트')) {
          const popularItems = await card.$$('a > div');
          console.log(`   └─ 인기 포스트 ${popularItems.length}개 표시됨`);
          
          // 주요 포스트가 인기 포스트 안에 있는지 확인
          const hasFeaturedBadge = await card.$('.bg-accent');
          if (hasFeaturedBadge) {
            console.log('   ⚠️  주요 포스트 배지가 인기 포스트 카드 내부에서 발견됨!');
          }
        }
        
        // 주요 포스트 카드인 경우
        if (headerText.includes('주요 포스트')) {
          const featuredBadge = await card.$('.bg-accent');
          console.log(`   └─ 주요 포스트 배지: ${featuredBadge ? '있음' : '없음'}`);
        }
      }
    }
    
    // 주요 포스트가 인기 포스트 섹션 안에 들어가 있는지 상세 확인
    console.log('\n🔍 상세 분석:');
    const popularCard = await sidebar.$('h3:has-text("인기 포스트")').then(h => h.closest('.card')).catch(() => null);
    
    if (popularCard) {
      const popularLinks = await popularCard.$$('a');
      console.log(`\n인기 포스트 카드 내 링크 수: ${popularLinks.length}개`);
      
      for (let i = 0; i < popularLinks.length; i++) {
        const link = popularLinks[i];
        const title = await link.$eval('h4', el => el.textContent).catch(() => null);
        const badge = await link.$('.bg-accent');
        
        if (title) {
          console.log(`  ${i + 1}. ${title} ${badge ? '⚠️ [주요 포스트 배지]' : ''}`);
        }
      }
    }
    
    // 스크린샷 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `sidebar-layout-check-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log(`\n📸 스크린샷 저장: sidebar-layout-check-${timestamp}.png`);
    
    // 문제 진단
    console.log('\n🚨 문제 진단:');
    const featuredInPopular = await popularCard?.$('.bg-accent');
    if (featuredInPopular) {
      console.log('❌ 주요 포스트가 인기 포스트 섹션 내부에 표시되고 있습니다!');
      console.log('   → 별도의 주요 포스트 카드가 필요합니다.');
    } else {
      console.log('✅ 주요 포스트가 별도 카드로 표시되고 있습니다.');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
})();