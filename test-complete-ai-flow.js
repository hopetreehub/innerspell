const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 스크린샷 저장 디렉토리 생성
const screenshotDir = path.join(__dirname, 'screenshots', 'complete-ai-test');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function testCompleteAIFlow() {
  console.log('🚀 완전한 AI 해석 테스트 시작...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500,
    args: ['--window-size=1400,1000']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 로그 모니터링
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`🔴 콘솔 에러: ${msg.text()}`);
    }
  });
  
  try {
    // 1. 타로 리딩 페이지 접속
    console.log('\n1️⃣ 타로 리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-initial-page.png'),
      fullPage: true 
    });
    
    // 2. 질문 입력
    console.log('\n2️⃣ 질문 입력...');
    const questionInput = await page.locator('#question');
    await questionInput.fill('AI 해석 기능이 정상적으로 작동하는지 테스트합니다');
    await page.screenshot({ 
      path: path.join(screenshotDir, '02-question-entered.png'),
      fullPage: true 
    });
    
    // 3. 카드 섞기
    console.log('\n3️⃣ 카드 섞기...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '03-cards-shuffled.png'),
      fullPage: true 
    });
    
    // 4. 카드 펼치기
    console.log('\n4️⃣ 카드 펼치기...');
    const spreadButton = await page.locator('button:has-text("카드 펼치기")');
    await spreadButton.click();
    await page.waitForTimeout(4000); // 카드 애니메이션 대기
    await page.screenshot({ 
      path: path.join(screenshotDir, '04-cards-spread.png'),
      fullPage: true 
    });
    
    // 5. 3장의 카드 선택
    console.log('\n5️⃣ 3장의 카드 선택...');
    
    // 카드 요소가 로드될 때까지 대기
    await page.waitForSelector('.card-item, .card, [data-card]', { timeout: 10000 });
    
    // 카드 선택
    const cards = await page.locator('.card-item, .card, [data-card]').all();
    console.log(`발견된 카드 수: ${cards.length}`);
    
    if (cards.length >= 3) {
      for (let i = 0; i < 3; i++) {
        await cards[i].click();
        await page.waitForTimeout(1500);
        console.log(`${i + 1}번째 카드 선택됨`);
        
        await page.screenshot({ 
          path: path.join(screenshotDir, `05-card-${i + 1}-selected.png`),
          fullPage: true 
        });
      }
    } else {
      throw new Error(`충분한 카드를 찾을 수 없습니다. 발견된 카드: ${cards.length}개`);
    }
    
    // 6. AI 해석 버튼 찾기 및 클릭
    console.log('\n6️⃣ AI 해석 버튼 찾기 및 클릭...');
    
    // AI 해석 버튼이 나타날 때까지 대기
    await page.waitForTimeout(2000);
    
    // 가능한 AI 해석 버튼 텍스트들
    const aiButtonTexts = ['AI 해석', 'AI로 해석', 'AI 분석', '해석하기', 'AI 타로 해석'];
    
    let aiButton = null;
    for (const text of aiButtonTexts) {
      try {
        const button = await page.locator(`button:has-text("${text}")`).first();
        if (await button.isVisible()) {
          aiButton = button;
          console.log(`✅ AI 해석 버튼 발견: "${text}"`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!aiButton) {
      // 모든 버튼 확인
      const allButtons = await page.locator('button').all();
      console.log('현재 페이지의 모든 버튼:');
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        const isVisible = await allButtons[i].isVisible();
        console.log(`  ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
      }
      throw new Error('AI 해석 버튼을 찾을 수 없습니다');
    }
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '06-before-ai-click.png'),
      fullPage: true 
    });
    
    // AI 해석 버튼 클릭
    await aiButton.click();
    console.log('AI 해석 버튼 클릭됨');
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '07-ai-button-clicked.png'),
      fullPage: true 
    });
    
    // 7. AI 해석 결과 대기 및 확인
    console.log('\n7️⃣ AI 해석 결과 대기 중...');
    
    // 로딩 상태 확인
    await page.waitForTimeout(3000);
    
    // 로딩 표시가 있는지 확인
    const loadingSelectors = ['.loading', '.spinner', '[class*="loading"]', 'div:has-text("로딩")', 'div:has-text("처리")'];
    for (const selector of loadingSelectors) {
      try {
        const loading = await page.locator(selector).first();
        if (await loading.isVisible()) {
          console.log(`로딩 중... (${selector})`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // AI 응답을 위해 최대 30초 대기
    console.log('AI 응답 대기 중... (최대 30초)');
    await page.waitForTimeout(15000);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '08-ai-processing.png'),
      fullPage: true 
    });
    
    // 추가 대기
    await page.waitForTimeout(10000);
    
    // 8. AI 해석 결과 확인
    console.log('\n8️⃣ AI 해석 결과 확인...');
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '09-ai-result-check.png'),
      fullPage: true 
    });
    
    // AI 해석 결과 영역 찾기
    const resultSelectors = [
      '.ai-interpretation',
      '.interpretation-result',
      '.ai-result',
      '.result-text',
      '.interpretation-text',
      '[class*="interpretation"]',
      '[class*="result"]',
      'div[role="region"]',
      '.card-interpretation'
    ];
    
    let interpretationFound = false;
    let interpretationText = '';
    
    for (const selector of resultSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          if (await element.isVisible()) {
            const text = await element.textContent();
            if (text && text.trim().length > 20) { // 의미 있는 텍스트인지 확인
              console.log(`\n✅ AI 해석 결과 발견 (${selector}):`);
              console.log('=' .repeat(60));
              console.log(text.trim());
              console.log('='.repeat(60));
              interpretationFound = true;
              interpretationText = text.trim();
              break;
            }
          }
        }
        if (interpretationFound) break;
      } catch (e) {
        continue;
      }
    }
    
    // 오류 메시지 확인
    const errorSelectors = [
      '.error',
      '.error-message',
      '[class*="error"]',
      '.alert-danger',
      'div:has-text("오류")',
      'div:has-text("에러")',
      'div:has-text("Error")'
    ];
    
    let errorFound = false;
    for (const selector of errorSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          const text = await element.textContent();
          console.log(`\n❌ 오류 메시지 발견 (${selector}):`);
          console.log('='.repeat(60));
          console.log(text.trim());
          console.log('='.repeat(60));
          errorFound = true;
        }
      } catch (e) {
        continue;
      }
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotDir, '10-final-result.png'),
      fullPage: true 
    });
    
    // 결과 분석
    console.log('\n📊 테스트 결과 분석:');
    console.log('==================');
    
    if (interpretationFound && !errorFound) {
      console.log('🎉 SUCCESS: AI 해석이 정상적으로 작동합니다!');
      console.log(`📝 해석 내용 길이: ${interpretationText.length}자`);
      
      // 해석 내용이 의미있는지 간단히 체크
      const meaningfulKeywords = ['타로', '카드', '과거', '현재', '미래', '해석', '의미', '상징', '조언'];
      const foundKeywords = meaningfulKeywords.filter(keyword => interpretationText.includes(keyword));
      console.log(`🔍 발견된 관련 키워드: ${foundKeywords.join(', ')}`);
      
    } else if (errorFound) {
      console.log('❌ FAILURE: AI 해석 중 오류가 발생했습니다');
      
    } else {
      console.log('⚠️  WARNING: AI 해석 결과를 확인할 수 없습니다');
      
      // 페이지 전체 텍스트에서 관련 내용 검색
      const pageText = await page.textContent('body');
      const keywords = ['해석', '분석', '타로', 'AI', '카드', '과거', '현재', '미래'];
      
      console.log('\n페이지 내 키워드 검색:');
      for (const keyword of keywords) {
        if (pageText.includes(keyword)) {
          console.log(`✅ "${keyword}" 키워드 발견`);
        }
      }
    }
    
    console.log(`\n📸 모든 스크린샷이 저장되었습니다: ${screenshotDir}`);
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
    await page.screenshot({ 
      path: path.join(screenshotDir, `error-${Date.now()}.png`),
      fullPage: true 
    });
  }
  
  // 수동 확인을 위해 브라우저 유지
  console.log('\n🔍 브라우저를 수동으로 확인하세요. 15초 후 자동 종료됩니다...');
  await page.waitForTimeout(15000);
  
  await browser.close();
}

// 테스트 실행
testCompleteAIFlow().catch(console.error);