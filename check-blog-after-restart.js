const { chromium } = require('playwright');

(async () => {
  console.log('🔍 서버 재시작 후 블로그 페이지 확인 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 메시지 수집
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (text.includes('블로그') || text.includes('포스트') || text.includes('데이터') || text.includes('로드')) {
      console.log(`📋 콘솔: ${text}`);
    }
  });
  
  try {
    console.log('1️⃣ 블로그 페이지 접속 중...');
    await page.goto('http://localhost:4000/blog', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    console.log('\n2️⃣ 블로그 포스트 확인 중...');
    
    // 블로그 포스트 카드 확인
    const postCards = await page.locator('.blog-card').all();
    console.log(`✅ 발견된 블로그 포스트 수: ${postCards.length}개`);
    
    if (postCards.length > 0) {
      console.log('\n📄 블로그 포스트 목록:');
      for (let i = 0; i < postCards.length; i++) {
        const card = postCards[i];
        
        // 제목 추출
        const titleElement = await card.locator('h3').first();
        const title = await titleElement.textContent().catch(() => '제목 없음');
        
        // 날짜 추출
        const dateElement = await card.locator('.text-gray-500').first();
        const date = await dateElement.textContent().catch(() => '날짜 없음');
        
        // 카테고리 추출
        const categoryElement = await card.locator('.bg-primary').first();
        const category = await categoryElement.textContent().catch(() => '카테고리 없음');
        
        console.log(`  ${i + 1}. ${title}`);
        console.log(`     - 카테고리: ${category}`);
        console.log(`     - 날짜: ${date}`);
      }
    } else {
      console.log('⚠️ 블로그 포스트가 표시되지 않습니다.');
      
      // 빈 상태 메시지 확인
      const emptyMessage = await page.locator('text=/포스트가 없습니다/').first();
      if (await emptyMessage.isVisible()) {
        console.log('📌 "포스트가 없습니다" 메시지가 표시됨');
      }
    }
    
    console.log('\n3️⃣ 카테고리별 포스트 수 확인...');
    
    // 카테고리 탭 확인
    const categoryTabs = await page.locator('.category-tabs button, [role="tab"]').all();
    console.log(`카테고리 탭 수: ${categoryTabs.length}개`);
    
    for (const tab of categoryTabs) {
      const tabText = await tab.textContent();
      console.log(`  - ${tabText}`);
    }
    
    console.log('\n4️⃣ 페이지 상태 스크린샷 캡처...');
    await page.screenshot({ 
      path: 'blog-after-restart.png',
      fullPage: true 
    });
    console.log('✅ 스크린샷 저장: blog-after-restart.png');
    
    // 네트워크 요청 확인을 위한 추가 대기
    console.log('\n5️⃣ 네트워크 활동 모니터링...');
    
    // 개발자 도구 열기 (선택사항)
    await page.keyboard.press('F12');
    await page.waitForTimeout(2000);
    
    // 콘솔 로그 요약
    console.log('\n📋 수집된 주요 콘솔 로그:');
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('블로그') || 
      log.includes('포스트') || 
      log.includes('데이터') ||
      log.includes('로드') ||
      log.includes('error') ||
      log.includes('Error')
    );
    
    if (relevantLogs.length > 0) {
      relevantLogs.forEach(log => console.log(`  ${log}`));
    } else {
      console.log('  - 관련 로그 없음');
    }
    
    // 추가 진단 정보
    console.log('\n6️⃣ 추가 진단 정보:');
    
    // 페이지 URL 확인
    console.log(`현재 URL: ${page.url()}`);
    
    // 페이지 제목 확인
    const pageTitle = await page.title();
    console.log(`페이지 제목: ${pageTitle}`);
    
    // 로딩 스피너 확인
    const loadingSpinner = await page.locator('.animate-spin, [role="status"]').first();
    if (await loadingSpinner.isVisible().catch(() => false)) {
      console.log('⚠️ 로딩 스피너가 여전히 표시되고 있습니다.');
    }
    
    console.log('\n✅ 블로그 페이지 확인 완료!');
    console.log('브라우저는 열려있습니다. 수동으로 확인 후 닫아주세요.');
    
    // 브라우저 열어둠 (수동 확인용)
    await page.waitForTimeout(60000); // 1분 대기
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    // 오류 시 스크린샷
    await page.screenshot({ 
      path: 'blog-error-after-restart.png',
      fullPage: true 
    }).catch(() => {});
    
  } finally {
    await browser.close();
  }
})();