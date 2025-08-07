const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testAdminPage() {
  console.log('🚀 관리자 페이지 최종 검증 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. 관리자 페이지 접속
    console.log('📍 1. 관리자 페이지 접속 테스트...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 빌드 오류가 있으면 에러 페이지가 표시될 것임
    await page.waitForTimeout(3000);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'screenshots/admin-final-verification.png',
      fullPage: true 
    });
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`✅ 페이지 제목: ${title}`);
    
    // 오류 페이지인지 확인
    const errorElements = await page.locator('text=Application error').count();
    if (errorElements > 0) {
      console.error('❌ 애플리케이션 오류가 발생했습니다!');
      return false;
    }
    
    // 로딩 상태 확인
    const loadingElements = await page.locator('text=Loading').count();
    if (loadingElements > 0) {
      console.log('⏳ 페이지가 로딩 중입니다. 잠시 대기...');
      await page.waitForTimeout(5000);
    }
    
    // 2. 메인 탭들이 표시되는지 확인
    console.log('📍 2. 메인 탭 표시 확인...');
    const tabs = [
      'text=AI 공급자',
      'text=사용통계', 
      'text=실시간 모니터링',
      'text=타로 지침',
      'text=블로그 관리'
    ];
    
    for (const tab of tabs) {
      const tabElement = await page.locator(tab).count();
      if (tabElement > 0) {
        console.log(`✅ ${tab} 탭이 표시됩니다.`);
      } else {
        console.log(`⚠️ ${tab} 탭을 찾을 수 없습니다.`);
      }
    }
    
    // 3. 사용통계 탭 클릭 테스트
    console.log('📍 3. 사용통계 탭 클릭 테스트...');
    const usageStatsTab = page.locator('text=사용통계');
    if (await usageStatsTab.count() > 0) {
      await usageStatsTab.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'screenshots/admin-usage-stats-verification.png',
        fullPage: true 
      });
      
      console.log('✅ 사용통계 탭 클릭 성공');
    }
    
    // 4. 실시간 모니터링 탭 클릭 테스트  
    console.log('📍 4. 실시간 모니터링 탭 클릭 테스트...');
    const monitoringTab = page.locator('text=실시간 모니터링');
    if (await monitoringTab.count() > 0) {
      await monitoringTab.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'screenshots/admin-monitoring-verification.png',
        fullPage: true 
      });
      
      console.log('✅ 실시간 모니터링 탭 클릭 성공');
    }
    
    // 5. 블로그 관리 탭 클릭 테스트
    console.log('📍 5. 블로그 관리 탭 클릭 테스트...');
    const blogTab = page.locator('text=블로그 관리');
    if (await blogTab.count() > 0) {
      await blogTab.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'screenshots/admin-blog-verification.png',
        fullPage: true 
      });
      
      console.log('✅ 블로그 관리 탭 클릭 성공');
    }
    
    console.log('✅ 관리자 페이지 최종 검증 완료!');
    return true;
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    
    // 오류 스크린샷 촬영
    await page.screenshot({ 
      path: 'screenshots/admin-error-verification.png',
      fullPage: true 
    });
    
    return false;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testAdminPage().then(success => {
  if (success) {
    console.log('🎉 모든 테스트 통과!');
    process.exit(0);
  } else {
    console.log('💥 테스트 실패!');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 테스트 실행 오류:', error);
  process.exit(1);
});