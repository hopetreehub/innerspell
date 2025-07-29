const { chromium } = require('playwright');
const path = require('path');

async function testManualAdminLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('=== 직접 관리자 계정으로 로그인 테스트 ===');
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    console.log('1. 로그인 페이지 스크린샷...');
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'manual-login-01-signin.png'),
      fullPage: true 
    });

    console.log('2. 이메일 입력...');
    await page.fill('input[placeholder="your@email.com"]', 'admin@innerspell.com');
    await page.waitForTimeout(1000);

    console.log('3. 비밀번호 입력...');
    await page.fill('input[type="password"]', 'admin123');
    await page.waitForTimeout(1000);

    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'manual-login-02-filled.png'),
      fullPage: true 
    });

    console.log('4. 로그인 버튼 클릭...');
    await page.click('button:has-text("로그인")');
    await page.waitForTimeout(5000); // 로그인 처리 대기

    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'manual-login-03-after-login.png'),
      fullPage: true 
    });

    // 현재 URL 확인
    const currentUrl = page.url();
    console.log(`로그인 후 현재 URL: ${currentUrl}`);

    // 페이지 내용 확인
    const pageText = await page.textContent('body');
    const isLoggedIn = pageText.includes('로그아웃') || 
                       pageText.includes('대시보드') || 
                       currentUrl.includes('/admin') ||
                       currentUrl === 'https://test-studio-firebase.vercel.app/';

    console.log(`로그인 상태: ${isLoggedIn}`);

    if (isLoggedIn) {
      console.log('5. 로그인 성공 - 타로리딩 페이지로 이동...');
      await page.click('text=타로리딩');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'manual-login-04-reading-logged-in.png'),
        fullPage: true 
      });

      console.log('6. 타로 카드 선택 프로세스 시작...');
      // 카드 덱 클릭
      const cardElement = await page.locator('.cursor-pointer').first();
      if (await cardElement.isVisible()) {
        await cardElement.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: path.join(__dirname, 'screenshots', 'manual-login-05-cards-spread.png'),
          fullPage: true 
        });

        // 개별 카드 선택
        const cards = await page.locator('img[alt*="카드"]').all();
        if (cards.length >= 3) {
          console.log(`발견된 카드 수: ${cards.length}`);
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
            path: path.join(__dirname, 'screenshots', 'manual-login-06-cards-selected.png'),
            fullPage: true 
          });

          console.log('7. 리딩 보기 버튼 클릭...');
          const readingBtn = await page.locator('button:has-text("리딩 보기")').first();
          if (await readingBtn.isVisible()) {
            await readingBtn.click();
            await page.waitForTimeout(8000); // AI 응답 대기
            
            await page.screenshot({ 
              path: path.join(__dirname, 'screenshots', 'manual-login-07-reading-result.png'),
              fullPage: true 
            });

            console.log('8. 저장 버튼 찾기...');
            const allButtons = await page.locator('button').all();
            for (let i = 0; i < allButtons.length; i++) {
              const text = await allButtons[i].textContent();
              const isVisible = await allButtons[i].isVisible();
              console.log(`버튼 ${i}: "${text}" (visible: ${isVisible})`);
              
              if (text && text.includes('저장')) {
                console.log('9. 저장 버튼 클릭...');
                await allButtons[i].click();
                await page.waitForTimeout(3000);
                
                await page.screenshot({ 
                  path: path.join(__dirname, 'screenshots', 'manual-login-08-after-save.png'),
                  fullPage: true 
                });
                break;
              }
            }

            console.log('10. 대시보드에서 저장된 리딩 확인...');
            await page.click('text=대시보드');
            await page.waitForTimeout(3000);
            
            await page.screenshot({ 
              path: path.join(__dirname, 'screenshots', 'manual-login-09-dashboard.png'),
              fullPage: true 
            });
          }
        }
      }
    } else {
      console.log('❌ 로그인 실패');
    }

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'manual-login-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testManualAdminLogin();