const { chromium } = require('playwright');

async function simpleBackTest() {
  console.log('🎯 간단한 카드 뒷면 테스트');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  try {
    const page = await browser.newContext().then(ctx => ctx.newPage());
    
    // 이미지 요청 모니터링
    let backImageFound = false;
    page.on('request', request => {
      const url = request.url();
      if (url.includes('back.png')) {
        console.log(`✅ 뒷면 이미지 요청 확인: ${url}`);
        backImageFound = true;
      }
    });
    
    console.log('📍 로컬 4000번 포트 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // 페이지 로딩 완료까지 기다림
    await page.waitForTimeout(10000);
    
    console.log('📸 페이지 스크린샷 촬영...');
    await page.screenshot({ path: 'simple-back-test.png', fullPage: true });
    
    // DOM에서 이미지 찾기
    const images = await page.locator('img').all();
    console.log(`\n🖼️ 총 ${images.length}개 이미지 발견`);
    
    let domBackCount = 0;
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src && src.includes('back')) {
        domBackCount++;
        console.log(`🔵 DOM 뒷면 이미지: ${src}`);
      }
    }
    
    console.log('\n📊 결과:');
    console.log(`- 네트워크 뒷면 이미지 요청: ${backImageFound ? '✅ 확인됨' : '❌ 없음'}`);
    console.log(`- DOM 뒷면 이미지: ${domBackCount}개`);
    console.log('- 스크린샷: simple-back-test.png');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

simpleBackTest().catch(console.error);