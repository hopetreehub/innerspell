const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('타로 페이지 최종 확인...\n');
  
  try {
    await page.goto('http://localhost:4000/tarot', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 페이지 로드 완료 대기
    await page.waitForTimeout(2000);
    
    // 1. 로딩 메시지 확인
    const loadingVisible = await page.locator('text="카드를 불러오는 중..."').isVisible().catch(() => false);
    console.log(`1. "카드를 불러오는 중..." 메시지 표시 여부: ${loadingVisible}`);
    
    // 2. 카드 그리드 확인
    const cardGrid = await page.locator('.grid').first().isVisible().catch(() => false);
    console.log(`2. 카드 그리드 표시 여부: ${cardGrid}`);
    
    // 3. 카드 개수 확인
    const cardCount = await page.locator('.card-item, [class*="card"]').count();
    console.log(`3. 표시된 카드 개수: ${cardCount}`);
    
    // 4. 카드 이미지 확인
    const images = await page.locator('img[alt*="Tarot"], img[alt*="tarot"], img[src*="tarot"]').all();
    console.log(`4. 타로 카드 이미지 개수: ${images.length}`);
    
    // 5. 첫 번째 카드 클릭 가능 여부 확인
    const firstCardLink = page.locator('a[href*="/tarot/"]').first();
    const hasCardLink = await firstCardLink.isVisible().catch(() => false);
    console.log(`5. 카드 링크 존재 여부: ${hasCardLink}`);
    
    if (hasCardLink) {
      const href = await firstCardLink.getAttribute('href');
      console.log(`   첫 번째 카드 링크: ${href}`);
    }
    
    // 6. 탭 네비게이션 확인
    const tabs = await page.locator('[role="tablist"] button').all();
    console.log(`\n6. 탭 네비게이션:`);
    for (const tab of tabs) {
      const text = await tab.textContent();
      const isSelected = await tab.getAttribute('aria-selected');
      console.log(`   - ${text} (선택됨: ${isSelected === 'true'})`);
    }
    
    // 7. 검색 기능 확인
    const searchInput = await page.locator('input[placeholder*="검색"]').isVisible().catch(() => false);
    console.log(`\n7. 검색 입력창 표시 여부: ${searchInput}`);
    
    // 8. 페이지 제목과 설명 확인
    const pageTitle = await page.locator('h1').textContent();
    const pageDesc = await page.locator('p.text-muted-foreground').first().textContent();
    console.log(`\n8. 페이지 정보:`);
    console.log(`   제목: ${pageTitle}`);
    console.log(`   설명: ${pageDesc}`);
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'tarot-page-final-state.png',
      fullPage: true 
    });
    console.log('\n최종 스크린샷 저장: tarot-page-final-state.png');
    
    // 결론
    console.log('\n=== 최종 상태 요약 ===');
    if (loadingVisible) {
      console.log('❌ 페이지가 로딩 중 상태에서 멈춰있습니다.');
    } else if (cardCount > 0) {
      console.log('✅ 페이지가 정상적으로 로드되었고 카드들이 표시되고 있습니다.');
    } else {
      console.log('⚠️ 페이지는 로드되었지만 카드가 표시되지 않습니다.');
    }
    
  } catch (error) {
    console.error('확인 중 오류:', error);
  }
  
  console.log('\n브라우저 확인 후 Enter를 누르면 종료됩니다...');
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  await browser.close();
})();