const { chromium } = require('playwright');

async function testShareWithMockInterpretation() {
  console.log('타로 리딩 공유 기능 테스트 (목업 해석 포함)...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. 타로 리딩 페이지 접속
    console.log('\n1. 타로 리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'mock-test-01-reading-page.png' });
    console.log('✓ 타로 리딩 페이지 로드 완료');
    
    // 2. 질문 입력
    console.log('\n2. 질문 입력...');
    const questionTextarea = await page.locator('textarea').first();
    await questionTextarea.click();
    await questionTextarea.fill('오늘의 운세는 어떨까요?');
    await page.screenshot({ path: 'mock-test-02-question.png' });
    console.log('✓ 질문 입력 완료');
    
    // 3. 카드 섞기
    console.log('\n3. 카드 섞기...');
    await page.locator('button:has-text("카드 섞기")').click();
    await page.waitForTimeout(2000);
    console.log('✓ 카드 섞기 완료');
    
    // 4. 카드 펼치기
    console.log('\n4. 카드 펼치기...');
    await page.locator('button:has-text("카드 펼치기")').click();
    await page.waitForTimeout(3000);
    console.log('✓ 카드 펼치기 완료');
    
    // 5. 카드 3장 선택
    console.log('\n5. 카드 3장 선택...');
    const cardContainers = await page.locator('div[class*="relative"]:has(img[alt*="카드"])').all();
    
    if (cardContainers.length >= 3) {
      for (let i = 0; i < 3; i++) {
        await cardContainers[i].click({ force: true });
        await page.waitForTimeout(1000);
        console.log(`✓ ${i + 1}번째 카드 선택`);
      }
    }
    await page.screenshot({ path: 'mock-test-03-cards-selected.png' });
    
    // 6. 개발자 도구로 목업 해석 데이터 주입
    console.log('\n6. 목업 해석 데이터 주입...');
    await page.evaluate(() => {
      // React 컴포넌트에 직접 해석 데이터를 주입
      const mockInterpretation = `## 오늘의 운세 해석

### 첫 번째 카드: 과거의 영향
오늘 당신에게 영향을 미치는 과거의 에너지는 **변화와 도전**의 시기였음을 보여줍니다. 

### 두 번째 카드: 현재 상황
현재 당신은 **균형과 조화**를 찾아가는 중입니다. 내면의 평화가 중요한 시기입니다.

### 세 번째 카드: 미래 전망
앞으로 **새로운 기회**가 찾아올 것입니다. 긍정적인 마음가짐을 유지하세요.

### 종합 메시지
오늘은 과거의 경험을 바탕으로 현재의 균형을 찾고, 미래의 기회를 준비하는 날입니다.`;
      
      // 브라우저 콘솔에 메시지 출력
      console.log('Mock interpretation injected:', mockInterpretation);
      
      // window 객체에 저장 (테스트용)
      window.__mockInterpretation = mockInterpretation;
    });
    
    // 7. AI 해석 버튼 클릭
    console.log('\n7. AI 해석 버튼 클릭...');
    const interpretButton = await page.locator('button:has-text("AI 해석 받기")').first();
    await interpretButton.click();
    console.log('✓ AI 해석 버튼 클릭 (오류가 발생할 수 있음)');
    
    // 오류 토스트 메시지 대기
    await page.waitForTimeout(3000);
    
    // 8. 오류 발생 확인
    const errorToast = await page.locator('text=/해석 오류|AI 해석을 생성하는 데 실패/').isVisible();
    if (errorToast) {
      console.log('✓ AI 모델 없음으로 인한 오류 확인됨');
      await page.screenshot({ path: 'mock-test-04-error.png' });
    }
    
    // 9. 공유 기능은 해석이 있어야 가능하므로 생략
    console.log('\n9. 공유 기능 테스트 결과:');
    console.log('⚠️ AI 모델이 설정되지 않아 해석을 생성할 수 없음');
    console.log('⚠️ 해석이 없으면 공유 기능을 테스트할 수 없음');
    console.log('\n필요한 설정:');
    console.log('- OpenAI, Google AI, Anthropic 등의 API 키 설정');
    console.log('- 또는 목업 해석 데이터를 반환하도록 코드 수정');
    
    // 10. 최종 상태
    await page.screenshot({ path: 'mock-test-05-final.png' });
    console.log('\n✓ 테스트 완료');
    
  } catch (error) {
    console.error('\n테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'mock-test-error.png' });
  } finally {
    console.log('\n브라우저 닫기 전 5초 대기...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testShareWithMockInterpretation();