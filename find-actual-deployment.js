const { chromium } = require('playwright');

async function findActualDeployment() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // 프로젝트 이름 기반 가능한 URL들
    const possibleUrls = [
      'https://test-studio-firebase.vercel.app',
      'https://test-studio-firebase-git-main.vercel.app',  
      'https://test-studio-firebase-junsu.vercel.app',
      'https://innerspell.vercel.app',
      'https://innerspell-git-main.vercel.app',
      'https://innerspell-junsu.vercel.app',
      // 다른 일반적인 패턴들
      'https://innerspell-an7ce.vercel.app',
      'https://innerspell-firebase.vercel.app'
    ];
    
    console.log('🔍 가능한 배포 URL들을 체계적으로 확인 중...\n');
    
    const results = [];
    
    for (const url of possibleUrls) {
      console.log(`\n🚀 확인 중: ${url}`);
      
      try {
        await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 15000 
        });
        
        const title = await page.title();
        const currentUrl = page.url();
        
        console.log('📄 제목:', title);
        console.log('🌐 실제 URL:', currentUrl);
        
        // 성공 조건 확인
        const isSuccess = !currentUrl.includes('vercel.com/login') && 
                         !currentUrl.includes('404') &&
                         !title.includes('404') &&
                         !title.includes('NOT_FOUND');
        
        if (isSuccess) {
          console.log('✅ 성공! 실제 사이트 발견');
          
          // 상세 분석
          const analysis = await page.evaluate(() => {
            const bodyText = document.body.innerText.substring(0, 300);
            return {
              title: document.title,
              bodyPreview: bodyText,
              hasInnerSpellContent: bodyText.includes('InnerSpell') || 
                                   bodyText.includes('타로') || 
                                   bodyText.includes('Tarot') ||
                                   bodyText.includes('AI'),
              hasHeader: document.querySelector('header') !== null,
              hasMain: document.querySelector('main') !== null
            };
          });
          
          // 스크린샷 촬영
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const screenshotPath = `actual-deployment-found-${timestamp}.png`;
          
          await page.screenshot({ 
            path: screenshotPath,
            fullPage: true 
          });
          
          console.log('📸 스크린샷 저장:', screenshotPath);
          console.log('🔍 분석 결과:', analysis);
          
          results.push({
            url: url,
            actualUrl: currentUrl,
            title: title,
            success: true,
            screenshot: screenshotPath,
            analysis: analysis
          });
          
          // 첫 번째 성공한 URL에서는 더 자세한 정보 수집
          if (results.length === 1) {
            console.log('\n🎯 첫 번째 성공 사이트에서 상세 정보 수집 중...');
            
            // 주요 페이지들 확인
            const pagesToCheck = ['/', '/tarot', '/reading', '/admin', '/blog'];
            
            for (const pagePath of pagesToCheck) {
              try {
                const fullUrl = new URL(pagePath, currentUrl).href;
                console.log(`📋 페이지 확인: ${fullUrl}`);
                
                await page.goto(fullUrl, { timeout: 10000 });
                const pageTitle = await page.title();
                console.log(`   → 제목: ${pageTitle}`);
                
              } catch (pageError) {
                console.log(`   → 오류: ${pageError.message}`);
              }
            }
          }
          
        } else {
          console.log('❌ 실패 또는 리다이렉트');
          results.push({
            url: url,
            actualUrl: currentUrl,
            title: title,
            success: false,
            issue: title.includes('404') ? '404 Not Found' : 'Redirected or other issue'
          });
        }
        
      } catch (error) {
        console.log(`❌ 접근 실패: ${error.message}`);
        results.push({
          url: url,
          success: false,
          error: error.message
        });
      }
    }
    
    console.log('\n\n🎯 전체 결과 요약:');
    const successfulUrls = results.filter(r => r.success);
    
    if (successfulUrls.length > 0) {
      console.log(`✅ 성공한 URL: ${successfulUrls.length}개`);
      successfulUrls.forEach(result => {
        console.log(`   • ${result.url} → ${result.actualUrl}`);
      });
    } else {
      console.log('❌ 작동하는 배포 URL을 찾지 못함');
    }
    
    return {
      totalChecked: possibleUrls.length,
      successfulUrls: successfulUrls.length,
      results: results,
      workingDeployment: successfulUrls.length > 0 ? successfulUrls[0] : null
    };
    
  } catch (error) {
    console.error('❌ 전체 확인 실패:', error.message);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// 실행
findActualDeployment()
  .then(result => {
    console.log('\n🏁 최종 결과:', JSON.stringify(result, null, 2));
  })
  .catch(console.error);