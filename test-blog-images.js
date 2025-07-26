const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🖼️ 블로그 이미지 문제 확인 중...');
  
  try {
    // 네트워크 요청 모니터링
    const failedImages = [];
    const successImages = [];
    
    page.on('response', response => {
      if (response.url().includes('.png') || response.url().includes('.jpg') || response.url().includes('.svg') || response.url().includes('.webp')) {
        if (response.status() >= 400) {
          failedImages.push({
            url: response.url(),
            status: response.status()
          });
        } else {
          successImages.push({
            url: response.url(),
            status: response.status()
          });
        }
      }
    });
    
    // 블로그 페이지 접속
    await page.goto('https://test-studio-firebase.vercel.app/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 이미지 요소들 찾기
    const images = await page.$$('img');
    console.log(`\n📸 페이지에서 발견된 이미지 요소: ${images.length}개`);
    
    // 각 이미지의 src와 로딩 상태 확인
    console.log('\n🔍 이미지 상태 검사:');
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      const naturalHeight = await img.evaluate(el => el.naturalHeight);
      
      const isLoaded = naturalWidth > 0 && naturalHeight > 0;
      console.log(`${i + 1}. ${isLoaded ? '✅' : '❌'} ${src} (${alt}) - ${naturalWidth}x${naturalHeight}`);
    }
    
    // 실패한 이미지 요청 확인
    console.log('\n🚫 실패한 이미지 요청:');
    failedImages.forEach(img => {
      console.log(`❌ ${img.status} - ${img.url}`);
    });
    
    console.log('\n✅ 성공한 이미지 요청:');
    successImages.forEach(img => {
      console.log(`✅ ${img.status} - ${img.url}`);
    });
    
    // 스크린샷 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `blog-images-check-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log(`\n📸 스크린샷 저장: blog-images-check-${timestamp}.png`);
    console.log(`\n📊 결과:`);
    console.log(`- 전체 이미지: ${images.length}개`);
    console.log(`- 실패한 이미지: ${failedImages.length}개`);
    console.log(`- 성공한 이미지: ${successImages.length}개`);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
})();