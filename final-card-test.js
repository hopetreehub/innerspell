const { chromium } = require('playwright');

(async () => {
  console.log("🎴 최종 타로 카드 표시 테스트...");
  
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
    
    // 2. 질문 입력
    console.log("\n2️⃣ 질문 입력...");
    const questionTextarea = await page.$('textarea[placeholder*="질문을 입력하세요"]');
    if (questionTextarea) {
      await questionTextarea.fill('타로 카드가 제대로 표시되는지 확인하고 싶습니다.');
    }
    
    // 초기 화면 스크린샷
    await page.screenshot({ 
      path: 'screenshots/final-card-1-initial.png', 
      fullPage: true 
    });
    
    // 3. 카드 섞기
    console.log("\n3️⃣ 카드 섞기...");
    const shuffleButton = await page.$('button:has-text("카드 섞기")');
    if (shuffleButton) {
      await shuffleButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 4. 카드 펼치기
    console.log("\n4️⃣ 카드 펼치기...");
    const spreadButton = await page.$('button:has-text("카드 펼치기")');
    if (spreadButton) {
      await spreadButton.click();
      await page.waitForTimeout(1500);
      
      // 펼쳐진 카드 스크린샷
      await page.screenshot({ 
        path: 'screenshots/final-card-2-spread.png', 
        fullPage: true 
      });
    }
    
    // 5. 카드 분석
    console.log("\n5️⃣ 카드 크기 분석...");
    const cardAnalysis = await page.evaluate(() => {
      const cards = document.querySelectorAll('[role="button"]');
      const results = [];
      
      // 처음 3개 카드만 분석
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        const card = cards[i];
        const img = card.querySelector('img');
        
        if (!img) continue;
        
        const cardRect = card.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        
        results.push({
          index: i + 1,
          container: {
            width: Math.round(cardRect.width),
            height: Math.round(cardRect.height)
          },
          image: {
            displayWidth: Math.round(imgRect.width),
            displayHeight: Math.round(imgRect.height),
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            objectFit: window.getComputedStyle(img).objectFit
          },
          isClipped: imgRect.width > cardRect.width || imgRect.height > cardRect.height
        });
      }
      
      return results;
    });
    
    console.log("\n📊 카드 분석 결과:");
    cardAnalysis.forEach(card => {
      console.log(`\n카드 ${card.index}:`);
      console.log(`- 컨테이너: ${card.container.width}x${card.container.height}px`);
      console.log(`- 이미지 표시: ${card.image.displayWidth}x${card.image.displayHeight}px`);
      console.log(`- 이미지 실제: ${card.image.naturalWidth}x${card.image.naturalHeight}px`);
      console.log(`- object-fit: ${card.image.objectFit}`);
      console.log(`- 상태: ${card.isClipped ? '❌ 잘림' : '✅ 정상'}`);
    });
    
    // 6. 카드 선택
    console.log("\n6️⃣ 카드 3개 선택...");
    const cardButtons = await page.$$('[role="button"]');
    for (let i = 0; i < Math.min(3, cardButtons.length); i++) {
      await cardButtons[i].click();
      await page.waitForTimeout(500);
    }
    
    await page.waitForTimeout(1000);
    
    // 선택된 카드 스크린샷
    await page.screenshot({ 
      path: 'screenshots/final-card-3-selected.png', 
      fullPage: true 
    });
    
    // 7. 선택된 카드 분석
    const selectedAnalysis = await page.evaluate(() => {
      const selectedCards = document.querySelectorAll('[aria-label*="선택된 카드"]');
      const results = [];
      
      selectedCards.forEach((card, index) => {
        const img = card.querySelector('img');
        if (!img) return;
        
        const cardRect = card.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        
        results.push({
          index: index + 1,
          container: `${Math.round(cardRect.width)}x${Math.round(cardRect.height)}px`,
          image: `${Math.round(imgRect.width)}x${Math.round(imgRect.height)}px`,
          naturalSize: `${img.naturalWidth}x${img.naturalHeight}px`,
          fileName: img.src.split('/').pop()
        });
      });
      
      return results;
    });
    
    if (selectedAnalysis.length > 0) {
      console.log("\n🎴 선택된 카드:");
      selectedAnalysis.forEach(card => {
        console.log(`\n카드 ${card.index} (${card.fileName}):`);
        console.log(`- 컨테이너: ${card.container}`);
        console.log(`- 이미지 표시: ${card.image}`);
        console.log(`- 이미지 실제: ${card.naturalSize}`);
      });
    }
    
    console.log("\n✅ 테스트 완료!");
    console.log("\n📸 스크린샷 저장 위치:");
    console.log("- screenshots/final-card-1-initial.png (초기 화면)");
    console.log("- screenshots/final-card-2-spread.png (카드 펼친 화면)");
    console.log("- screenshots/final-card-3-selected.png (카드 선택 화면)");
    
    console.log("\n브라우저를 열어두었습니다. 직접 확인하세요.");
    
  } catch (error) {
    console.error("❌ 오류:", error);
    await page.screenshot({ 
      path: 'screenshots/final-card-error.png', 
      fullPage: true 
    });
  }
})();