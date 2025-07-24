const { chromium } = require('playwright');

async function simpleClickTest() {
  console.log('🎯 간단한 Google 버튼 클릭 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // 중요한 로그만 수집
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Firebase') || text.includes('Google') || text.includes('Error') || text.includes('config')) {
      console.log(`[CONSOLE] ${text}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`[ERROR] ${error.message}`);
  });
  
  try {
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('✅ 페이지 로드 완료');
    
    // 3초 대기
    await page.waitForTimeout(3000);
    
    // Google 버튼 찾기 (여러 방법 시도)
    console.log('🔍 Google 버튼 찾는 중...');
    
    let buttonClicked = false;
    
    // 방법 1: 텍스트로 찾기
    try {
      const googleBtn = page.locator('text=Google로 로그인').first();
      if (await googleBtn.isVisible({ timeout: 2000 })) {
        console.log('✅ "Google로 로그인" 버튼 발견');
        
        const popupPromise = context.waitForEvent('page', { timeout: 10000 }).catch(() => null);
        await googleBtn.click();
        buttonClicked = true;
        
        const popup = await popupPromise;
        if (popup) {
          console.log('🎉 SUCCESS! Google 팝업이 열렸습니다!');
          console.log('팝업 URL:', popup.url());
          await popup.close();
        }
      }
    } catch (e) {
      console.log('방법 1 실패');
    }
    
    // 방법 2: G 아이콘이 있는 버튼 찾기
    if (!buttonClicked) {
      try {
        const gIconBtn = page.locator('button:has(svg), button:has(.google)').first();
        if (await gIconBtn.isVisible({ timeout: 2000 })) {
          console.log('✅ G 아이콘 버튼 발견');
          
          const popupPromise = context.waitForEvent('page', { timeout: 10000 }).catch(() => null);
          await gIconBtn.click();
          buttonClicked = true;
          
          const popup = await popupPromise;
          if (popup) {
            console.log('🎉 SUCCESS! Google 팝업이 열렸습니다!');
            console.log('팝업 URL:', popup.url());
            await popup.close();
          }
        }
      } catch (e) {
        console.log('방법 2 실패');
      }
    }
    
    // 방법 3: 모든 버튼 중 Google 포함 텍스트 찾기
    if (!buttonClicked) {
      try {
        const allButtons = await page.locator('button').all();
        console.log(`총 ${allButtons.length}개 버튼 발견`);
        
        for (let i = 0; i < allButtons.length; i++) {
          const btnText = await allButtons[i].textContent();
          console.log(`버튼 ${i + 1}: "${btnText}"`);
          
          if (btnText && (btnText.includes('Google') || btnText.includes('구글'))) {
            console.log(`✅ Google 버튼 발견: "${btnText}"`);
            
            const popupPromise = context.waitForEvent('page', { timeout: 10000 }).catch(() => null);
            await allButtons[i].click();
            buttonClicked = true;
            
            console.log('⏱️  팝업 대기 중...');
            await page.waitForTimeout(3000);
            
            const popup = await popupPromise;
            if (popup) {
              console.log('🎉 SUCCESS! Google 팝업이 열렸습니다!');
              console.log('팝업 URL:', popup.url());
              
              // 팝업 스크린샷
              await popup.screenshot({ 
                path: '/mnt/e/project/test-studio-firebase/screenshots/google_popup_success.png',
                fullPage: true 
              });
              
              await popup.close();
            } else {
              console.log('❌ 팝업이 열리지 않았습니다');
              
              // 현재 페이지에서 오류 확인
              await page.screenshot({ 
                path: '/mnt/e/project/test-studio-firebase/screenshots/after_click_no_popup.png',
                fullPage: true 
              });
            }
            break;
          }
        }
      } catch (e) {
        console.log('방법 3 실패:', e.message);
      }
    }
    
    if (!buttonClicked) {
      console.log('❌ Google 버튼을 찾을 수 없거나 클릭할 수 없습니다');
      
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/screenshots/no_google_button.png',
        fullPage: true 
      });
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
  } finally {
    await browser.close();
    console.log('🏁 테스트 완료');
  }
}

simpleClickTest().catch(console.error);