const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function simplifiedSiteTest() {
  console.log('🚀 시작: Vercel 사이트 간소화 테스트');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();
  
  // 페이지 타임아웃 설정
  page.setDefaultTimeout(60000);
  
  try {
    const baseUrl = 'https://test-studio-firebase.vercel.app';
    const screenshotDir = '/mnt/e/project/test-studio-firebase/screenshots';
    
    // 스크린샷 디렉토리 생성
    await fs.mkdir(screenshotDir, { recursive: true });
    
    const testResults = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // 1. 메인 페이지 로딩 상태 테스트
    console.log('📱 테스트 1: 메인 페이지 로딩');
    try {
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(5000); // 추가 로딩 대기
      
      const title = await page.title();
      console.log(`페이지 제목: ${title}`);
      
      await page.screenshot({ 
        path: path.join(screenshotDir, 'latest-01-main.png'), 
        fullPage: true 
      });
      
      testResults.tests.push({
        name: 'Main Page Loading',
        status: 'success',
        title: title,
        screenshot: 'latest-01-main.png'
      });
      
      console.log('✅ 메인 페이지 테스트 완료');
    } catch (error) {
      console.error('❌ 메인 페이지 테스트 실패:', error.message);
      testResults.tests.push({
        name: 'Main Page Loading',
        status: 'failed',
        error: error.message
      });
    }

    // 2. 타로 읽기 페이지 테스트
    console.log('🔮 테스트 2: 타로 읽기 페이지');
    try {
      await page.goto(`${baseUrl}/tarot`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(5000);
      
      // 질문 입력 시도
      const questionInputs = await page.locator('input, textarea').all();
      if (questionInputs.length > 0) {
        await questionInputs[0].fill('오늘의 운세는 어떨까요?');
        await page.waitForTimeout(1000);
      }
      
      await page.screenshot({ 
        path: path.join(screenshotDir, 'latest-02-tarot.png'), 
        fullPage: true 
      });
      
      testResults.tests.push({
        name: 'Tarot Reading Page',
        status: 'success',
        screenshot: 'latest-02-tarot.png'
      });
      
      console.log('✅ 타로 페이지 테스트 완료');
    } catch (error) {
      console.error('❌ 타로 페이지 테스트 실패:', error.message);
      testResults.tests.push({
        name: 'Tarot Reading Page',
        status: 'failed',
        error: error.message
      });
    }

    // 3. 블로그 페이지 테스트
    console.log('📝 테스트 3: 블로그 페이지');
    try {
      await page.goto(`${baseUrl}/blog`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(5000);
      
      const blogPosts = await page.locator('article, .post, [class*="post"]').count();
      console.log(`블로그 포스트 개수: ${blogPosts}`);
      
      await page.screenshot({ 
        path: path.join(screenshotDir, 'latest-03-blog.png'), 
        fullPage: true 
      });
      
      testResults.tests.push({
        name: 'Blog Page',  
        status: 'success',
        postCount: blogPosts,
        screenshot: 'latest-03-blog.png'
      });
      
      console.log('✅ 블로그 페이지 테스트 완료');
    } catch (error) {
      console.error('❌ 블로그 페이지 테스트 실패:', error.message);
      testResults.tests.push({
        name: 'Blog Page',
        status: 'failed',
        error: error.message
      });
    }

    // 4. 관리자 페이지 테스트
    console.log('👨‍💼 테스트 4: 관리자 페이지');
    try {
      await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(5000);
      
      // 로그인 요소 확인
      const loginElements = await page.locator('input[type="email"], input[type="password"], button').count();
      const isLoginPage = loginElements > 0;
      
      await page.screenshot({ 
        path: path.join(screenshotDir, 'latest-04-admin.png'), 
        fullPage: true 
      });
      
      testResults.tests.push({
        name: 'Admin Page',
        status: 'success',
        requiresLogin: isLoginPage,
        screenshot: 'latest-04-admin.png'
      });
      
      console.log('✅ 관리자 페이지 테스트 완료');
    } catch (error) {
      console.error('❌ 관리자 페이지 테스트 실패:', error.message);
      testResults.tests.push({
        name: 'Admin Page',
        status: 'failed',
        error: error.message
      });
    }

    // 5. 모바일 반응형 테스트
    console.log('📱 테스트 5: 모바일 반응형');
    try {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(5000);
      
      // 모바일 메뉴 버튼 확인
      const menuButtons = await page.locator('button').all();
      if (menuButtons.length > 0) {
        // 첫 번째 버튼 클릭 시도 (메뉴 버튼일 가능성)
        try {
          await menuButtons[0].click();
          await page.waitForTimeout(1000);
        } catch (e) {
          console.log('메뉴 버튼 클릭 실패, 계속 진행');
        }
      }
      
      await page.screenshot({ 
        path: path.join(screenshotDir, 'latest-05-mobile.png'), 
        fullPage: true 
      });
      
      testResults.tests.push({
        name: 'Mobile Responsive',  
        status: 'success',
        viewport: '375x812',
        screenshot: 'latest-05-mobile.png'
      });
      
      console.log('✅ 모바일 반응형 테스트 완료');
    } catch (error) {
      console.error('❌ 모바일 반응형 테스트 실패:', error.message);
      testResults.tests.push({
        name: 'Mobile Responsive',
        status: 'failed',
        error: error.message
      });
    }

    // 결과 리포트 저장
    await fs.writeFile(
      path.join(screenshotDir, 'comprehensive-test-report.json'),
      JSON.stringify(testResults, null, 2)
    );

    console.log('✅ 모든 테스트 완료!');
    console.log('📊 테스트 결과 요약:');
    testResults.tests.forEach(test => {
      console.log(`  - ${test.name}: ${test.status}`);
    });
    
    return testResults;
    
  } catch (error) {
    console.error('❌ 전체 테스트 실행 중 오류:', error);
    
    // 에러 스크린샷
    try {
      await page.screenshot({ 
        path: path.join('/mnt/e/project/test-studio-firebase/screenshots', 'error-latest.png'), 
        fullPage: true 
      });
    } catch (screenshotError) {
      console.error('에러 스크린샷 촬영 실패:', screenshotError);
    }
    
    throw error;
  } finally {
    await browser.close();
  }
}

// 실행
simplifiedSiteTest().catch(console.error);