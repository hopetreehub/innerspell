const { chromium } = require('playwright');
const path = require('path');

async function testFinalReading() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('=== 최종 타로리딩 저장 기능 테스트 ===');
    
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'final-01-initial.png'),
      fullPage: true 
    });

    console.log('1. 질문 입력...');
    await page.fill('textarea[placeholder*="카드에게"]', '오늘의 운세는 어떻게 될까요?');
    await page.waitForTimeout(1000);

    console.log('2. 우측 "카드 보기" 버튼 클릭...');
    const cardViewButtons = await page.locator('button').all();
    let cardViewBtn = null;
    
    for (const btn of cardViewButtons) {
      const text = await btn.textContent();
      if (text && text.includes('카드 보기')) {
        cardViewBtn = btn;
        break;
      }
    }
    
    if (cardViewBtn) {
      await cardViewBtn.click();
      console.log('카드 보기 버튼 클릭됨, AI 응답 대기...');
      await page.waitForTimeout(12000); // AI 응답 충분히 대기
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'final-02-interpretation.png'),
        fullPage: true 
      });

      console.log('3. 해석 대화상자 닫기...');
      // ESC 키로 대화상자 닫기
      await page.keyboard.press('Escape');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'final-03-after-close.png'),
        fullPage: true 
      });

      console.log('4. 저장 버튼 찾기 및 클릭...');
      // 페이지를 다시 스크롤하여 모든 요소 확인
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
      
      const allButtons = await page.locator('button').all();
      let saveButtonFound = false;
      
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        const isVisible = await allButtons[i].isVisible();
        
        console.log(`버튼 ${i}: "${text}" (visible: ${isVisible})`);
        
        if (text && text.includes('저장') && isVisible) {
          console.log('✅ 저장 버튼 발견!');
          saveButtonFound = true;
          
          // 저장 버튼이 화면에 보이도록 스크롤
          await allButtons[i].scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ 
            path: path.join(__dirname, 'screenshots', 'final-04-save-button.png'),
            fullPage: true 
          });
          
          await allButtons[i].click();
          console.log('저장 버튼 클릭됨');
          await page.waitForTimeout(3000);
          
          await page.screenshot({ 
            path: path.join(__dirname, 'screenshots', 'final-05-after-save.png'),
            fullPage: true 
          });
          
          // 토스트 메시지 확인
          const toastText = await page.textContent('body');
          if (toastText.includes('로그인')) {
            console.log('📢 로그인 필요 메시지 표시됨');
          }
          if (toastText.includes('저장')) {
            console.log('📢 저장 관련 메시지 표시됨');
          }
          
          break;
        }
      }
      
      if (!saveButtonFound) {
        console.log('❌ 저장 버튼을 찾을 수 없습니다.');
        console.log('현재 페이지 상태를 확인합니다...');
        
        const pageContent = await page.textContent('body');
        console.log('페이지에 포함된 텍스트 키워드:');
        console.log('- "저장" 포함:', pageContent.includes('저장'));
        console.log('- "해석" 포함:', pageContent.includes('해석'));
        console.log('- "완료" 포함:', pageContent.includes('완료'));
      }
    } else {
      console.log('❌ 카드 보기 버튼을 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'final-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testFinalReading();