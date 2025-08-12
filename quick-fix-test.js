const { chromium } = require('playwright');

(async () => {
  console.log('=== 🚀 빠른 수정 테스트 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false 
  });
  const page = await browser.newPage();
  
  try {
    // 1. 리다이렉트 테스트
    console.log('1️⃣ URL 리다이렉트 테스트');
    
    // /tarot-reading → /reading
    console.log('- /tarot-reading 접근...');
    await page.goto('http://localhost:4000/tarot-reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    await page.waitForTimeout(2000);
    const currentUrl1 = page.url();
    console.log(`  최종 URL: ${currentUrl1}`);
    console.log(`  리다이렉트: ${currentUrl1.includes('/reading') ? '✅ 성공' : '❌ 실패'}`);
    
    // /dream → /dream-interpretation
    console.log('\n- /dream 접근...');
    await page.goto('http://localhost:4000/dream', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    await page.waitForTimeout(2000);
    const currentUrl2 = page.url();
    console.log(`  최종 URL: ${currentUrl2}`);
    console.log(`  리다이렉트: ${currentUrl2.includes('/dream-interpretation') ? '✅ 성공' : '❌ 실패'}`);
    
    // /login → /sign-in
    console.log('\n- /login 접근...');
    await page.goto('http://localhost:4000/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    await page.waitForTimeout(2000);
    const currentUrl3 = page.url();
    console.log(`  최종 URL: ${currentUrl3}`);
    console.log(`  리다이렉트: ${currentUrl3.includes('/sign-in') ? '✅ 성공' : '❌ 실패'}`);
    
    await page.screenshot({ path: 'quick-fix-result.png' });
    
  } catch (error) {
    console.error('테스트 오류:', error.message);
  }
  
  await browser.close();
})();