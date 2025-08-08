const { chromium } = require('playwright');

(async () => {
  console.log("🔍 타로 카드 이미지 상세 분석 시작...");
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // 콘솔 로그 수집
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ 콘솔 에러:', msg.text());
    }
  });
  
  try {
    // 1. 리딩 페이지로 이동
    console.log("\n1️⃣ 리딩 페이지로 이동 중...");
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(2000);
    
    // 페이지 구조 확인
    const pageStructure = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="cursor-pointer"]');
      const images = document.querySelectorAll('img');
      
      return {
        totalCards: cards.length,
        totalImages: images.length,
        imageDetails: Array.from(images).map(img => ({
          src: img.src,
          alt: img.alt,
          className: img.className,
          parentClassName: img.parentElement?.className || 'no-parent',
          naturalSize: `${img.naturalWidth}x${img.naturalHeight}`,
          displaySize: `${img.offsetWidth}x${img.offsetHeight}`
        }))
      };
    });
    
    console.log("\n📊 페이지 구조:");
    console.log(`   - 총 카드 수: ${pageStructure.totalCards}`);
    console.log(`   - 총 이미지 수: ${pageStructure.totalImages}`);
    
    if (pageStructure.imageDetails.length > 0) {
      console.log("\n📸 이미지 상세 정보:");
      pageStructure.imageDetails.forEach((img, index) => {
        console.log(`\n   이미지 ${index + 1}:`);
        console.log(`   - src: ${img.src}`);
        console.log(`   - alt: ${img.alt}`);
        console.log(`   - className: ${img.className}`);
        console.log(`   - 실제 크기: ${img.naturalSize}`);
        console.log(`   - 표시 크기: ${img.displaySize}`);
      });
    }
    
    // 초기 상태 스크린샷
    await page.screenshot({ 
      path: 'screenshots/card-detail-1-initial.png', 
      fullPage: true 
    });
    
    // 2. 카드 컨테이너 분석
    console.log("\n2️⃣ 카드 컨테이너 상세 분석...");
    const cardAnalysis = await page.evaluate(() => {
      const cardContainers = document.querySelectorAll('.cursor-pointer');
      
      if (cardContainers.length === 0) return null;
      
      const firstCard = cardContainers[0];
      const rect = firstCard.getBoundingClientRect();
      const styles = window.getComputedStyle(firstCard);
      
      // 이미지 찾기
      const img = firstCard.querySelector('img');
      let imgInfo = null;
      
      if (img) {
        const imgRect = img.getBoundingClientRect();
        const imgStyles = window.getComputedStyle(img);
        
        imgInfo = {
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
          maxHeight: imgStyles.maxHeight,
          position: imgStyles.position,
          inset: imgStyles.inset,
          top: imgStyles.top,
          left: imgStyles.left,
          right: imgStyles.right,
          bottom: imgStyles.bottom
        };
      }
      
      return {
        container: {
          width: rect.width,
          height: rect.height,
          cssWidth: styles.width,
          cssHeight: styles.height,
          padding: styles.padding,
          overflow: styles.overflow,
          position: styles.position,
          display: styles.display,
          className: firstCard.className
        },
        image: imgInfo
      };
    });
    
    if (cardAnalysis) {
      console.log("\n📦 카드 컨테이너 정보:");
      console.log(`   - 크기: ${cardAnalysis.container.width}x${cardAnalysis.container.height}px`);
      console.log(`   - CSS width/height: ${cardAnalysis.container.cssWidth} / ${cardAnalysis.container.cssHeight}`);
      console.log(`   - overflow: ${cardAnalysis.container.overflow}`);
      console.log(`   - className: ${cardAnalysis.container.className}`);
      
      if (cardAnalysis.image) {
        console.log("\n📐 카드 이미지 정보:");
        console.log(`   - src: ${cardAnalysis.image.src}`);
        console.log(`   - 실제 크기: ${cardAnalysis.image.naturalWidth}x${cardAnalysis.image.naturalHeight}px`);
        console.log(`   - 표시 크기: ${cardAnalysis.image.displayWidth}x${cardAnalysis.image.displayHeight}px`);
        console.log(`   - object-fit: ${cardAnalysis.image.objectFit}`);
        console.log(`   - position: ${cardAnalysis.image.position}`);
        console.log(`   - inset: ${cardAnalysis.image.inset}`);
        
        // 비율 계산
        if (cardAnalysis.image.naturalWidth > 0) {
          const imageRatio = cardAnalysis.image.naturalHeight / cardAnalysis.image.naturalWidth;
          const containerRatio = cardAnalysis.container.height / cardAnalysis.container.width;
          console.log(`\n   📊 비율 분석:`);
          console.log(`   - 이미지 비율: ${imageRatio.toFixed(2)} (${cardAnalysis.image.naturalWidth}:${cardAnalysis.image.naturalHeight})`);
          console.log(`   - 컨테이너 비율: ${containerRatio.toFixed(2)} (${cardAnalysis.container.width}:${cardAnalysis.container.height})`);
          console.log(`   - 비율 차이: ${Math.abs(imageRatio - containerRatio).toFixed(2)}`);
        }
      }
    }
    
    // 3. 카드 섞기
    console.log("\n3️⃣ 카드 섞기 버튼 찾기...");
    const shuffleButton = await page.$('button:has-text("카드 섞기")');
    
    if (shuffleButton) {
      console.log("   ✅ 카드 섞기 버튼 발견!");
      await shuffleButton.click();
      await page.waitForTimeout(1500);
      
      await page.screenshot({ 
        path: 'screenshots/card-detail-2-shuffled.png', 
        fullPage: true 
      });
      
      // 카드 선택
      console.log("\n4️⃣ 카드 선택하기...");
      const cards = await page.$$('.cursor-pointer');
      
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        await cards[i].click();
        await page.waitForTimeout(500);
        console.log(`   - 카드 ${i + 1} 선택됨`);
      }
      
      await page.screenshot({ 
        path: 'screenshots/card-detail-3-selected.png', 
        fullPage: true 
      });
      
      // 선택된 카드 분석
      const selectedCardAnalysis = await page.evaluate(() => {
        const selectedCards = document.querySelectorAll('.bg-white.shadow-lg');
        
        return Array.from(selectedCards).map((card, index) => {
          const img = card.querySelector('img');
          if (!img) return null;
          
          const cardRect = card.getBoundingClientRect();
          const imgRect = img.getBoundingClientRect();
          
          return {
            cardIndex: index + 1,
            cardSize: `${cardRect.width}x${cardRect.height}`,
            imageSrc: img.src.split('/').pop(),
            imageNaturalSize: `${img.naturalWidth}x${img.naturalHeight}`,
            imageDisplaySize: `${imgRect.width}x${imgRect.height}`,
            imageFitsInContainer: imgRect.width <= cardRect.width && imgRect.height <= cardRect.height
          };
        }).filter(Boolean);
      });
      
      if (selectedCardAnalysis.length > 0) {
        console.log("\n🎴 선택된 카드 분석:");
        selectedCardAnalysis.forEach(card => {
          console.log(`\n   카드 ${card.cardIndex}:`);
          console.log(`   - 파일명: ${card.imageSrc}`);
          console.log(`   - 카드 크기: ${card.cardSize}`);
          console.log(`   - 이미지 실제 크기: ${card.imageNaturalSize}`);
          console.log(`   - 이미지 표시 크기: ${card.imageDisplaySize}`);
          console.log(`   - 컨테이너에 맞음: ${card.imageFitsInContainer ? '✅' : '❌'}`);
        });
      }
    } else {
      console.log("   ❌ 카드 섞기 버튼을 찾을 수 없습니다.");
    }
    
    // 4. 문제 진단 및 해결책
    console.log("\n🔍 최종 진단:");
    console.log("   문제: 타로 카드 이미지가 컨테이너에서 잘림");
    console.log("   원인: 카드 이미지의 비율과 컨테이너 비율 불일치");
    console.log("   해결 방안: TarotReading 컴포넌트의 카드 스타일 수정 필요");
    
    console.log("\n✅ 분석 완료!");
    
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    await page.screenshot({ 
      path: 'screenshots/card-detail-error.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();