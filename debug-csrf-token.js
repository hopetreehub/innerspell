const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🔐 CSRF 토큰 디버깅...\n');
  
  try {
    // 1. 첫 페이지 방문으로 CSRF 토큰 생성
    console.log('1️⃣ 첫 페이지 방문으로 CSRF 토큰 쿠키 생성...');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    
    // 쿠키 확인
    const cookies = await context.cookies();
    console.log('🍪 현재 쿠키들:');
    cookies.forEach(cookie => {
      console.log(`  - ${cookie.name}: ${cookie.value}`);
    });
    
    const csrfCookie = cookies.find(c => c.name === 'csrf-token');
    if (csrfCookie) {
      console.log(`✅ CSRF 토큰 쿠키 발견: ${csrfCookie.value}`);
    } else {
      console.log('❌ CSRF 토큰 쿠키가 없음');
    }
    
    // 로그인
    console.log('\n2️⃣ 로그인...');
    await page.goto('http://localhost:4000/sign-in');
    await page.waitForLoadState('networkidle');
    
    const devButton = await page.$('button:has-text("관리자로 로그인")');
    if (devButton) {
      await devButton.click();
      await page.waitForTimeout(3000);
    }
    
    // 로그인 후 쿠키 재확인
    const cookiesAfterLogin = await context.cookies();
    const csrfCookieAfterLogin = cookiesAfterLogin.find(c => c.name === 'csrf-token');
    if (csrfCookieAfterLogin) {
      console.log(`✅ 로그인 후 CSRF 토큰: ${csrfCookieAfterLogin.value}`);
    } else {
      console.log('❌ 로그인 후에도 CSRF 토큰 쿠키가 없음');
    }
    
    // 3. 브라우저에서 CSRF 유틸리티 함수 테스트
    console.log('\n3️⃣ 브라우저에서 CSRF 함수 테스트...');
    const clientSideTest = await page.evaluate(() => {
      // getCsrfToken 함수 구현
      function getCsrfToken() {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'csrf-token') {
            return decodeURIComponent(value);
          }
        }
        return null;
      }
      
      return {
        documentCookie: document.cookie,
        csrfToken: getCsrfToken(),
        allCookies: document.cookie.split(';').map(c => c.trim())
      };
    });
    
    console.log('🍪 브라우저에서 본 쿠키:', clientSideTest.documentCookie);
    console.log('🔑 추출된 CSRF 토큰:', clientSideTest.csrfToken);
    
    // 4. API 요청 직접 테스트
    console.log('\n4️⃣ API 요청 직접 테스트...');
    const apiTest = await page.evaluate(async (csrfToken) => {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      };
      
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }
      
      console.log('헤더:', headers);
      
      try {
        const response = await fetch('/api/blog/posts', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: 'CSRF 디버그 테스트',
            excerpt: '테스트 요약',
            content: '테스트 내용',
            category: 'tarot',
            published: false
          })
        });
        
        const responseText = await response.text();
        return {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
          headers: Object.fromEntries(response.headers.entries())
        };
      } catch (error) {
        return { error: error.message };
      }
    }, clientSideTest.csrfToken);
    
    console.log('📡 API 테스트 결과:', JSON.stringify(apiTest, null, 2));
    
    // 5. 서버 로그에서 CSRF 검증 과정 확인하기 위해 다른 방법 시도
    console.log('\n5️⃣ API secret 헤더로 우회 테스트...');
    const apiSecretTest = await page.evaluate(async () => {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
        'x-api-secret': process.env.BLOG_API_SECRET_KEY || 'test-secret'
      };
      
      try {
        const response = await fetch('/api/blog/posts', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: 'API Secret 테스트',
            excerpt: '테스트 요약',
            content: '테스트 내용',
            category: 'tarot',
            published: false
          })
        });
        
        const responseText = await response.text();
        return {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('🔐 API Secret 테스트 결과:', JSON.stringify(apiSecretTest, null, 2));
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    console.log('\n🔍 CSRF 디버깅 완료!');
    await browser.close();
  }
})();