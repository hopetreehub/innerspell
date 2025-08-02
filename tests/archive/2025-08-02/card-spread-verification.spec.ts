import { test, expect } from '@playwright/test';

test.describe('카드펼치기 기능 완성도 검증', () => {
  test('타로 리딩 전체 플로우 테스트', async ({ page }) => {
    test.setTimeout(120000);
    
    // 리딩 페이지로 이동
    await page.goto('http://localhost:4000/reading', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // 초기 상태 스크린샷
    await page.screenshot({ 
      path: 'emergency-screenshots/card-spread-01-initial.png', 
      fullPage: true 
    });
    
    console.log('🃏 타로 리딩 페이지 로드 완료');
    
    // 카드 섞기 버튼 찾기 및 클릭
    const shuffleButton = page.locator('button:has-text("섞기"), button:has-text("shuffle"), button[data-testid*="shuffle"]').first();
    
    if (await shuffleButton.isVisible({ timeout: 5000 })) {
      await shuffleButton.click();
      console.log('✅ 카드 섞기 버튼 클릭 성공');
      
      await page.waitForTimeout(3000);
      await page.screenshot({ 
        path: 'emergency-screenshots/card-spread-02-shuffled.png', 
        fullPage: true 
      });
    } else {
      console.log('❌ 카드 섞기 버튼을 찾을 수 없음');
    }
    
    // 카드 펼치기 버튼 찾기 및 클릭
    const spreadButton = page.locator('button:has-text("펼치"), button:has-text("spread"), button[data-testid*="spread"]').first();
    
    if (await spreadButton.isVisible({ timeout: 5000 })) {
      // 버튼이 활성화될 때까지 대기
      await spreadButton.waitFor({ state: 'visible', timeout: 10000 });
      
      if (await spreadButton.isEnabled()) {
        await spreadButton.click();
        console.log('✅ 카드 펼치기 버튼 클릭 성공');
        
        await page.waitForTimeout(5000);
        await page.screenshot({ 
          path: 'emergency-screenshots/card-spread-03-spread.png', 
          fullPage: true 
        });
        
        // 펼쳐진 카드들 확인
        const cards = await page.locator('[class*="card"], [data-testid*="card"], img[src*="tarot"]');
        const cardCount = await cards.count();
        console.log(`🃏 펼쳐진 카드 개수: ${cardCount}`);
        
        // 첫 번째 카드 클릭 시도
        if (cardCount > 0) {
          await cards.first().click();
          console.log('✅ 첫 번째 카드 선택 성공');
          
          await page.waitForTimeout(2000);
          await page.screenshot({ 
            path: 'emergency-screenshots/card-spread-04-selected.png', 
            fullPage: true 
          });
        }
        
      } else {
        console.log('⚠️ 카드 펼치기 버튼이 비활성화됨');
      }
    } else {
      console.log('❌ 카드 펼치기 버튼을 찾을 수 없음');
    }
    
    // 현재 페이지의 모든 버튼 텍스트 확인
    const allButtons = await page.locator('button').all();
    console.log('🔘 페이지의 모든 버튼들:');
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      console.log(`  - 버튼 ${i + 1}: "${text}"`);
    }
  });

  test('UI 요소 상태 확인', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    // 현재 UI 상태 스크린샷
    await page.screenshot({ 
      path: 'emergency-screenshots/ui-status-check.png', 
      fullPage: true 
    });
    
    // JavaScript 에러 체크
    const jsErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(5000);
    
    // CSS 및 스타일 확인
    const styleElements = await page.locator('style, link[rel="stylesheet"]').count();
    const scriptElements = await page.locator('script').count();
    
    console.log('📊 리소스 로딩 상태:');
    console.log(`  - CSS/Style 요소: ${styleElements}개`);
    console.log(`  - Script 요소: ${scriptElements}개`);
    console.log(`  - JavaScript 에러: ${jsErrors.length}개`);
    
    if (jsErrors.length > 0) {
      console.log('❌ JavaScript 에러들:');
      jsErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    // 네비게이션 메뉴 확인
    const navLinks = await page.locator('nav a, header a').count();
    console.log(`🧭 네비게이션 링크: ${navLinks}개`);
    
    // 메인 컨텐츠 영역 확인
    const mainContent = await page.locator('main, [role="main"], .main-content').count();
    console.log(`📄 메인 컨텐츠 영역: ${mainContent}개`);
  });
});