const { chromium } = require('playwright');

(async () => {
  console.log('📱 모바일 및 다양한 화면 크기에서 사이드바 테스트...\n');
  
  const browser = await chromium.launch({ headless: false });
  
  // 테스트할 뷰포트 크기들
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];
  
  for (const viewport of viewports) {
    console.log(`\n🖥️ ${viewport.name} (${viewport.width}x${viewport.height}) 테스트:`);
    
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    
    try {
      await page.goto('https://test-studio-firebase.vercel.app/blog', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      await page.waitForTimeout(2000);
      
      // 사이드바 찾기 (데스크톱) 또는 전체 컨테이너 (모바일)
      const sidebarSelector = viewport.width >= 1024 ? '.lg\\:col-span-1' : '.container';
      const sidebar = await page.$(sidebarSelector);
      
      if (sidebar) {
        // 인기 포스트 찾기
        const popularCard = await page.$('h3:has-text("인기 포스트")');
        const featuredCard = await page.$('h3:has-text("주요 포스트")');
        
        if (popularCard && featuredCard) {
          // 두 카드의 Y 좌표 비교
          const popularBox = await popularCard.boundingBox();
          const featuredBox = await featuredCard.boundingBox();
          
          console.log(`  인기 포스트 Y: ${popularBox?.y || 'N/A'}`);
          console.log(`  주요 포스트 Y: ${featuredBox?.y || 'N/A'}`);
          
          if (popularBox && featuredBox) {
            if (popularBox.y < featuredBox.y) {
              console.log('  ✅ 인기 포스트가 위에 있습니다.');
            } else {
              console.log('  ❌ 주요 포스트가 위에 있습니다!');
            }
          }
        } else {
          console.log('  ⚠️ 카드를 찾을 수 없습니다.');
        }
        
        // 스크린샷
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await page.screenshot({ 
          path: `sidebar-${viewport.name.toLowerCase()}-${timestamp}.png`,
          fullPage: false 
        });
      }
      
    } catch (error) {
      console.error(`  ❌ 오류: ${error.message}`);
    } finally {
      await context.close();
    }
  }
  
  await browser.close();
})();