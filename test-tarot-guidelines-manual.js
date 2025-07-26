const { chromium } = require('playwright');

(async () => {
  console.log('🚀 타로 지침 관리 시스템 수동 검증 시작...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 1. 홈페이지 접근
    console.log('📍 1. 홈페이지 접근 중...');
    await page.goto('https://test-studio-firebase.vercel.app/');
    await page.waitForLoadState('networkidle');
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'tarot-test-1-homepage.png', 
      fullPage: true 
    });
    console.log('   ✅ 홈페이지 로드 완료\n');
    
    // 2. 관리자 페이지 직접 접근 (로그인 없이 테스트)
    console.log('📍 2. 관리자 페이지 접근 중...');
    await page.goto('https://test-studio-firebase.vercel.app/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'tarot-test-2-admin-page.png', 
      fullPage: true 
    });
    console.log('   ✅ 관리자 페이지 접근 완료\n');
    
    // 3. 타로 지침 탭 클릭 (가능한 경우)
    console.log('📍 3. 타로 지침 탭 확인 중...');
    
    // 타로 지침 탭이 존재하는지 확인
    const tarotTab = await page.locator('button:has-text("타로 지침")').first();
    const isTabVisible = await tarotTab.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isTabVisible) {
      await tarotTab.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'tarot-test-3-tarot-guidelines-tab.png', 
        fullPage: true 
      });
      console.log('   ✅ 타로 지침 탭 클릭 완료\n');
      
      // 4. 통계 탭 확인
      console.log('📍 4. 통계 및 분석 탭 확인 중...');
      const analyticsTab = await page.locator('button:has-text("통계 및 분석")').first();
      const isAnalyticsVisible = await analyticsTab.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isAnalyticsVisible) {
        await analyticsTab.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: 'tarot-test-4-analytics-tab.png', 
          fullPage: true 
        });
        console.log('   ✅ 통계 탭 확인 완료\n');
      }
      
      // 5. 새 지침 생성 버튼 테스트
      console.log('📍 5. 새 지침 생성 버튼 테스트 중...');
      const createButton = await page.locator('button:has-text("새 지침 생성")').first();
      const isCreateVisible = await createButton.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isCreateVisible) {
        await createButton.click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: 'tarot-test-5-create-guideline-form.png', 
          fullPage: true 
        });
        console.log('   ✅ 지침 생성 폼 열기 완료\n');
      }
    } else {
      console.log('   ⚠️  타로 지침 탭이 보이지 않음 (로그인 필요할 수 있음)\n');
    }
    
    console.log('🎉 수동 검증 완료!');
    console.log('\n📸 생성된 스크린샷:');
    console.log('   - tarot-test-1-homepage.png');
    console.log('   - tarot-test-2-admin-page.png');
    console.log('   - tarot-test-3-tarot-guidelines-tab.png (조건부)');
    console.log('   - tarot-test-4-analytics-tab.png (조건부)');
    console.log('   - tarot-test-5-create-guideline-form.png (조건부)');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    
    // 오류 스크린샷
    await page.screenshot({ 
      path: 'tarot-test-error.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();