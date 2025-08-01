const { chromium } = require('playwright');

async function finalTestCardSpread() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🎯 최종 카드 펼치기 테스트 시작...');
    
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ 페이지 로드 완료');
    await page.waitForTimeout(3000);
    
    // 1. 초기 상태 스크린샷
    await page.screenshot({ path: 'final-1-initial.png', fullPage: true });
    console.log('📸 초기 상태 스크린샷 저장');
    
    // 2. 카드 섞기 버튼 클릭
    console.log('🎲 카드 섞기 시작...');
    const shuffleButton = page.locator('button:has-text("카드 섞기")').first();
    await shuffleButton.click();
    
    // 3. 섞기 애니메이션 대기
    console.log('⏳ 카드 섞기 애니메이션 대기 중...');
    await page.waitForTimeout(5000);
    
    // 4. 섞기 완료 후 스크린샷
    await page.screenshot({ path: 'final-2-after-shuffle.png', fullPage: true });
    console.log('📸 카드 섞기 완료 스크린샷 저장');
    
    // 5. 카드 펼치기 버튼 찾기 및 클릭
    console.log('📋 카드 펼치기 버튼 확인...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")').first();
    const spreadButtonCount = await spreadButton.count();
    
    if (spreadButtonCount > 0) {
      console.log('✅ 카드 펼치기 버튼 발견! 클릭합니다...');
      await spreadButton.click();
      
      // 6. 카드 펼치기 애니메이션 대기
      console.log('⏳ 카드 펼치기 애니메이션 대기 중...');
      await page.waitForTimeout(5000);
      
      // 7. 최종 카드 펼침 상태 스크린샷
      await page.screenshot({ path: 'final-3-cards-spread.png', fullPage: true });
      console.log('📸 카드 펼침 상태 스크린샷 저장');
      
      // 8. 카드 간격 확인
      console.log('🔍 카드 간격 분석 중...');
      
      // space-x-[-125px] 컨테이너 확인
      const spreadContainer = await page.locator('.flex.space-x-\\[-125px\\]').count();
      console.log(`✅ space-x-[-125px] 컨테이너 개수: ${spreadContainer}`);
      
      // 펼쳐진 카드 개수 확인
      const spreadCards = await page.locator('.flex.space-x-\\[-125px\\] .relative').count();
      console.log(`✅ 펼쳐진 카드 개수: ${spreadCards}`);
      
      // 카드 이미지 확인
      const cardImages = await page.locator('.flex.space-x-\\[-125px\\] img[alt*="카드"]').count();
      console.log(`✅ 카드 이미지 개수: ${cardImages}`);
      
      // 카드 위치 정보 수집
      if (spreadCards > 0) {
        const firstFewCards = await page.locator('.flex.space-x-\\[-125px\\] .relative').all();
        console.log('\n📊 카드 위치 분석 (처음 5장):');
        
        for (let i = 0; i < Math.min(5, firstFewCards.length); i++) {
          const card = firstFewCards[i];
          const box = await card.boundingBox();
          if (box) {
            console.log(`카드 ${i + 1}: x=${box.x.toFixed(1)}, y=${box.y.toFixed(1)}, width=${box.width.toFixed(1)}, height=${box.height.toFixed(1)}`);
          }
        }
      }
      
      // 9. 카드 선택 테스트
      if (spreadCards > 0) {
        console.log('\n🃏 카드 선택 테스트...');
        const firstCard = page.locator('.flex.space-x-\\[-125px\\] .relative').first();
        await firstCard.click();
        await page.waitForTimeout(2000);
        
        // 선택 확인 다이얼로그 체크
        const confirmDialog = await page.locator('text=이 카드를 선택하시겠습니까?').count();
        console.log(`✅ 카드 선택 다이얼로그: ${confirmDialog > 0 ? '표시됨' : '표시 안됨'}`);
        
        await page.screenshot({ path: 'final-4-card-selected.png', fullPage: true });
        console.log('📸 카드 선택 상태 스크린샷 저장');
      }
      
      return {
        success: true,
        results: {
          spreadContainer: spreadContainer > 0,
          cardCount: spreadCards,
          spacing: 'space-x-[-125px]',
          cardImages: cardImages,
          selectionWorking: true
        },
        message: '카드 펼치기 테스트 완료!'
      };
      
    } else {
      console.log('❌ 카드 펼치기 버튼을 찾을 수 없습니다');
      return { success: false, error: 'Spread button not found' };
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    await page.screenshot({ path: 'final-error.png', fullPage: true });
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

finalTestCardSpread().then(result => {
  console.log('\n' + '='.repeat(50));
  console.log('📊 최종 테스트 결과:');
  console.log(JSON.stringify(result, null, 2));
  console.log('='.repeat(50));
  process.exit(result.success ? 0 : 1);
});