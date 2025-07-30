const { chromium } = require('playwright');

async function qaFinalVerification() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const baseUrl = 'https://innerspell-app.vercel.app';
  
  console.log('🎯 QA 최종 검증: AI 해석 오류 수정 확인');
  console.log('================================================');
  
  try {
    // 1. 메인 페이지 로드
    console.log('1️⃣ 메인 페이지 접속...');
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'qa-final-01-homepage.png' });
    console.log('✅ 메인 페이지 로드 완료');
    
    // 2. 타로 리딩 페이지로 이동
    console.log('2️⃣ 타로 리딩 페이지 접속...');
    await page.goto(`${baseUrl}/reading`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'qa-final-02-reading-page.png' });
    console.log('✅ 타로 리딩 페이지 접속 완료');
    
    // 3. 질문 입력
    console.log('3️⃣ 질문 입력...');
    const questionInput = page.locator('input[placeholder*="질문"], textarea[placeholder*="질문"]');
    await questionInput.fill('새로운 AI 시스템이 제대로 작동하는지 확인해주세요');
    await page.screenshot({ path: 'qa-final-03-question-entered.png' });
    console.log('✅ 질문 입력 완료');
    
    // 4. 카드 셔플 및 스프레드
    console.log('4️⃣ 카드 셔플 시작...');
    const shuffleButton = page.locator('button').filter({ hasText: /셔플|shuffle|시작/i }).first();
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      console.log('✅ 셔플 버튼 클릭');
    }
    
    // 잠시 대기 (애니메이션)
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'qa-final-04-cards-shuffled.png' });
    
    // 5. 카드 선택
    console.log('5️⃣ 카드 선택...');
    let selectedCards = 0;
    const maxCards = 3;
    
    while (selectedCards < maxCards) {
      try {
        // 클릭 가능한 카드 찾기
        const cards = page.locator('.card:not(.selected), [data-testid*="card"]:not(.selected), .tarot-card:not(.selected)');
        const cardCount = await cards.count();
        
        if (cardCount > 0) {
          await cards.first().click();
          selectedCards++;
          console.log(`✅ 카드 ${selectedCards} 선택됨`);
          await page.waitForTimeout(1000);
        } else {
          break;
        }
      } catch (error) {
        console.log(`⚠️ 카드 선택 중 오류: ${error.message}`);
        break;
      }
    }
    
    await page.screenshot({ path: 'qa-final-05-cards-selected.png' });
    
    // 6. AI 해석 버튼 클릭 (핵심 테스트)
    console.log('6️⃣ AI 해석 요청... (핵심 테스트)');
    
    // 다양한 방법으로 AI 해석 버튼 찾기
    const aiButtons = [
      page.locator('button').filter({ hasText: /AI.*해석|해석.*시작|interpret/i }),
      page.locator('button').filter({ hasText: /해석/i }),
      page.locator('[data-testid*="interpret"], [data-testid*="ai"]'),
      page.locator('button[class*="interpret"], button[class*="ai"]')
    ];
    
    let aiButtonFound = false;
    for (const buttonSelector of aiButtons) {
      try {
        if (await buttonSelector.first().isVisible()) {
          await buttonSelector.first().click();
          aiButtonFound = true;
          console.log('✅ AI 해석 버튼 클릭됨');
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (!aiButtonFound) {
      console.log('⚠️ AI 해석 버튼을 찾을 수 없습니다. 페이지 상태 확인...');
      await page.screenshot({ path: 'qa-final-no-ai-button.png' });
    }
    
    // 7. AI 응답 대기 (최대 60초)
    console.log('7️⃣ AI 응답 대기...');
    const maxWaitTime = 60000; // 60초
    const startTime = Date.now();
    
    let aiResponseReceived = false;
    while (Date.now() - startTime < maxWaitTime) {
      try {
        // AI 응답이 있는지 확인
        const responseSelectors = [
          page.locator('text=/서론|본론|결론/'),
          page.locator('[data-testid*="interpretation"], [data-testid*="result"]'),
          page.locator('.interpretation, .ai-response, .result'),
          page.locator('text=/AI.*해석|해석.*결과/'),
          // 에러 메시지도 확인
          page.locator('text=/모델.*찾을.*수.*없습니다|gpt-3.5-turbo.*not found|API.*키/'),
          page.locator('text=/🤖|⚙️|🚫/')
        ];
        
        for (const selector of responseSelectors) {
          if (await selector.first().isVisible()) {
            const text = await selector.first().textContent();
            console.log('📝 AI 응답 감지:', text?.substring(0, 100) + '...');
            
            // 에러 메시지 확인
            if (text?.includes('gpt-3.5-turbo') || text?.includes('not found')) {
              console.log('❌ 여전히 gpt-3.5-turbo 에러 발생!');
              aiResponseReceived = false;
            } else if (text?.includes('🤖') || text?.includes('서론') || text?.includes('해석')) {
              console.log('✅ 정상적인 AI 응답 수신!');
              aiResponseReceived = true;
            }
            break;
          }
        }
        
        if (aiResponseReceived) break;
        
        await page.waitForTimeout(2000);
      } catch (error) {
        await page.waitForTimeout(2000);
      }
    }
    
    await page.screenshot({ path: 'qa-final-06-ai-response.png' });
    
    // 8. 결과 분석
    console.log('8️⃣ 최종 결과 분석...');
    
    const pageContent = await page.content();
    const isErrorFixed = !pageContent.includes('gpt-3.5-turbo') && !pageContent.includes('not found');
    
    console.log('================================================');
    console.log('🎯 QA 최종 검증 결과');
    console.log('================================================');
    console.log(`AI 버튼 발견: ${aiButtonFound ? '✅' : '❌'}`);
    console.log(`AI 응답 수신: ${aiResponseReceived ? '✅' : '❌'}`);
    console.log(`gpt-3.5-turbo 에러 수정: ${isErrorFixed ? '✅' : '❌'}`);
    
    if (aiResponseReceived && isErrorFixed) {
      console.log('🎉 SUCCESS: AI 해석 기능이 정상적으로 작동합니다!');
    } else {
      console.log('⚠️ ISSUES: 아직 해결되지 않은 문제가 있습니다.');
    }
    
    return {
      aiButtonFound,
      aiResponseReceived,
      isErrorFixed,
      success: aiResponseReceived && isErrorFixed
    };
    
  } catch (error) {
    console.error('❌ QA 검증 중 오류:', error);
    await page.screenshot({ path: 'qa-final-error.png' });
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

qaFinalVerification().then(result => {
  console.log('\n🎯 최종 결과:', result);
}).catch(console.error);