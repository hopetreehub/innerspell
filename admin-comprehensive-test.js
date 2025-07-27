const { chromium } = require('playwright');

(async () => {
  console.log('🚀 관리자 페이지 종합 테스트 시작...');
  
  const browser = await chromium.launch({
    headless: false,
    viewport: { width: 1400, height: 900 }
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1400, height: 900 }
    });
    const page = await context.newPage();
    
    // 콘솔 메시지 및 네트워크 요청 모니터링
    const logs = [];
    page.on('console', msg => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      logs.push(`[ERROR] ${error.message}`);
    });
    
    console.log('\n=== 1단계: 홈페이지에서 시작 ===');
    await page.goto('https://test-studio-firebase.vercel.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'admin-comprehensive-01-homepage.png',
      fullPage: false 
    });
    
    console.log('\n=== 2단계: /admin 직접 접속 ===');
    await page.goto('https://test-studio-firebase.vercel.app/admin', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    console.log('현재 URL:', page.url());
    
    await page.screenshot({ 
      path: 'admin-comprehensive-02-signin-redirect.png',
      fullPage: false 
    });
    
    console.log('\n=== 3단계: Google 로그인 시도 ===');
    
    // Google 로그인 버튼 확인 및 클릭
    try {
      const googleButton = page.locator('button:has-text("Google로 로그인")');
      if (await googleButton.isVisible()) {
        console.log('Google 로그인 버튼 발견, 클릭...');
        await googleButton.click();
        await page.waitForTimeout(5000);
        
        console.log('Google OAuth 후 URL:', page.url());
        
        await page.screenshot({ 
          path: 'admin-comprehensive-03-after-google-oauth.png',
          fullPage: false 
        });
      } else {
        console.log('Google 로그인 버튼을 찾을 수 없음');
      }
    } catch (error) {
      console.log('Google 로그인 시도 중 에러:', error.message);
    }
    
    console.log('\n=== 4단계: 이메일/비밀번호 로그인 시도 ===');
    
    // 로그인 페이지로 돌아가기
    if (!page.url().includes('sign-in')) {
      await page.goto('https://test-studio-firebase.vercel.app/sign-in?redirect=/admin');
      await page.waitForTimeout(2000);
    }
    
    // 이메일과 비밀번호 입력
    try {
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        console.log('이메일/비밀번호 필드 발견, 테스트 계정으로 로그인 시도...');
        
        // 관리자 이메일 사용
        await emailInput.fill('admin@innerspell.com');
        await passwordInput.fill('test123456');
        
        await page.screenshot({ 
          path: 'admin-comprehensive-04-login-form-filled.png',
          fullPage: false 
        });
        
        // 로그인 버튼 클릭
        const loginButton = page.locator('button[type="submit"], button:has-text("로그인")').first();
        if (await loginButton.isVisible()) {
          await loginButton.click();
          await page.waitForTimeout(5000);
          
          console.log('로그인 후 URL:', page.url());
          
          await page.screenshot({ 
            path: 'admin-comprehensive-05-after-login.png',
            fullPage: false 
          });
        }
      }
    } catch (error) {
      console.log('이메일/비밀번호 로그인 시도 중 에러:', error.message);
    }
    
    console.log('\n=== 5단계: 수동 관리자 인증 시뮬레이션 ===');
    
    // localStorage에 임시 인증 정보 설정하여 관리자 페이지 접근 시도
    try {
      await page.evaluate(() => {
        // 임시 인증 토큰 설정
        localStorage.setItem('adminToken', 'temp-admin-token');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userEmail', 'admin@innerspell.com');
        localStorage.setItem('isAuthenticated', 'true');
        
        // Firebase 인증 상태 시뮬레이션
        window.mockAuth = {
          currentUser: {
            email: 'admin@innerspell.com',
            uid: 'mock-admin-uid',
            emailVerified: true
          },
          isAdmin: true
        };
      });
      
      console.log('임시 인증 정보 설정 완료');
      
      // 관리자 페이지로 이동
      await page.goto('https://test-studio-firebase.vercel.app/admin', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      await page.waitForTimeout(5000);
      
      console.log('인증 후 URL:', page.url());
      
      await page.screenshot({ 
        path: 'admin-comprehensive-06-mock-auth-admin.png',
        fullPage: false 
      });
      
    } catch (error) {
      console.log('수동 인증 시뮬레이션 중 에러:', error.message);
    }
    
    console.log('\n=== 6단계: 관리자 대시보드 구조 분석 ===');
    
    // 현재 페이지 구조 분석
    const pageAnalysis = await page.evaluate(() => {
      const result = {
        url: window.location.href,
        title: document.title,
        headings: [],
        tabs: [],
        buttons: [],
        forms: [],
        menuItems: [],
        hasAdminContent: false,
        hasAuthError: false,
        bodyText: document.body.innerText.substring(0, 1000)
      };
      
      // 제목들 수집
      document.querySelectorAll('h1, h2, h3, h4').forEach(h => {
        result.headings.push(h.textContent.trim());
      });
      
      // 탭/버튼 수집
      document.querySelectorAll('button, [role="tab"], .tab').forEach(el => {
        const text = el.textContent.trim();
        if (text) {
          if (el.hasAttribute('role') && el.getAttribute('role') === 'tab') {
            result.tabs.push(text);
          } else {
            result.buttons.push(text);
          }
        }
      });
      
      // 메뉴 항목 수집
      document.querySelectorAll('nav a, .menu a, .navigation a').forEach(link => {
        const text = link.textContent.trim();
        if (text) {
          result.menuItems.push(text);
        }
      });
      
      // 폼 수집
      document.querySelectorAll('form').forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select').length;
        result.forms.push({
          action: form.action,
          method: form.method,
          inputCount: inputs
        });
      });
      
      // 관리자 컨텐츠 확인
      const text = document.body.innerText.toLowerCase();
      result.hasAdminContent = text.includes('관리자') || text.includes('admin') || 
                             text.includes('대시보드') || text.includes('dashboard') ||
                             text.includes('타로 지침') || text.includes('ai 설정');
      
      result.hasAuthError = text.includes('인증') || text.includes('로그인') || 
                           text.includes('권한') || text.includes('access denied');
      
      return result;
    });
    
    console.log('\n📊 페이지 분석 결과:');
    console.log('URL:', pageAnalysis.url);
    console.log('제목:', pageAnalysis.title);
    console.log('페이지 제목들:', pageAnalysis.headings);
    console.log('탭들:', pageAnalysis.tabs);
    console.log('버튼들:', pageAnalysis.buttons.slice(0, 10)); // 처음 10개만
    console.log('메뉴 항목들:', pageAnalysis.menuItems);
    console.log('폼 수:', pageAnalysis.forms.length);
    console.log('관리자 컨텐츠 존재:', pageAnalysis.hasAdminContent);
    console.log('인증 에러 존재:', pageAnalysis.hasAuthError);
    
    console.log('\n=== 7단계: 관리자 기능 탐색 ===');
    
    // 타로 지침 관리 탭 찾기
    try {
      const tarotTab = page.locator('button:has-text("타로 지침"), [role="tab"]:has-text("타로"), button:has-text("Tarot")');
      if (await tarotTab.first().isVisible()) {
        console.log('타로 지침 탭 발견, 클릭 시도...');
        await tarotTab.first().click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: 'admin-comprehensive-07-tarot-guidelines.png',
          fullPage: false 
        });
      }
    } catch (error) {
      console.log('타로 지침 탭 클릭 중 에러:', error.message);
    }
    
    // AI 설정 탭 찾기
    try {
      const aiTab = page.locator('button:has-text("AI 설정"), [role="tab"]:has-text("AI"), button:has-text("Settings")');
      if (await aiTab.first().isVisible()) {
        console.log('AI 설정 탭 발견, 클릭 시도...');
        await aiTab.first().click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: 'admin-comprehensive-08-ai-settings.png',
          fullPage: false 
        });
      }
    } catch (error) {
      console.log('AI 설정 탭 클릭 중 에러:', error.message);
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'admin-comprehensive-09-final-state.png',
      fullPage: true 
    });
    
    console.log('\n=== 8단계: 로그 분석 ===');
    console.log('수집된 로그 (마지막 20개):');
    logs.slice(-20).forEach((log, i) => {
      console.log(`  ${i+1}. ${log}`);
    });
    
    console.log('\n✅ 종합 테스트 완료!');
    console.log('📸 생성된 스크린샷:');
    console.log('- admin-comprehensive-01-homepage.png: 홈페이지');
    console.log('- admin-comprehensive-02-signin-redirect.png: 로그인 리다이렉트');
    console.log('- admin-comprehensive-03-after-google-oauth.png: Google OAuth 후');
    console.log('- admin-comprehensive-04-login-form-filled.png: 로그인 폼 입력');
    console.log('- admin-comprehensive-05-after-login.png: 로그인 후');
    console.log('- admin-comprehensive-06-mock-auth-admin.png: 모의 인증 후');
    console.log('- admin-comprehensive-07-tarot-guidelines.png: 타로 지침 탭');
    console.log('- admin-comprehensive-08-ai-settings.png: AI 설정 탭');
    console.log('- admin-comprehensive-09-final-state.png: 최종 상태');
    
  } catch (error) {
    console.error('테스트 중 에러 발생:', error);
    await page.screenshot({ 
      path: 'admin-comprehensive-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();