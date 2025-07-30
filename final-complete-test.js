const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    console.log('\\n=== Vercel 배포 최종 확인 ===\\n');
    
    // 1. 페이지 로드 (더 긴 대기)
    console.log('1. 페이지 로드 중...');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // 컨텐츠가 완전히 로드될 때까지 대기
    console.log('   - DOM 로드 완료, 추가 대기 중...');
    await page.waitForTimeout(10000); // 10초 대기
    
    // 특정 요소 대기
    try {
      await page.waitForSelector('header', { timeout: 5000 });
      console.log('   - 헤더 로드 확인');
    } catch (e) {
      console.log('   - 헤더 로드 실패');
    }
    
    // 2. 전체 페이지 스크린샷
    await page.screenshot({ path: 'vercel-final-full.png', fullPage: true });
    console.log('\\n2. 전체 페이지 스크린샷 저장: vercel-final-full.png');
    
    // 3. 페이지 정보 수집
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        hasHeader: !!document.querySelector('header'),
        hasNav: !!document.querySelector('nav'),
        hasMain: !!document.querySelector('main'),
        hasFooter: !!document.querySelector('footer'),
        bodyClasses: document.body.className,
        totalElements: document.querySelectorAll('*').length,
        images: document.querySelectorAll('img').length,
        buttons: document.querySelectorAll('button').length,
        links: document.querySelectorAll('a').length,
        forms: document.querySelectorAll('form').length
      };
    });
    
    console.log('\\n3. 페이지 분석 결과:');
    console.log('   - 제목:', pageInfo.title);
    console.log('   - URL:', pageInfo.url);
    console.log('   - 헤더:', pageInfo.hasHeader ? '있음' : '없음');
    console.log('   - 네비게이션:', pageInfo.hasNav ? '있음' : '없음');
    console.log('   - 메인 영역:', pageInfo.hasMain ? '있음' : '없음');
    console.log('   - 푸터:', pageInfo.hasFooter ? '있음' : '없음');
    console.log('   - 전체 요소 수:', pageInfo.totalElements);
    console.log('   - 이미지:', pageInfo.images, '개');
    console.log('   - 버튼:', pageInfo.buttons, '개');
    console.log('   - 링크:', pageInfo.links, '개');
    console.log('   - 폼:', pageInfo.forms, '개');
    
    // 4. 주요 기능 페이지 빠른 확인
    console.log('\\n4. 주요 페이지 접근성 확인:');
    
    const pages = [
      { name: '타로 리딩', url: '/reading' },
      { name: '로그인', url: '/sign-in' },
      { name: '블로그', url: '/blog' },
      { name: '꿈해몽', url: '/dream-interpretation' }
    ];
    
    for (const pageItem of pages) {
      try {
        const response = await page.goto(`https://test-studio-firebase.vercel.app${pageItem.url}`, {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        });
        console.log(`   - ${pageItem.name}: ${response.status()} (${response.ok() ? '정상' : '오류'})`);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `vercel-${pageItem.name.replace(/\\s+/g, '-')}.png` });
      } catch (e) {
        console.log(`   - ${pageItem.name}: 접근 실패`);
      }
    }
    
    // 5. API 상태 확인
    console.log('\\n5. API 엔드포인트 상태:');
    const apiEndpoints = [
      '/api/health',
      '/api/debug/ai-providers',
      '/api/blog/posts'
    ];
    
    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(`https://test-studio-firebase.vercel.app${endpoint}`);
        console.log(`   - ${endpoint}: ${response.status} ${response.statusText}`);
        if (endpoint === '/api/health' && response.ok) {
          const data = await response.json();
          console.log('     서비스 상태:', JSON.stringify(data.services));
        }
      } catch (e) {
        console.log(`   - ${endpoint}: 요청 실패`);
      }
    }
    
    console.log('\\n=== 테스트 완료 ===\\n');
    
  } catch (error) {
    console.error('\\n오류 발생:', error.message);
  } finally {
    await browser.close();
  }
})();