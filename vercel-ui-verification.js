const { chromium } = require('playwright');

async function verifyVercelUI() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    console.log('🚀 Vercel 사이트 접근 중: https://innerspell.vercel.app');
    
    // 페이지 로드
    await page.goto('https://innerspell.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('📄 페이지 제목:', await page.title());
    console.log('🌐 현재 URL:', page.url());
    
    // 스크린샷 촬영
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `vercel-ui-verification-${timestamp}.png`;
    
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    console.log('📸 스크린샷 저장:', screenshotPath);
    
    // UI 요소 확인
    const mainElements = await page.evaluate(() => {
      return {
        hasHeader: document.querySelector('header') !== null,
        hasNav: document.querySelector('nav') !== null,
        hasMain: document.querySelector('main') !== null,
        hasFooter: document.querySelector('footer') !== null,
        bodyText: document.body.innerText.substring(0, 500)
      };
    });
    
    console.log('🔍 UI 요소 분석:', mainElements);
    
    // 에러 체크
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 잠시 대기하여 추가 로딩 확인
    await page.waitForTimeout(3000);
    
    if (consoleErrors.length > 0) {
      console.log('⚠️ 콘솔 에러:', consoleErrors);
    }
    
    console.log('✅ Vercel UI 검증 완료');
    return {
      success: true,
      url: page.url(),
      title: await page.title(),
      screenshot: screenshotPath,
      elements: mainElements,
      errors: consoleErrors
    };
    
  } catch (error) {
    console.error('❌ Vercel UI 검증 실패:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// 실행
verifyVercelUI()
  .then(result => {
    console.log('\n🎯 최종 결과:', JSON.stringify(result, null, 2));
  })
  .catch(console.error);