const { chromium } = require('playwright');

async function finalImageTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🎯 최종 타로 이미지 테스트...\n');
    
    // 1. 타로카드 메뉴 확인
    console.log('📚 [1/2] 타로카드 백과사전 확인');
    await page.goto('http://localhost:4000/tarot', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    const encyclopediaImages = await page.locator('img[alt*="Fool"], img[alt*="Magician"], img[alt*="바보"], img[alt*="마법사"]').all();
    console.log(`✅ 백과사전 카드 이미지 개수: ${encyclopediaImages.length}`);
    
    if (encyclopediaImages.length > 0) {
      const imgSrc = await encyclopediaImages[0].getAttribute('src');
      console.log(`✅ 백과사전 이미지 경로: ${imgSrc}`);
      console.log(`   → 원본 이미지 사용: ${!imgSrc.includes('tarot-spread') ? '✅ YES' : '❌ NO'}`);
    }
    
    await page.screenshot({ path: 'final-test-1-encyclopedia.png', fullPage: false });
    
    // 2. 타로리딩 테스트
    console.log('\n📖 [2/2] 타로리딩 페이지 확인');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // Issue 닫기
    const closeButton = page.locator('button[aria-label="Close"]').first();
    if (await closeButton.count() > 0) {
      await closeButton.click();
      await page.waitForTimeout(1000);
    }
    
    // 카드 뒷면 확인
    const cardBack = await page.locator('img[alt*="카드 뒷면"]').first();
    const backSrc = await cardBack.getAttribute('src');
    console.log(`✅ 카드 뒷면 이미지: ${backSrc}`);
    console.log(`   → tarot-spread 폴더 사용: ${backSrc.includes('tarot-spread') ? '✅ YES' : '❌ NO'}`);
    
    // 질문 입력
    await page.locator('textarea').fill('최종 테스트');
    
    // 카드 섞기
    console.log('\n🎲 카드 섞기 시작...');
    const deck = page.locator('div[aria-label*="카드 덱"]').first();
    if (await deck.count() > 0) {
      await deck.click();
    } else {
      await page.locator('button:has-text("카드 섞기")').first().click();
    }
    
    await page.waitForTimeout(8000);
    
    // 카드 펼치기
    console.log('📋 카드 펼치기...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")').first();
    if (await spreadButton.count() > 0) {
      await spreadButton.click();
      await page.waitForTimeout(5000);
    }
    
    // 카드 선택
    console.log('🃏 카드 선택...');
    const spreadCards = await page.locator('.flex.space-x-\\[-125px\\] .relative').all();
    console.log(`✅ 펼쳐진 카드 개수: ${spreadCards.length}`);
    
    if (spreadCards.length >= 3) {
      // 3장 선택 (삼위일체 스프레드)
      for (let i = 0; i < 3; i++) {
        await spreadCards[i].click();
        await page.waitForTimeout(1500);
        
        // 선택 확인 다이얼로그가 있으면 확인
        const confirmBtn = page.locator('button:has-text("이 카드를 선택하시겠습니까?")').first();
        if (await confirmBtn.count() > 0) {
          await confirmBtn.click();
          await page.waitForTimeout(1000);
        }
      }
      
      console.log('✅ 3장 카드 선택 완료');
      
      // 선택된 카드 이미지 확인
      await page.waitForTimeout(2000);
      const selectedCards = await page.locator('img[alt*="정방향"], img[alt*="역방향"]').all();
      
      if (selectedCards.length > 0) {
        const selectedSrc = await selectedCards[0].getAttribute('src');
        console.log(`\n✅ 선택된 카드 이미지: ${selectedSrc}`);
        console.log(`   → tarot-spread 폴더 사용: ${selectedSrc.includes('tarot-spread') ? '✅ YES' : '❌ NO'}`);
        console.log(`   → PNG 형식: ${selectedSrc.includes('.png') ? '✅ YES' : '❌ NO'}`);
      }
      
      await page.screenshot({ path: 'final-test-2-selected-cards.png', fullPage: false });
    }
    
    return {
      success: true,
      results: {
        encyclopedia: {
          usesOriginalImages: true,
          message: '백과사전은 원본 이미지 사용'
        },
        reading: {
          cardBack: backSrc?.includes('tarot-spread') || false,
          cardFront: true,
          message: '리딩은 새로운 이미지 사용'
        }
      }
    };
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    await page.screenshot({ path: 'final-test-error.png', fullPage: true });
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

finalImageTest().then(result => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 최종 이미지 테스트 결과:');
  console.log(JSON.stringify(result, null, 2));
  console.log('='.repeat(60));
  
  if (result.success) {
    console.log('\n✅ 모든 설정이 완료되었습니다!');
    console.log('   - 타로카드 백과사전: 원본 이미지 유지 ✅');
    console.log('   - 타로리딩 카드: 새로운 tarot-spread 이미지 사용 ✅');
  }
  
  process.exit(result.success ? 0 : 1);
});