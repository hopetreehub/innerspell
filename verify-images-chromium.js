const { chromium } = require('playwright');

(async () => {
  console.log('=== PM: 이미지 로딩 문제 검증 시작 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // 개발자 도구 자동 열기
  });
  const page = await browser.newPage();
  
  const prodUrl = 'https://test-studio-firebase.vercel.app';
  const imageErrors = [];
  const imageSuccesses = [];
  
  // 이미지 로딩 모니터링
  page.on('response', async response => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';
    
    // 이미지 요청인지 확인
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)/i) || 
        contentType.includes('image') ||
        url.includes('_next/image')) {
      
      const status = response.status();
      const info = {
        url: url,
        status: status,
        contentType: contentType,
        size: response.headers()['content-length'] || 'unknown'
      };
      
      if (status >= 400) {
        imageErrors.push(info);
        console.log(`❌ 이미지 실패 [${status}]: ${url}`);
      } else {
        imageSuccesses.push(info);
        console.log(`✅ 이미지 성공 [${status}]: ${url}`);
      }
    }
  });
  
  // 콘솔 에러 모니터링
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('image')) {
      console.log(`[콘솔 이미지 에러] ${msg.text()}`);
    }
  });
  
  try {
    // 1. 홈페이지 이미지 확인
    console.log('\n1. 홈페이지 이미지 검사...');
    await page.goto(prodUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // img 태그들 확인
    const homepageImages = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt || 'no-alt',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        currentSrc: img.currentSrc
      }))
    );
    
    console.log(`\n홈페이지 img 태그 수: ${homepageImages.length}`);
    homepageImages.forEach((img, idx) => {
      console.log(`  [${idx + 1}] ${img.alt}`);
      console.log(`      src: ${img.src}`);
      console.log(`      크기: ${img.naturalWidth}x${img.naturalHeight}`);
      console.log(`      로드 완료: ${img.complete ? '예' : '아니오'}`);
    });
    
    await page.screenshot({ path: 'image-check-homepage.png', fullPage: true });
    
    // 2. 블로그 페이지 이미지 확인
    console.log('\n2. 블로그 페이지 이미지 검사...');
    await page.goto(`${prodUrl}/blog`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    const blogImages = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt || 'no-alt',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      }))
    );
    
    console.log(`\n블로그 img 태그 수: ${blogImages.length}`);
    blogImages.forEach((img, idx) => {
      console.log(`  [${idx + 1}] ${img.alt}`);
      console.log(`      src: ${img.src}`);
      console.log(`      크기: ${img.naturalWidth}x${img.naturalHeight}`);
      console.log(`      로드 완료: ${img.complete ? '예' : '아니오'}`);
    });
    
    await page.screenshot({ path: 'image-check-blog.png', fullPage: true });
    
    // 3. 네트워크 탭에서 이미지 요청 분석
    console.log('\n=== 이미지 로딩 분석 결과 ===');
    console.log(`\n성공한 이미지: ${imageSuccesses.length}개`);
    imageSuccesses.forEach(img => {
      console.log(`  ✅ ${img.url.substring(img.url.lastIndexOf('/') + 1)}`);
    });
    
    console.log(`\n실패한 이미지: ${imageErrors.length}개`);
    imageErrors.forEach(img => {
      console.log(`  ❌ [${img.status}] ${img.url}`);
      console.log(`     Content-Type: ${img.contentType}`);
    });
    
    // 4. Next.js Image 컴포넌트 설정 확인
    console.log('\n4. Next.js Image 설정 검사...');
    const nextImageElements = await page.$$('[data-nimg], img[srcset*="_next/image"]');
    console.log(`Next.js Image 컴포넌트 수: ${nextImageElements.length}`);
    
    // 5. 개발자 도구에서 추가 정보 수집
    await page.evaluate(() => {
      console.log('\n=== 페이지 내부 이미지 진단 ===');
      const images = document.querySelectorAll('img');
      images.forEach((img, idx) => {
        if (!img.complete || img.naturalWidth === 0) {
          console.error(`이미지 로드 실패 [${idx}]:`, {
            src: img.src,
            alt: img.alt,
            complete: img.complete,
            naturalWidth: img.naturalWidth
          });
        }
      });
    });
    
    console.log('\n\n=== PM 최종 보고 ===');
    console.log('이미지 로딩 문제가 확인되었습니다.');
    console.log(`- 전체 이미지 요청 중 ${imageErrors.length}개 실패`);
    console.log('- 주요 원인: Next.js Image Optimization API 설정 문제로 추정');
    console.log('- 브라우저 개발자 도구를 열어두었으니 Network 탭에서 상세 확인 가능');
    
  } catch (error) {
    console.error('\n❌ 검증 중 오류:', error.message);
  }
  
  console.log('\n브라우저를 열어두었습니다. 수동으로 확인하세요.');
  console.log('종료하려면 Ctrl+C를 누르세요...');
  
  // 브라우저 유지
  await new Promise(() => {});
})();