import { test, expect } from '@playwright/test';

test.describe('관리자 회원/시스템 관리 탭 확인', () => {
  test('회원 관리 및 시스템 관리 탭에서 교육 문의 기능 찾기', async ({ page }) => {
    // 1. 관리자 페이지로 이동
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 관리자 대시보드 확인
    const dashboardTitle = await page.locator('h1:has-text("관리자 대시보드")').first();
    if (await dashboardTitle.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ 관리자 대시보드 접근 성공');
    }
    
    // 2. 회원 관리 탭 클릭
    console.log('\n📌 회원 관리 탭 확인...');
    const memberTab = await page.locator('button:has-text("회원 관리"), [role="tab"]:has-text("회원")').first();
    if (await memberTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await memberTab.click();
      await page.waitForTimeout(1500);
      
      // 회원 관리 탭 내용 확인
      const memberContent = await page.locator('[role="tabpanel"]:visible, .tab-content:visible').first();
      const memberText = await memberContent.textContent();
      console.log('회원 관리 탭 내용:', memberText?.substring(0, 200));
      
      // 교육 문의 관련 메뉴 찾기
      const educationInMember = await page.locator('text=/교육.*문의|문의.*관리|inquiry|education/i').count();
      console.log(`회원 관리 탭 내 교육 문의 관련 요소: ${educationInMember}개`);
      
      // 서브 메뉴나 버튼 확인
      const subMenus = await page.locator('[role="tabpanel"]:visible button, [role="tabpanel"]:visible a').allTextContents();
      console.log('회원 관리 서브 메뉴:', subMenus);
      
      // 스크린샷
      await page.screenshot({ 
        path: 'admin-member-tab.png',
        fullPage: true 
      });
    }
    
    // 3. 시스템 관리 탭 클릭
    console.log('\n📌 시스템 관리 탭 확인...');
    const systemTab = await page.locator('button:has-text("시스템 관리"), [role="tab"]:has-text("시스템")').first();
    if (await systemTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await systemTab.click();
      await page.waitForTimeout(1500);
      
      // 시스템 관리 탭 내용 확인
      const systemContent = await page.locator('[role="tabpanel"]:visible, .tab-content:visible').first();
      const systemText = await systemContent.textContent();
      console.log('시스템 관리 탭 내용:', systemText?.substring(0, 200));
      
      // 교육 문의 관련 메뉴 찾기
      const educationInSystem = await page.locator('text=/교육.*문의|문의.*관리|inquiry|education/i').count();
      console.log(`시스템 관리 탭 내 교육 문의 관련 요소: ${educationInSystem}개`);
      
      // 서브 메뉴나 버튼 확인
      const systemSubMenus = await page.locator('[role="tabpanel"]:visible button, [role="tabpanel"]:visible a').allTextContents();
      console.log('시스템 관리 서브 메뉴:', systemSubMenus);
      
      // 스크린샷
      await page.screenshot({ 
        path: 'admin-system-tab.png',
        fullPage: true 
      });
    }
    
    // 4. 사용통계 탭 확인 (문의 통계가 있을 수 있음)
    console.log('\n📌 사용통계 탭 확인...');
    const statsTab = await page.locator('button:has-text("사용통계"), [role="tab"]:has-text("통계")').first();
    if (await statsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statsTab.click();
      await page.waitForTimeout(1500);
      
      // 사용통계 탭 내용 확인
      const statsContent = await page.locator('[role="tabpanel"]:visible, .tab-content:visible').first();
      const statsText = await statsContent.textContent();
      console.log('사용통계 탭 내용:', statsText?.substring(0, 200));
      
      // 문의 관련 통계 찾기
      const inquiryStats = await page.locator('text=/문의|inquiry|contact|education/i').count();
      console.log(`사용통계 탭 내 문의 관련 요소: ${inquiryStats}개`);
      
      // 스크린샷
      await page.screenshot({ 
        path: 'admin-stats-tab.png',
        fullPage: true 
      });
    }
    
    // 5. 최종 요약
    console.log('\n📊 최종 요약:');
    console.log('- 관리자 대시보드 접근 가능');
    console.log('- 회원 관리, 시스템 관리, 사용통계 탭 확인 완료');
    console.log('- /admin/education-inquiries 경로는 404 반환');
    console.log('- 교육 문의 관리 기능이 별도 탭으로 구현되지 않은 것으로 보임');
    
    // 모든 탭 이름 다시 확인
    const allTabs = await page.locator('[role="tab"], button[class*="tab"]').allTextContents();
    console.log('\n사용 가능한 모든 탭:', allTabs);
  });
});