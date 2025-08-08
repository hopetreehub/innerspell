const { chromium } = require('playwright');

(async () => {
  console.log("🎴 타로 카드 수정 사항 확인...");
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // 1. 리딩 페이지로 이동
    console.log("\n1️⃣ 리딩 페이지로 이동...");
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(3000);
    
    // 초기 화면 스크린샷
    await page.screenshot({ 
      path: 'screenshots/card-fix-1-initial.png', 
      fullPage: true 
    });
    
    // 2. 카드 섞기
    console.log("\n2️⃣ 카드 섞기...");
    const shuffleButton = await page.$('button:has-text("카드 섞기")');
    if (shuffleButton) {
      await shuffleButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 3. 카드 펼치기
    console.log("\n3️⃣ 카드 펼치기...");
    const spreadButton = await page.$('button:has-text("카드 펼치기")');
    if (spreadButton) {
      await spreadButton.click();
      await page.waitForTimeout(1500);
      
      // 펼쳐진 카드 스크린샷
      await page.screenshot({ 
        path: 'screenshots/card-fix-2-spread.png', 
        fullPage: true 
      });
    }
    
    // 4. 카드 분석
    console.log("\n4️⃣ 카드 크기 분석...");
    const cardAnalysis = await page.evaluate(() => {
      const card = document.querySelector('[role="button"]');
      const img = card?.querySelector('img');
      
      if (!card || !img) return null;
      
      const cardRect = card.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      const cardStyles = window.getComputedStyle(card);
      const imgStyles = window.getComputedStyle(img);
      
      // aspect-ratio 클래스 확인
      const wrapper = img.closest('div');
      const wrapperClasses = wrapper?.className || '';
      
      return {
        container: {
          width: cardRect.width,
          height: cardRect.height,
          className: card.className
        },
        wrapper: {
          className: wrapperClasses,
          aspectRatio: window.getComputedStyle(wrapper).aspectRatio
        },
        image: {
          naturalSize: `${img.naturalWidth}x${img.naturalHeight}`,
          displaySize: `${imgRect.width}x${imgRect.height}`,
          objectFit: imgStyles.objectFit,
          isClipped: imgRect.width > cardRect.width || imgRect.height > cardRect.height
        }
      };
    });
    
    if (cardAnalysis) {
      console.log("\n📊 카드 분석 결과:");
      console.log(`컨테이너: ${cardAnalysis.container.width}x${cardAnalysis.container.height}px`);
      console.log(`래퍼 클래스: ${cardAnalysis.wrapper.className}`);
      console.log(`래퍼 aspect-ratio: ${cardAnalysis.wrapper.aspectRatio}`);
      console.log(`이미지 실제: ${cardAnalysis.image.naturalSize}`);
      console.log(`이미지 표시: ${cardAnalysis.image.displaySize}`);
      console.log(`object-fit: ${cardAnalysis.image.objectFit}`);
      console.log(`잘림 여부: ${cardAnalysis.image.isClipped ? '❌ 잘림' : '✅ 정상'}`);
    }
    
    // 5. 카드 선택
    console.log("\n5️⃣ 카드 선택...");
    const cards = await page.$$('[role="button"]');
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      await cards[i].click();
      await page.waitForTimeout(500);
    }
    
    await page.waitForTimeout(1000);
    
    // 선택된 카드 스크린샷
    await page.screenshot({ 
      path: 'screenshots/card-fix-3-selected.png', 
      fullPage: true 
    });
    
    // 6. 선택된 카드 분석
    const selectedAnalysis = await page.evaluate(() => {
      const selectedCard = document.querySelector('[aria-label*="선택된 카드"]');
      const img = selectedCard?.querySelector('img');
      
      if (!selectedCard || !img) return null;
      
      const cardRect = selectedCard.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      
      return {
        container: `${cardRect.width}x${cardRect.height}px`,
        image: `${imgRect.width}x${imgRect.height}px`,
        naturalSize: `${img.naturalWidth}x${img.naturalHeight}px`
      };
    });
    
    if (selectedAnalysis) {
      console.log("\n🎴 선택된 카드:");
      console.log(`컨테이너: ${selectedAnalysis.container}`);
      console.log(`이미지 표시: ${selectedAnalysis.image}`);
      console.log(`이미지 실제: ${selectedAnalysis.naturalSize}`);
    }
    
    console.log("\n✅ 확인 완료! 스크린샷이 저장되었습니다.");
    console.log("브라우저를 열어두었습니다. 직접 확인하세요.");
    
  } catch (error) {
    console.error("❌ 오류:", error);
  }
})();