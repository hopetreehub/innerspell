const { chromium } = require('playwright');

(async () => {
  console.log('🎴 타로 카드 상세 크기 확인 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ko-KR'
  });
  const page = await context.newPage();

  try {
    // 타로 리딩 페이지로 이동
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 카드 덱 이미지 분석
    const cardDeck = await page.locator('img[alt="카드 뒷면 뭉치"]').first();
    if (await cardDeck.isVisible()) {
      const deckBox = await cardDeck.boundingBox();
      const deckClass = await cardDeck.getAttribute('class');
      const deckStyle = await cardDeck.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          width: styles.width,
          height: styles.height,
          objectFit: styles.objectFit
        };
      });
      
      console.log('📦 카드 덱 (뒷면 뭉치):');
      console.log(`  - 클래스: ${deckClass}`);
      console.log(`  - 실제 크기: ${deckBox?.width}x${deckBox?.height}px`);
      console.log(`  - CSS 스타일:`, deckStyle);
    }

    // 카드 덱 컨테이너 분석
    const deckContainer = await page.locator('.h-80').first();
    if (await deckContainer.isVisible()) {
      const containerBox = await deckContainer.boundingBox();
      const containerClass = await deckContainer.getAttribute('class');
      console.log('\n📦 카드 덱 컨테이너 (h-80):');
      console.log(`  - 클래스: ${containerClass}`);
      console.log(`  - 실제 크기: ${containerBox?.width}x${containerBox?.height}px`);
    }

    // 세 장 스프레드 선택
    await page.locator('button[role="combobox"]').first().click();
    await page.waitForTimeout(500);
    await page.locator('text="세 장 스프레드"').click();
    await page.waitForTimeout(500);

    // 질문 입력
    await page.fill('textarea#question', '타로 카드 크기 확인용 테스트');

    // 셔플 버튼 클릭
    await page.locator('button:has-text("셔플")').click();
    await page.waitForTimeout(3000);

    // 펼치기 버튼 클릭
    await page.locator('button:has-text("펼치기")').click();
    await page.waitForTimeout(2000);

    // 펼쳐진 카드들 스크린샷
    await page.screenshot({ 
      path: 'screenshots/tarot-spread-detail.png',
      fullPage: false,
      clip: { x: 0, y: 400, width: 1920, height: 600 }
    });

    // 펼쳐진 카드 분석
    const spreadCards = await page.locator('.space-x-\\[-188px\\] img').all();
    console.log(`\n🃏 펼쳐진 카드 수: ${spreadCards.length}`);
    
    for (let i = 0; i < Math.min(3, spreadCards.length); i++) {
      const card = spreadCards[i];
      const box = await card.boundingBox();
      const className = await card.getAttribute('class');
      
      console.log(`\n펼쳐진 카드 ${i + 1}:`);
      console.log(`  - 클래스: ${className}`);
      console.log(`  - 실제 크기: ${box?.width}x${box?.height}px`);
    }

    // 카드 3장 선택
    const cardContainers = await page.locator('.space-x-\\[-188px\\] > div').all();
    for (let i = 0; i < Math.min(3, cardContainers.length); i++) {
      await cardContainers[i].click();
      await page.waitForTimeout(500);
    }

    await page.waitForTimeout(1000);

    // 선택된 카드 스크린샷
    await page.screenshot({ 
      path: 'screenshots/tarot-selected-detail.png',
      fullPage: false,
      clip: { x: 0, y: 800, width: 1920, height: 600 }
    });

    // 선택된 카드 분석
    const selectedCards = await page.locator('img[alt*="정방향"], img[alt*="역방향"]').all();
    console.log(`\n✅ 선택된 카드 이미지 수: ${selectedCards.length}`);
    
    for (let i = 0; i < selectedCards.length; i++) {
      const card = selectedCards[i];
      const box = await card.boundingBox();
      const src = await card.getAttribute('src');
      const alt = await card.getAttribute('alt');
      const className = await card.getAttribute('class');
      
      console.log(`\n선택된 카드 ${i + 1}:`);
      console.log(`  - alt: ${alt}`);
      console.log(`  - src: ${src}`);
      console.log(`  - 클래스: ${className}`);
      console.log(`  - 실제 크기: ${box?.width}x${box?.height}px`);
    }

    // 전체 페이지 최종 스크린샷
    await page.screenshot({ 
      path: 'screenshots/tarot-final-state.png',
      fullPage: true
    });

    console.log('\n✨ 타로 카드 상세 크기 확인 완료!');
    console.log('📸 스크린샷 파일:');
    console.log('  - screenshots/tarot-spread-detail.png');
    console.log('  - screenshots/tarot-selected-detail.png');
    console.log('  - screenshots/tarot-final-state.png');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }

  // 5초 후 브라우저 닫기
  await page.waitForTimeout(5000);
  await browser.close();
})();