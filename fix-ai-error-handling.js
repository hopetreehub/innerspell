// Emergency AI Error Handling Fix
const { chromium } = require('playwright');

async function debugAIFunction() {
  console.log('🚨 긴급 AI 에러 핸들링 디버깅');
  console.log('================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 모든 콘솔 로그 캡처
  const logs = [];
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      time: new Date().toISOString()
    };
    logs.push(logEntry);
    console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });
  
  // 네트워크 요청 캡처
  const requests = [];
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      time: new Date().toISOString()
    });
    console.log(`[REQUEST] ${request.method()} ${request.url()}`);
  });
  
  // 에러 캡처
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
    console.log(`[STACK] ${error.stack}`);
  });
  
  try {
    console.log('1. Vercel 사이트 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('2. 개발자 도구에서 직접 함수 테스트...');
    
    // 브라우저에서 직접 generateTarotInterpretation 호출 테스트
    const testResult = await page.evaluate(async () => {
      try {
        // Next.js의 Server Action 또는 import 경로 확인
        console.log('Attempting to import generateTarotInterpretation...');
        
        // 가능한 import 경로들 시도
        const possiblePaths = [
          '/src/ai/flows/generate-tarot-interpretation',
          './src/ai/flows/generate-tarot-interpretation',
          '@/ai/flows/generate-tarot-interpretation'
        ];
        
        let generateTarotInterpretation = null;
        let importPath = null;
        
        for (const path of possiblePaths) {
          try {
            const module = await import(path);
            generateTarotInterpretation = module.generateTarotInterpretation || module.default;
            if (generateTarotInterpretation) {
              importPath = path;
              break;
            }
          } catch (e) {
            console.log(`Failed to import from ${path}:`, e.message);
          }
        }
        
        if (!generateTarotInterpretation) {
          return {
            success: false,
            error: 'Cannot import generateTarotInterpretation function',
            importAttempts: possiblePaths
          };
        }
        
        console.log(`Successfully imported from: ${importPath}`);
        
        // 함수 호출 테스트
        const testInput = {
          question: '테스트 질문입니다',
          cardSpread: '1장 뽑기',
          cardInterpretations: 'The Fool (정방향): 새로운 시작',
          isGuestUser: true,
          spreadId: 'single-card',
          styleId: 'traditional-rws'
        };
        
        console.log('Calling generateTarotInterpretation with:', testInput);
        
        const startTime = Date.now();
        const result = await generateTarotInterpretation(testInput);
        const endTime = Date.now();
        
        return {
          success: true,
          result: result,
          executionTime: endTime - startTime,
          hasInterpretation: !!(result && result.interpretation),
          importPath: importPath
        };
        
      } catch (error) {
        return {
          success: false,
          error: error.message,
          stack: error.stack,
          name: error.name
        };
      }
    });
    
    console.log('\n=== 직접 함수 호출 결과 ===');
    console.log('성공:', testResult.success);
    
    if (testResult.success) {
      console.log('실행 시간:', testResult.executionTime, 'ms');
      console.log('해석 존재:', testResult.hasInterpretation);
      console.log('Import 경로:', testResult.importPath);
      
      if (testResult.result) {
        console.log('결과 타입:', typeof testResult.result);
        console.log('결과 키들:', Object.keys(testResult.result || {}));
      }
      
      if (testResult.hasInterpretation) {
        console.log('✅ AI 함수가 정상 작동함!');
      } else {
        console.log('⚠️ 함수는 실행되지만 해석이 생성되지 않음');
      }
    } else {
      console.log('❌ 함수 호출 실패');
      console.log('에러:', testResult.error);
      console.log('스택:', testResult.stack);
      console.log('Import 시도들:', testResult.importAttempts);
      
      if (testResult.error.includes('NOT_FOUND') || testResult.error.includes('gpt-3.5-turbo')) {
        console.log('🎯 발견! gpt-3.5-turbo 모델 오류 확인됨');
      }
    }
    
    console.log('\n=== 수집된 로그 ===');
    console.log('총 로그 수:', logs.length);
    logs.forEach((log, i) => {
      if (log.text.includes('gpt-3.5-turbo') || log.text.includes('NOT_FOUND') || log.text.includes('Model')) {
        console.log(`${i + 1}. [${log.type}] ${log.text}`);
      }
    });
    
    console.log('\n=== 네트워크 요청 ===');
    console.log('총 요청 수:', requests.length);
    requests.forEach((req, i) => {
      if (req.url.includes('api') || req.url.includes('tarot')) {
        console.log(`${i + 1}. ${req.method} ${req.url}`);
      }
    });
    
    // 스크린샷
    await page.screenshot({ 
      path: `debug-ai-function-${Date.now()}.png`,
      fullPage: true 
    });
    
  } catch (error) {
    console.error('디버깅 오류:', error);
  }
  
  console.log('\n브라우저를 열어두고 수동 확인 가능합니다.');
  await new Promise(() => {});
}

debugAIFunction().catch(console.error);