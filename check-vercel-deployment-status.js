const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Vercel 배포 상태 확인 시작...');
  
  const browser = await chromium.launch({ 
    headless: false, 
    viewport: { width: 1280, height: 720 } 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📍 Vercel 배포 URL 접속 시도: https://innerspell.vercel.app');
    
    // Vercel 배포 사이트 접속
    const response = await page.goto('https://innerspell.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 응답 상태 확인
    const status = response ? response.status() : 'No response';
    console.log(`📊 응답 상태: ${status}`);
    
    // 페이지 타이틀 확인
    const title = await page.title();
    console.log(`📄 페이지 타이틀: ${title}`);
    
    // 스크린샷 캡처
    await page.screenshot({ 
      path: 'vercel-deployment-check-2025-07-28.png',
      fullPage: true 
    });
    console.log('📸 스크린샷 저장: vercel-deployment-check-2025-07-28.png');
    
    // 페이지 내용 확인
    const pageContent = await page.evaluate(() => {
      return {
        hasContent: document.body && document.body.innerText.length > 0,
        contentLength: document.body ? document.body.innerText.length : 0,
        errorMessage: document.querySelector('h1')?.innerText || '',
        description: document.querySelector('p')?.innerText || ''
      };
    });
    
    console.log('📋 페이지 컨텐츠 분석:', pageContent);
    
    // 404 또는 에러 페이지 확인
    if (status === 404 || pageContent.errorMessage.includes('404') || pageContent.errorMessage.includes('NOT_FOUND')) {
      console.log('❌ Vercel 배포가 존재하지 않습니다!');
      console.log('💡 해결 방법:');
      console.log('   1. Vercel Dashboard에서 프로젝트 생성');
      console.log('   2. GitHub 저장소 연결');
      console.log('   3. 환경 변수 설정');
      console.log('   4. 배포 트리거');
    } else if (status === 200) {
      console.log('✅ Vercel 배포가 활성화되어 있습니다!');
      
      // 주요 요소 확인
      const elements = await page.evaluate(() => {
        return {
          hasLogo: !!document.querySelector('img[alt*="logo"]'),
          hasNavigation: !!document.querySelector('nav'),
          hasMainContent: !!document.querySelector('main'),
          hasFooter: !!document.querySelector('footer')
        };
      });
      
      console.log('🔍 페이지 구조 분석:', elements);
    }
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    
    // 에러 스크린샷
    await page.screenshot({ 
      path: 'vercel-deployment-error-2025-07-28.png',
      fullPage: true 
    });
    console.log('📸 에러 스크린샷 저장: vercel-deployment-error-2025-07-28.png');
  } finally {
    await browser.close();
    console.log('🏁 검증 완료');
  }
})();