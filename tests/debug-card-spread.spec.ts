import { test, expect } from '@playwright/test';

test.describe('카드 스프레드 디버그 테스트', () => {
  test('카드 스프레드 상세 분석', async ({ page }) => {
    test.setTimeout(180000); // 3분으로 연장
    
    // 페이지 로드
    await page.goto('http://localhost:4000/reading', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    console.log('📍 1. 페이지 로드 완료');
    await page.screenshot({ path: 'debug-screenshots/01-page-loaded.png', fullPage: true });
    
    // 질문 입력
    const questionTextarea = page.locator('textarea[placeholder*="카드에게"]').first();
    if (await questionTextarea.isVisible()) {
      await questionTextarea.fill('내 연애운은 어떤가요?');
      console.log('✅ 질문 입력 완료');
    }
    
    // 카드 덱 상태 확인
    const cardStack = page.locator('.relative.mx-auto').first();
    console.log('📍 2. 카드 덱 상태 확인');
    await page.screenshot({ path: 'debug-screenshots/02-initial-deck.png', fullPage: true });
    
    // 모든 버튼들의 상태 확인
    const allButtons = await page.locator('button').all();
    console.log('🔘 초기 버튼 상태:');
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      const isEnabled = await allButtons[i].isEnabled();
      const isVisible = await allButtons[i].isVisible();
      console.log(`  - 버튼 ${i + 1}: "${text}" | 활성화: ${isEnabled} | 가시: ${isVisible}`);
    }
    
    // 섞기 버튼 찾기 및 클릭
    const shuffleButton = page.locator('button').filter({ hasText: /섞기|shuffle/i }).first();
    if (await shuffleButton.isVisible()) {
      console.log('📍 3. 섞기 버튼 클릭');
      await shuffleButton.click();
      
      // 섞기 애니메이션 시작 확인
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'debug-screenshots/03-shuffle-started.png', fullPage: true });
      
      // 섞기 완료 대기 (더 길게)
      console.log('⏳ 섞기 애니메이션 완료 대기...');
      await page.waitForTimeout(10000); // 10초 대기
      
      await page.screenshot({ path: 'debug-screenshots/04-shuffle-completed.png', fullPage: true });
      
      // 섞기 완료 후 버튼 상태 재확인
      const allButtonsAfterShuffle = await page.locator('button').all();
      console.log('🔘 섞기 완료 후 버튼 상태:');
      for (let i = 0; i < allButtonsAfterShuffle.length; i++) {
        const text = await allButtonsAfterShuffle[i].textContent();
        const isEnabled = await allButtonsAfterShuffle[i].isEnabled();
        const isVisible = await allButtonsAfterShuffle[i].isVisible();
        console.log(`  - 버튼 ${i + 1}: "${text}" | 활성화: ${isEnabled} | 가시: ${isVisible}`);
      }
    }
    
    // 펼치기 버튼 찾기
    const spreadButton = page.locator('button').filter({ hasText: /펼치|spread/i }).first();
    console.log('📍 4. 펼치기 버튼 상태 확인');
    
    if (await spreadButton.isVisible()) {
      const isEnabled = await spreadButton.isEnabled();
      console.log(`펼치기 버튼 활성화 여부: ${isEnabled}`);
      
      if (isEnabled) {
        console.log('📍 5. 펼치기 버튼 클릭');
        await spreadButton.click();
        
        // 펼치기 애니메이션 대기
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'debug-screenshots/05-cards-spread.png', fullPage: true });
        
        // 펼쳐진 카드들 확인
        const cards = page.locator('div[role="button"][tabindex="0"]').or(page.locator('img[src*="tarot"], img[src*="back.webp"]'));
        const cardCount = await cards.count();
        console.log(`🃏 펼쳐진 카드 개수: ${cardCount}`);
        
        if (cardCount > 0) {
          // 카드들의 위치 정보 확인
          for (let i = 0; i < Math.min(cardCount, 5); i++) {
            const cardBox = await cards.nth(i).boundingBox();
            console.log(`카드 ${i + 1} 위치:`, cardBox);
          }
          
          // 첫 번째 카드 클릭 시도
          console.log('📍 6. 첫 번째 카드 선택');
          await cards.first().click();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ path: 'debug-screenshots/06-card-selected.png', fullPage: true });
          
          // 선택된 카드 확인
          const selectedCards = page.locator('div[aria-label*="선택된 카드"]');
          const selectedCount = await selectedCards.count();
          console.log(`✅ 선택된 카드 개수: ${selectedCount}`);
        }
      } else {
        console.log('❌ 펼치기 버튼이 비활성화되어 있음');
      }
    } else {
      console.log('❌ 펼치기 버튼을 찾을 수 없음');
    }
    
    // 최종 상태 스크린샷
    await page.screenshot({ path: 'debug-screenshots/07-final-state.png', fullPage: true });
  });
});