const { chromium } = require('playwright');
const fs = require('fs').promises;

async function analyzeAdminWithLogin() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('🔍 Admin 페이지 분석 (로그인 포함)...\n');
  
  try {
    // 1. 로그인 페이지 접속
    console.log('1️⃣ 로그인 페이지 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    await page.waitForTimeout(2000);
    
    // 테스트 계정으로 로그인 시도
    console.log('2️⃣ 테스트 계정으로 로그인 시도...');
    
    // 이메일 입력
    await page.fill('input[type="email"]', 'test@example.com');
    
    // 비밀번호 입력
    await page.fill('input[type="password"]', 'Test123!@#');
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 로그인 처리 대기
    await page.waitForTimeout(3000);
    
    // 현재 URL 확인
    const afterLoginUrl = page.url();
    console.log(`   로그인 후 URL: ${afterLoginUrl}`);
    
    // Admin 페이지로 이동
    if (!afterLoginUrl.includes('/admin')) {
      console.log('3️⃣ Admin 페이지로 이동 중...');
      await page.goto('https://test-studio-firebase.vercel.app/admin', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      await page.waitForTimeout(3000);
    }
    
    // 현재 페이지 확인
    const currentUrl = page.url();
    console.log(`   현재 페이지: ${currentUrl}`);
    
    if (currentUrl.includes('/admin')) {
      console.log('   ✅ Admin 페이지 접속 성공!\n');
      
      // 전체 페이지 스크린샷
      await page.screenshot({ 
        path: 'screenshots/admin-dashboard-main.png',
        fullPage: true 
      });
      console.log('📸 Admin 대시보드 메인 스크린샷 저장');
      
      // 페이지 구조 분석
      const pageStructure = await page.evaluate(() => {
        // 모든 탭/버튼 찾기
        const tabs = [];
        const tabSelectors = [
          '[role="tab"]',
          'button[data-state]',
          '.tab',
          'button[aria-selected]',
          'button[data-radix-collection-item]'
        ];
        
        tabSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent.trim();
            if (text && !tabs.includes(text)) {
              tabs.push(text);
            }
          });
        });
        
        // 차트 요소 찾기
        const charts = {
          canvas: document.querySelectorAll('canvas').length,
          svg: document.querySelectorAll('svg').length,
          recharts: document.querySelectorAll('.recharts-wrapper').length
        };
        
        // 카드/통계 요소 찾기
        const cards = document.querySelectorAll('[class*="card"], [class*="stat"]');
        const cardTexts = Array.from(cards).map(card => card.textContent.trim()).slice(0, 5);
        
        return {
          tabs,
          charts,
          cardCount: cards.length,
          cardTexts
        };
      });
      
      console.log('📊 페이지 구조 분석:');
      console.log(`   탭 메뉴: ${pageStructure.tabs.join(', ')}`);
      console.log(`   차트: Canvas(${pageStructure.charts.canvas}), SVG(${pageStructure.charts.svg}), Recharts(${pageStructure.charts.recharts})`);
      console.log(`   카드/통계: ${pageStructure.cardCount}개\n`);
      
      // 각 탭 클릭하며 확인
      const tabsToCheck = ['사용통계', 'Usage Stats', '통계', 'Statistics', '실시간', 'Real-time', '모니터링', 'Monitoring'];
      
      for (const tabName of tabsToCheck) {
        try {
          const tabButton = await page.locator(`button:has-text("${tabName}")`).first();
          if (await tabButton.isVisible({ timeout: 1000 })) {
            console.log(`\n🔍 "${tabName}" 탭 분석 중...`);
            await tabButton.click();
            await page.waitForTimeout(2000);
            
            // 탭별 스크린샷
            const filename = `screenshots/admin-tab-${tabName.toLowerCase().replace(/\s+/g, '-')}.png`;
            await page.screenshot({ 
              path: filename,
              fullPage: true 
            });
            console.log(`   📸 스크린샷 저장: ${filename}`);
            
            // 탭 내용 분석
            const tabContent = await page.evaluate(() => {
              // 차트 확인
              const charts = document.querySelectorAll('canvas, svg, .recharts-wrapper');
              
              // 데이터 테이블 확인
              const tables = document.querySelectorAll('table');
              
              // 실시간 데이터 표시 확인
              const realtimeIndicators = [];
              const allTexts = document.body.innerText.toLowerCase();
              if (allTexts.includes('실시간') || allTexts.includes('real-time') || allTexts.includes('live')) {
                realtimeIndicators.push('실시간 텍스트 발견');
              }
              
              // 숫자 데이터 수집
              const numbers = [];
              const numberElements = document.querySelectorAll('[class*="number"], [class*="count"], [class*="value"]');
              numberElements.forEach(el => {
                const text = el.textContent.trim();
                if (/\d+/.test(text)) {
                  numbers.push(text);
                }
              });
              
              return {
                chartCount: charts.length,
                tableCount: tables.length,
                hasRealtimeData: realtimeIndicators.length > 0,
                numberData: numbers.slice(0, 5)
              };
            });
            
            console.log(`   - 차트: ${tabContent.chartCount}개`);
            console.log(`   - 테이블: ${tabContent.tableCount}개`);
            console.log(`   - 실시간 데이터: ${tabContent.hasRealtimeData ? '있음' : '없음'}`);
            if (tabContent.numberData.length > 0) {
              console.log(`   - 표시된 숫자 데이터: ${tabContent.numberData.join(', ')}`);
            }
          }
        } catch (e) {
          // 탭을 찾을 수 없으면 계속
        }
      }
      
      // 실시간 모니터링 기능 상세 확인
      console.log('\n\n🔍 실시간 모니터링 기능 상세 분석...');
      
      const realtimeFeatures = await page.evaluate(() => {
        // WebSocket 연결 확인
        const hasWebSocket = typeof WebSocket !== 'undefined';
        
        // 자동 업데이트 요소 찾기
        const autoUpdateElements = [];
        const intervals = window.setInterval.toString().includes('native') ? 'Native intervals detected' : null;
        
        // 시간 표시 요소
        const timeElements = document.querySelectorAll('time, [class*="time"], [class*="update"]');
        const timeTexts = Array.from(timeElements).map(el => el.textContent.trim()).filter(t => t);
        
        // 새로고침/업데이트 버튼
        const refreshButtons = document.querySelectorAll('button[class*="refresh"], button[class*="reload"], button[aria-label*="refresh"]');
        
        return {
          hasWebSocket,
          intervals,
          timeDisplayCount: timeElements.length,
          sampleTimes: timeTexts.slice(0, 3),
          refreshButtonCount: refreshButtons.length
        };
      });
      
      console.log('실시간 기능 요약:');
      console.log(`   - WebSocket 지원: ${realtimeFeatures.hasWebSocket ? '✅' : '❌'}`);
      console.log(`   - 시간 표시 요소: ${realtimeFeatures.timeDisplayCount}개`);
      console.log(`   - 새로고침 버튼: ${realtimeFeatures.refreshButtonCount}개`);
      if (realtimeFeatures.sampleTimes.length > 0) {
        console.log(`   - 시간 표시 예시: ${realtimeFeatures.sampleTimes.join(', ')}`);
      }
      
    } else {
      console.log('   ❌ Admin 페이지 접속 실패');
      console.log('   로그인이 실패했거나 권한이 없을 수 있습니다.');
      
      // 현재 페이지 스크린샷
      await page.screenshot({ 
        path: 'screenshots/admin-access-failed.png',
        fullPage: true 
      });
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    // 오류 스크린샷
    await page.screenshot({ 
      path: 'screenshots/admin-error-state.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n✅ 분석 완료');
  }
}

// 실행
(async () => {
  try {
    await fs.mkdir('screenshots', { recursive: true });
  } catch (e) {}
  
  await analyzeAdminWithLogin();
})();