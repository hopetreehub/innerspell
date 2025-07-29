const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function comprehensiveSiteTest() {
  console.log('🚀 시작: Vercel 사이트 종합 테스트');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
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
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // 페이지 로딩 확인
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

    // 2. 타로 읽기 페이지 접속 및 작동 상태
    console.log('🔮 테스트 2: 타로 읽기 페이지');
    
    // 타로 읽기 링크 찾기
    const tarotLink = await page.locator('a[href*="tarot"], a[href*="reading"]').first();
    if (await tarotLink.count() > 0) {
      await tarotLink.click();
      await page.waitForTimeout(3000);
    } else {
      // 직접 URL로 이동
      await page.goto(`${baseUrl}/tarot`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }
    
    // 타로 페이지에서 질문 입력 시도
    const questionInput = await page.locator('input[placeholder*="질문"], textarea[placeholder*="질문"], input[type="text"]').first();
    if (await questionInput.count() > 0) {
      await questionInput.fill('오늘의 운세는 어떨까요?');
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

    // 3. 블로그 페이지 접속 및 포스트 목록 표시
    console.log('📝 테스트 3: 블로그 페이지');
    
    await page.goto(`${baseUrl}/blog`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 블로그 포스트 확인
    const blogPosts = await page.locator('article, .blog-post, [class*="post"]');
    const postCount = await blogPosts.count();
    console.log(`블로그 포스트 개수: ${postCount}`);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, 'latest-03-blog.png'), 
      fullPage: true 
    });
    
    testResults.tests.push({
      name: 'Blog Page',
      status: 'success',
      postCount: postCount,
      screenshot: 'latest-03-blog.png'
    });

    // 4. 관리자 페이지 접속 (로그인 필요시 로그인 과정 포함)
    console.log('👨‍💼 테스트 4: 관리자 페이지');
    
    await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 로그인이 필요한지 확인
    const isLoginPage = await page.locator('input[type="email"], input[type="password"], button[class*="google"]').count() > 0;
    
    if (isLoginPage) {
      console.log('로그인 페이지 감지됨');
      
      // Google 로그인 버튼 찾기
      const googleButton = await page.locator('button[class*="google"], button:has-text("Google"), [class*="google-btn"]').first();
      if (await googleButton.count() > 0) {
        console.log('Google 로그인 버튼 발견');
        // 클릭하지는 않고 버튼 존재만 확인
      }
    }
    
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

    // 5. 모바일 반응형 테스트
    console.log('📱 테스트 5: 모바일 반응형');
    
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X 크기
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 모바일 메뉴 확인
    const mobileMenuButton = await page.locator('button[class*="menu"], button[aria-label*="menu"], .hamburger').first();
    if (await mobileMenuButton.count() > 0) {
      await mobileMenuButton.click();
      await page.waitForTimeout(1000);
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

    // 결과 리포트 저장
    await fs.writeFile(
      path.join(screenshotDir, 'comprehensive-test-report.json'),
      JSON.stringify(testResults, null, 2)
    );

    console.log('✅ 모든 테스트 완료!');
    console.log('📊 테스트 결과:', testResults);
    
    return testResults;
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
    
    // 에러 스크린샷
    await page.screenshot({ 
      path: path.join('/mnt/e/project/test-studio-firebase/screenshots', 'error-latest.png'), 
      fullPage: true 
    });
    
    throw error;
  } finally {
    await browser.close();
  }
}

// 실행
comprehensiveSiteTest().catch(console.error);