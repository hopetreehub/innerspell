const { chromium } = require('playwright');
const fs = require('fs').promises;

async function analyzeKoreanAdminDashboard() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('🔍 한국어 Admin 대시보드 분석 시작...\n');
  
  try {
    // Admin 페이지 직접 접속
    console.log('1️⃣ Admin 페이지 접속 시도...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`   현재 URL: ${currentUrl}\n`);
    
    // 로그인이 필요한 경우 처리
    if (currentUrl.includes('sign-in')) {
      console.log('2️⃣ 로그인 필요 - 테스트 계정으로 로그인 시도...');
      
      // 이메일 입력
      await page.fill('input[name="email"]', 'test@innerspell.com');
      await page.fill('input[type="password"]', 'Test1234!');
      
      // 로그인 버튼 클릭
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
      // Admin 페이지로 재이동
      if (!page.url().includes('admin')) {
        await page.goto('https://test-studio-firebase.vercel.app/admin');
        await page.waitForTimeout(3000);
      }
    }
    
    // Admin 대시보드인지 확인
    if (!page.url().includes('sign-in')) {
      console.log('3️⃣ Admin 대시보드 분석 중...\n');
      
      // 전체 대시보드 스크린샷
      await page.screenshot({ 
        path: 'screenshots/admin-dashboard-korean.png',
        fullPage: true 
      });
      console.log('📸 한국어 대시보드 전체 스크린샷 저장\n');
      
      // 탭 메뉴 분석
      const tabs = await page.evaluate(() => {
        // 상단 아이콘 메뉴 확인
        const iconButtons = document.querySelectorAll('button[title], button[aria-label]');
        const iconMenus = Array.from(iconButtons).map(btn => ({
          title: btn.getAttribute('title') || btn.getAttribute('aria-label'),
          text: btn.textContent.trim()
        }));
        
        // 탭 또는 메뉴 항목 찾기
        const tabElements = document.querySelectorAll('[role="tab"], .tab, button[class*="tab"]');
        const tabs = Array.from(tabElements).map(tab => tab.textContent.trim());
        
        return {
          iconMenus: iconMenus.filter(m => m.title),
          tabs
        };
      });
      
      console.log('📋 메뉴 구조:');
      if (tabs.iconMenus.length > 0) {
        console.log('   아이콘 메뉴:');
        tabs.iconMenus.forEach(menu => {
          console.log(`   • ${menu.title}`);
        });
      }
      
      if (tabs.tabs.length > 0) {
        console.log('\n   탭 메뉴:', tabs.tabs.join(', '));
      }
      
      // 사용통계 관련 버튼 찾아 클릭
      console.log('\n4️⃣ 사용통계 기능 찾기...');
      
      // 통계 아이콘 찾기 (차트 아이콘 등)
      const statsIconSelectors = [
        'button[title*="통계"]',
        'button[title*="차트"]',
        'button[title*="분석"]',
        'button[aria-label*="통계"]',
        'button[aria-label*="차트"]',
        'button svg[class*="chart"]',
        'button:has(svg path[d*="M3"])', // 차트 아이콘 path
      ];
      
      let statsFound = false;
      for (const selector of statsIconSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            // 현재 화면 저장
            await page.screenshot({ 
              path: 'screenshots/admin-before-stats-click.png'
            });
            
            await element.click();
            await page.waitForTimeout(3000);
            statsFound = true;
            console.log(`   ✅ 통계 관련 버튼 클릭 완료`);
            break;
          }
        } catch (e) {
          // 다음 셀렉터 시도
        }
      }
      
      // 통계 페이지 스크린샷
      if (statsFound) {
        await page.screenshot({ 
          path: 'screenshots/admin-stats-section.png',
          fullPage: true 
        });
        console.log('   📸 통계 섹션 스크린샷 저장\n');
        
        // 차트 및 데이터 분석
        const statsContent = await page.evaluate(() => {
          // 차트 요소
          const charts = {
            canvas: document.querySelectorAll('canvas').length,
            svg: document.querySelectorAll('svg').length,
            chartjs: document.querySelectorAll('.chartjs-render-monitor').length
          };
          
          // 통계 수치
          const numbers = [];
          document.querySelectorAll('*').forEach(el => {
            const text = el.textContent.trim();
            if (el.children.length === 0 && /^\d+[,.\d]*[%]?$/.test(text)) {
              const parent = el.parentElement?.textContent || '';
              numbers.push({
                value: text,
                label: parent.replace(text, '').trim()
              });
            }
          });
          
          return {
            charts,
            statistics: numbers.slice(0, 10)
          };
        });
        
        console.log('   📊 통계 콘텐츠:');
        console.log(`   차트: Canvas(${statsContent.charts.canvas}), SVG(${statsContent.charts.svg}), Chart.js(${statsContent.charts.chartjs})`);
        
        if (statsContent.statistics.length > 0) {
          console.log('\n   주요 통계:');
          statsContent.statistics.forEach(stat => {
            console.log(`   • ${stat.value} - ${stat.label}`);
          });
        }
      }
      
      // 실시간 모니터링 찾기
      console.log('\n5️⃣ 실시간 모니터링 기능 찾기...');
      
      // 홈으로 돌아가기
      const homeButton = await page.locator('button[title*="홈"], button[aria-label*="홈"], button:has(svg path[d*="M3 9"])').first();
      if (await homeButton.isVisible()) {
        await homeButton.click();
        await page.waitForTimeout(2000);
      }
      
      // 실시간 관련 아이콘 찾기
      const realtimeIconSelectors = [
        'button[title*="실시간"]',
        'button[title*="모니터링"]',
        'button[aria-label*="실시간"]',
        'button[aria-label*="모니터"]',
        'button:has(svg path[d*="M12"])', // 시계/활동 아이콘
      ];
      
      let realtimeFound = false;
      for (const selector of realtimeIconSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.click();
            await page.waitForTimeout(3000);
            realtimeFound = true;
            console.log(`   ✅ 실시간 모니터링 버튼 클릭 완료`);
            break;
          }
        } catch (e) {
          // 다음 셀렉터 시도
        }
      }
      
      if (realtimeFound) {
        await page.screenshot({ 
          path: 'screenshots/admin-realtime-section.png',
          fullPage: true 
        });
        console.log('   📸 실시간 모니터링 스크린샷 저장\n');
        
        // 실시간 데이터 분석
        const realtimeContent = await page.evaluate(() => {
          // 실시간 관련 텍스트
          const realtimeTexts = [];
          const keywords = ['실시간', '현재', '활성', '온라인', 'Active', 'Online', 'Live', '접속'];
          
          document.querySelectorAll('*').forEach(el => {
            const text = el.textContent.trim();
            if (el.children.length === 0 && text.length < 100) {
              for (const keyword of keywords) {
                if (text.includes(keyword)) {
                  realtimeTexts.push(text);
                  break;
                }
              }
            }
          });
          
          // 상태 표시기
          const statusIndicators = document.querySelectorAll('.status, .state, [class*="status"], [class*="online"], [class*="active"]');
          
          // 업데이트 시간
          const timeElements = document.querySelectorAll('time, [class*="time"], [class*="update"]');
          const times = Array.from(timeElements).map(el => el.textContent.trim()).filter(t => t);
          
          return {
            realtimeTexts: [...new Set(realtimeTexts)].slice(0, 10),
            statusCount: statusIndicators.length,
            timeDisplays: times.slice(0, 5)
          };
        });
        
        console.log('   🔴 실시간 콘텐츠:');
        console.log(`   상태 표시기: ${realtimeContent.statusCount}개`);
        
        if (realtimeContent.realtimeTexts.length > 0) {
          console.log('\n   실시간 관련 텍스트:');
          realtimeContent.realtimeTexts.forEach(text => {
            console.log(`   • ${text}`);
          });
        }
        
        if (realtimeContent.timeDisplays.length > 0) {
          console.log('\n   시간 표시:', realtimeContent.timeDisplays.join(', '));
        }
      }
      
      // 전체 대시보드 기능 요약
      console.log('\n\n📝 대시보드 기능 요약:');
      
      const dashboardSummary = await page.evaluate(() => {
        // 모든 버튼의 title/aria-label 수집
        const buttons = document.querySelectorAll('button[title], button[aria-label]');
        const features = Array.from(buttons).map(btn => 
          btn.getAttribute('title') || btn.getAttribute('aria-label')
        ).filter(label => label);
        
        // 현재 표시된 주요 정보
        const mainContent = document.querySelector('main, .main-content, [role="main"]');
        const contentText = mainContent ? mainContent.textContent.substring(0, 200) : '';
        
        return {
          availableFeatures: [...new Set(features)],
          mainContentPreview: contentText
        };
      });
      
      console.log('사용 가능한 기능들:');
      dashboardSummary.availableFeatures.forEach(feature => {
        console.log(`   • ${feature}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    await page.screenshot({ 
      path: 'screenshots/admin-error-korean.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n✅ 분석 완료!');
  }
}

// 실행
(async () => {
  try {
    await fs.mkdir('screenshots', { recursive: true });
  } catch (e) {}
  
  await analyzeKoreanAdminDashboard();
})();