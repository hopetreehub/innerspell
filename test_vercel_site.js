const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  console.log('=== Vercel 배포 사이트 테스트 ===\n');
  
  const deploymentUrl = 'https://test-studio-firebase-92s28pm4q-johns-projects-bf5e60f3.vercel.app';
  
  try {
    console.log('1. 배포된 사이트 접속 중...');
    console.log(`URL: ${deploymentUrl}`);
    
    const response = await page.goto(deploymentUrl, { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    console.log(`응답 상태: ${response.status()}`);
    
    // 401 에러 처리
    if (response.status() === 401) {
      console.log('\n❌ 401 Unauthorized 에러 발생');
      console.log('이는 Vercel 프로젝트가 비공개로 설정되어 있거나 인증이 필요함을 의미합니다.');
      
      // 페이지 내용 확인
      const pageContent = await page.content();
      if (pageContent.includes('Vercel')) {
        console.log('Vercel 인증 페이지가 표시되고 있습니다.');
      }
      
      await page.screenshot({ path: 'screenshots/vercel_401_error.png' });
      console.log('스크린샷 저장: screenshots/vercel_401_error.png');
    } else {
      console.log('✅ 사이트가 정상적으로 로드되었습니다.');
      
      // 페이지 타이틀 확인
      const title = await page.title();
      console.log(`페이지 타이틀: ${title}`);
      
      await page.screenshot({ path: 'screenshots/vercel_deployed_site.png', fullPage: true });
      console.log('스크린샷 저장: screenshots/vercel_deployed_site.png');
    }
    
    // API 헬스 체크도 시도
    console.log('\n2. API 헬스 체크 시도...');
    const apiResponse = await page.evaluate(async (url) => {
      try {
        const res = await fetch(`${url}/api/health`);
        return {
          status: res.status,
          ok: res.ok,
          data: res.ok ? await res.json() : null
        };
      } catch (e) {
        return { error: e.message };
      }
    }, deploymentUrl);
    
    console.log('API 응답:', JSON.stringify(apiResponse, null, 2));
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'screenshots/vercel_error.png' });
    console.log('에러 스크린샷 저장: screenshots/vercel_error.png');
  } finally {
    console.log('\n테스트 완료');
    await browser.close();
  }
})();