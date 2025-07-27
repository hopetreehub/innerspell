const { chromium } = require('playwright');

(async () => {
  console.log('Checking PWA head elements...');
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  try {
    // Vercel 배포 URL로 이동
    console.log('Navigating to Vercel deployment...');
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // head 태그 내용 확인
    const headContent = await page.evaluate(() => {
      const head = document.head;
      const elements = [];
      
      // 모든 meta 태그 확인
      head.querySelectorAll('meta').forEach(meta => {
        elements.push({
          type: 'meta',
          name: meta.getAttribute('name'),
          content: meta.getAttribute('content'),
          httpEquiv: meta.getAttribute('http-equiv')
        });
      });
      
      // 모든 link 태그 확인
      head.querySelectorAll('link').forEach(link => {
        elements.push({
          type: 'link',
          rel: link.getAttribute('rel'),
          href: link.getAttribute('href')
        });
      });
      
      return elements;
    });

    console.log('\nHead elements:');
    console.log(JSON.stringify(headContent, null, 2));

    // manifest.json 직접 접근 테스트
    console.log('\nTesting direct manifest.json access...');
    const manifestResponse = await page.goto('https://test-studio-firebase.vercel.app/manifest.json');
    console.log('Manifest status:', manifestResponse.status());
    
    if (manifestResponse.ok()) {
      const manifestContent = await manifestResponse.json();
      console.log('Manifest content:', JSON.stringify(manifestContent, null, 2));
    }

    // sw.js 직접 접근 테스트
    console.log('\nTesting direct sw.js access...');
    const swResponse = await page.goto('https://test-studio-firebase.vercel.app/sw.js');
    console.log('Service Worker status:', swResponse.status());
    
    if (swResponse.ok()) {
      const swContent = await swResponse.text();
      console.log('Service Worker first 200 chars:', swContent.substring(0, 200));
    }

  } catch (error) {
    console.error('Error during check:', error);
  }

  await browser.close();
})();