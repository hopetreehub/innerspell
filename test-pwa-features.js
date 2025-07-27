const { chromium } = require('playwright');

(async () => {
  console.log('Starting PWA feature test...');
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: null,
    permissions: ['notifications'],
    colorScheme: 'dark'
  });

  const page = await context.newPage();

  try {
    // Vercel 배포 URL로 이동
    console.log('Navigating to Vercel deployment...');
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // 1. Service Worker 등록 확인
    console.log('Checking Service Worker registration...');
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      }
      return false;
    });
    console.log('Service Worker registered:', swRegistered);

    // 2. Manifest 확인
    console.log('Checking manifest.json...');
    const manifestLink = await page.$('link[rel="manifest"]');
    const manifestExists = manifestLink !== null;
    console.log('Manifest link exists:', manifestExists);

    // 3. PWA 설치 가능 여부 확인
    console.log('Checking PWA installability...');
    await page.screenshot({ path: 'screenshots/pwa-01-main.png', fullPage: true });

    // 4. 오프라인 페이지 테스트
    console.log('Testing offline page...');
    // 먼저 온라인 상태에서 오프라인 페이지 방문
    await page.goto('https://test-studio-firebase.vercel.app/offline', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/pwa-02-offline.png', fullPage: true });

    // 5. 모바일 뷰 테스트
    console.log('Testing mobile PWA view...');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
      hasTouch: true,
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('https://test-studio-firebase.vercel.app', {
      waitUntil: 'networkidle'
    });
    await mobilePage.waitForTimeout(3000);
    await mobilePage.screenshot({ path: 'screenshots/pwa-03-mobile.png' });

    // 6. Apple 메타태그 확인
    console.log('Checking Apple PWA meta tags...');
    const appleMeta = await mobilePage.evaluate(() => {
      const capable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      const statusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      const title = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      const icon = document.querySelector('link[rel="apple-touch-icon"]');
      
      return {
        capable: capable?.content,
        statusBar: statusBar?.content,
        title: title?.content,
        iconHref: icon?.href
      };
    });
    console.log('Apple PWA meta tags:', appleMeta);

    // 7. 캐시 확인
    console.log('Checking cache storage...');
    const cacheInfo = await page.evaluate(async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const cacheDetails = {};
        
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          cacheDetails[name] = keys.length;
        }
        
        return cacheDetails;
      }
      return null;
    });
    console.log('Cache storage:', cacheInfo);

    // 8. 콘솔 메시지 캡처
    page.on('console', msg => {
      if (msg.text().includes('Service Worker') || msg.text().includes('PWA')) {
        console.log('Console:', msg.text());
      }
    });

    console.log('\nPWA 기능 테스트 완료!');
    console.log('스크린샷 저장 위치:');
    console.log('- screenshots/pwa-01-main.png');
    console.log('- screenshots/pwa-02-offline.png');
    console.log('- screenshots/pwa-03-mobile.png');

    await mobileContext.close();
    
  } catch (error) {
    console.error('Error during PWA test:', error);
    await page.screenshot({ path: 'screenshots/pwa-error.png', fullPage: true });
  }

  await browser.close();
})();