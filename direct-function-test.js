// Direct function test via client-side call simulation
const https = require('https');
const { chromium } = require('playwright');

async function testDirectFunction() {
  console.log('🧪 실제 함수 호출 테스트');
  console.log('=======================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 에러 감시
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('NOT_FOUND') || msg.text().includes('gpt-3.5-turbo')) {
      errors.push({
        type: msg.type(),
        text: msg.text(),
        time: new Date().toISOString()
      });
      console.log(`[CONSOLE ${msg.type().toUpperCase()}]`, msg.text());
    }
  });
  
  // 네트워크 요청 감시
  const apiCalls = [];
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('generateTarotInterpretation') || url.includes('tarot')) {
      try {
        const body = await response.text();
        apiCalls.push({
          url,
          status: response.status(),
          body: body.substring(0, 500) // 처음 500자만
        });
        
        if (body.includes('NOT_FOUND') || body.includes('gpt-3.5-turbo')) {
          console.log(`❌ API 에러 발견: ${response.status()} ${url}`);
          console.log('Body:', body);
        } else if (response.status() === 200) {
          console.log(`✅ API 성공: ${response.status()} ${url}`);
        }
      } catch (e) {
        console.log(`⚠️ 응답 파싱 실패: ${url}`);
      }
    }
  });
  
  try {
    console.log('1. Vercel 사이트 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('2. 개발자 콘솔에서 함수 직접 호출...');
    
    // 브라우저 콘솔에서 직접 함수 호출
    const result = await page.evaluate(async () => {
      try {
        // generateTarotInterpretation 함수를 직접 호출
        const { generateTarotInterpretation } = await import('/src/ai/flows/generate-tarot-interpretation.js');
        
        const testInput = {
          question: '오늘의 운세는 어떤가요?',
          cardSpread: '1장 뽑기',
          cardInterpretations: 'The Fool (정방향): 새로운 시작, 모험',
          isGuestUser: true,
          spreadId: 'single-card',
          styleId: 'traditional-rws'
        };
        
        const result = await generateTarotInterpretation(testInput);
        return {
          success: true,
          result: result,
          hasInterpretation: !!(result && result.interpretation)
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          stack: error.stack
        };
      }
    });
    
    console.log('\n=== 함수 호출 결과 ===');
    console.log('성공:', result.success);
    
    if (result.success) {
      console.log('해석 존재:', result.hasInterpretation);
      if (result.result && result.result.interpretation) {
        console.log('해석 길이:', result.result.interpretation.length);
        console.log('✅ AI 모델 오류 해결됨!');
      }
    } else {
      console.log('에러:', result.error);
      if (result.error.includes('NOT_FOUND') || result.error.includes('gpt-3.5-turbo')) {
        console.log('❌ 모델 오류 여전히 존재');
      }
    }
    
    console.log('\n=== 전체 API 호출 ===');
    console.log('API 호출 수:', apiCalls.length);
    apiCalls.forEach((call, i) => {
      console.log(`${i + 1}. ${call.status} ${call.url}`);
    });
    
    console.log('\n=== 콘솔 에러 ===');
    console.log('에러 수:', errors.length);
    errors.forEach((err, i) => {
      console.log(`${i + 1}. [${err.type}] ${err.text}`);
    });
    
    // 스크린샷
    await page.screenshot({ 
      path: `direct-function-test-${Date.now()}.png`,
      fullPage: true 
    });
    
  } catch (error) {
    console.error('테스트 오류:', error);
  }
  
  console.log('\n브라우저를 열어두고 수동 확인 가능합니다.');
  await new Promise(() => {});
}

testDirectFunction().catch(console.error);