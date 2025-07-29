const { chromium } = require('playwright');
const path = require('path');

async function testLoginAndSaveReading() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('1. Vercel 배포 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    // 1. 로그인 전 타로리딩 페이지 확인
    console.log('2. 로그인 전 타로리딩 페이지 확인...');
    await page.click('text=타로리딩');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'login-test-01-reading-before-login.png'),
      fullPage: true 
    });

    // 2. 관리자로 로그인 버튼 클릭
    console.log('3. 관리자로 로그인 버튼 찾기...');
    const loginButton = await page.locator('button:has-text("관리자로 로그인")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      console.log('4. 로그인 버튼 클릭 완료');
      await page.waitForTimeout(3000);
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'login-test-02-after-login-click.png'),
        fullPage: true 
      });
    } else {
      console.log('로그인 버튼을 찾을 수 없습니다.');
    }

    // 3. 로그인 후 타로리딩 페이지 다시 확인
    console.log('5. 로그인 후 타로리딩 페이지로 이동...');
    await page.click('text=타로리딩');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'login-test-03-reading-after-login.png'),
      fullPage: true 
    });

    // 4. 카드 선택하기
    console.log('6. 타로 카드 선택...');
    const cards = await page.locator('.cursor-pointer img').all();
    console.log(`찾은 카드 수: ${cards.length}`);
    
    if (cards.length >= 3) {
      // 3장의 카드 선택
      for (let i = 0; i < 3; i++) {
        await cards[i].click();
        await page.waitForTimeout(500);
      }
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'login-test-04-cards-selected.png'),
        fullPage: true 
      });

      // 5. 리딩 보기 버튼 클릭
      console.log('7. 리딩 보기 버튼 클릭...');
      const readingButton = await page.locator('button:has-text("리딩 보기")').first();
      if (await readingButton.isVisible()) {
        await readingButton.click();
        await page.waitForTimeout(5000); // AI 응답 대기
        
        await page.screenshot({ 
          path: path.join(__dirname, 'screenshots', 'login-test-05-reading-result.png'),
          fullPage: true 
        });

        // 6. 저장 버튼 찾기 및 클릭
        console.log('8. 저장 버튼 찾기...');
        const saveButtons = await page.locator('button').all();
        let saveButton = null;
        
        for (const btn of saveButtons) {
          const text = await btn.textContent();
          console.log(`버튼 텍스트: ${text}`);
          if (text && text.includes('저장')) {
            saveButton = btn;
            break;
          }
        }

        if (saveButton) {
          console.log('9. 저장 버튼 클릭...');
          await saveButton.click();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ 
            path: path.join(__dirname, 'screenshots', 'login-test-06-after-save.png'),
            fullPage: true 
          });

          // 알림 메시지 확인
          const alerts = await page.locator('[role="alert"]').all();
          for (const alert of alerts) {
            const alertText = await alert.textContent();
            console.log(`알림 메시지: ${alertText}`);
          }
        } else {
          console.log('저장 버튼을 찾을 수 없습니다.');
        }

        // 7. 프로필/대시보드에서 저장된 리딩 확인
        console.log('10. 대시보드에서 저장된 리딩 확인...');
        await page.click('text=대시보드');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: path.join(__dirname, 'screenshots', 'login-test-07-dashboard-saved.png'),
          fullPage: true 
        });

        // 최근 리딩 섹션 확인
        const recentReadings = await page.locator('h3:has-text("최근 리딩")').isVisible();
        if (recentReadings) {
          console.log('최근 리딩 섹션이 표시됩니다.');
          const readingItems = await page.locator('.p-4.border').all();
          console.log(`저장된 리딩 수: ${readingItems.length}`);
        }
      }
    }

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'login-test-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testLoginAndSaveReading();