const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log("🔍 타로 카드 이미지 분석 시작...");
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // 1. 리딩 페이지로 이동
    console.log("1️⃣ 리딩 페이지로 이동 중...");
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(3000);
    
    // 초기 상태 스크린샷
    await page.screenshot({ 
      path: 'screenshots/card-analysis-1-initial.png', 
      fullPage: true 
    });
    
    // 2. 카드 백 이미지 분석
    console.log("\n2️⃣ 카드 백(back.png) 이미지 분석...");
    const cardBacks = await page.$$('.bg-gradient-to-br.from-purple-600.to-indigo-600 img[src="/tarot-cards/back.png"]');
    
    if (cardBacks.length > 0) {
      console.log(`   - 카드 백 이미지 개수: ${cardBacks.length}개`);
      
      // 첫 번째 카드 백 이미지 분석
      const firstCardBack = cardBacks[0];
      const backImageInfo = await firstCardBack.evaluate((img) => {
        const rect = img.getBoundingClientRect();
        const styles = window.getComputedStyle(img);
        const container = img.closest('.bg-gradient-to-br');
        const containerRect = container?.getBoundingClientRect();
        const containerStyles = container ? window.getComputedStyle(container) : null;
        
        return {
          image: {
            src: img.src,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            displayWidth: rect.width,
            displayHeight: rect.height,
            objectFit: styles.objectFit,
            objectPosition: styles.objectPosition,
            width: styles.width,
            height: styles.height,
            maxWidth: styles.maxWidth,
            maxHeight: styles.maxHeight
          },
          container: container ? {
            width: containerRect.width,
            height: containerRect.height,
            padding: containerStyles.padding,
            overflow: containerStyles.overflow,
            position: containerStyles.position
          } : null
        };
      });
      
      console.log("\n   📐 카드 백 이미지 정보:");
      console.log(`   - 실제 이미지 크기: ${backImageInfo.image.naturalWidth}x${backImageInfo.image.naturalHeight}px`);
      console.log(`   - 표시 크기: ${backImageInfo.image.displayWidth}x${backImageInfo.image.displayHeight}px`);
      console.log(`   - object-fit: ${backImageInfo.image.objectFit}`);
      console.log(`   - CSS width: ${backImageInfo.image.width}, height: ${backImageInfo.image.height}`);
      
      if (backImageInfo.container) {
        console.log("\n   📦 컨테이너 정보:");
        console.log(`   - 컨테이너 크기: ${backImageInfo.container.width}x${backImageInfo.container.height}px`);
        console.log(`   - overflow: ${backImageInfo.container.overflow}`);
        console.log(`   - padding: ${backImageInfo.container.padding}`);
      }
    }
    
    // 3. 카드 섞기 및 앞면 확인
    console.log("\n3️⃣ 카드를 섞어서 앞면 확인...");
    const shuffleButton = await page.$('button:has-text("카드 섞기")');
    
    if (shuffleButton) {
      await shuffleButton.click();
      await page.waitForTimeout(1500);
      
      await page.screenshot({ 
        path: 'screenshots/card-analysis-2-shuffled.png', 
        fullPage: true 
      });
      
      // 카드 선택하여 앞면 확인
      console.log("\n4️⃣ 카드를 선택하여 앞면 확인...");
      
      // 첫 번째 카드 클릭
      const firstCard = await page.$('.bg-gradient-to-br.from-purple-600.to-indigo-600');
      if (firstCard) {
        await firstCard.click();
        await page.waitForTimeout(1000);
      }
      
      // 두 번째 카드 클릭
      const cards = await page.$$('.bg-gradient-to-br.from-purple-600.to-indigo-600');
      if (cards.length > 1) {
        await cards[1].click();
        await page.waitForTimeout(1000);
      }
      
      // 세 번째 카드 클릭
      if (cards.length > 2) {
        await cards[2].click();
        await page.waitForTimeout(1000);
      }
      
      await page.screenshot({ 
        path: 'screenshots/card-analysis-3-selected.png', 
        fullPage: true 
      });
      
      // 앞면 카드 분석
      const frontCards = await page.$$('img[src*="/tarot-cards/"]:not([src*="back.png"])');
      
      if (frontCards.length > 0) {
        console.log(`\n   - 앞면 카드 개수: ${frontCards.length}개`);
        
        const firstFrontCard = frontCards[0];
        const frontImageInfo = await firstFrontCard.evaluate((img) => {
          const rect = img.getBoundingClientRect();
          const styles = window.getComputedStyle(img);
          const container = img.closest('.bg-white');
          const containerRect = container?.getBoundingClientRect();
          
          return {
            image: {
              src: img.src,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              displayWidth: rect.width,
              displayHeight: rect.height,
              objectFit: styles.objectFit
            },
            container: container ? {
              width: containerRect.width,
              height: containerRect.height
            } : null
          };
        });
        
        console.log("\n   📐 앞면 카드 이미지 정보:");
        console.log(`   - 실제 이미지 크기: ${frontImageInfo.image.naturalWidth}x${frontImageInfo.image.naturalHeight}px`);
        console.log(`   - 표시 크기: ${frontImageInfo.image.displayWidth}x${frontImageInfo.image.displayHeight}px`);
        console.log(`   - object-fit: ${frontImageInfo.image.objectFit}`);
        
        if (frontImageInfo.container) {
          console.log(`   - 컨테이너 크기: ${frontImageInfo.container.width}x${frontImageInfo.container.height}px`);
        }
      }
    }
    
    // 5. CSS 스타일 상세 분석
    console.log("\n5️⃣ CSS 스타일 상세 분석...");
    const cssAnalysis = await page.evaluate(() => {
      const card = document.querySelector('.bg-gradient-to-br.from-purple-600.to-indigo-600');
      const img = card?.querySelector('img');
      
      if (!card || !img) return null;
      
      const cardStyles = window.getComputedStyle(card);
      const imgStyles = window.getComputedStyle(img);
      
      // 부모 요소들의 크기도 확인
      let parent = card.parentElement;
      const parentSizes = [];
      while (parent && parent !== document.body) {
        const parentRect = parent.getBoundingClientRect();
        const parentStyles = window.getComputedStyle(parent);
        parentSizes.push({
          tagName: parent.tagName,
          className: parent.className,
          width: parentRect.width,
          height: parentRect.height,
          overflow: parentStyles.overflow
        });
        parent = parent.parentElement;
      }
      
      return {
        card: {
          width: cardStyles.width,
          height: cardStyles.height,
          padding: cardStyles.padding,
          overflow: cardStyles.overflow,
          display: cardStyles.display,
          position: cardStyles.position
        },
        image: {
          width: imgStyles.width,
          height: imgStyles.height,
          maxWidth: imgStyles.maxWidth,
          maxHeight: imgStyles.maxHeight,
          objectFit: imgStyles.objectFit,
          position: imgStyles.position,
          top: imgStyles.top,
          left: imgStyles.left,
          transform: imgStyles.transform
        },
        parentHierarchy: parentSizes
      };
    });
    
    if (cssAnalysis) {
      console.log("\n   🎨 CSS 스타일 분석 결과:");
      console.log("   카드 컨테이너:", cssAnalysis.card);
      console.log("   이미지 스타일:", cssAnalysis.image);
      console.log("\n   부모 요소 계층구조:");
      cssAnalysis.parentHierarchy.forEach((parent, index) => {
        console.log(`   ${' '.repeat(index * 2)}- ${parent.tagName}.${parent.className}: ${parent.width}x${parent.height}px (overflow: ${parent.overflow})`);
      });
    }
    
    // 6. 문제 진단
    console.log("\n6️⃣ 문제 진단 결과:");
    console.log("   ❌ 이미지가 잘리는 이유:");
    console.log("   - 컨테이너 크기가 320x200px로 고정되어 있음");
    console.log("   - 타로 카드 이미지의 실제 비율과 컨테이너 비율이 맞지 않음");
    console.log("   - object-contain이 설정되어 있지만, 이미지가 컨테이너보다 클 경우 잘림");
    console.log("\n   ✅ 해결 방안:");
    console.log("   1. 컨테이너의 aspect-ratio를 카드 이미지 비율에 맞게 조정");
    console.log("   2. 이미지에 object-fit: contain 확실히 적용");
    console.log("   3. 컨테이너의 overflow: hidden 제거 고려");
    
    console.log("\n✅ 분석 완료! 스크린샷이 screenshots 폴더에 저장되었습니다.");
    
  } catch (error) {
    console.error("❌ 오류 발생:", error);
  } finally {
    await browser.close();
  }
})();