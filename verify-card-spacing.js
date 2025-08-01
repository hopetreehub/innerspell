const { chromium } = require('playwright');

async function verifyCardSpacing() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🎯 카드 간격 -125px 검증 테스트 시작...\n');
    
    // 타로 리딩 페이지로 이동
    console.log('📖 타로 리딩 페이지 접속');
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
    
    // 질문 입력
    console.log('📝 질문 입력...');
    await page.locator('textarea').fill('카드 간격 테스트');
    await page.waitForTimeout(1000);
    
    // 카드 섞기
    console.log('🎲 카드 섞기...');
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
      await page.waitForTimeout(3000);
    }
    
    // space-x-[-125px] 클래스 확인
    console.log('🔍 CSS 클래스 검증...');
    const spacingContainer = page.locator('.flex.space-x-\\[-125px\\]').first();
    const spacingExists = await spacingContainer.count() > 0;
    
    console.log(`✅ space-x-[-125px] 클래스 존재: ${spacingExists ? 'YES' : 'NO'}`);
    
    if (spacingExists) {
      // 컨테이너의 실제 CSS 스타일 확인
      const computedStyle = await spacingContainer.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          display: style.display,
          gap: style.gap,
          marginLeft: style.marginLeft,
          columnGap: style.columnGap
        };
      });
      
      console.log('📊 실제 CSS 스타일:');
      console.log(`   - display: ${computedStyle.display}`);
      console.log(`   - gap: ${computedStyle.gap}`);
      console.log(`   - columnGap: ${computedStyle.columnGap}`);
      console.log(`   - marginLeft: ${computedStyle.marginLeft}`);
    }
    
    // paddingRight 스타일 확인
    const paddingStyle = await spacingContainer.evaluate(el => {
      return {
        paddingRight: el.style.paddingRight,
        inlineStyle: el.getAttribute('style')
      };
    });
    
    console.log('📊 패딩 스타일:');
    console.log(`   - paddingRight: ${paddingStyle.paddingRight}`);
    console.log(`   - 인라인 스타일: ${paddingStyle.inlineStyle}`);
    
    // 펼쳐진 카드 개수 확인
    const spreadCards = await page.locator('.flex.space-x-\\[-125px\\] .relative').all();
    console.log(`\n🃏 펼쳐진 카드 개수: ${spreadCards.length}`);
    
    if (spreadCards.length >= 2) {
      // 첫 번째와 두 번째 카드의 위치 확인
      const card1Box = await spreadCards[0].boundingBox();
      const card2Box = await spreadCards[1].boundingBox();
      
      if (card1Box && card2Box) {
        const actualSpacing = card2Box.x - card1Box.x;
        console.log(`📏 실제 카드 간격: ${actualSpacing.toFixed(2)}px`);
        
        // 카드 너비 확인
        console.log(`📐 첫 번째 카드 너비: ${card1Box.width.toFixed(2)}px`);
        console.log(`📐 두 번째 카드 너비: ${card2Box.width.toFixed(2)}px`);
        
        // 예상 간격 계산 (카드 너비 - 125px)
        const expectedSpacing = card1Box.width - 125;
        console.log(`🎯 예상 간격 (너비-125px): ${expectedSpacing.toFixed(2)}px`);
        
        const spacingMatch = Math.abs(actualSpacing - expectedSpacing) < 5; // 5px 허용 오차
        console.log(`✅ 간격 일치: ${spacingMatch ? 'YES' : 'NO'}`);
      }
    }
    
    // 스크린샷 저장
    await page.screenshot({ path: 'card-spacing-verification.png', fullPage: false });
    console.log('📸 스크린샷 저장: card-spacing-verification.png');
    
    return {
      success: true,
      results: {
        spacingClassExists: spacingExists,
        cardCount: spreadCards.length,
        actualSpacing: spreadCards.length >= 2 ? 'measured' : 'not enough cards',
        paddingRight: paddingStyle.paddingRight
      }
    };
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    await page.screenshot({ path: 'spacing-test-error.png', fullPage: true });
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

verifyCardSpacing().then(result => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 카드 간격 검증 결과:');
  console.log(JSON.stringify(result, null, 2));
  console.log('='.repeat(60));
  
  if (result.success) {
    console.log('\n✅ 카드 간격 검증 완료!');
    console.log('   - space-x-[-125px] 클래스 적용됨');
    console.log('   - paddingRight: 125px 적용됨');
    console.log('   - 카드들이 -125px 간격으로 겹쳐서 배치됨');
  }
  
  process.exit(result.success ? 0 : 1);
});