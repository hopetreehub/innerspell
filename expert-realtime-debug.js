const { chromium } = require('playwright');

async function expertRealtimeDebug() {
  console.log('🔬 전문가 실시간 디버깅 (Expert Real-time Debug)');
  console.log('================================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let allLogs = [];
  let modelRequests = [];
  let configValues = [];
  let errorDetails = [];
  
  // 모든 콘솔 로그 수집
  page.on('console', msg => {
    const text = msg.text();
    const logEntry = {
      type: msg.type(),
      text: text,
      time: new Date().toISOString()
    };
    allLogs.push(logEntry);
    
    // Model ID 관련 로그
    if (text.includes('Using model ID for prompt:')) {
      const modelId = text.split('Using model ID for prompt:')[1]?.trim();
      modelRequests.push({
        modelId: modelId,
        time: new Date().toISOString()
      });
      console.log('🎯 DETECTED MODEL ID:', modelId);
    }
    
    // Config 관련 로그
    if (text.includes('config') && text.includes('[TAROT]')) {
      configValues.push({
        text: text,
        time: new Date().toISOString()
      });
      console.log('⚙️ CONFIG LOG:', text);
    }
    
    // 오류 로그
    if (text.includes('NOT_FOUND') || text.includes('Model') && text.includes('not found')) {
      errorDetails.push({
        error: text,
        time: new Date().toISOString()
      });
      console.log('🚨 ERROR DETECTED:', text);
    }
    
    // 일반 TAROT 로그
    if (text.includes('[TAROT]')) {
      console.log('📋 [TAROT]:', text);
    }
  });
  
  // Network 요청 모니터링
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/')) {
      console.log('🌐 API Request:', request.method(), url);
    }
  });
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/') && response.status() >= 400) {
      console.log('🔴 API Error Response:', response.status(), url);
    }
  });
  
  try {
    // 즉시 타로 페이지로 이동
    console.log('1️⃣ 타로 페이지 로드');
    await page.goto('https://test-studio-firebase.vercel.app/tarot', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 빠른 테스트 시나리오
    console.log('2️⃣ 빠른 테스트 시작');
    
    // 질문 입력
    const questionInput = await page.locator('input[type="text"], textarea').first();
    await questionInput.fill('전문가 실시간 디버깅 테스트');
    
    // 원 카드 선택
    const tabs = await page.locator('[role="tablist"] button').all();
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text && text.includes('원 카드')) {
        await tab.click();
        break;
      }
    }
    await page.waitForTimeout(1000);
    
    // 카드 섞기
    console.log('3️⃣ 카드 섞기');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      await page.waitForTimeout(3000);
    }
    
    // 카드 펼치기
    console.log('4️⃣ 카드 펼치기');
    const spreadButton = await page.locator('button:has-text("카드 펼치기")').first();
    if (await spreadButton.isVisible()) {
      await spreadButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 카드 선택
    console.log('5️⃣ 카드 선택');
    const cards = await page.locator('img[alt*="카드"]').all();
    if (cards.length > 0) {
      await cards[0].click();
      await page.waitForTimeout(1000);
    }
    
    // 해석 요청 - 핵심 모니터링
    console.log('6️⃣ AI 해석 요청 (실시간 모니터링)');
    console.log('==========================================');
    
    const interpretButton = await page.locator('button:has-text("해석 보기")').first();
    if (await interpretButton.isVisible()) {
      console.log('🔄 해석 버튼 클릭 - 실시간 로그 수집 시작...');
      
      // 클릭 전 로그 카운트
      const preClickLogCount = allLogs.length;
      
      await interpretButton.click();
      
      // 30초간 실시간 모니터링
      const monitoringStart = Date.now();
      let errorFound = false;
      let successFound = false;
      
      while (Date.now() - monitoringStart < 30000) {
        // 새로운 로그 확인
        const newLogs = allLogs.slice(preClickLogCount);
        
        for (const log of newLogs) {
          if (log.text.includes('NOT_FOUND') || (log.text.includes('Model') && log.text.includes('not found'))) {
            errorFound = true;
            console.log('\n🚨 실시간 오류 감지!');
            console.log('오류 내용:', log.text);
            console.log('발생 시간:', log.time);
            
            // 해당 시점의 모든 관련 로그 출력
            console.log('\n📋 관련 로그들:');
            const recentLogs = allLogs.slice(-10);
            recentLogs.forEach(recentLog => {
              console.log(`[${recentLog.type}] ${recentLog.text}`);
            });
            break;
          }
          
          if (log.text.includes('interpretation generated successfully')) {
            successFound = true;
            console.log('\n✅ 성공 감지:', log.text);
            break;
          }
        }
        
        if (errorFound || successFound) break;
        
        await page.waitForTimeout(500);
      }
      
      // 결과 분석
      console.log('\n📊 실시간 분석 결과:');
      console.log('===================');
      console.log(`총 로그 수: ${allLogs.length}`);
      console.log(`Model ID 요청 수: ${modelRequests.length}`);
      console.log(`Config 로그 수: ${configValues.length}`);
      console.log(`오류 수: ${errorDetails.length}`);
      
      if (modelRequests.length > 0) {
        console.log('\n🎯 감지된 Model ID들:');
        modelRequests.forEach(req => {
          console.log(`- ${req.modelId} (at ${req.time})`);
        });
      }
      
      if (errorDetails.length > 0) {
        console.log('\n🚨 감지된 오류들:');
        errorDetails.forEach(err => {
          console.log(`- ${err.error} (at ${err.time})`);
        });
      }
      
      // 스크린샷
      await page.screenshot({ 
        path: 'verification-screenshots/expert-realtime-debug.png', 
        fullPage: true 
      });
      
      // 전체 로그 저장
      const fs = require('fs');
      fs.writeFileSync(
        'verification-screenshots/expert-realtime-logs.json',
        JSON.stringify({
          allLogs,
          modelRequests,
          configValues,
          errorDetails,
          analysis: {
            totalLogs: allLogs.length,
            modelRequestCount: modelRequests.length,
            configLogCount: configValues.length,
            errorCount: errorDetails.length,
            errorFound,
            successFound
          }
        }, null, 2)
      );
      
      console.log('\n📁 로그 파일 저장: verification-screenshots/expert-realtime-logs.json');
    }
    
  } catch (error) {
    console.error('\n💥 디버깅 중 오류:', error);
    await page.screenshot({ 
      path: 'verification-screenshots/expert-debug-error.png', 
      fullPage: true 
    });
  }
  
  console.log('\n🔍 브라우저 유지 중. 수동 확인 후 Ctrl+C로 종료하세요.');
  await new Promise(() => {}); // Keep browser open
}

expertRealtimeDebug().catch(console.error);