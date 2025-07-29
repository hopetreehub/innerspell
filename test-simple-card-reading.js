const { chromium } = require('playwright');
const path = require('path');

async function testSimpleCardReading() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('=== 간단한 타로리딩 테스트 ===');
    
    console.log('1. 타로리딩 페이지로 이동...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'simple-01-reading-page.png'),
      fullPage: true 
    });

    console.log('2. "카드 보기" 버튼 클릭...');
    const cardViewBtn = await page.locator('button:has-text("카드 보기")').first();
    if (await cardViewBtn.isVisible()) {
      await cardViewBtn.click();
      await page.waitForTimeout(10000); // AI 응답 대기
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'simple-02-after-card-view.png'),
        fullPage: true 
      });

      console.log('3. 해석 대화상자 처리...');
      // 대화상자가 열려있다면 닫기
      const dialogCloseBtn = await page.locator('[data-radix-collection-item] button').last();
      const isDialogVisible = await dialogCloseBtn.isVisible().catch(() => false);
      
      if (isDialogVisible) {
        await dialogCloseBtn.click();
        await page.waitForTimeout(2000);
        console.log('대화상자 닫음');
      }

      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'simple-03-after-dialog.png'),
        fullPage: true 
      });

      console.log('4. 저장 버튼 찾기...');
      const pageText = await page.textContent('body');
      console.log('페이지에 "저장" 텍스트 포함:', pageText.includes('저장'));
      
      // 모든 버튼 검사
      const allButtons = await page.locator('button').all();
      console.log(`전체 버튼 수: ${allButtons.length}`);
      
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        const isVisible = await allButtons[i].isVisible();
        
        if (text && (text.includes('저장') || text.includes('Save'))) {
          console.log(`✅ 저장 버튼 발견: "${text}" (visible: ${isVisible})`);
          
          if (isVisible) {
            await page.screenshot({ 
              path: path.join(__dirname, 'screenshots', 'simple-04-save-button-found.png'),
              fullPage: true 
            });
            
            console.log('5. 저장 버튼 클릭...');
            await allButtons[i].click();
            await page.waitForTimeout(3000);
            
            await page.screenshot({ 
              path: path.join(__dirname, 'screenshots', 'simple-05-after-save-click.png'),
              fullPage: true 
            });
            
            // 토스트 메시지 확인
            console.log('토스트 메시지 확인 중...');
            const toastElements = await page.locator('[data-sonner-toast], [role="alert"], .toast, [data-radix-toast-viewport] *').all();
            for (const toast of toastElements) {
              const toastText = await toast.textContent();
              if (toastText && toastText.trim()) {
                console.log(`📢 토스트 메시지: "${toastText}"`);
              }
            }
            break;
          }
        }
      }
    } else {
      console.log('❌ "카드 보기" 버튼을 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'simple-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testSimpleCardReading();