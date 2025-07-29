const { chromium } = require('playwright');
const path = require('path');

async function testGoogleLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('=== Google 로그인 테스트 ===');
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    console.log('1. 로그인 페이지 스크린샷...');
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'google-login-01.png'),
      fullPage: true 
    });

    console.log('2. Google로 로그인 버튼 클릭...');
    await page.click('button:has-text("Google로 로그인")');
    
    // Google 로그인 팝업 처리
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'google-login-02-popup.png'),
      fullPage: true 
    });

    // 로그인 상태 확인
    const currentUrl = page.url();
    console.log(`현재 URL: ${currentUrl}`);
    
    // 성공적으로 로그인되었는지 확인
    if (currentUrl !== 'https://test-studio-firebase.vercel.app/sign-in') {
      console.log('✅ 로그인 성공으로 보임');
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'google-login-03-success.png'),
        fullPage: true 
      });

      // 타로리딩 페이지로 이동하여 저장 기능 테스트
      await page.click('text=타로리딩');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'google-login-04-reading.png'),
        fullPage: true 
      });

      // 저장 기능이 있는지 확인 (로그인 후에는 저장 버튼이 나타날 것)
      console.log('로그인 상태에서 타로리딩 페이지 확인 완료');
      
    } else {
      console.log('❌ 로그인 실패 또는 취소');
    }

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'google-login-error.png'),
      fullPage: true 
    });
  } finally {
    console.log('브라우저를 수동으로 닫아주세요. Google 로그인 테스트를 위해 10분간 대기합니다...');
    await page.waitForTimeout(600000); // 10분 대기
    await browser.close();
  }
}

testGoogleLogin();