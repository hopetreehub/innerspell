const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 로그 수집
  const logs = {
    console: [],
    network: [],
    errors: []
  };
  
  // 콘솔 메시지 수집
  page.on('console', async msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    
    logs.console.push(logEntry);
    console.log(`[${msg.type()}] ${msg.text()}`);
    
    // Firebase 관련 로그 강조
    if (msg.text().toLowerCase().includes('firebase') || 
        msg.text().toLowerCase().includes('mock') || 
        msg.text().toLowerCase().includes('admin')) {
      console.log('🔥 FIREBASE LOG:', msg.text());
    }
  });
  
  // 에러 수집
  page.on('pageerror', error => {
    logs.errors.push({
      message: error.message,
      timestamp: new Date().toISOString()
    });
    console.error('❌ PAGE ERROR:', error.message);
  });
  
  // 네트워크 요청/응답 상세 모니터링
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/') || url.includes('firebase')) {
      const reqInfo = {
        url: url,
        method: request.method(),
        headers: request.headers(),
        timestamp: new Date().toISOString()
      };
      logs.network.push({ type: 'request', ...reqInfo });
      console.log(`📤 API Request: ${request.method()} ${url}`);
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/') || url.includes('firebase')) {
      try {
        const body = await response.text();
        const respInfo = {
          url: url,
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers(),
          body: body,
          timestamp: new Date().toISOString()
        };
        logs.network.push({ type: 'response', ...respInfo });
        console.log(`📥 API Response [${response.status()}]: ${url}`);
        console.log('   Body:', body.substring(0, 200));
      } catch (e) {
        console.log(`   Could not read response body: ${e.message}`);
      }
    }
  });

  try {
    console.log('\n=== 1. Vercel 사이트 접속 ===');
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // localStorage 확인
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        items[key] = window.localStorage.getItem(key);
      }
      return items;
    });
    console.log('\nLocalStorage:', localStorage);
    
    // 환경 변수 확인 (window 객체에 노출된 경우)
    const windowVars = await page.evaluate(() => {
      return {
        env: window.__ENV__ || {},
        firebase: window.firebase ? 'Firebase SDK loaded' : 'Firebase SDK not loaded'
      };
    });
    console.log('\nWindow variables:', windowVars);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'detailed-1-home.png'),
      fullPage: true 
    });
    
    console.log('\n=== 2. 로그인 페이지 이동 ===');
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', {
      waitUntil: 'networkidle'
    });
    
    await page.waitForTimeout(2000);
    
    // Google 로그인 버튼 상세 확인
    const googleButtons = await page.locator('button').all();
    console.log(`\n발견된 버튼 수: ${googleButtons.length}`);
    
    for (let i = 0; i < googleButtons.length; i++) {
      const text = await googleButtons[i].textContent();
      console.log(`버튼 ${i + 1}: "${text}"`);
      if (text && text.toLowerCase().includes('google')) {
        console.log('✅ Google 로그인 버튼 발견!');
        
        // 버튼 클릭 시도
        const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
        await googleButtons[i].click();
        
        const popup = await popupPromise;
        if (popup) {
          console.log('🔲 Google OAuth 팝업이 열렸습니다!');
          await popup.close();
        } else {
          console.log('⚠️  팝업이 열리지 않았습니다. Mock 모드일 가능성이 있습니다.');
        }
        
        await page.waitForTimeout(3000);
        break;
      }
    }
    
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'detailed-2-signin.png'),
      fullPage: true 
    });
    
    console.log('\n=== 3. 타로 리딩 페이지 테스트 ===');
    await page.goto('https://test-studio-firebase.vercel.app/reading', {
      waitUntil: 'networkidle'
    });
    
    await page.waitForTimeout(3000);
    
    // 페이지 상태 확인
    const pageContent = await page.content();
    console.log('\n페이지에 "로그인" 텍스트 포함:', pageContent.includes('로그인'));
    console.log('페이지에 "타로" 텍스트 포함:', pageContent.includes('타로'));
    
    // 카드 선택 가능 여부 확인
    const cards = await page.locator('[data-testid="tarot-card"], .cursor-pointer').all();
    console.log(`\n타로 카드 수: ${cards.length}`);
    
    if (cards.length >= 3) {
      // 카드 3개 선택
      for (let i = 0; i < 3; i++) {
        await cards[i].click();
        await page.waitForTimeout(500);
        console.log(`카드 ${i + 1} 선택 완료`);
      }
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'detailed-3-cards-selected.png'),
        fullPage: true 
      });
      
      // 리딩 버튼 찾기
      const readingButton = await page.locator('button').filter({ hasText: /Get Your Reading|리딩 시작/i }).first();
      
      if (await readingButton.isVisible()) {
        console.log('\n리딩 버튼 클릭...');
        
        // API 요청 모니터링
        const apiPromise = page.waitForResponse(
          response => response.url().includes('/api/'),
          { timeout: 15000 }
        ).catch(() => null);
        
        await readingButton.click();
        
        const apiResponse = await apiPromise;
        if (apiResponse) {
          console.log(`\nAPI 응답 받음: ${apiResponse.url()}`);
          console.log(`상태 코드: ${apiResponse.status()}`);
          const responseBody = await apiResponse.text();
          console.log('응답 내용:', responseBody);
        }
        
        // 리딩 결과 대기
        await page.waitForTimeout(10000);
        
        await page.screenshot({ 
          path: path.join(__dirname, 'screenshots', 'detailed-4-reading-result.png'),
          fullPage: true 
        });
        
        // 저장 버튼 테스트
        const saveButton = await page.locator('button').filter({ hasText: /Save|저장/i }).first();
        
        if (await saveButton.isVisible()) {
          console.log('\n저장 버튼 클릭...');
          
          // 저장 API 모니터링
          const savePromise = page.waitForResponse(
            response => response.url().includes('/api/reading/save'),
            { timeout: 10000 }
          ).catch(() => null);
          
          await saveButton.click();
          
          const saveResponse = await savePromise;
          if (saveResponse) {
            console.log(`\n저장 API 응답: ${saveResponse.status()}`);
            const saveBody = await saveResponse.text();
            console.log('저장 응답:', saveBody);
          }
          
          await page.waitForTimeout(3000);
          
          // 에러 메시지 확인
          const errorElements = await page.locator('.text-red-500, .text-destructive, [role="alert"]').all();
          for (const elem of errorElements) {
            const errorText = await elem.textContent();
            console.log('🚨 에러 메시지:', errorText);
          }
          
          await page.screenshot({ 
            path: path.join(__dirname, 'screenshots', 'detailed-5-after-save.png'),
            fullPage: true 
          });
        }
      }
    } else {
      console.log('⚠️  타로 카드를 찾을 수 없습니다. 로그인이 필요할 수 있습니다.');
    }
    
    // 로그 저장
    const logPath = path.join(__dirname, 'screenshots', 'detailed-logs.json');
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    console.log(`\n📄 로그 저장됨: ${logPath}`);
    
    // Firebase 관련 로그 요약
    console.log('\n=== Firebase 관련 로그 요약 ===');
    logs.console.forEach(log => {
      if (log.text.toLowerCase().includes('firebase') || 
          log.text.toLowerCase().includes('mock') || 
          log.text.toLowerCase().includes('admin')) {
        console.log(`[${log.timestamp}] ${log.text}`);
      }
    });
    
    // API 요청 요약
    console.log('\n=== API 요청/응답 요약 ===');
    logs.network.forEach(item => {
      if (item.type === 'response') {
        console.log(`${item.method || 'GET'} ${item.url} - ${item.status}`);
        if (item.body) {
          console.log('  Body:', item.body.substring(0, 100));
        }
      }
    });
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'detailed-error.png'),
      fullPage: true 
    });
  }
  
  console.log('\n브라우저를 열어둔 상태입니다. Enter를 눌러 종료하세요...');
  await new Promise(resolve => process.stdin.once('data', resolve));
  
  await browser.close();
})();