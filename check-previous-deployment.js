const { chromium } = require('playwright');

(async () => {
  console.log('🔍 이전 성공 배포 확인...');
  
  const browser = await chromium.launch({ 
    headless: false, 
    viewport: { width: 1920, height: 1080 } 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 6시간 전 성공한 배포 URL
  const deploymentUrl = 'https://test-studio-firebase-g1hflkesq-johns-projects-bf5e60f3.vercel.app';
  
  try {
    console.log(`📍 이전 성공 배포 URL 접속: ${deploymentUrl}`);
    
    const response = await page.goto(deploymentUrl, {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    const status = response ? response.status() : 'No response';
    console.log(`📊 응답 상태: ${status}`);
    
    if (status === 200) {
      console.log('✅ 이전 배포 정상 작동 확인!');
      
      await page.screenshot({ 
        path: 'vercel-previous-deployment.png',
        fullPage: true 
      });
      console.log('📸 스크린샷 저장');
      
      // 타로 지침 관리 페이지 확인
      console.log('\n📍 관리자 페이지로 이동...');
      await page.goto(`${deploymentUrl}/admin`, {
        waitUntil: 'networkidle'
      });
      
      // 로그인 필요시 처리
      if (page.url().includes('/sign-in')) {
        console.log('🔐 Mock 로그인 수행...');
        
        await page.evaluate(() => {
          localStorage.setItem('mockAuth', JSON.stringify({
            user: {
              id: 'admin-test',
              email: 'admin@test.com',
              role: 'admin',
              displayName: 'Test Admin'
            }
          }));
        });
        
        await page.goto(`${deploymentUrl}/admin`);
        await page.waitForLoadState('networkidle');
      }
      
      // 타로 지침 탭 확인
      const tarotTab = await page.locator('button:has-text("타로 지침")').first();
      if (await tarotTab.isVisible()) {
        await tarotTab.click();
        console.log('✅ 타로 지침 탭 확인 완료');
        
        await page.waitForTimeout(2000);
        await page.screenshot({ 
          path: 'vercel-tarot-guidelines-tab.png',
          fullPage: true 
        });
        console.log('📸 타로 지침 탭 스크린샷 저장');
      }
      
      console.log('\n🌐 프로덕션 도메인 정보:');
      console.log('  - test-studio-firebase-johns-projects-bf5e60f3.vercel.app');
      console.log('  - test-studio-firebase-junsupark9999-8777-johns-projects-bf5e60f3.vercel.app');
      
    } else {
      console.log('❌ 이전 배포도 접속 실패');
    }
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
  } finally {
    await browser.close();
    console.log('🏁 검증 완료');
  }
})();