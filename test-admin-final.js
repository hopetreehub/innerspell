const { chromium } = require('playwright');

async function testAdminFinal() {
  console.log('🔍 관리자 대시보드 최종 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. 관리자 페이지 접속
    console.log('\n1️⃣ 관리자 페이지 접속 테스트');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`   - 현재 URL: ${currentUrl}`);
    console.log(`   - 로그인 페이지로 리다이렉트: ${currentUrl.includes('sign-in')}`);
    
    // 로그인 페이지 요소 확인 (한국어 기준)
    const emailInput = await page.locator('input[placeholder*="email"], input[placeholder*="이메일"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    const loginButton = await page.locator('button:has-text("로그인")').count();
    
    console.log(`   - 이메일 입력 필드: ${emailInput > 0 ? '있음' : '없음'}`);
    console.log(`   - 비밀번호 입력 필드: ${passwordInput > 0 ? '있음' : '없음'}`);
    console.log(`   - 로그인 버튼: ${loginButton > 0 ? '있음' : '없음'}`);
    
    await page.screenshot({ 
      path: 'screenshots/admin-login-page-final.png',
      fullPage: true 
    });
    console.log('📸 로그인 페이지 스크린샷 저장');
    
    // 2. 관리자 권한 필요 메시지 확인
    const developerLoginMessage = await page.locator('text=개발 환경 도우미').count();
    const adminRequiredMessage = await page.locator('text=관리자로 로그인').count();
    
    console.log(`   - 개발 환경 도우미 메시지: ${developerLoginMessage > 0 ? '있음' : '없음'}`);
    console.log(`   - 관리자 로그인 메시지: ${adminRequiredMessage > 0 ? '있음' : '없음'}`);
    
    // 3. 개발 환경 로그인 버튼 클릭
    console.log('\n2️⃣ 개발 환경 로그인 시도');
    
    const devLoginButton = await page.locator('button:has-text("관리자로 로그인")').count();
    if (devLoginButton > 0) {
      console.log('   - 개발 환경 로그인 버튼 발견');
      await page.locator('button:has-text("관리자로 로그인")').click();
      console.log('   - 개발 환경 로그인 버튼 클릭');
      
      // 로그인 처리 대기
      await page.waitForTimeout(5000);
      
      const afterLoginUrl = page.url();
      console.log(`   - 로그인 후 URL: ${afterLoginUrl}`);
      
      // 관리자 대시보드로 이동했는지 확인
      if (afterLoginUrl.includes('/admin') && !afterLoginUrl.includes('sign-in')) {
        console.log('✅ 개발 환경 로그인 성공! 관리자 대시보드로 이동');
        
        // 4. 관리자 대시보드 탭 구조 확인
        console.log('\n3️⃣ 관리자 대시보드 탭 구조 확인');
        
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: 'screenshots/admin-dashboard-main.png',
          fullPage: true 
        });
        console.log('📸 관리자 대시보드 메인 스크린샷 저장');
        
        // 탭 버튼들 찾기
        const allButtons = await page.locator('button').all();
        console.log(`   - 전체 버튼 개수: ${allButtons.length}`);
        
        // 각 버튼의 텍스트 확인
        console.log('   - 버튼 목록:');
        for (let i = 0; i < allButtons.length; i++) {
          const buttonText = await allButtons[i].textContent().catch(() => '');
          if (buttonText.trim()) {
            console.log(`     ${i + 1}. ${buttonText.trim()}`);
          }
        }
        
        // 특정 탭 찾기
        const usageStatsTab = await page.locator('button:has-text("사용통계"), button:has-text("Usage Stats")').count();
        const monitoringTab = await page.locator('button:has-text("실시간 모니터링"), button:has-text("Real-time Monitoring")').count();
        const tarotTab = await page.locator('button:has-text("타로 지침"), button:has-text("Tarot Guidelines")').count();
        
        console.log('\n   - 탭 존재 여부:');
        console.log(`     사용통계 탭: ${usageStatsTab > 0 ? '✅ 있음' : '❌ 없음'}`);
        console.log(`     실시간 모니터링 탭: ${monitoringTab > 0 ? '✅ 있음' : '❌ 없음'}`);
        console.log(`     타로 지침 탭: ${tarotTab > 0 ? '✅ 있음' : '❌ 없음'}`);
        
        // 5. URL 파라미터로 직접 접근 테스트
        console.log('\n4️⃣ URL 파라미터로 탭 직접 접근 테스트');
        
        // 사용통계 탭
        await page.goto('http://localhost:4000/admin?tab=usage-stats', { 
          waitUntil: 'networkidle' 
        });
        await page.waitForTimeout(2000);
        console.log(`   - 사용통계 탭 URL 접근: ${page.url()}`);
        
        await page.screenshot({ 
          path: 'screenshots/admin-usage-stats-direct.png',
          fullPage: true 
        });
        console.log('   - 사용통계 탭 스크린샷 저장');
        
        // 실시간 모니터링 탭
        await page.goto('http://localhost:4000/admin?tab=real-time-monitoring', { 
          waitUntil: 'networkidle' 
        });
        await page.waitForTimeout(2000);
        console.log(`   - 실시간 모니터링 탭 URL 접근: ${page.url()}`);
        
        await page.screenshot({ 
          path: 'screenshots/admin-monitoring-direct.png',
          fullPage: true 
        });
        console.log('   - 실시간 모니터링 탭 스크린샷 저장');
        
      } else {
        console.log('❌ 개발 환경 로그인 실패');
        
        await page.screenshot({ 
          path: 'screenshots/admin-dev-login-failed.png',
          fullPage: true 
        });
      }
    } else {
      console.log('   - 개발 환경 로그인 버튼을 찾을 수 없음');
      
      // 일반 로그인 시도
      if (emailInput > 0 && passwordInput > 0) {
        console.log('\n   일반 로그인 시도...');
        await page.locator('input[placeholder*="email"], input[placeholder*="이메일"]').fill('admin@innerspell.com');
        await page.locator('input[type="password"]').fill('admin123456');
        
        await page.screenshot({ 
          path: 'screenshots/admin-login-filled-final.png',
          fullPage: true 
        });
        console.log('   - 로그인 정보 입력 완료');
        
        if (loginButton > 0) {
          await page.locator('button:has-text("로그인")').click();
          console.log('   - 로그인 버튼 클릭');
          
          await page.waitForTimeout(5000);
          
          const afterLoginUrl = page.url();
          console.log(`   - 로그인 후 URL: ${afterLoginUrl}`);
          
          await page.screenshot({ 
            path: 'screenshots/admin-after-normal-login.png',
            fullPage: true 
          });
        }
      }
    }
    
    console.log('\n✅ 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    await page.screenshot({ 
      path: 'screenshots/admin-error-final.png',
      fullPage: true 
    });
  } finally {
    console.log('\n브라우저를 15초 후에 자동으로 닫습니다...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

testAdminFinal().catch(console.error);