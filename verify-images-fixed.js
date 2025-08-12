const { chromium } = require('playwright');

(async () => {
  console.log('=== PM: 이미지 수정 검증 시작 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false 
  });
  const page = await browser.newPage();
  
  const prodUrl = 'https://test-studio-firebase.vercel.app';
  let imageSuccessCount = 0;
  let imageFailCount = 0;
  
  // 이미지 로딩 모니터링
  page.on('response', async response => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';
    
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)/i) || 
        contentType.includes('image')) {
      
      const status = response.status();
      if (status >= 400) {
        imageFailCount++;
        console.log(`❌ 이미지 실패 [${status}]: ${url}`);
      } else {
        imageSuccessCount++;
        console.log(`✅ 이미지 성공 [${status}]: ${url.substring(url.lastIndexOf('/') + 1)}`);
      }
    }
  });
  
  try {
    // 1. 홈페이지 이미지 확인
    console.log('\n1. 홈페이지 이미지 검사...');
    await page.goto(prodUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const homepageImages = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt || 'no-alt',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      }))
    );
    
    console.log(`\n홈페이지 이미지 수: ${homepageImages.length}`);
    homepageImages.forEach((img, idx) => {
      const status = img.naturalWidth > 0 ? '✅' : '❌';
      console.log(`  ${status} [${idx + 1}] ${img.alt}`);
      console.log(`      크기: ${img.naturalWidth}x${img.naturalHeight}`);
    });
    
    await page.screenshot({ path: 'fixed-homepage.png', fullPage: true });
    
    // 2. 블로그 페이지 이미지 확인
    console.log('\n2. 블로그 페이지 이미지 검사...');
    await page.goto(`${prodUrl}/blog`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const blogImages = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt || 'no-alt',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      }))
    );
    
    console.log(`\n블로그 이미지 수: ${blogImages.length}`);
    let blogSuccessCount = 0;
    blogImages.forEach((img, idx) => {
      const status = img.naturalWidth > 0 ? '✅' : '❌';
      if (img.naturalWidth > 0) blogSuccessCount++;
      console.log(`  ${status} [${idx + 1}] ${img.alt}`);
    });
    
    await page.screenshot({ path: 'fixed-blog.png', fullPage: true });
    
    console.log('\n\n=== 🎉 PM 최종 보고 ===');
    console.log(`✅ 성공한 이미지: ${imageSuccessCount}개`);
    console.log(`❌ 실패한 이미지: ${imageFailCount}개`);
    console.log(`\n홈페이지 이미지 로딩률: ${homepageImages.filter(img => img.naturalWidth > 0).length}/${homepageImages.length}`);
    console.log(`블로그 이미지 로딩률: ${blogSuccessCount}/${blogImages.length}`);
    
    if (imageFailCount === 0) {
      console.log('\n🎉 모든 이미지가 정상적으로 로드되었습니다!');
    } else {
      console.log('\n⚠️ 일부 이미지가 여전히 로드되지 않습니다.');
    }
    
  } catch (error) {
    console.error('\n❌ 검증 중 오류:', error.message);
  }
  
  console.log('\n브라우저를 10초 후 닫습니다...');
  await page.waitForTimeout(10000);
  await browser.close();
})();