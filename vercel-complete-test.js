const { chromium } = require('playwright');
const fs = require('fs').promises;

async function completeVercelTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🚀 Vercel 배포 환경 완전 테스트\n');
  
  // 테스트 결과 디렉토리
  const testDir = './vercel-complete-results';
  try {
    await fs.mkdir(testDir, { recursive: true });
  } catch (err) {}

  // 테스트 보고서
  const report = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  try {
    // 테스트 1: API 엔드포인트 직접 확인
    console.log('📌 테스트 1: API 엔드포인트 확인');
    
    // 1-1. 디버그 API
    try {
      const debugUrl = 'https://test-studio-firebase.vercel.app/api/debug-env?key=debug-innerspell-2025';
      await page.goto(debugUrl);
      await page.screenshot({ path: `${testDir}/01-debug-api.png` });
      report.tests.push({
        name: 'Debug API',
        url: debugUrl,
        status: 'completed',
        screenshot: '01-debug-api.png'
      });
    } catch (e) {
      report.tests.push({
        name: 'Debug API',
        status: 'failed',
        error: e.message
      });
    }

    // 1-2. 타로 테스트 API
    try {
      const testUrl = 'https://test-studio-firebase.vercel.app/api/test-tarot?key=debug-innerspell-2025';
      await page.goto(testUrl);
      await page.screenshot({ path: `${testDir}/02-test-tarot-api.png` });
      report.tests.push({
        name: 'Test Tarot API',
        url: testUrl,
        status: 'completed',
        screenshot: '02-test-tarot-api.png'
      });
    } catch (e) {
      report.tests.push({
        name: 'Test Tarot API',
        status: 'failed',
        error: e.message
      });
    }

    // 테스트 2: 타로 리딩 전체 플로우
    console.log('\n📌 테스트 2: 타로 리딩 전체 플로우');
    
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForTimeout(3000);
    
    // 2-1. 초기 화면
    await page.screenshot({ path: `${testDir}/03-reading-initial.png`, fullPage: true });
    console.log('✅ 초기 화면 로드 완료');

    // 2-2. 질문 입력
    const textarea = await page.locator('textarea').first();
    await textarea.fill('오늘의 운세를 알려주세요');
    await page.screenshot({ path: `${testDir}/04-question-entered.png`, fullPage: true });
    console.log('✅ 질문 입력 완료');

    // 2-3. 카드 섞기
    const shuffleBtn = await page.locator('button:has-text("카드 섞기")').first();
    await shuffleBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${testDir}/05-shuffling.png`, fullPage: true });
    console.log('✅ 카드 섞기 시작');

    // 2-4. 카드 펼치기
    const spreadBtn = await page.locator('button:has-text("카드 펼치기")').first();
    await spreadBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${testDir}/06-cards-spread.png`, fullPage: true });
    console.log('✅ 카드 펼치기 완료');

    // 2-5. 페이지 구조 분석
    console.log('\n📊 페이지 구조 분석:');
    const images = await page.locator('img').all();
    console.log(`   - 이미지 수: ${images.length}`);
    
    const buttons = await page.locator('button').all();
    console.log(`   - 버튼 수: ${buttons.length}`);
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      if (text) {
        console.log(`     버튼 ${i+1}: "${text.trim()}"`);
      }
    }

    // 2-6. 카드 클릭 시도
    console.log('\n🎯 카드 클릭 시도:');
    
    // 가능한 모든 클릭 가능 요소 찾기
    const clickableElements = await page.locator('*').all();
    let clicked = false;
    
    for (const element of clickableElements) {
      try {
        const box = await element.boundingBox();
        if (box && box.width > 50 && box.height > 50) {
          const className = await element.getAttribute('class');
          if (className && (className.includes('card') || className.includes('tarot'))) {
            await element.click();
            console.log(`   ✅ 카드 요소 클릭 성공: ${className}`);
            clicked = true;
            await page.waitForTimeout(2000);
            break;
          }
        }
      } catch (e) {
        // 클릭 불가능한 요소는 무시
      }
    }

    await page.screenshot({ path: `${testDir}/07-after-click.png`, fullPage: true });

    // 최종 상태 확인
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${testDir}/08-final-state.png`, fullPage: true });

    // 보고서 저장
    await fs.writeFile(
      `${testDir}/test-report.json`, 
      JSON.stringify(report, null, 2)
    );

    console.log('\n✅ 모든 테스트 완료!');
    console.log(`📁 결과 저장 위치: ${testDir}`);
    console.log('\n💡 브라우저를 30초간 열어두고 수동 테스트 가능합니다...');
    
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    await page.screenshot({ path: `${testDir}/error-screenshot.png`, fullPage: true });
  }

  await browser.close();
}

completeVercelTest().catch(console.error);