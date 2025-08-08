const { chromium } = require('playwright');

(async () => {
  console.log('🎴 타로 카드 이미지 크기 확인 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ko-KR'
  });
  const page = await context.newPage();

  try {
    // 타로 리딩 페이지로 이동
    console.log('📍 타로 리딩 페이지로 이동 중...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 전체 페이지 스크린샷
    await page.screenshot({ 
      path: 'screenshots/tarot-reading-full-page.png',
      fullPage: true 
    });
    console.log('✅ 전체 페이지 스크린샷 저장됨');

    // 스프레드 선택
    const spreadSelect = await page.locator('button[role="combobox"]').first();
    if (await spreadSelect.isVisible()) {
      await spreadSelect.click();
      await page.waitForTimeout(500);
      
      // 세 장 스프레드 선택
      await page.locator('text="세 장 스프레드"').click();
      await page.waitForTimeout(500);
      console.log('✅ 세 장 스프레드 선택됨');
    }

    // 질문 입력
    await page.fill('textarea#question', '타로 카드 이미지 크기 테스트입니다.');

    // 셔플 버튼 클릭
    const shuffleButton = await page.locator('button:has-text("셔플")');
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      console.log('✅ 셔플 시작됨');
      await page.waitForTimeout(3000);
    }

    // 카드 덱 클릭해서 셔플
    const cardDeck = await page.locator('.group:has-text("덱 (섞기)")').first();
    if (await cardDeck.isVisible()) {
      await cardDeck.click();
      console.log('✅ 카드 덱 클릭으로 셔플');
      await page.waitForTimeout(3000);
    }

    // 펼치기 버튼 클릭
    const spreadButton = await page.locator('button:has-text("펼치기")');
    if (await spreadButton.isVisible()) {
      await spreadButton.click();
      console.log('✅ 카드 펼침');
      await page.waitForTimeout(2000);
      
      // 펼쳐진 카드 상태 스크린샷
      await page.screenshot({ 
        path: 'screenshots/tarot-spread-cards.png',
        fullPage: true 
      });
      console.log('✅ 펼쳐진 카드 스크린샷 저장됨');
    }

    // 카드 이미지 요소들 분석
    const cardImages = await page.locator('img[alt*="카드"]').all();
    console.log(`\n📊 발견된 카드 이미지 개수: ${cardImages.length}`);

    // 각 카드 이미지의 크기 정보 수집
    for (let i = 0; i < Math.min(5, cardImages.length); i++) {
      const card = cardImages[i];
      const boundingBox = await card.boundingBox();
      const src = await card.getAttribute('src');
      const className = await card.getAttribute('class');
      const computedStyle = await card.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          width: styles.width,
          height: styles.height,
          objectFit: styles.objectFit,
          maxWidth: styles.maxWidth,
          maxHeight: styles.maxHeight
        };
      });

      console.log(`\n카드 ${i + 1}:`);
      console.log(`  - src: ${src}`);
      console.log(`  - class: ${className}`);
      console.log(`  - 실제 크기: ${boundingBox?.width}x${boundingBox?.height}px`);
      console.log(`  - CSS 스타일:`, computedStyle);
    }

    // 카드 컨테이너 분석
    const cardContainers = await page.locator('.h-80').all();
    console.log(`\n📦 h-80 클래스를 가진 컨테이너 수: ${cardContainers.length}`);
    
    if (cardContainers.length > 0) {
      const container = cardContainers[0];
      const containerBox = await container.boundingBox();
      const containerStyle = await container.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          height: styles.height,
          width: styles.width,
          aspectRatio: styles.aspectRatio
        };
      });
      
      console.log('\n첫 번째 카드 컨테이너:');
      console.log(`  - 실제 크기: ${containerBox?.width}x${containerBox?.height}px`);
      console.log(`  - CSS 스타일:`, containerStyle);
    }

    // 카드 3장 선택
    console.log('\n🎯 카드 선택 중...');
    const spreadCards = await page.locator('.space-x-\\[-188px\\] > div').all();
    
    for (let i = 0; i < Math.min(3, spreadCards.length); i++) {
      await spreadCards[i].click();
      await page.waitForTimeout(500);
      console.log(`✅ 카드 ${i + 1} 선택됨`);
    }

    // 선택된 카드 스크린샷
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'screenshots/tarot-selected-cards.png',
      fullPage: true 
    });
    console.log('✅ 선택된 카드 스크린샷 저장됨');

    // 선택된 카드의 크기 분석
    const selectedCards = await page.locator('.border-primary\\/50, .border-destructive\\/50').all();
    console.log(`\n🃏 선택된 카드 수: ${selectedCards.length}`);
    
    for (let i = 0; i < selectedCards.length; i++) {
      const card = selectedCards[i];
      const boundingBox = await card.boundingBox();
      const img = await card.locator('img').first();
      const imgBox = await img.boundingBox();
      
      console.log(`\n선택된 카드 ${i + 1}:`);
      console.log(`  - 컨테이너 크기: ${boundingBox?.width}x${boundingBox?.height}px`);
      console.log(`  - 이미지 크기: ${imgBox?.width}x${imgBox?.height}px`);
    }

    console.log('\n✨ 타로 카드 크기 확인 완료!');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    await page.screenshot({ 
      path: 'screenshots/tarot-error-state.png',
      fullPage: true 
    });
  }

  // 브라우저는 열어둔 채로 유지
  console.log('\n🔍 브라우저를 열어둡니다. 수동으로 확인 후 닫아주세요.');
  // await browser.close();
})();