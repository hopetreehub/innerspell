const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true  // 개발자 도구 자동 열기
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('타로 페이지 상세 분석 시작...\n');
  
  // 네트워크 요청 상세 모니터링
  const networkRequests = [];
  page.on('request', request => {
    if (request.url().includes('api') || request.url().includes('firestore')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: new Date().toISOString()
      });
    }
  });

  page.on('response', response => {
    if (response.url().includes('api') || response.url().includes('firestore')) {
      const req = networkRequests.find(r => r.url === response.url());
      if (req) {
        req.status = response.status();
        req.statusText = response.statusText();
      }
    }
  });

  // 콘솔 메시지 상세 수집
  page.on('console', msg => {
    console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  page.on('pageerror', error => {
    console.error('페이지 에러:', error.message);
  });

  try {
    await page.goto('http://localhost:4000/tarot', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // API 요청 확인을 위해 잠시 대기
    await page.waitForTimeout(5000);
    
    console.log('\n=== API/Firestore 요청 분석 ===');
    if (networkRequests.length > 0) {
      networkRequests.forEach(req => {
        console.log(`\n요청: ${req.method} ${req.url}`);
        console.log(`상태: ${req.status || '대기중'} ${req.statusText || ''}`);
        console.log(`시간: ${req.timestamp}`);
      });
    } else {
      console.log('API/Firestore 요청이 감지되지 않았습니다.');
    }
    
    // 카드 데이터 확인
    console.log('\n=== 카드 데이터 확인 ===');
    const cardElements = await page.locator('.card-item').all();
    console.log(`표시된 카드 수: ${cardElements.length}`);
    
    if (cardElements.length > 0) {
      // 첫 번째 카드의 정보 확인
      const firstCard = cardElements[0];
      const cardName = await firstCard.locator('.card-name').textContent().catch(() => 'N/A');
      const cardDesc = await firstCard.locator('.card-description').textContent().catch(() => 'N/A');
      console.log(`\n첫 번째 카드 정보:`);
      console.log(`- 이름: ${cardName}`);
      console.log(`- 설명: ${cardDesc}`);
    }
    
    // localStorage 확인
    console.log('\n=== LocalStorage 확인 ===');
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        items[key] = window.localStorage.getItem(key);
      }
      return items;
    });
    console.log('LocalStorage 내용:', JSON.stringify(localStorage, null, 2));
    
    // 페이지 소스에서 Firebase 초기화 확인
    console.log('\n=== Firebase 초기화 확인 ===');
    const hasFirebase = await page.evaluate(() => {
      return typeof window.firebase !== 'undefined';
    });
    console.log(`Firebase 객체 존재: ${hasFirebase}`);
    
    if (hasFirebase) {
      const firebaseApps = await page.evaluate(() => {
        try {
          return window.firebase.apps.map(app => ({
            name: app.name,
            options: app.options
          }));
        } catch (e) {
          return 'Firebase apps 접근 오류: ' + e.message;
        }
      });
      console.log('Firebase 앱 정보:', JSON.stringify(firebaseApps, null, 2));
    }
    
    // 스크린샷
    await page.screenshot({ 
      path: 'tarot-page-detailed-analysis.png',
      fullPage: true 
    });
    console.log('\n스크린샷 저장: tarot-page-detailed-analysis.png');
    
  } catch (error) {
    console.error('상세 분석 중 오류:', error);
  }
  
  console.log('\n개발자 도구에서 Network 탭과 Console을 확인하세요.');
  console.log('브라우저 확인 후 Enter를 누르면 종료됩니다...');
  
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  await browser.close();
})();