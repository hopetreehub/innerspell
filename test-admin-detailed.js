const { chromium } = require('playwright');

async function testAdminDetailed() {
  console.log('🔍 관리자 대시보드 상세 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. 관리자 페이지 접속 및 로그인 페이지 확인
    console.log('\n1️⃣ 관리자 페이지 접속 테스트');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`   - 현재 URL: ${currentUrl}`);
    console.log(`   - 로그인 페이지로 리다이렉트: ${currentUrl.includes('sign-in')}`);
    
    // 로그인 페이지 요소 확인
    const emailInput = await page.locator('input[type="email"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    const signInButton = await page.locator('button:has-text("Sign in"), button:has-text("로그인")').count();
    
    console.log(`   - 이메일 입력 필드: ${emailInput > 0 ? '있음' : '없음'}`);
    console.log(`   - 비밀번호 입력 필드: ${passwordInput > 0 ? '있음' : '없음'}`);
    console.log(`   - 로그인 버튼: ${signInButton > 0 ? '있음' : '없음'}`);
    
    await page.screenshot({ 
      path: 'screenshots/admin-login-page-detailed.png',
      fullPage: true 
    });
    console.log('📸 로그인 페이지 스크린샷 저장: screenshots/admin-login-page-detailed.png');
    
    // 2. 테스트 관리자 계정으로 로그인 시도
    console.log('\n2️⃣ 관리자 로그인 시도');
    
    if (emailInput > 0 && passwordInput > 0) {
      // 테스트 계정 정보 입력
      await page.fill('input[type="email"]', 'admin@innerspell.com');
      await page.fill('input[type="password"]', 'admin123456');
      
      console.log('   - 로그인 정보 입력 완료');
      
      await page.screenshot({ 
        path: 'screenshots/admin-login-filled-detailed.png',
        fullPage: true 
      });
      console.log('📸 로그인 정보 입력 후 스크린샷 저장');
      
      // 로그인 버튼 클릭
      if (signInButton > 0) {
        await page.locator('button:has-text("Sign in"), button:has-text("로그인")').first().click();
        console.log('   - 로그인 버튼 클릭');
        
        // 로그인 처리 대기
        await page.waitForTimeout(5000);
        
        const afterLoginUrl = page.url();
        console.log(`   - 로그인 후 URL: ${afterLoginUrl}`);
        
        // 관리자 대시보드로 이동했는지 확인
        if (afterLoginUrl.includes('/admin') && !afterLoginUrl.includes('sign-in')) {
          console.log('✅ 로그인 성공! 관리자 대시보드로 이동');
          
          // 3. 탭 구조 확인
          console.log('\n3️⃣ 관리자 대시보드 탭 구조 확인');
          
          await page.waitForTimeout(2000);
          
          // 탭 버튼들 찾기
          const tabButtons = await page.locator('[role="tab"], button[data-tab], .tab-button').all();
          console.log(`   - 탭 버튼 개수: ${tabButtons.length}`);
          
          // 각 탭의 텍스트 확인
          for (let i = 0; i < tabButtons.length; i++) {
            const tabText = await tabButtons[i].textContent();
            console.log(`   - 탭 ${i + 1}: ${tabText.trim()}`);
          }
          
          // 사용통계 탭 찾기
          const usageStatsTab = await page.locator('button:has-text("사용통계"), button:has-text("Usage Stats"), [data-tab="usage-stats"]').count();
          console.log(`   - 사용통계 탭 존재: ${usageStatsTab > 0}`);
          
          // 실시간 모니터링 탭 찾기
          const monitoringTab = await page.locator('button:has-text("실시간 모니터링"), button:has-text("Real-time Monitoring"), [data-tab="real-time-monitoring"]').count();
          console.log(`   - 실시간 모니터링 탭 존재: ${monitoringTab > 0}`);
          
          await page.screenshot({ 
            path: 'screenshots/admin-dashboard-tabs.png',
            fullPage: true 
          });
          console.log('📸 관리자 대시보드 탭 스크린샷 저장');
          
          // 4. 사용통계 탭 클릭 테스트
          if (usageStatsTab > 0) {
            console.log('\n4️⃣ 사용통계 탭 클릭 테스트');
            await page.locator('button:has-text("사용통계"), button:has-text("Usage Stats"), [data-tab="usage-stats"]').first().click();
            await page.waitForTimeout(2000);
            
            const usageStatsUrl = page.url();
            console.log(`   - 사용통계 탭 URL: ${usageStatsUrl}`);
            
            await page.screenshot({ 
              path: 'screenshots/admin-usage-stats-tab.png',
              fullPage: true 
            });
            console.log('📸 사용통계 탭 스크린샷 저장');
          }
          
          // 5. 실시간 모니터링 탭 클릭 테스트
          if (monitoringTab > 0) {
            console.log('\n5️⃣ 실시간 모니터링 탭 클릭 테스트');
            await page.locator('button:has-text("실시간 모니터링"), button:has-text("Real-time Monitoring"), [data-tab="real-time-monitoring"]').first().click();
            await page.waitForTimeout(2000);
            
            const monitoringUrl = page.url();
            console.log(`   - 실시간 모니터링 탭 URL: ${monitoringUrl}`);
            
            await page.screenshot({ 
              path: 'screenshots/admin-monitoring-tab.png',
              fullPage: true 
            });
            console.log('📸 실시간 모니터링 탭 스크린샷 저장');
          }
          
        } else {
          console.log('❌ 로그인 실패 또는 리다이렉트됨');
          
          // 에러 메시지 확인
          const errorMessage = await page.locator('.error-message, .alert-error, [role="alert"]').textContent().catch(() => null);
          if (errorMessage) {
            console.log(`   - 에러 메시지: ${errorMessage}`);
          }
          
          await page.screenshot({ 
            path: 'screenshots/admin-login-failed.png',
            fullPage: true 
          });
          console.log('📸 로그인 실패 스크린샷 저장');
        }
      }
    }
    
    console.log('\n✅ 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    await page.screenshot({ 
      path: 'screenshots/admin-error-detailed.png',
      fullPage: true 
    });
  } finally {
    // 브라우저는 열어둡니다
    console.log('\n브라우저를 10초 후에 자동으로 닫습니다...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

testAdminDetailed().catch(console.error);