const { chromium } = require('playwright');

async function verifyNewDeployment() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    console.log('🚀 새 Vercel 배포 확인: https://innerspell.vercel.app');
    
    // 페이지 로드 시도
    await page.goto('https://innerspell.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const title = await page.title();
    const currentUrl = page.url();
    
    console.log('📄 페이지 제목:', title);
    console.log('🌐 현재 URL:', currentUrl);
    
    // 로그인 페이지가 아닌 경우 (성공적인 배포)
    if (!currentUrl.includes('vercel.com/login')) {
      console.log('✅ 성공! InnerSpell 사이트 직접 접근 가능');
      
      // 스크린샷 촬영
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = `new-deployment-success-${timestamp}.png`;
      
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      console.log('📸 성공 스크린샷:', screenshotPath);
      
      // 페이지 내용 분석
      const pageAnalysis = await page.evaluate(() => {
        const content = document.body.innerText.substring(0, 500);
        return {
          hasInnerSpellContent: content.includes('InnerSpell') || 
                               content.includes('타로') || 
                               content.includes('Tarot') ||
                               content.includes('AI') ||
                               content.includes('해석'),
          hasHeader: document.querySelector('header') !== null,
          hasNav: document.querySelector('nav') !== null,
          hasMain: document.querySelector('main') !== null,
          title: document.title,
          contentPreview: content
        };
      });
      
      console.log('🔍 페이지 분석:', pageAnalysis);
      
      return {
        success: true,
        deploymentWorking: true,
        url: currentUrl,
        title: title,
        screenshot: screenshotPath,
        analysis: pageAnalysis
      };
      
    } else {
      console.log('⚠️ 여전히 로그인 페이지로 리다이렉트됨');
      
      // 스크린샷 촬영
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = `new-deployment-still-redirected-${timestamp}.png`;
      
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      console.log('📸 리다이렉트 스크린샷:', screenshotPath);
      
      return {
        success: false,
        deploymentWorking: false,
        issue: 'Still redirected to login page',
        url: currentUrl,
        screenshot: screenshotPath
      };
    }
    
  } catch (error) {
    console.error('❌ 새 배포 확인 실패:', error.message);
    return {
      success: false,
      deploymentWorking: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// 실행
verifyNewDeployment()
  .then(result => {
    console.log('\n🎯 새 배포 확인 결과:', JSON.stringify(result, null, 2));
  })
  .catch(console.error);