const { chromium } = require('playwright');

async function checkCardBack() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🔍 카드 뒷면 혼입 확인 테스트...\n');
    
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // Issue 버튼 닫기
    const closeButton = page.locator('button[aria-label="Close"]').first();
    if (await closeButton.count() > 0) {
      await closeButton.click();
      await page.waitForTimeout(1000);
    }
    
    // 질문 입력 및 카드 섞기
    await page.locator('textarea').fill('카드 뒷면 확인 테스트');
    await page.waitForTimeout(1000);
    
    const deck = page.locator('div[aria-label*="카드 덱"]').first();
    if (await deck.count() > 0) {
      await deck.click();
    } else {
      await page.locator('button:has-text("카드 섞기")').first().click();
    }
    
    await page.waitForTimeout(8000);
    
    // 카드 펼치기
    const spreadButton = page.locator('button:has-text("카드 펼치기")').first();
    if (await spreadButton.count() > 0) {
      await spreadButton.click();
      await page.waitForTimeout(3000);
    }
    
    // 펼쳐진 카드들의 이미지 소스 확인
    console.log('📋 펼쳐진 카드 이미지 분석...');
    const spreadCards = await page.locator('.flex.space-x-\\[-125px\\] img').all();
    
    console.log(`🃏 총 펼쳐진 카드: ${spreadCards.length}장`);
    
    let backCardCount = 0;
    let frontCardCount = 0;
    const imageSources = [];
    
    for (let i = 0; i < Math.min(spreadCards.length, 10); i++) { // 첫 10장만 체크
      const imgSrc = await spreadCards[i].getAttribute('src');
      const imgAlt = await spreadCards[i].getAttribute('alt');
      
      imageSources.push({ index: i + 1, src: imgSrc, alt: imgAlt });
      
      if (imgSrc && imgSrc.includes('back.png')) {
        backCardCount++;
        console.log(`❌ ${i + 1}번째 카드: 뒷면 (${imgAlt})`);
      } else {
        frontCardCount++;
        console.log(`✅ ${i + 1}번째 카드: 앞면 (${imgAlt})`);
      }
    }
    
    console.log(`\n📊 카드 분석 결과 (첫 10장):`);
    console.log(`   - 뒷면 카드: ${backCardCount}장`);
    console.log(`   - 앞면 카드: ${frontCardCount}장`);
    
    // 카드 사이즈 측정
    if (spreadCards.length > 0) {
      const cardBox = await spreadCards[0].boundingBox();
      console.log(`\n📐 현재 카드 사이즈:`);
      console.log(`   - 너비: ${cardBox.width.toFixed(2)}px`);
      console.log(`   - 높이: ${cardBox.height.toFixed(2)}px`);
    }
    
    await page.screenshot({ path: 'card-back-check.png', fullPage: false });
    
    return {
      success: true,
      totalCards: spreadCards.length,
      backCards: backCardCount,
      frontCards: frontCardCount,
      imageSources: imageSources
    };
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

checkCardBack().then(result => {
  console.log('\n' + '='.repeat(50));
  console.log('📊 카드 뒷면 확인 결과:');
  console.log(JSON.stringify(result, null, 2));
  console.log('='.repeat(50));
  
  if (result.success && result.backCards > 0) {
    console.log('\n⚠️  경고: 펼쳐진 카드 중에 뒷면이 포함되어 있습니다!');
  } else if (result.success) {
    console.log('\n✅ 모든 펼쳐진 카드가 정상적으로 앞면입니다!');
  }
});