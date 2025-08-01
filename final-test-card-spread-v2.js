const { chromium } = require('playwright');

async function finalTestCardSpreadV2() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🎯 최종 카드 펼치기 테스트 V2 시작...');
    
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ 페이지 로드 완료');
    await page.waitForTimeout(3000);
    
    // Issue 버튼이 있으면 닫기
    const issueButton = page.locator('button:has-text("issue")');
    const issueCount = await issueButton.count();
    if (issueCount > 0) {
      console.log('⚠️ Issue 버튼 발견, 닫기 시도...');
      const closeButton = page.locator('button[aria-label="Close"]').first();
      if (await closeButton.count() > 0) {
        await closeButton.click();
        console.log('✅ Issue 닫기 완료');
        await page.waitForTimeout(1000);
      }
    }
    
    // 1. 초기 상태 스크린샷
    await page.screenshot({ path: 'final-v2-1-initial.png', fullPage: true });
    console.log('📸 초기 상태 스크린샷 저장');
    
    // 2. 필요한 경우 질문 입력
    const textarea = page.locator('textarea');
    if (await textarea.count() > 0) {
      const currentValue = await textarea.inputValue();
      if (!currentValue) {
        await textarea.fill('카드 펼치기 테스트 질문입니다.');
        console.log('✍️ 질문 입력 완료');
      }
    }
    
    // 3. 카드 덱 클릭 (섞기)
    console.log('🎲 카드 덱 클릭하여 섞기...');
    const cardDeck = page.locator('div[aria-label*="카드 덱"]').first();
    const deckCount = await cardDeck.count();
    
    if (deckCount > 0) {
      await cardDeck.click();
      console.log('✅ 카드 덱 클릭 완료');
    } else {
      // 대체 방법: 카드 섞기 버튼 찾기
      const shuffleButton = page.locator('button:has-text("카드 섞기")').first();
      if (await shuffleButton.count() > 0) {
        await shuffleButton.click();
        console.log('✅ 카드 섞기 버튼 클릭 완료');
      }
    }
    
    // 4. 섞기 애니메이션 대기
    console.log('⏳ 카드 섞기 애니메이션 대기 중...');
    await page.waitForTimeout(8000);
    
    // 5. 섞기 완료 후 스크린샷
    await page.screenshot({ path: 'final-v2-2-after-shuffle.png', fullPage: true });
    console.log('📸 카드 섞기 완료 스크린샷 저장');
    
    // 6. 카드 펼치기 버튼 찾기
    console.log('📋 카드 펼치기 버튼 확인...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")').first();
    const spreadButtonCount = await spreadButton.count();
    
    if (spreadButtonCount > 0) {
      console.log('✅ 카드 펼치기 버튼 발견! 클릭합니다...');
      await spreadButton.click();
      
      // 7. 카드 펼치기 애니메이션 대기
      console.log('⏳ 카드 펼치기 애니메이션 대기 중...');
      await page.waitForTimeout(5000);
      
      // 8. 최종 카드 펼침 상태 스크린샷
      await page.screenshot({ path: 'final-v2-3-cards-spread.png', fullPage: true });
      console.log('📸 카드 펼침 상태 스크린샷 저장');
      
      // 9. 카드 간격 확인
      console.log('\n🔍 카드 간격 분석 중...');
      
      // space-x-[-125px] 컨테이너 확인
      const spreadContainer125 = await page.locator('.flex.space-x-\\[-125px\\]').count();
      console.log(`✅ space-x-[-125px] 컨테이너 개수: ${spreadContainer125}`);
      
      // space-x-[-60px] 컨테이너도 확인 (이전 버전)
      const spreadContainer60 = await page.locator('.flex.space-x-\\[-60px\\]').count();
      console.log(`ℹ️ space-x-[-60px] 컨테이너 개수: ${spreadContainer60}`);
      
      // 사용된 간격 확인
      const spacing = spreadContainer125 > 0 ? '-125px' : (spreadContainer60 > 0 ? '-60px' : 'unknown');
      console.log(`📏 사용된 카드 간격: ${spacing}`);
      
      // 펼쳐진 카드 개수 확인
      const selector = spreadContainer125 > 0 ? '.flex.space-x-\\[-125px\\] .relative' : '.flex.space-x-\\[-60px\\] .relative';
      const spreadCards = await page.locator(selector).count();
      console.log(`✅ 펼쳐진 카드 개수: ${spreadCards}`);
      
      // 카드 이미지 확인
      const imgSelector = spreadContainer125 > 0 ? '.flex.space-x-\\[-125px\\] img[alt*="카드"]' : '.flex.space-x-\\[-60px\\] img[alt*="카드"]';
      const cardImages = await page.locator(imgSelector).count();
      console.log(`✅ 카드 이미지 개수: ${cardImages}`);
      
      // 카드 위치 정보 수집
      if (spreadCards > 0) {
        const firstFewCards = await page.locator(selector).all();
        console.log('\n📊 카드 위치 분석 (처음 5장):');
        
        for (let i = 0; i < Math.min(5, firstFewCards.length); i++) {
          const card = firstFewCards[i];
          const box = await card.boundingBox();
          if (box) {
            console.log(`카드 ${i + 1}: x=${box.x.toFixed(1)}, y=${box.y.toFixed(1)}, width=${box.width.toFixed(1)}, height=${box.height.toFixed(1)}`);
            if (i > 0) {
              const prevCard = firstFewCards[i-1];
              const prevBox = await prevCard.boundingBox();
              if (prevBox) {
                const gap = box.x - (prevBox.x + prevBox.width);
                console.log(`  → 카드 ${i}와 ${i+1} 사이 간격: ${gap.toFixed(1)}px`);
              }
            }
          }
        }
      }
      
      // 10. 카드 높이 확인
      if (spreadCards > 0) {
        console.log('\n📐 카드 세로 크기 확인:');
        const firstCard = await page.locator(selector).first();
        const cardBox = await firstCard.boundingBox();
        if (cardBox) {
          console.log(`✅ 카드 높이: ${cardBox.height.toFixed(1)}px`);
          console.log(`✅ 카드 너비: ${cardBox.width.toFixed(1)}px`);
          console.log(`✅ 종횡비: ${(cardBox.width / cardBox.height).toFixed(2)}`);
        }
      }
      
      return {
        success: true,
        results: {
          spreadContainer125: spreadContainer125 > 0,
          spreadContainer60: spreadContainer60 > 0,
          actualSpacing: spacing,
          cardCount: spreadCards,
          cardImages: cardImages,
          message: `카드가 ${spacing} 간격으로 ${spreadCards}장 펼쳐졌습니다.`
        }
      };
      
    } else {
      console.log('❌ 카드 펼치기 버튼을 찾을 수 없습니다');
      
      // 대체 확인: 카드가 이미 펼쳐져 있는지 확인
      const alreadySpread125 = await page.locator('.flex.space-x-\\[-125px\\]').count();
      const alreadySpread60 = await page.locator('.flex.space-x-\\[-60px\\]').count();
      
      if (alreadySpread125 > 0 || alreadySpread60 > 0) {
        console.log('ℹ️ 카드가 이미 펼쳐져 있습니다!');
        const spacing = alreadySpread125 > 0 ? '-125px' : '-60px';
        const selector = alreadySpread125 > 0 ? '.flex.space-x-\\[-125px\\] .relative' : '.flex.space-x-\\[-60px\\] .relative';
        const cardCount = await page.locator(selector).count();
        
        return {
          success: true,
          results: {
            alreadySpread: true,
            actualSpacing: spacing,
            cardCount: cardCount,
            message: `카드가 이미 ${spacing} 간격으로 ${cardCount}장 펼쳐져 있습니다.`
          }
        };
      }
      
      return { success: false, error: 'Spread button not found and cards not spread' };
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    await page.screenshot({ path: 'final-v2-error.png', fullPage: true });
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

finalTestCardSpreadV2().then(result => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 최종 테스트 V2 결과:');
  console.log(JSON.stringify(result, null, 2));
  console.log('='.repeat(60));
  process.exit(result.success ? 0 : 1);
});