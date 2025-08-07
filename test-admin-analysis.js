const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function captureAdminPages() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('🔍 Admin 페이지 분석 시작...\n');
  
  try {
    // 1. Admin 페이지 접속
    console.log('1️⃣ Admin 페이지 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 현재 URL 확인 (리다이렉트 확인)
    const currentUrl = page.url();
    console.log(`   현재 URL: ${currentUrl}`);
    
    // 로그인 페이지로 리다이렉트 되었는지 확인
    if (currentUrl.includes('/login')) {
      console.log('   ⚠️  로그인 페이지로 리다이렉트됨');
      await page.screenshot({ 
        path: 'screenshots/admin-login-required.png',
        fullPage: true 
      });
      console.log('   📸 로그인 페이지 스크린샷 저장: screenshots/admin-login-required.png');
      
      // 로그인 폼 구조 분석
      const loginForm = await page.evaluate(() => {
        const form = document.querySelector('form');
        const inputs = document.querySelectorAll('input');
        const buttons = document.querySelectorAll('button');
        
        return {
          hasForm: !!form,
          inputCount: inputs.length,
          inputTypes: Array.from(inputs).map(input => ({
            type: input.type,
            placeholder: input.placeholder,
            name: input.name || input.id
          })),
          buttonCount: buttons.length,
          buttonTexts: Array.from(buttons).map(btn => btn.textContent.trim())
        };
      });
      
      console.log('\n   로그인 페이지 구조:');
      console.log(`   - 폼 존재: ${loginForm.hasForm}`);
      console.log(`   - 입력 필드 수: ${loginForm.inputCount}`);
      loginForm.inputTypes.forEach(input => {
        console.log(`     • ${input.type} 타입 (${input.placeholder || input.name})`);
      });
      console.log(`   - 버튼 수: ${loginForm.buttonCount}`);
      loginForm.buttonTexts.forEach(text => {
        console.log(`     • "${text}" 버튼`);
      });
      
    } else if (currentUrl.includes('/admin')) {
      console.log('   ✅ Admin 페이지 접속 성공');
      
      // 전체 페이지 스크린샷
      await page.screenshot({ 
        path: 'screenshots/admin-full-page.png',
        fullPage: true 
      });
      console.log('   📸 전체 페이지 스크린샷 저장: screenshots/admin-full-page.png');
      
      // 탭 구조 확인
      const tabs = await page.evaluate(() => {
        const tabElements = document.querySelectorAll('[role="tab"], .tab, button[aria-selected]');
        return Array.from(tabElements).map(tab => tab.textContent.trim());
      });
      
      if (tabs.length > 0) {
        console.log('\n   발견된 탭들:');
        tabs.forEach((tab, index) => {
          console.log(`   ${index + 1}. ${tab}`);
        });
      }
      
      // 사용통계 탭 찾기 및 클릭
      console.log('\n2️⃣ 사용통계 탭 확인 중...');
      
      const statsTabSelectors = [
        'button:has-text("사용통계")',
        'button:has-text("Usage Stats")',
        'button:has-text("통계")',
        'button:has-text("Statistics")',
        '[role="tab"]:has-text("사용통계")',
        '[role="tab"]:has-text("Usage")'
      ];
      
      let statsTabFound = false;
      for (const selector of statsTabSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.click();
            await page.waitForTimeout(2000);
            statsTabFound = true;
            console.log(`   ✅ 사용통계 탭 클릭 완료`);
            break;
          }
        } catch (e) {
          // continue to next selector
        }
      }
      
      if (statsTabFound) {
        // 차트 요소 분석
        const chartInfo = await page.evaluate(() => {
          const canvases = document.querySelectorAll('canvas');
          const svgs = document.querySelectorAll('svg');
          const rechartContainers = document.querySelectorAll('.recharts-wrapper');
          const chartContainers = document.querySelectorAll('[class*="chart"], [id*="chart"]');
          
          // 통계 데이터 텍스트 수집
          const statsTexts = [];
          const statsElements = document.querySelectorAll('[class*="stat"], [class*="metric"], [class*="count"]');
          statsElements.forEach(el => {
            const text = el.textContent.trim();
            if (text && !statsTexts.includes(text)) {
              statsTexts.push(text);
            }
          });
          
          return {
            canvasCount: canvases.length,
            svgCount: svgs.length,
            rechartCount: rechartContainers.length,
            chartContainerCount: chartContainers.length,
            statsTexts: statsTexts.slice(0, 10) // 처음 10개만
          };
        });
        
        console.log('\n   차트 및 데이터 분석:');
        console.log(`   - Canvas 요소: ${chartInfo.canvasCount}개`);
        console.log(`   - SVG 요소: ${chartInfo.svgCount}개`);
        console.log(`   - Recharts 컨테이너: ${chartInfo.rechartCount}개`);
        console.log(`   - 차트 컨테이너: ${chartInfo.chartContainerCount}개`);
        
        if (chartInfo.statsTexts.length > 0) {
          console.log('\n   표시되는 통계 데이터:');
          chartInfo.statsTexts.forEach(text => {
            console.log(`   • ${text}`);
          });
        }
        
        // 사용통계 탭 스크린샷
        await page.screenshot({ 
          path: 'screenshots/admin-usage-stats.png',
          fullPage: true 
        });
        console.log('\n   📸 사용통계 탭 스크린샷 저장: screenshots/admin-usage-stats.png');
      }
      
      // 실시간 모니터링 관련 기능 찾기
      console.log('\n3️⃣ 실시간 모니터링 기능 확인 중...');
      
      const realtimeSelectors = [
        'button:has-text("실시간")',
        'button:has-text("Real-time")',
        'button:has-text("모니터링")',
        'button:has-text("Monitoring")',
        '[role="tab"]:has-text("실시간")',
        '[role="tab"]:has-text("Live")'
      ];
      
      let realtimeFound = false;
      for (const selector of realtimeSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.click();
            await page.waitForTimeout(2000);
            realtimeFound = true;
            console.log(`   ✅ 실시간 모니터링 탭/섹션 발견 및 클릭`);
            break;
          }
        } catch (e) {
          // continue to next selector
        }
      }
      
      // 실시간 데이터 요소 분석
      const realtimeInfo = await page.evaluate(() => {
        // 실시간 관련 텍스트 찾기
        const realtimeTexts = [];
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(el => {
          const text = el.textContent.trim();
          if (text && (
            text.includes('실시간') || 
            text.includes('Real-time') || 
            text.includes('Live') ||
            text.includes('현재') ||
            text.includes('Active') ||
            text.includes('Online')
          ) && text.length < 100) {
            realtimeTexts.push(text);
          }
        });
        
        // WebSocket 연결 확인
        const hasWebSocket = window.WebSocket !== undefined;
        
        // 업데이트 시간 표시 찾기
        const timeElements = document.querySelectorAll('[class*="time"], [class*="update"], time');
        const times = Array.from(timeElements).map(el => el.textContent.trim()).filter(t => t);
        
        return {
          realtimeTexts: [...new Set(realtimeTexts)].slice(0, 10),
          hasWebSocket,
          timeDisplays: times.slice(0, 5)
        };
      });
      
      console.log('\n   실시간 기능 분석:');
      console.log(`   - WebSocket 지원: ${realtimeInfo.hasWebSocket ? '예' : '아니오'}`);
      
      if (realtimeInfo.realtimeTexts.length > 0) {
        console.log('\n   실시간 관련 텍스트:');
        realtimeInfo.realtimeTexts.forEach(text => {
          console.log(`   • ${text}`);
        });
      }
      
      if (realtimeInfo.timeDisplays.length > 0) {
        console.log('\n   시간 표시:');
        realtimeInfo.timeDisplays.forEach(time => {
          console.log(`   • ${time}`);
        });
      }
      
      if (realtimeFound) {
        // 실시간 모니터링 스크린샷
        await page.screenshot({ 
          path: 'screenshots/admin-realtime-monitoring.png',
          fullPage: true 
        });
        console.log('\n   📸 실시간 모니터링 스크린샷 저장: screenshots/admin-realtime-monitoring.png');
      }
      
      // 전체 페이지 구조 분석
      const pageStructure = await page.evaluate(() => {
        const sidebar = document.querySelector('[class*="sidebar"], aside, nav');
        const mainContent = document.querySelector('main, [role="main"], [class*="content"]');
        const headers = document.querySelectorAll('h1, h2, h3');
        const tables = document.querySelectorAll('table');
        const forms = document.querySelectorAll('form');
        
        return {
          hasSidebar: !!sidebar,
          hasMainContent: !!mainContent,
          headerCount: headers.length,
          headerTexts: Array.from(headers).slice(0, 5).map(h => h.textContent.trim()),
          tableCount: tables.length,
          formCount: forms.length
        };
      });
      
      console.log('\n4️⃣ 페이지 구조 분석:');
      console.log(`   - 사이드바: ${pageStructure.hasSidebar ? '있음' : '없음'}`);
      console.log(`   - 메인 콘텐츠 영역: ${pageStructure.hasMainContent ? '있음' : '없음'}`);
      console.log(`   - 헤더 수: ${pageStructure.headerCount}개`);
      if (pageStructure.headerTexts.length > 0) {
        console.log('   - 주요 헤더:');
        pageStructure.headerTexts.forEach(text => {
          console.log(`     • ${text}`);
        });
      }
      console.log(`   - 테이블 수: ${pageStructure.tableCount}개`);
      console.log(`   - 폼 수: ${pageStructure.formCount}개`);
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    // 오류 시 현재 페이지 스크린샷
    try {
      await page.screenshot({ 
        path: 'screenshots/admin-error-state.png',
        fullPage: true 
      });
      console.log('📸 오류 상태 스크린샷 저장: screenshots/admin-error-state.png');
    } catch (screenshotError) {
      console.error('스크린샷 저장 실패:', screenshotError.message);
    }
  } finally {
    await browser.close();
    console.log('\n✅ 분석 완료');
  }
}

// 스크린샷 디렉토리 생성
async function ensureScreenshotDir() {
  try {
    await fs.mkdir('screenshots', { recursive: true });
  } catch (error) {
    // 디렉토리가 이미 존재하면 무시
  }
}

// 실행
(async () => {
  await ensureScreenshotDir();
  await captureAdminPages();
})();