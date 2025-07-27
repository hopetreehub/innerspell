const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testAdminPanel() {
  // 스크린샷 저장 디렉토리 생성
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000 // 각 액션 사이에 2초 대기
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  try {
    console.log('1. 메인 사이트 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotDir, '01-main-page.png') });
    console.log('✓ 메인 페이지 스크린샷 저장됨');

    console.log('2. /admin 경로로 이동 중...');
    await page.goto('https://test-studio-firebase.vercel.app/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotDir, '02-admin-page-initial.png') });
    console.log('✓ 관리자 페이지 초기 화면 스크린샷 저장됨');

    // 페이지 제목 확인
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);

    // 현재 URL 확인
    console.log(`현재 URL: ${page.url()}`);

    // 간단한 텍스트 내용 확인
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('페이지 텍스트 (처음 1000자):');
    console.log(bodyText.substring(0, 1000));

    // Google 로그인 버튼 찾기 및 클릭
    console.log('3. Google 로그인 버튼 찾는 중...');
    const googleLoginButton = await page.locator('text=Google로 로그인').first();
    const isVisible = await googleLoginButton.isVisible();
    
    if (isVisible) {
      console.log('Google 로그인 버튼 발견! 클릭 시도...');
      await googleLoginButton.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: path.join(screenshotDir, '03-after-google-login-click.png') });
      console.log('✓ Google 로그인 클릭 후 스크린샷 저장됨');
    } else {
      console.log('Google 로그인 버튼을 찾을 수 없음');
    }

    // 로그인 후 또는 로그인 없이 페이지 확인
    await page.waitForTimeout(3000);
    
    // 타로 관련 요소 찾기
    console.log('4. 타로 지침 관리 관련 요소 찾는 중...');
    const tarotElements = await page.locator('text=타로').all();
    console.log(`타로 관련 요소 개수: ${tarotElements.length}`);

    for (let i = 0; i < tarotElements.length; i++) {
      const text = await tarotElements[i].textContent();
      console.log(`타로 요소 ${i+1}: ${text}`);
    }

    // 지침 관련 요소 찾기
    const guideElements = await page.locator('text=지침').all();
    console.log(`지침 관련 요소 개수: ${guideElements.length}`);

    // 완성도 또는 퍼센트 관련 요소 찾기
    const percentElements = await page.locator('text=%').all();
    console.log(`퍼센트(%) 관련 요소 개수: ${percentElements.length}`);

    for (let i = 0; i < percentElements.length; i++) {
      const text = await percentElements[i].textContent();
      console.log(`퍼센트 요소 ${i+1}: ${text}`);
    }

    // 최종 스크린샷
    await page.screenshot({ path: path.join(screenshotDir, '04-final-state.png') });
    console.log('✓ 최종 상태 스크린샷 저장됨');

    console.log(`최종 URL: ${page.url()}`);

  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: path.join(screenshotDir, 'error-screenshot.png') });
  } finally {
    await browser.close();
  }
}

testAdminPanel().catch(console.error);