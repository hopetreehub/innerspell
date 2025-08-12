const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('타로 카드 전체 기능 테스트', () => {
  test.setTimeout(120000); // 2분 타임아웃

  test('타로 백과사전 15-21번 카드 이미지 확인', async ({ page }) => {
    // 1. 타로 백과사전 페이지 접속
    console.log('1. 타로 백과사전 페이지 접속 중...');
    await page.goto('http://localhost:4000/tarot', { waitUntil: 'networkidle' });
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 전체 페이지 스크린샷
    await page.screenshot({ 
      path: 'screenshots/tarot-encyclopedia-full.png', 
      fullPage: true 
    });
    
    // 15-21번 카드 이미지 확인
    const cardsToCheck = [
      { number: 15, name: 'The Devil' },
      { number: 16, name: 'The Tower' },
      { number: 17, name: 'The Star' },
      { number: 18, name: 'The Moon' },
      { number: 19, name: 'The Sun' },
      { number: 20, name: 'Judgement' },
      { number: 21, name: 'The World' }
    ];

    for (const card of cardsToCheck) {
      console.log(`\n2. ${card.number}번 카드 (${card.name}) 확인 중...`);
      
      // 카드까지 스크롤
      const cardSelector = `img[alt*="${card.name}"], img[src*="${card.number}"], img[src*="major-${card.number}"]`;
      
      try {
        // 이미지 요소 찾기
        const imageElements = await page.$$(cardSelector);
        
        if (imageElements.length > 0) {
          for (let i = 0; i < imageElements.length; i++) {
            const img = imageElements[i];
            await img.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            
            // 이미지 소스 확인
            const src = await img.getAttribute('src');
            const alt = await img.getAttribute('alt');
            console.log(`   - 이미지 ${i + 1} 발견: src="${src}", alt="${alt}"`);
            
            // 이미지 로드 상태 확인
            const isLoaded = await img.evaluate((el) => el.complete && el.naturalHeight !== 0);
            console.log(`   - 이미지 로드 상태: ${isLoaded ? '성공' : '실패'}`);
            
            // 개별 카드 스크린샷
            await page.screenshot({ 
              path: `screenshots/card-${card.number}-${card.name.replace(/\s+/g, '-')}.png`,
              clip: await img.boundingBox()
            });
          }
        } else {
          console.log(`   ⚠️ ${card.number}번 카드 이미지를 찾을 수 없습니다.`);
          
          // 페이지 내 모든 이미지 확인
          const allImages = await page.$$eval('img', imgs => 
            imgs.map(img => ({ src: img.src, alt: img.alt }))
          );
          console.log(`   - 페이지 내 전체 이미지 수: ${allImages.length}`);
        }
      } catch (error) {
        console.error(`   ❌ ${card.number}번 카드 확인 중 오류:`, error.message);
      }
    }

    // 콘솔 에러 확인
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('콘솔 에러:', msg.text());
      }
    });

    // 네트워크 에러 확인
    page.on('response', response => {
      if (!response.ok() && response.url().includes('tarot')) {
        console.log(`네트워크 에러: ${response.status()} - ${response.url()}`);
      }
    });
  });

  test('타로 리딩 기능 전체 테스트', async ({ page }) => {
    console.log('\n\n=== 타로 리딩 기능 테스트 시작 ===\n');
    
    // 5. 메인 페이지로 이동
    console.log('5. 메인 페이지로 이동 중...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/main-page.png' });
    
    // 6. "무료 타로 리딩 시작하기" 버튼 클릭
    console.log('6. "무료 타로 리딩 시작하기" 버튼 찾기...');
    
    // 다양한 버튼 셀렉터 시도
    const buttonSelectors = [
      'text="무료 타로 리딩 시작하기"',
      'button:has-text("무료 타로 리딩")',
      'a:has-text("무료 타로 리딩")',
      '[href*="tarot-reading"]',
      'button:has-text("타로")',
      'a:has-text("타로")'
    ];
    
    let clicked = false;
    for (const selector of buttonSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`   - "${selector}" 버튼 발견!`);
          await element.click();
          clicked = true;
          break;
        }
      } catch (e) {
        // 다음 셀렉터 시도
      }
    }
    
    if (!clicked) {
      console.log('   ⚠️ 버튼을 찾을 수 없어 직접 URL로 이동합니다.');
      await page.goto('http://localhost:4000/tarot-reading', { waitUntil: 'networkidle' });
    }
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/tarot-reading-page.png' });
    
    // 7. 카드 선택
    console.log('7. 타로 카드 선택 중...');
    
    // 카드 덱이나 선택 가능한 카드 찾기
    const cardSelectors = [
      '.card-deck .card',
      '[class*="card"]:not([class*="selected"])',
      '.tarot-card',
      'img[alt*="card"]',
      '[data-card]'
    ];
    
    let cardSelected = false;
    for (const selector of cardSelectors) {
      try {
        const cards = await page.$$(selector);
        if (cards.length > 0) {
          console.log(`   - ${cards.length}개의 카드 발견 (${selector})`);
          
          // 첫 번째 카드 클릭
          await cards[0].click();
          await page.waitForTimeout(1000);
          
          // 두 번째 카드가 있으면 클릭 (3장 스프레드일 경우)
          if (cards.length > 1) {
            await cards[1].click();
            await page.waitForTimeout(1000);
          }
          
          // 세 번째 카드가 있으면 클릭
          if (cards.length > 2) {
            await cards[2].click();
            await page.waitForTimeout(1000);
          }
          
          cardSelected = true;
          await page.screenshot({ path: 'screenshots/cards-selected.png' });
          break;
        }
      } catch (e) {
        console.log(`   - ${selector} 시도 실패:`, e.message);
      }
    }
    
    if (!cardSelected) {
      console.log('   ⚠️ 선택 가능한 카드를 찾을 수 없습니다.');
    }
    
    // 8. 해석 생성
    console.log('8. 타로 해석 생성 시도...');
    
    // 해석 버튼 찾기
    const interpretButtonSelectors = [
      'button:has-text("해석")',
      'button:has-text("리딩")',
      'button:has-text("확인")',
      'button:has-text("시작")',
      '[type="submit"]',
      'button.primary',
      'button.btn-primary'
    ];
    
    for (const selector of interpretButtonSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          const buttonText = await button.textContent();
          console.log(`   - "${buttonText}" 버튼 클릭`);
          await button.click();
          break;
        }
      } catch (e) {
        // 다음 시도
      }
    }
    
    // 해석 결과 대기
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/interpretation-result.png' });
    
    // 에러 메시지 확인
    const errorSelectors = ['.error', '[class*="error"]', '.alert-danger', '[role="alert"]'];
    for (const selector of errorSelectors) {
      const error = await page.$(selector);
      if (error) {
        const errorText = await error.textContent();
        console.log(`   ❌ 오류 발견: ${errorText}`);
      }
    }
    
    // 9. 저장 기능 테스트
    console.log('9. 저장 기능 테스트...');
    
    const saveButtonSelectors = [
      'button:has-text("저장")',
      'button:has-text("save")',
      '[class*="save"]',
      'button[onclick*="save"]'
    ];
    
    for (const selector of saveButtonSelectors) {
      try {
        const saveButton = await page.$(selector);
        if (saveButton) {
          console.log(`   - 저장 버튼 발견 및 클릭`);
          await saveButton.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: 'screenshots/save-result.png' });
          break;
        }
      } catch (e) {
        // 다음 시도
      }
    }
    
    // 최종 상태 스크린샷
    await page.screenshot({ path: 'screenshots/final-state.png', fullPage: true });
    
    // 콘솔 로그 수집
    const logs = [];
    page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
    
    if (logs.length > 0) {
      console.log('\n=== 콘솔 로그 ===');
      logs.forEach(log => console.log(`[${log.type}] ${log.text}`));
    }
  });
});