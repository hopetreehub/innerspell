const { chromium } = require('playwright');

(async () => {
  console.log("🔍 타로 카드 크기 문제 상세 분석 시작...");
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // 1. 리딩 페이지로 이동
    console.log("\n1️⃣ 리딩 페이지로 이동 중...");
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(2000);
    
    // 2. 카드 섞기
    console.log("\n2️⃣ 카드 섞기 중...");
    const shuffleButton = await page.$('button:has-text("카드 섞기")');
    if (shuffleButton) {
      await shuffleButton.click();
      await page.waitForTimeout(1500);
    }
    
    // 3. 카드 펼치기
    console.log("\n3️⃣ 카드 펼치기 중...");
    const spreadButton = await page.$('button:has-text("카드 펼치기")');
    if (spreadButton) {
      await spreadButton.click();
      await page.waitForTimeout(1000);
    }
    
    // 초기 스크린샷
    await page.screenshot({ 
      path: 'screenshots/card-size-1-spread.png', 
      fullPage: true 
    });
    
    // 4. 카드 컨테이너와 이미지 분석
    console.log("\n4️⃣ 카드 뒷면 이미지 분석...");
    const cardAnalysis = await page.evaluate(() => {
      // 카드 뒷면 이미지들 찾기
      const cardContainers = document.querySelectorAll('[role="button"]');
      const results = [];
      
      cardContainers.forEach((container, index) => {
        if (index >= 3) return; // 처음 3개만 분석
        
        const img = container.querySelector('img[src*="back.png"]');
        if (!img) return;
        
        const containerRect = container.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        const containerStyles = window.getComputedStyle(container);
        const imgStyles = window.getComputedStyle(img);
        
        // 부모 요소들 확인
        let parent = container.parentElement;
        const parentInfo = [];
        for (let i = 0; i < 3 && parent; i++) {
          const parentRect = parent.getBoundingClientRect();
          const parentStyles = window.getComputedStyle(parent);
          parentInfo.push({
            className: parent.className,
            width: parentRect.width,
            height: parentRect.height,
            overflow: parentStyles.overflow
          });
          parent = parent.parentElement;
        }
        
        results.push({
          index: index + 1,
          container: {
            width: containerRect.width,
            height: containerRect.height,
            className: container.className,
            overflow: containerStyles.overflow,
            position: containerStyles.position
          },
          image: {
            src: img.src,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            displayWidth: imgRect.width,
            displayHeight: imgRect.height,
            objectFit: imgStyles.objectFit,
            objectPosition: imgStyles.objectPosition,
            width: imgStyles.width,
            height: imgStyles.height,
            maxWidth: imgStyles.maxWidth,
            maxHeight: imgStyles.maxHeight
          },
          parentHierarchy: parentInfo,
          isClipped: imgRect.width > containerRect.width || imgRect.height > containerRect.height
        });
      });
      
      return results;
    });
    
    console.log("\n📊 카드 분석 결과:");
    cardAnalysis.forEach(card => {
      console.log(`\n카드 ${card.index}:`);
      console.log(`컨테이너: ${card.container.width}x${card.container.height}px`);
      console.log(`이미지 실제: ${card.image.naturalWidth}x${card.image.naturalHeight}px`);
      console.log(`이미지 표시: ${card.image.displayWidth}x${card.image.displayHeight}px`);
      console.log(`object-fit: ${card.image.objectFit}`);
      console.log(`잘림 여부: ${card.isClipped ? '❌ 잘림' : '✅ 정상'}`);
      
      if (card.isClipped) {
        console.log(`⚠️  이미지가 컨테이너보다 큽니다!`);
      }
    });
    
    // 5. 카드 선택하여 앞면 확인
    console.log("\n5️⃣ 카드를 선택하여 앞면 확인...");
    const cards = await page.$$('[role="button"]');
    
    // 처음 3개 카드 선택
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      await cards[i].click();
      await page.waitForTimeout(500);
    }
    
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'screenshots/card-size-2-selected.png', 
      fullPage: true 
    });
    
    // 6. 선택된 카드 앞면 분석
    console.log("\n6️⃣ 선택된 카드 앞면 분석...");
    const selectedCardAnalysis = await page.evaluate(() => {
      const selectedCards = document.querySelectorAll('[aria-label*="선택된 카드"]');
      const results = [];
      
      selectedCards.forEach((card, index) => {
        const img = card.querySelector('img');
        if (!img) return;
        
        const cardRect = card.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        const cardStyles = window.getComputedStyle(card);
        const imgStyles = window.getComputedStyle(img);
        
        results.push({
          index: index + 1,
          cardContainer: {
            width: cardRect.width,
            height: cardRect.height,
            className: card.className,
            style: card.getAttribute('style')
          },
          image: {
            src: img.src.split('/').pop(),
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            displayWidth: imgRect.width,
            displayHeight: imgRect.height,
            objectFit: imgStyles.objectFit,
            isReversed: img.className.includes('rotate-180')
          },
          aspectRatio: {
            natural: (img.naturalHeight / img.naturalWidth).toFixed(3),
            container: (cardRect.height / cardRect.width).toFixed(3)
          }
        });
      });
      
      return results;
    });
    
    console.log("\n🎴 선택된 카드 분석:");
    selectedCardAnalysis.forEach(card => {
      console.log(`\n카드 ${card.index} (${card.image.src}):`);
      console.log(`컨테이너: ${card.cardContainer.width}x${card.cardContainer.height}px`);
      console.log(`이미지: ${card.image.naturalWidth}x${card.image.naturalHeight}px`);
      console.log(`비율 - 이미지: ${card.aspectRatio.natural}, 컨테이너: ${card.aspectRatio.container}`);
      console.log(`역방향: ${card.image.isReversed ? '예' : '아니오'}`);
    });
    
    // 7. CSS 스타일 추출
    console.log("\n7️⃣ CSS 스타일 추출...");
    const cssInfo = await page.evaluate(() => {
      const card = document.querySelector('[role="button"]');
      if (!card) return null;
      
      // Tailwind 클래스 확인
      const h80Class = Array.from(document.styleSheets)
        .flatMap(sheet => {
          try {
            return Array.from(sheet.cssRules || []);
          } catch (e) {
            return [];
          }
        })
        .find(rule => rule.selectorText && rule.selectorText.includes('.h-80'));
      
      return {
        cardClasses: card.className,
        h80Style: h80Class ? h80Class.style.cssText : 'not found',
        computedHeight: window.getComputedStyle(card).height
      };
    });
    
    if (cssInfo) {
      console.log("\n🎨 CSS 정보:");
      console.log(`카드 클래스: ${cssInfo.cardClasses}`);
      console.log(`h-80 스타일: ${cssInfo.h80Style}`);
      console.log(`계산된 높이: ${cssInfo.computedHeight}`);
    }
    
    // 8. 문제 진단 및 해결책
    console.log("\n🔍 최종 진단:");
    console.log("\n문제점:");
    console.log("1. 카드 컨테이너가 200x320px로 고정됨 (h-80 = 320px)");
    console.log("2. 타로 카드 이미지 비율은 약 1:1.6 (512x819)");
    console.log("3. 컨테이너 비율은 1:1.6으로 이미지와 동일하지만, 절대 크기가 작음");
    console.log("4. object-contain이 설정되어 있지만, 이미지가 제대로 맞지 않을 수 있음");
    
    console.log("\n해결 방안:");
    console.log("1. 카드 높이를 더 크게 조정 (예: h-96 = 384px)");
    console.log("2. 또는 카드 너비를 줄여서 비율 맞추기");
    console.log("3. aspect-ratio CSS 속성 사용 고려");
    console.log("4. 이미지에 object-fit: contain 확실히 적용");
    
    console.log("\n✅ 분석 완료!");
    
  } catch (error) {
    console.error("❌ 오류 발생:", error);
  } finally {
    // 브라우저 열어둠
    console.log("\n브라우저를 열어두었습니다. 직접 확인하세요.");
    // await browser.close();
  }
})();