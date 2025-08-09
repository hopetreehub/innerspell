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
    console.log('1. 로컬 서버 접속 중...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle', timeout: 30000 });
    
    // 로그인이 필요한 경우
    const loginButton = await page.locator('text="로그인"').first();
    if (await loginButton.isVisible()) {
      console.log('2. 로그인 중...');
      await loginButton.click();
      await page.waitForTimeout(2000);
      
      // Google 로그인 선택
      const googleButton = await page.locator('button:has-text("Google")').first();
      if (await googleButton.isVisible()) {
        await googleButton.click();
        await page.waitForTimeout(2000);
        
        // 새 창이 열릴 수 있으므로 대기
        const pages = context.pages();
        if (pages.length > 1) {
          // Google 로그인 창 처리
          const googlePage = pages[pages.length - 1];
          await googlePage.close();
        }
      }
    }
    
    console.log('3. 관리자 페이지로 이동 중...');
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 블로그 관리 탭 클릭
    console.log('4. 블로그 관리 탭 클릭...');
    const blogTab = await page.locator('button:has-text("블로그 관리")').first();
    if (await blogTab.isVisible()) {
      await blogTab.click();
      await page.waitForTimeout(1000);
    }
    
    // 새 포스트 작성 버튼 클릭
    console.log('5. 새 포스트 작성 버튼 클릭...');
    const newPostButton = await page.locator('button:has-text("새 포스트 작성")').first();
    if (await newPostButton.isVisible()) {
      await newPostButton.click();
      await page.waitForTimeout(1000);
      
      // 하드 리프레시
      console.log('6. 하드 리프레시 수행...');
      await page.keyboard.press('Control+Shift+R');
      await page.waitForTimeout(3000);
      
      // 다시 블로그 관리 탭과 새 포스트 작성 버튼 클릭
      const blogTabAfterRefresh = await page.locator('button:has-text("블로그 관리")').first();
      if (await blogTabAfterRefresh.isVisible()) {
        await blogTabAfterRefresh.click();
        await page.waitForTimeout(1000);
      }
      
      const newPostButtonAfterRefresh = await page.locator('button:has-text("새 포스트 작성")').first();
      if (await newPostButtonAfterRefresh.isVisible()) {
        await newPostButtonAfterRefresh.click();
        await page.waitForTimeout(1000);
      }
      
      // 모달 확인
      console.log('7. 모달 확인 중...');
      const modal = await page.locator('.fixed.inset-0').first();
      if (await modal.isVisible()) {
        // 포스트 이미지 필드 확인
        const imageField = await page.locator('label:has-text("포스트 이미지")');
        const imageFieldVisible = await imageField.isVisible();
        
        console.log(`포스트 이미지 필드 존재 여부: ${imageFieldVisible ? '있음' : '없음'}`);
        
        // 스크린샷 촬영
        await page.screenshot({ 
          path: 'blog-image-field-check.png',
          fullPage: false
        });
        console.log('스크린샷 저장: blog-image-field-check.png');
      }
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'blog-image-field-error.png' });
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
})();