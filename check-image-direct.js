const { chromium } = require('playwright');

(async () => {
  console.log('=== 이미지 직접 접근 테스트 ===\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 15번 카드 이미지 직접 접근
    const imageUrl = 'http://localhost:4000/images/tarot/15-TheDevil.jpg';
    console.log('접근 URL:', imageUrl);
    
    const response = await page.goto(imageUrl);
    console.log('응답 상태:', response?.status());
    console.log('Content-Type:', response?.headers()['content-type']);
    
    await page.screenshot({ path: 'direct-image-test.png' });
    
  } catch (error) {
    console.error('오류:', error.message);
  }
  
  console.log('\n브라우저를 5초 후 닫습니다...');
  await page.waitForTimeout(5000);
  await browser.close();
})();