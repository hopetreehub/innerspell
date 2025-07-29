const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Vercel 배포 URL
const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

// 스크린샷 폴더 생성
const screenshotDir = path.join(__dirname, 'screenshots', 'ai-final-step');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function testFinalAIInterpretation() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  // 에러 수집
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('requestfailed', request => {
    if (request.url().includes('/api/')) {
      errors.push(`API 요청 실패: ${request.url()} - ${request.failure()?.errorText}`);
    }
  });
  
  try {
    console.log('🚀 최종 AI 타로 해석 테스트\n');
    
    // 빠른 워크플로우로 카드 선택 상태까지 진행
    console.log('📍 타로 리딩 페이지 접속 및 설정...');
    await page.goto(`${VERCEL_URL}/reading`);
    await page.waitForTimeout(2000);
    
    // 질문 입력
    await page.fill('[placeholder*="질문"], [placeholder*="카드에게"]', '2025년 나의 성공과 행복을 위한 조언은?');
    
    // 카드 섞기
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(1500);
    
    // 카드 펼치기
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(2000);
    
    // 카드 3장 선택
    const cards = await page.locator('div[role="button"][aria-label*="카드"]').all();
    if (cards.length >= 3) {
      await cards[5].click();
      await page.waitForTimeout(1000);
      await cards[15].click();
      await page.waitForTimeout(1000);
      await cards[25].click();
      await page.waitForTimeout(1000);
    }
    
    console.log('✅ 카드 3장 선택 완료\n');
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-cards-selected.png'),
      fullPage: true 
    });
    
    // AI 해석 받기 버튼 클릭
    console.log('🎯 AI 해석 받기 버튼 클릭...');
    const interpretButton = await page.locator('button:has-text("AI 해석 받기")').first();
    await interpretButton.click();
    console.log('✅ AI 해석 요청 전송\n');
    
    // AI 응답 대기
    console.log('⏳ AI 타로 해석 생성 대기중...');
    
    let interpretationReceived = false;
    let errorOccurred = false;
    
    for (let i = 1; i <= 10; i++) {
      await page.waitForTimeout(3000);
      console.log(`   ${i * 3}초 경과...`);
      
      // 로딩 상태 확인
      const loadingElements = await page.locator('text=/로딩|처리|생성 중/i').all();
      if (loadingElements.length > 0) {
        console.log('   ⏳ AI가 해석을 생성하는 중...');
      }
      
      // 에러 확인
      const errorElements = await page.locator('text=/error|오류|실패|failed|NOT_FOUND/i').all();
      for (const errorEl of errorElements) {
        const errorText = await errorEl.textContent();
        if (errorText && errorText.length > 20) {
          console.log(`\n❌ 에러 발생: ${errorText}`);
          
          // OpenAI 모델 에러 상세 분석
          if (errorText.includes('NOT_FOUND') && errorText.includes('Model')) {
            console.log('\n🔍 OpenAI API 에러 상세:');
            console.log('━'.repeat(50));
            console.log('에러 유형: Model Not Found');
            console.log('문제의 모델명: "openai/g" (잘못된 모델명)');
            console.log('\n✅ 해결 방법:');
            console.log('1. app/actions/tarot.ts 파일의 getAIInterpretation 함수 확인');
            console.log('2. model 파라미터를 다음 중 하나로 변경:');
            console.log('   - "gpt-4o-mini" (추천)');
            console.log('   - "gpt-4-turbo-preview"');
            console.log('   - "gpt-3.5-turbo"');
            console.log('━'.repeat(50));
          }
          
          errorOccurred = true;
          await page.screenshot({ 
            path: path.join(screenshotDir, '02-error-message.png'),
            fullPage: true 
          });
          break;
        }
      }
      
      if (errorOccurred) break;
      
      // AI 해석 내용 확인
      const interpretationSelectors = [
        '.prose',
        '.whitespace-pre-wrap',
        'div[class*="bg-"][class*="rounded"][class*="p-"]',
        'div[class*="text-gray"]',
        'div[class*="space-y"]'
      ];
      
      for (const selector of interpretationSelectors) {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          try {
            const text = await element.textContent();
            if (text && text.length > 500 && 
                (text.includes('카드') || text.includes('의미') || text.includes('조언') || 
                 text.includes('미래') || text.includes('현재') || text.includes('과거'))) {
              
              console.log('\n✅ AI 타로 해석 수신 성공!');
              console.log('\n📮 AI 타로 해석 내용:');
              console.log('═'.repeat(70));
              
              // 해석 내용을 보기 좋게 정리
              const lines = text.split('\n').filter(line => line.trim());
              lines.forEach(line => {
                if (line.includes('과거') || line.includes('현재') || line.includes('미래')) {
                  console.log(`\n【${line.trim()}】`);
                } else {
                  console.log(line.trim());
                }
              });
              
              console.log('═'.repeat(70));
              
              interpretationReceived = true;
              await page.screenshot({ 
                path: path.join(screenshotDir, '02-interpretation-success.png'),
                fullPage: true 
              });
              break;
            }
          } catch (e) {
            // 계속
          }
        }
        if (interpretationReceived) break;
      }
      
      if (interpretationReceived) break;
    }
    
    if (!interpretationReceived && !errorOccurred) {
      console.log('\n⚠️ 30초 동안 AI 해석을 받지 못했습니다.');
      await page.screenshot({ 
        path: path.join(screenshotDir, '02-timeout.png'),
        fullPage: true 
      });
    }
    
    // 에러 로그 출력
    if (errors.length > 0) {
      console.log('\n📋 수집된 에러:');
      errors.forEach(err => console.log(`   - ${err}`));
    }
    
    console.log('\n✅ 테스트 완료!');
    console.log(`📸 스크린샷: ${screenshotDir}`);
    
  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'critical-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testFinalAIInterpretation().catch(console.error);