const { chromium } = require('playwright');
const path = require('path');

async function testReadingWithoutLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('=== 로그인 없이 타로리딩 및 저장 버튼 테스트 ===');
    
    console.log('1. 타로리딩 페이지로 직접 이동...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'no-login-01-reading-page.png'),
      fullPage: true 
    });

    console.log('2. 타로 카드 덱 클릭하여 리딩 시작...');
    const deckElement = await page.locator('.cursor-pointer').first();
    if (await deckElement.isVisible()) {
      await deckElement.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'no-login-02-cards-spread.png'),
        fullPage: true 
      });

      console.log('3. 카드 3장 선택...');
      const cards = await page.locator('img[alt*="카드"]').all();
      console.log(`발견된 카드 수: ${cards.length}`);
      
      if (cards.length >= 3) {
        for (let i = 0; i < 3; i++) {
          try {
            await cards[i].click();
            await page.waitForTimeout(1000);
            console.log(`카드 ${i + 1} 선택 완료`);
          } catch (e) {
            console.log(`카드 ${i + 1} 선택 실패: ${e.message}`);
          }
        }
        
        await page.screenshot({ 
          path: path.join(__dirname, 'screenshots', 'no-login-03-cards-selected.png'),
          fullPage: true 
        });

        console.log('4. 리딩 보기 버튼 클릭...');
        const readingBtn = await page.locator('button:has-text("리딩 보기")').first();
        if (await readingBtn.isVisible()) {
          await readingBtn.click();
          console.log('리딩 보기 버튼 클릭됨, AI 응답 대기...');
          await page.waitForTimeout(10000); // AI 응답 대기
          
          await page.screenshot({ 
            path: path.join(__dirname, 'screenshots', 'no-login-04-interpretation-dialog.png'),
            fullPage: true 
          });

          console.log('5. 해석 대화상자 닫기...');
          // 대화상자가 열려있는지 확인하고 닫기
          const closeButton = await page.locator('button:has-text("닫기")').first();
          const isCloseVisible = await closeButton.isVisible().catch(() => false);
          
          if (isCloseVisible) {
            await closeButton.click();
            await page.waitForTimeout(2000);
            console.log('해석 대화상자 닫음');
          } else {
            console.log('닫기 버튼을 찾을 수 없음');
          }

          await page.screenshot({ 
            path: path.join(__dirname, 'screenshots', 'no-login-05-after-dialog-closed.png'),
            fullPage: true 
          });

          console.log('6. 저장 버튼 찾기...');
          const allButtons = await page.locator('button').all();
          let saveButtonFound = false;
          
          for (let i = 0; i < allButtons.length; i++) {
            const text = await allButtons[i].textContent();
            const isVisible = await allButtons[i].isVisible();
            console.log(`버튼 ${i}: "${text}" (visible: ${isVisible})`);
            
            if (text && text.includes('저장') && isVisible) {
              console.log('✅ 저장 버튼 발견!');
              saveButtonFound = true;
              
              await page.screenshot({ 
                path: path.join(__dirname, 'screenshots', 'no-login-06-save-button-found.png'),
                fullPage: true 
              });

              console.log('7. 저장 버튼 클릭 테스트...');
              await allButtons[i].click();
              await page.waitForTimeout(3000);
              
              await page.screenshot({ 
                path: path.join(__dirname, 'screenshots', 'no-login-07-after-save-click.png'),
                fullPage: true 
              });

              // 토스트 메시지 확인
              const toasts = await page.locator('[data-sonner-toast], [role="alert"], .toast').all();
              for (const toast of toasts) {
                const toastText = await toast.textContent();
                if (toastText) {
                  console.log(`📢 토스트 메시지: ${toastText}`);
                }
              }
              break;
            }
          }

          if (!saveButtonFound) {
            console.log('❌ 저장 버튼을 찾을 수 없습니다.');
          }
        } else {
          console.log('❌ 리딩 보기 버튼을 찾을 수 없습니다.');
        }
      }
    } else {
      console.log('❌ 카드 덱을 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'no-login-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testReadingWithoutLogin();