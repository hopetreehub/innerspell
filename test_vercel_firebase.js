const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // 개발자 도구 자동 열기
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 메시지 수집
  const consoleLogs = [];
  page.on('console', msg => {
    const logEntry = `[${msg.type()}] ${msg.text()}`;
    console.log(logEntry);
    consoleLogs.push(logEntry);
  });
  
  // 네트워크 요청 모니터링
  const apiRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      response.text().then(body => {
        console.log(`API Response [${response.status()}]: ${response.url()}`);
        console.log('Body:', body);
      }).catch(() => {});
    }
  });

  try {
    console.log('1. Vercel 사이트 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'vercel-home.png'),
      fullPage: true 
    });
    
    // 초기 로딩 시 Firebase 관련 로그 확인
    await page.waitForTimeout(3000);
    
    console.log('\n2. 로그인 페이지로 이동...');
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', {
      waitUntil: 'networkidle'
    });
    
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'vercel-signin.png'),
      fullPage: true 
    });
    
    // Google 로그인 버튼 찾기
    console.log('\n3. Google 로그인 버튼 찾기...');
    const googleButton = await page.locator('button:has-text("Sign in with Google")').first();
    
    if (await googleButton.isVisible()) {
      console.log('Google 로그인 버튼 발견!');
      
      // 클릭 전 네트워크 탭 확인을 위한 대기
      await page.waitForTimeout(2000);
      
      // 팝업 핸들러 설정
      const popupPromise = page.waitForEvent('popup', { timeout: 10000 }).catch(() => null);
      
      console.log('Google 로그인 버튼 클릭...');
      await googleButton.click();
      
      const popup = await popupPromise;
      if (popup) {
        console.log('Google 로그인 팝업이 열렸습니다.');
        await page.screenshot({ 
          path: path.join(__dirname, 'screenshots', 'vercel-google-popup-attempt.png')
        });
        // 팝업 닫기
        await popup.close();
      } else {
        console.log('Google 로그인 팝업이 열리지 않았습니다. Mock 모드일 수 있습니다.');
      }
      
      await page.waitForTimeout(3000);
    } else {
      console.log('Google 로그인 버튼을 찾을 수 없습니다.');
    }
    
    // 현재까지의 콘솔 로그 출력
    console.log('\n=== Firebase 관련 콘솔 로그 ===');
    consoleLogs.forEach(log => {
      if (log.toLowerCase().includes('firebase') || 
          log.toLowerCase().includes('mock') || 
          log.toLowerCase().includes('admin')) {
        console.log(log);
      }
    });
    
    // 타로 리딩 페이지로 직접 이동 시도
    console.log('\n4. 타로 리딩 페이지로 이동...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'vercel-reading-page.png'),
      fullPage: true 
    });
    
    // 타로 카드 선택 시도
    console.log('\n5. 타로 카드 선택 시도...');
    const cards = await page.locator('.cursor-pointer').all();
    
    if (cards.length >= 3) {
      console.log(`${cards.length}개의 카드를 발견했습니다.`);
      
      // 3개의 카드 선택
      for (let i = 0; i < 3 && i < cards.length; i++) {
        await cards[i].click();
        await page.waitForTimeout(500);
        console.log(`카드 ${i + 1} 선택됨`);
      }
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'vercel-cards-selected.png'),
        fullPage: true 
      });
      
      // 리딩 버튼 찾기
      const readingButton = await page.locator('button:has-text("Get Your Reading")').first();
      if (await readingButton.isVisible()) {
        console.log('\n6. 리딩 버튼 클릭...');
        await readingButton.click();
        
        // 리딩 결과 대기
        await page.waitForTimeout(10000);
        
        await page.screenshot({ 
          path: path.join(__dirname, 'screenshots', 'vercel-reading-result.png'),
          fullPage: true 
        });
        
        // 저장 버튼 찾기
        console.log('\n7. 저장 버튼 찾기...');
        const saveButton = await page.locator('button:has-text("Save Reading")').first();
        
        if (await saveButton.isVisible()) {
          console.log('저장 버튼 클릭...');
          
          // 네트워크 요청 모니터링을 위한 Promise
          const saveResponsePromise = page.waitForResponse(
            response => response.url().includes('/api/reading/save'),
            { timeout: 10000 }
          ).catch(() => null);
          
          await saveButton.click();
          
          const saveResponse = await saveResponsePromise;
          if (saveResponse) {
            console.log(`\n저장 API 응답: ${saveResponse.status()}`);
            const responseBody = await saveResponse.text();
            console.log('응답 내용:', responseBody);
          }
          
          await page.waitForTimeout(3000);
          
          // 저장 후 스크린샷
          await page.screenshot({ 
            path: path.join(__dirname, 'screenshots', 'vercel-after-save.png'),
            fullPage: true 
          });
          
          // 에러 메시지 확인
          const errorMessage = await page.locator('.text-red-500, .text-destructive').first();
          if (await errorMessage.isVisible()) {
            const errorText = await errorMessage.textContent();
            console.log('\n에러 메시지:', errorText);
          }
        } else {
          console.log('저장 버튼을 찾을 수 없습니다.');
        }
      } else {
        console.log('리딩 버튼을 찾을 수 없습니다.');
      }
    } else {
      console.log('타로 카드를 찾을 수 없습니다.');
    }
    
    // 최종 콘솔 로그 출력
    console.log('\n=== 모든 콘솔 로그 ===');
    consoleLogs.forEach(log => console.log(log));
    
    // API 요청 로그
    console.log('\n=== API 요청 목록 ===');
    apiRequests.forEach(req => {
      console.log(`${req.method} ${req.url}`);
    });
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'vercel-error.png'),
      fullPage: true 
    });
  }
  
  // 브라우저 열어둔 채로 대기
  console.log('\n브라우저를 열어두고 있습니다. 수동으로 확인하려면 Enter를 누르세요...');
  await new Promise(resolve => process.stdin.once('data', resolve));
  
  await browser.close();
})();