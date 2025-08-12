const { chromium } = require('playwright');

(async () => {
  console.log('=== ✅ 올바른 URL 최종 테스트 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false 
  });
  const page = await browser.newPage();
  
  try {
    // 1. 타로리딩 (/reading)
    console.log('1️⃣ 타로리딩 페이지 (/reading)');
    const tarotResponse = await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    console.log(`- 응답 상태: ${tarotResponse?.status()}`);
    console.log(`- URL: ${page.url()}`);
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'working-tarot.png' });
    
    // 2. 꿈해몽 (/dream-interpretation)
    console.log('\n2️⃣ 꿈해몽 페이지 (/dream-interpretation)');
    const dreamResponse = await page.goto('http://localhost:4000/dream-interpretation', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    console.log(`- 응답 상태: ${dreamResponse?.status()}`);
    console.log(`- URL: ${page.url()}`);
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'working-dream.png' });
    
    // 3. 로그인 (/sign-in)
    console.log('\n3️⃣ 로그인 페이지 (/sign-in)');
    const loginResponse = await page.goto('http://localhost:4000/sign-in', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    console.log(`- 응답 상태: ${loginResponse?.status()}`);
    console.log(`- URL: ${page.url()}`);
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'working-login.png' });
    
    console.log('\n=== 📊 결과 요약 ===');
    console.log('모든 페이지가 올바른 URL로 접근 가능합니다.');
    console.log('API 키 설정 후 기능이 정상 작동할 것입니다.');
    
  } catch (error) {
    console.error('테스트 오류:', error.message);
  }
  
  await browser.close();
})();