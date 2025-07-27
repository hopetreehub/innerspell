const { chromium } = require('playwright');

async function testTarotGuidelines() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Console log collection
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    console.log(`[BROWSER]: ${text}`);
  });
  
  try {
    console.log('=== 타로 지침 활용 테스트 시작 ===');
    
    // 1. 페이지 접속
    console.log('1. 타로 리딩 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'networkidle' 
    });
    await page.screenshot({ path: 'screenshots/01-page-load.png', fullPage: true });
    
    // 2. 질문 입력
    console.log('2. 질문 입력...');
    try {
      await page.waitForSelector('input, textarea', { timeout: 10000 });
      const inputs = await page.locator('input, textarea').all();
      if (inputs.length > 0) {
        await inputs[0].fill('새로운 프로젝트 시작에 대한 조언을 주세요');
        console.log('✓ 질문 입력 완료');
      }
    } catch (e) {
      console.log('⚠ 질문 입력 필드 찾기 실패');
    }
    await page.screenshot({ path: 'screenshots/02-question-input.png', fullPage: true });
    
    // 3. 스프레드 선택 (삼위일체 조망)
    console.log('3. 스프레드 선택...');
    try {
      const allElements = await page.locator('button, label, div').all();
      for (const element of allElements) {
        const text = await element.textContent();
        if (text && (text.includes('삼위일체') || text.includes('Trinity') || text.includes('3장'))) {
          await element.click();
          console.log(`✓ 스프레드 선택: ${text.trim()}`);
          break;
        }
      }
    } catch (e) {
      console.log('⚠ 스프레드 선택 실패');
    }
    await page.screenshot({ path: 'screenshots/03-spread-select.png', fullPage: true });
    
    // 4. 해석 스타일 선택 (심리학적 원형 탐구)
    console.log('4. 해석 스타일 선택...');
    try {
      const styleElements = await page.locator('button, label, div').all();
      for (const element of styleElements) {
        const text = await element.textContent();
        if (text && (text.includes('심리학적') || text.includes('원형') || text.includes('psychological'))) {
          await element.click();
          console.log(`✓ 해석 스타일 선택: ${text.trim()}`);
          break;
        }
      }
    } catch (e) {
      console.log('⚠ 해석 스타일 선택 실패');
    }
    await page.screenshot({ path: 'screenshots/04-style-select.png', fullPage: true });
    
    // 5. 시작 버튼 클릭
    console.log('5. 카드 게임 시작...');
    try {
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const text = await button.textContent();
        if (text && (text.includes('시작') || text.includes('Start') || text.includes('섞기'))) {
          await button.click();
          console.log(`✓ ${text.trim()} 버튼 클릭`);
          break;
        }
      }
    } catch (e) {
      console.log('⚠ 시작 버튼 클릭 실패');
    }
    
    // 카드 로딩 대기
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/05-cards-ready.png', fullPage: true });
    
    // 6. 카드 선택
    console.log('6. 카드 선택...');
    try {
      const cards = await page.locator('img, .card, .tarot-card, [data-card]').all();
      console.log(`발견된 카드 수: ${cards.length}`);
      
      // 처음 3개 카드 선택
      const maxCards = Math.min(3, cards.length);
      for (let i = 0; i < maxCards; i++) {
        await cards[i].click();
        console.log(`✓ 카드 ${i + 1} 선택`);
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('⚠ 카드 선택 실패:', e.message);
    }
    await page.screenshot({ path: 'screenshots/06-cards-selected.png', fullPage: true });
    
    // 7. AI 해석 요청
    console.log('7. AI 해석 요청...');
    try {
      const interpretButtons = await page.locator('button').all();
      for (const button of interpretButtons) {
        const text = await button.textContent();
        if (text && (text.includes('해석') || text.includes('분석') || text.includes('Interpret'))) {
          await button.click();
          console.log(`✓ ${text.trim()} 버튼 클릭`);
          break;
        }
      }
    } catch (e) {
      console.log('⚠ 해석 버튼 클릭 실패');
    }
    
    // 8. 해석 결과 대기 및 로그 수집
    console.log('8. 해석 결과 대기 중... (45초)');
    await page.waitForTimeout(45000);
    await page.screenshot({ path: 'screenshots/07-interpretation-done.png', fullPage: true });
    
    // 9. 콘솔 로그 분석
    console.log('\n=== 콘솔 로그 분석 ===');
    
    const tarotLogs = consoleLogs.filter(log => 
      log.includes('[TAROT]') || 
      log.includes('guideline') ||
      log.includes('Using guideline') ||
      log.includes('clientSpreadId') ||
      log.includes('mappedSpreadId') ||
      log.includes('clientStyleId') ||
      log.includes('mappedStyleId')
    );
    
    console.log(`총 수집된 로그: ${consoleLogs.length}개`);
    console.log(`타로 지침 관련 로그: ${tarotLogs.length}개`);
    
    if (tarotLogs.length > 0) {
      console.log('\n=== 발견된 타로 지침 로그 ===');
      tarotLogs.forEach((log, i) => {
        console.log(`${i + 1}. ${log}`);
      });
    }
    
    const mappingLogs = consoleLogs.filter(log =>
      log.includes('trinity-view') ||
      log.includes('past-present-future') ||
      log.includes('심리학적 원형 탐구') ||
      log.includes('psychological-jungian')
    );
    
    if (mappingLogs.length > 0) {
      console.log('\n=== 매핑 관련 로그 ===');
      mappingLogs.forEach((log, i) => {
        console.log(`${i + 1}. ${log}`);
      });
    }
    
    // 결과 요약
    console.log('\n=== 테스트 결과 ===');
    console.log('✓ 페이지 접속 완료');
    console.log('✓ 질문 입력 시도');
    console.log('✓ 스프레드 선택 시도 (삼위일체 조망)');
    console.log('✓ 해석 스타일 선택 시도 (심리학적 원형 탐구)');
    console.log('✓ 카드 선택 및 해석 요청');
    console.log(`✓ 스크린샷 7개 저장`);
    console.log(`✓ 콘솔 로그 ${consoleLogs.length}개 수집`);
    
    if (tarotLogs.length > 0) {
      console.log('\n🎯 타로 지침이 활용되고 있습니다!');
    } else {
      console.log('\n⚠️ 타로 지침 로그를 찾을 수 없습니다.');
    }
    
    // 수동 확인을 위해 브라우저 유지
    console.log('\n브라우저를 수동으로 확인한 후 Enter를 눌러 종료하세요...');
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
  } catch (error) {
    console.error('테스트 오류:', error.message);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('테스트 완료!');
  }
}

testTarotGuidelines();