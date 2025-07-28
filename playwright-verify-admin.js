const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 Vercel 배포 사이트 관리자 페이지 확인 시작...');
    
    // 관리자 페이지 접속
    const adminUrl = 'https://test-studio-firebase.vercel.app/admin';
    console.log(`📍 접속 URL: ${adminUrl}`);
    
    await page.goto(adminUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // 로딩 대기
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`📄 페이지 제목: ${title}`);
    
    // 로그인 페이지인지 확인
    const isLoginPage = await page.locator('input[type="email"], input[type="password"], form').count() > 0;
    console.log(`🔐 로그인 페이지 여부: ${isLoginPage}`);
    
    if (isLoginPage) {
      console.log('✅ 관리자 로그인 페이지가 정상적으로 로드됨');
      
      // 로그인 폼 요소 확인
      const emailInput = await page.locator('input[type="email"]').count();
      const passwordInput = await page.locator('input[type="password"]').count();
      const submitButton = await page.locator('button[type="submit"], input[type="submit"]').count();
      
      console.log(`📧 이메일 입력 필드: ${emailInput}개`);
      console.log(`🔒 비밀번호 입력 필드: ${passwordInput}개`);
      console.log(`🔘 제출 버튼: ${submitButton}개`);
      
      // 스크린샷 저장
      const screenshotPath = '/mnt/e/project/test-studio-firebase/admin-login-page.png';
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 로그인 페이지 스크린샷 저장: ${screenshotPath}`);
    } else {
      console.log('⚠️ 로그인 페이지가 아닌 것으로 보임 - 이미 로그인된 상태이거나 다른 페이지');
      
      // 통계 탭 확인
      const statsTab = await page.locator('text="통계", text="Statistics"').count();
      console.log(`📊 통계 탭 발견: ${statsTab}개`);
      
      // 차트 컴포넌트 확인
      const chartElements = await page.locator('canvas, svg, .chart, [class*="chart"]').count();
      console.log(`📈 차트 요소 발견: ${chartElements}개`);
      
      // 전체 페이지 스크린샷
      const screenshotPath = '/mnt/e/project/test-studio-firebase/admin-dashboard.png';
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 관리자 대시보드 스크린샷 저장: ${screenshotPath}`);
    }
    
    // 페이지 HTML 구조 일부 확인
    const bodyContent = await page.locator('body').innerHTML();
    const hasStatsTabs = bodyContent.includes('통계') || bodyContent.includes('Statistics');
    const hasChartComponents = bodyContent.includes('chart') || bodyContent.includes('Chart');
    
    console.log(`📋 통계 관련 텍스트 포함: ${hasStatsTabs}`);
    console.log(`📊 차트 관련 텍스트 포함: ${hasChartComponents}`);
    
    console.log('✅ Vercel 배포 사이트 확인 완료');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    // 오류 발생 시에도 스크린샷 저장
    const errorScreenshotPath = '/mnt/e/project/test-studio-firebase/admin-error.png';
    try {
      await page.screenshot({ path: errorScreenshotPath, fullPage: true });
      console.log(`📸 오류 상황 스크린샷 저장: ${errorScreenshotPath}`);
    } catch (screenshotError) {
      console.error('스크린샷 저장 실패:', screenshotError.message);
    }
  } finally {
    await browser.close();
  }
})();