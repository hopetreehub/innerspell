const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('1. 관리자 페이지 직접 접속...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    // 페이지 내용 확인
    const pageContent = await page.content();
    console.log('페이지 로드됨');
    
    // 블로그 관리 탭 찾기
    console.log('2. 블로그 관리 탭 찾기...');
    const blogTabs = await page.locator('button').all();
    for (const tab of blogTabs) {
      const text = await tab.textContent();
      if (text && text.includes('블로그')) {
        console.log(`발견: ${text}`);
        await tab.click();
        await page.waitForTimeout(1000);
        break;
      }
    }
    
    // 새 포스트 작성 버튼 찾기
    console.log('3. 새 포스트 작성 버튼 찾기...');
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && text.includes('새 포스트')) {
        console.log(`발견: ${text}`);
        await button.click();
        await page.waitForTimeout(2000);
        break;
      }
    }
    
    // 모달 내용 확인
    console.log('4. 모달 내용 확인...');
    const labels = await page.locator('label').all();
    console.log('모달 내 라벨들:');
    for (const label of labels) {
      const text = await label.textContent();
      if (text) {
        console.log(`- ${text}`);
      }
    }
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'blog-modal-fields.png',
      fullPage: false
    });
    console.log('\n스크린샷 저장: blog-modal-fields.png');
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'blog-modal-error.png' });
  }
  
  await page.waitForTimeout(5000);
  await browser.close();
})();