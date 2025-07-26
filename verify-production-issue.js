const { chromium } = require('playwright');

(async () => {
  console.log('🚨 씨크릿 창 문제 긴급 검증...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--incognito'] // 시크릿 모드
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 현재 배포된 버전 접속
    console.log('1️⃣ 현재 배포 버전 접속 (시크릿 모드)...');
    await page.goto('https://test-studio-firebase.vercel.app/blog', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(5000);
    
    // 페이지 소스 확인
    console.log('\n2️⃣ HTML 소스 분석...');
    const pageSource = await page.content();
    
    // 사이드바 영역 찾기
    const sidebarExists = pageSource.includes('lg:col-span-1');
    console.log(`사이드바 존재: ${sidebarExists ? '✅' : '❌'}`);
    
    // 뷰포트 크기 확인
    const viewport = page.viewportSize();
    console.log(`\n뷰포트 크기: ${viewport.width}x${viewport.height}`);
    
    // 다양한 선택자로 사이드바 찾기
    console.log('\n3️⃣ 사이드바 요소 찾기...');
    
    // 방법 1: 클래스 선택자
    let sidebar = await page.$('.lg\\:col-span-1');
    if (!sidebar) {
      console.log('   → lg:col-span-1 클래스로 찾지 못함');
      
      // 방법 2: 속성 선택자
      sidebar = await page.$('[class*="col-span-1"]');
      if (!sidebar) {
        console.log('   → col-span-1 포함 클래스로도 찾지 못함');
        
        // 방법 3: 구조적 선택자
        sidebar = await page.$('div:has(> div > h3:text("인기 포스트"))').then(el => el?.$('..'));
      }
    }
    
    if (sidebar) {
      console.log('✅ 사이드바를 찾았습니다!');
      
      // 사이드바 내부 HTML 가져오기
      const sidebarHTML = await sidebar.innerHTML();
      
      // 인기 포스트와 주요 포스트 위치 확인
      const popularIndex = sidebarHTML.indexOf('인기 포스트');
      const featuredIndex = sidebarHTML.indexOf('주요 포스트');
      
      console.log(`\n4️⃣ 콘텐츠 위치 분석:`);
      console.log(`   인기 포스트 위치: ${popularIndex}`);
      console.log(`   주요 포스트 위치: ${featuredIndex}`);
      
      if (popularIndex > -1 && featuredIndex > -1) {
        if (featuredIndex > popularIndex) {
          // 주요 포스트 섹션이 인기 포스트 카드 닫기 태그 전에 있는지 확인
          const popularCardEnd = sidebarHTML.indexOf('</div>', sidebarHTML.indexOf('</div>', popularIndex) + 1);
          
          if (featuredIndex < popularCardEnd) {
            console.log('\n❌ 문제 확인: 주요 포스트가 인기 포스트 카드 내부에 있습니다!');
            console.log(`   인기 포스트 카드 끝: ${popularCardEnd}`);
            console.log(`   주요 포스트 시작: ${featuredIndex}`);
          } else {
            console.log('\n✅ 정상: 주요 포스트가 독립적으로 표시됩니다.');
          }
        }
      }
      
      // 카드 개수와 구조 확인
      const cards = await sidebar.$$('.card, [class*="rounded-lg"][class*="border"]');
      console.log(`\n5️⃣ 발견된 카드 수: ${cards.length}개`);
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const h3Text = await card.$eval('h3', el => el.textContent).catch(() => 'N/A');
        const cardBounds = await card.boundingBox();
        
        console.log(`\n카드 ${i + 1}: ${h3Text}`);
        if (cardBounds) {
          console.log(`   위치: Y=${cardBounds.y}, 높이=${cardBounds.height}`);
        }
      }
    } else {
      console.log('❌ 사이드바를 찾을 수 없습니다!');
      
      // 전체 페이지 구조 확인
      const mainContent = await page.$('main');
      if (mainContent) {
        const mainHTML = await mainContent.innerHTML();
        console.log('\n페이지에 인기 포스트 텍스트 존재:', mainHTML.includes('인기 포스트'));
        console.log('페이지에 주요 포스트 텍스트 존재:', mainHTML.includes('주요 포스트'));
      }
    }
    
    // 스크린샷 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `production-issue-${timestamp}.png`,
      fullPage: true 
    });
    console.log(`\n📸 스크린샷 저장: production-issue-${timestamp}.png`);
    
  } catch (error) {
    console.error('❌ 검증 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
})();