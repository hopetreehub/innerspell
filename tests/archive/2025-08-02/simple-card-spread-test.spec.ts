import { test, expect } from '@playwright/test';

test.describe('간단한 카드 스프레드 테스트', () => {
  test('카드 스프레드 완전한 플로우', async ({ page }) => {
    test.setTimeout(120000);
    
    // 페이지 로드
    await page.goto('http://localhost:4000/reading', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('✅ 페이지 로드 완료');
    
    // 질문 입력
    const questionTextarea = page.locator('textarea[placeholder*="카드에게"]').first();
    await questionTextarea.fill('내 미래는 어떻게 될까요?');
    console.log('✅ 질문 입력 완료');
    
    // 섞기 버튼 클릭
    const shuffleButton = page.locator('button').filter({ hasText: /섞기|shuffle/i }).first();
    await shuffleButton.click();
    console.log('✅ 섞기 시작');
    
    // 섞기 완료 대기 (10초)
    await page.waitForTimeout(10000);
    console.log('✅ 섞기 완료');
    
    // 펼치기 버튼 클릭
    const spreadButton = page.locator('button').filter({ hasText: /펼치|spread/i }).first();
    await spreadButton.click();
    console.log('✅ 카드 펼치기 완료');
    
    // 카드 펼쳐짐 대기
    await page.waitForTimeout(3000);
    
    // 펼쳐진 카드들 확인 (클릭 가능한 카드들)
    const clickableCards = page.locator('div[role="button"][tabindex="0"]');
    const cardCount = await clickableCards.count();
    console.log(`🃏 펼쳐진 클릭 가능한 카드 개수: ${cardCount}`);
    
    // 스프레드 정보 확인
    const spreadInfo = page.locator('h3:has-text("펼쳐진 카드")');
    if (await spreadInfo.isVisible()) {
      const spreadText = await spreadInfo.textContent();
      console.log(`📊 스프레드 정보: ${spreadText}`);
    }
    
    // 필요한 카드 수만큼 선택 (Trinity View는 3장)
    const requiredCards = 3;
    for (let i = 0; i < Math.min(requiredCards, cardCount); i++) {
      await clickableCards.nth(i).click();
      console.log(`✅ 카드 ${i + 1} 선택 완료`);
      await page.waitForTimeout(1000); // 각 선택 간 1초 대기
    }
    
    // 선택된 카드 확인
    const selectedCardsSection = page.locator('div:has-text("선택된 카드")');
    if (await selectedCardsSection.isVisible()) {
      console.log('✅ 선택된 카드 섹션 확인됨');
    }
    
    // AI 해석 버튼 확인
    const interpretButton = page.locator('button').filter({ hasText: /AI 해석|해석 받기/i }).first();
    if (await interpretButton.isVisible()) {
      console.log('✅ AI 해석 버튼 발견됨');
      
      const isEnabled = await interpretButton.isEnabled();
      console.log(`AI 해석 버튼 활성화 상태: ${isEnabled}`);
      
      if (isEnabled) {
        console.log('🎯 AI 해석 버튼 클릭 가능함 - 카드 스프레드 기능 완전히 작동 중!');
      }
    }
    
    // 최종 상태 스크린샷
    await page.screenshot({ 
      path: `simple-test-${requiredCards}-cards-spread-${Date.now()}.png`, 
      fullPage: true 
    });
    
    console.log('🎉 카드 스프레드 기능 테스트 완료!');
  });
});