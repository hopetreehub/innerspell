const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testAdminWithAuthBypass() {
  console.log('🚀 Starting admin functionality test with auth bypass...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 스크린샷 저장 디렉토리 생성
  const screenshotDir = './admin-auth-bypass-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  try {
    console.log('📋 1. Testing admin page access...');
    
    // 1. http://localhost:4000/admin 페이지 접속 시도
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '01_admin_access_initial.png'),
      fullPage: true 
    });
    
    const currentUrl = page.url();
    console.log(`Current URL after admin access: ${currentUrl}`);
    
    // 2. 로그인 페이지로 리다이렉트 되는지 확인
    if (currentUrl.includes('/sign-in')) {
      console.log('✅ Redirected to sign-in page as expected');
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '02_signin_page.png'),
        fullPage: true 
      });
      
      // 3. Google 로그인 UI 확인
      console.log('📋 3. Checking Google login UI...');
      
      // Google 로그인 버튼 찾기
      const googleButton = await page.locator('text=Google').first();
      if (await googleButton.isVisible()) {
        console.log('✅ Google login button found');
        
        // 버튼 하이라이트
        await googleButton.evaluate(el => {
          el.style.border = '3px solid red';
          el.style.backgroundColor = 'yellow';
        });
        
        await page.screenshot({ 
          path: path.join(screenshotDir, '03_google_login_highlighted.png'),
          fullPage: true 
        });
      }
      
      // 4. 인증 상태 모킹을 위해 localStorage에 가짜 사용자 데이터 설정
      console.log('📋 4. Setting up mock admin authentication...');
      
      await page.evaluate(() => {
        // AuthContext에서 사용하는 키들로 설정
        const mockUser = {
          uid: 'admin-test-user',
          email: 'admin@innerspell.com',
          displayName: 'Test Admin',
          role: 'admin',
          emailVerified: true
        };
        
        localStorage.setItem('firebase-auth-user', JSON.stringify(mockUser));
        localStorage.setItem('user-role', 'admin');
        localStorage.setItem('auth-state', 'authenticated');
      });
      
      // 5. 관리자 페이지로 다시 이동
      console.log('📋 5. Redirecting to admin page with mock auth...');
      await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '04_admin_with_mock_auth.png'),
        fullPage: true 
      });
      
    }
    
    // 인증 우회가 작동하지 않을 경우를 대비해 직접 페이지 접근
    console.log('📋 6. Checking if admin dashboard is accessible...');
    
    const currentUrlAfterAuth = page.url();
    console.log(`URL after auth attempt: ${currentUrlAfterAuth}`);
    
    // 페이지가 여전히 로그인 페이지라면 다른 방법 시도
    if (currentUrlAfterAuth.includes('/sign-in')) {
      console.log('📋 7. Auth bypass failed, trying alternative approach...');
      
      // React DevTools 같은 방식으로 상태 직접 조작
      await page.evaluate(() => {
        // window 객체에 임시 인증 상태 설정
        window.__mockAuth = {
          user: {
            uid: 'admin-test-user',
            email: 'admin@innerspell.com',
            displayName: 'Test Admin',
            role: 'admin',
            emailVerified: true
          },
          loading: false
        };
      });
      
      // 페이지 새로고침
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '05_alternative_auth_attempt.png'),
        fullPage: true 
      });
    }
    
    // 8. 관리자 대시보드 탭들 확인
    console.log('📋 8. Checking admin dashboard tabs...');
    
    // 페이지 소스에서 탭들 확인
    const pageContent = await page.content();
    const tabsFound = [];
    
    const expectedTabs = [
      'AI 공급자',
      '타로 지침', 
      '타로 AI',
      '꿈해몽 AI',
      'GEO 가이드',
      '블로그 관리',
      '회원 관리',
      '시스템 관리'
    ];
    
    for (const tab of expectedTabs) {
      if (pageContent.includes(tab)) {
        tabsFound.push(tab);
        console.log(`✅ Found tab in HTML: ${tab}`);
      } else {
        console.log(`❌ Tab not found in HTML: ${tab}`);
      }
    }
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '06_final_dashboard_state.png'),
      fullPage: true 
    });
    
    // 9. 탭들이 실제로 표시되는지 확인
    if (tabsFound.length > 0) {
      console.log('📋 9. Attempting to interact with visible tabs...');
      
      for (const tab of tabsFound.slice(0, 3)) { // 처음 3개 탭만 테스트
        try {
          const tabElement = page.locator(`text=${tab}`).first();
          if (await tabElement.isVisible({ timeout: 5000 })) {
            console.log(`📋 Clicking tab: ${tab}`);
            await tabElement.click();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ 
              path: path.join(screenshotDir, `07_tab_${tab.replace(/[^a-zA-Z0-9]/g, '_')}.png`),
              fullPage: true 
            });
          }
        } catch (e) {
          console.log(`Error interacting with tab ${tab}:`, e.message);
        }
      }
    }
    
    // 10. 블로그 관리 탭 특별 확인
    console.log('📋 10. Special check for blog management...');
    
    try {
      const blogTab = page.locator('text=블로그 관리').first();
      if (await blogTab.isVisible({ timeout: 5000 })) {
        await blogTab.click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: path.join(screenshotDir, '08_blog_management_tab.png'),
          fullPage: true 
        });
        
        // 새 포스트 작성 관련 요소 찾기
        const newPostElements = [
          'text=새 포스트',
          'text=새 글 작성',
          'text=포스트 작성',
          'button:has-text("작성")',
          'button:has-text("새")',
          '[placeholder*="제목"]',
          'textarea[placeholder*="내용"]'
        ];
        
        for (const selector of newPostElements) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 3000 })) {
              console.log(`✅ Found blog element: ${selector}`);
              
              await element.evaluate(el => {
                el.style.border = '3px solid green';
                el.style.backgroundColor = 'lightgreen';
              });
            }
          } catch (e) {
            console.log(`Blog element not found: ${selector}`);
          }
        }
        
        await page.screenshot({ 
          path: path.join(screenshotDir, '09_blog_elements_highlighted.png'),
          fullPage: true 
        });
      }
    } catch (e) {
      console.log('Error in blog management section:', e.message);
    }
    
    // 최종 상태 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotDir, '10_final_state.png'),
      fullPage: true 
    });
    
    console.log('✅ Admin functionality test with auth bypass completed!');
    console.log(`📁 Screenshots saved in: ${screenshotDir}`);
    console.log(`📊 Tabs found in HTML: ${tabsFound.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error during admin functionality test:', error);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, 'error_state.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testAdminWithAuthBypass().catch(console.error);