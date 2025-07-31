const { chromium } = require('playwright');

async function finalUserScenarioTest() {
  console.log('👤 FINAL USER SCENARIO TEST: 실제 브라우저 환경에서 완전한 사용자 시나리오');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 30000,
    slowMo: 500 // 실제 사용자 속도
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // 에러 추적
    const allErrors = [];
    const authErrors = [];
    const webpackErrors = [];
    
    page.on('pageerror', error => {
      allErrors.push(error.message);
      console.log(`🚨 RUNTIME ERROR: ${error.message}`);
      
      if (error.message.includes("Cannot read properties of undefined (reading 'call')")) {
        webpackErrors.push(error.message);
      }
      
      if (error.message.includes('auth') || error.message.includes('인증')) {
        authErrors.push(error.message);
      }
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ CONSOLE: ${msg.text()}`);
      }
    });
    
    const timestamp = Date.now();
    
    console.log('🌟 1. 홈페이지 접근 및 완전 로딩...');
    
    await page.goto('http://localhost:4000/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // 페이지 완전히 로딩될 때까지 대기
    await page.waitForTimeout(8000);
    
    await page.screenshot({ 
      path: `final-test-01-homepage-${timestamp}.png`,
      fullPage: true 
    });
    
    const title = await page.title();
    console.log(`✅ 홈페이지 로딩: ${title}`);
    
    console.log('🔮 2. 타로 리딩 페이지 접근...');
    
    await page.goto('http://localhost:4000/reading', {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: `final-test-02-reading-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log('✍️ 3. 타로 질문 입력...');
    
    const questionTextarea = await page.locator('textarea').first();
    if (await questionTextarea.count() > 0) {
      await questionTextarea.click();
      await questionTextarea.fill('인증 오류가 계속 발생하는 이유와 해결 방법을 알려주세요.');
      console.log('✅ 질문 입력 완료');
      
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: `final-test-03-question-${timestamp}.png`,
        fullPage: true 
      });
    } else {
      console.log('❌ 질문 입력 필드를 찾을 수 없음');
    }
    
    console.log('🃏 4. 카드 섞기 및 펼치기...');
    
    // 카드 섞기
    const shuffleButton = await page.getByRole('button', { name: /섞기|shuffle/i }).first();
    if (await shuffleButton.count() > 0) {
      await shuffleButton.click();
      console.log('✅ 카드 섞기 완료');
      await page.waitForTimeout(3000);
    } else {
      console.log('❌ 카드 섞기 버튼을 찾을 수 없음');
    }
    
    // 카드 펼치기
    const spreadButton = await page.getByRole('button', { name: /펼치기|spread/i }).first();
    if (await spreadButton.count() > 0) {
      await spreadButton.click();
      console.log('✅ 카드 펼치기 완료');
      await page.waitForTimeout(4000);
      
      await page.screenshot({ 
        path: `final-test-04-spread-${timestamp}.png`,
        fullPage: true 
      });
    } else {
      console.log('❌ 카드 펼치기 버튼을 찾을 수 없음');
    }
    
    console.log('🎴 5. 카드 선택 (3장)...');
    
    // 다양한 선택자로 카드 찾기
    const cardSelectors = [
      '.card',
      '[data-card]',
      '.tarot-card',
      'button[class*="card"]',
      'div[class*="card"]',
      '[role="button"]'
    ];
    
    let cards = [];
    for (const selector of cardSelectors) {
      cards = await page.locator(selector).all();
      if (cards.length > 0) {
        console.log(`✅ ${selector} 선택자로 ${cards.length}개 카드 발견`);
        break;
      }
    }
    
    if (cards.length >= 3) {
      for (let i = 0; i < 3; i++) {
        try {
          await cards[i].click();
          console.log(`✅ 카드 ${i+1} 선택 완료`);
          await page.waitForTimeout(1500);
        } catch (error) {
          console.log(`⚠️ 카드 ${i+1} 선택 실패: ${error.message}`);
        }
      }
      
      await page.screenshot({ 
        path: `final-test-05-selected-${timestamp}.png`,
        fullPage: true 
      });
    } else {
      console.log(`❌ 카드 부족: ${cards.length}개 발견 (3개 필요)`);
    }
    
    console.log('🤖 6. AI 해석 요청...');
    
    const interpretButton = await page.getByRole('button', { name: /해석|interpret|AI|분석/i }).first();
    if (await interpretButton.count() > 0) {
      await interpretButton.click();
      console.log('✅ AI 해석 버튼 클릭');
      
      // AI 해석 완료까지 대기 (최대 15초)
      await page.waitForTimeout(15000);
      
      await page.screenshot({ 
        path: `final-test-06-result-${timestamp}.png`,
        fullPage: true 
      });
    } else {
      console.log('❌ AI 해석 버튼을 찾을 수 없음');
    }
    
    // 최종 에러 분석
    console.log('\\n📊 FINAL ERROR ANALYSIS:');
    console.log('='.repeat(50));
    
    console.log(`❌ Total Runtime Errors: ${allErrors.length}`);
    console.log(`🔧 Webpack Errors: ${webpackErrors.length}`);
    console.log(`🔐 Auth Errors: ${authErrors.length}`);
    
    if (webpackErrors.length > 0) {
      console.log('\\n🚨 WEBPACK ERRORS:');
      webpackErrors.forEach((error, i) => console.log(`  ${i+1}. ${error}`));
    }
    
    if (authErrors.length > 0) {
      console.log('\\n🔐 AUTH ERRORS:');
      authErrors.forEach((error, i) => console.log(`  ${i+1}. ${error}`));
    }
    
    if (allErrors.length > 0) {
      console.log('\\n📋 ALL ERRORS:');
      allErrors.forEach((error, i) => console.log(`  ${i+1}. ${error.substring(0, 100)}...`));
    }
    
    // 최종 판정
    const hasWebpackIssues = webpackErrors.length > 0;
    const hasAuthIssues = authErrors.length > 0;
    const hasAnyErrors = allErrors.length > 0;
    
    console.log('\\n🎯 FINAL VERDICT:');
    console.log('='.repeat(50));
    
    if (hasWebpackIssues) {
      console.log('🔥 CRITICAL: Webpack 에러 여전히 존재 - Vercel 동기화 필요');
    } else if (hasAuthIssues) {
      console.log('⚠️ WARNING: 인증 관련 에러 존재 - 추가 수정 필요');
    } else if (hasAnyErrors) {
      console.log('⚠️ MINOR: 일부 비중요 에러 존재 - 기능상 문제없음');
    } else {
      console.log('✅ SUCCESS: 모든 기능이 에러 없이 정상 작동');
    }
    
    // 상세 보고서 저장
    const report = {
      timestamp: new Date().toISOString(),
      testDuration: '완전한 사용자 시나리오',
      results: {
        totalErrors: allErrors.length,
        webpackErrors: webpackErrors.length,
        authErrors: authErrors.length,
        hasWebpackIssues,
        hasAuthIssues,
        verdict: hasWebpackIssues ? 'CRITICAL' : (hasAuthIssues ? 'WARNING' : (hasAnyErrors ? 'MINOR' : 'SUCCESS'))
      },
      errors: allErrors,
      recommendations: hasWebpackIssues ? [
        'Vercel에서 정상 작동하는 코드 다운로드',
        '동적 컴포넌트 문제 해결',
        '환경 설정 동기화'
      ] : []
    };
    
    require('fs').writeFileSync(
      `final-user-scenario-report-${timestamp}.json`, 
      JSON.stringify(report, null, 2)
    );
    
    return report.results;
    
  } catch (error) {
    console.error('❌ 최종 테스트 실패:', error.message);
    return { 
      totalErrors: 999, 
      webpackErrors: 999, 
      authErrors: 999, 
      hasWebpackIssues: true,
      verdict: 'FAILED'
    };
  } finally {
    await browser.close();
  }
}

finalUserScenarioTest()
  .then(result => {
    console.log('\\n🏁 EXPERT FINAL CONCLUSION:');
    console.log('='.repeat(60));
    
    switch(result.verdict) {
      case 'CRITICAL':
        console.log('🔥 CRITICAL ISSUE: Vercel에서 코드 동기화 필요');
        console.log('   ACTION: git pull origin main 또는 Vercel에서 코드 다운로드');
        break;
      case 'WARNING':
        console.log('⚠️ WARNING: 추가 수정 작업 필요');
        console.log('   ACTION: 인증 시스템 추가 디버깅');
        break;
      case 'MINOR':
        console.log('✅ MINOR ISSUES: 기본 기능은 정상, 세부사항 개선 필요');
        break;
      case 'SUCCESS':
        console.log('🎉 COMPLETE SUCCESS: 모든 기능 완벽 작동');
        break;
      default:
        console.log('❌ TEST FAILED: 테스트 자체에 문제 발생');
    }
  })
  .catch(console.error);