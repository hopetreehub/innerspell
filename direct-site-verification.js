const { chromium } = require('playwright');

async function verifyDirectSite() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // 여러 가능한 URL 시도
    const urls = [
      'https://innerspell.vercel.app',
      'https://test-studio-firebase.vercel.app',
      'https://test-studio-firebase-git-main.vercel.app'
    ];
    
    for (const url of urls) {
      console.log(`\n🚀 시도 중: ${url}`);
      
      try {
        await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 15000 
        });
        
        const title = await page.title();
        const currentUrl = page.url();
        
        console.log('📄 페이지 제목:', title);
        console.log('🌐 현재 URL:', currentUrl);
        
        // 로그인 페이지가 아닌 경우에만 계속
        if (!currentUrl.includes('vercel.com/login')) {
          // 스크린샷 촬영
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const screenshotPath = `direct-site-${timestamp}.png`;
          
          await page.screenshot({ 
            path: screenshotPath,
            fullPage: true 
          });
          
          console.log('📸 스크린샷 저장:', screenshotPath);
          
          // UI 요소 확인
          const pageContent = await page.evaluate(() => {
            return {
              hasHeader: document.querySelector('header') !== null,
              hasNav: document.querySelector('nav') !== null,
              hasMain: document.querySelector('main') !== null,
              title: document.title,
              bodyText: document.body.innerText.substring(0, 300),
              hasInnerSpellElements: document.body.innerText.includes('InnerSpell') || 
                                   document.body.innerText.includes('타로') ||
                                   document.body.innerText.includes('Tarot')
            };
          });
          
          console.log('🔍 페이지 분석:', pageContent);
          
          if (pageContent.hasInnerSpellElements) {
            console.log('✅ InnerSpell 사이트 발견!');
            return {
              success: true,
              url: currentUrl,
              workingUrl: url,
              title: title,
              screenshot: screenshotPath,
              content: pageContent
            };
          }
        }
        
      } catch (error) {
        console.log(`❌ ${url} 접근 실패:`, error.message);
      }
    }
    
    console.log('⚠️ 모든 URL 시도 완료, 작동하는 사이트를 찾지 못함');
    return { success: false, message: 'No working site found' };
    
  } catch (error) {
    console.error('❌ 검증 실패:', error.message);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// 실행
verifyDirectSite()
  .then(result => {
    console.log('\n🎯 최종 결과:', JSON.stringify(result, null, 2));
  })
  .catch(console.error);