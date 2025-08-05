/**
 * Firebase Development Fallback 테스트 스크립트
 * 
 * Firebase 없이도 애플리케이션이 정상 작동하는지 확인
 */

const { chromium } = require('playwright');

async function testFirebaseFallback() {
  console.log('🔧 Firebase Development Fallback 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('1. 개발 모드 감지 테스트...');
    
    // 개발 모드 로깅을 캐치하기 위한 리스너
    const developmentLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('[DEV-FALLBACK]')) {
        developmentLogs.push(msg.text());
        console.log('   📝', msg.text());
      }
    });
    
    console.log('2. 홈페이지 로딩...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const title = await page.title();
    console.log(`   ✅ 페이지 로드: ${title}`);
    
    await page.screenshot({ path: 'fallback-test-01-homepage.png' });
    
    console.log('\n3. 관리자 페이지 접근 테스트...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000); // Firebase 요청 시간 대기
    
    // Firebase 에러 메시지 대신 fallback 데이터가 표시되는지 확인
    const pageContent = await page.textContent('body');
    const hasFirebaseError = pageContent.includes('Missing or insufficient permissions');
    const hasData = pageContent.includes('카테고리') || pageContent.includes('AI 제공자');
    
    console.log(`   Firebase 에러 존재: ${hasFirebaseError ? '❌' : '✅'}`);
    console.log(`   Fallback 데이터 존재: ${hasData ? '✅' : '❌'}`);
    
    await page.screenshot({ path: 'fallback-test-02-admin-page.png' });
    
    console.log('\n4. 개발 모드 로그 확인...');
    console.log(`   개발 모드 로그 수: ${developmentLogs.length}`);
    
    if (developmentLogs.length > 0) {
      console.log('   🟢 개발 모드 Fallback 작동 중');
    } else {
      console.log('   🟡 개발 모드 로그 미발견 (Firebase 정상 작동 중이거나 로그 미표시)');
    }
    
    console.log('\n5. API 엔드포인트 테스트...');
    
    // 카테고리 API 테스트
    try {
      const categoryResponse = await page.evaluate(async () => {
        const response = await fetch('/api/categories');
        return {
          status: response.status,
          ok: response.ok,
          text: await response.text()
        };
      });
      
      console.log(`   카테고리 API: HTTP ${categoryResponse.status} ${categoryResponse.ok ? '✅' : '❌'}`);
      
      if (categoryResponse.ok) {
        const data = JSON.parse(categoryResponse.text);
        console.log(`   카테고리 데이터 수: ${Array.isArray(data) ? data.length : 'N/A'}`);
      }
    } catch (error) {
      console.log(`   카테고리 API 에러: ${error.message}`);
    }
    
    // 관리자 통계 API 테스트 (개발 모드에서는 작동해야 함)
    try {
      const statsResponse = await page.evaluate(async () => {
        const response = await fetch('/api/admin/stats');
        return {
          status: response.status,
          ok: response.ok
        };
      });
      
      console.log(`   관리자 통계 API: HTTP ${statsResponse.status} ${statsResponse.ok ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`   관리자 통계 API 에러: ${error.message}`);
    }
    
    await page.screenshot({ path: 'fallback-test-03-final-state.png' });
    
    console.log('\n📊 테스트 결과 요약:');
    console.log('═══════════════════════════════════════');
    console.log(`   🟢 홈페이지 로딩: 성공`);
    console.log(`   🟢 관리자 페이지: ${hasData ? '데이터 표시됨' : '데이터 없음'}`);
    console.log(`   🟢 Firebase 에러: ${hasFirebaseError ? '존재 (정상 - fallback 필요)' : '없음'}`);
    console.log(`   🟢 개발 모드 로그: ${developmentLogs.length}개`);
    
    if (!hasFirebaseError && hasData) {
      console.log('\n   ✅ Firebase Development Fallback이 성공적으로 작동하고 있습니다!');
    } else if (hasFirebaseError && !hasData) {
      console.log('\n   ⚠️  Firebase 에러가 있지만 fallback 데이터가 표시되지 않습니다.');
      console.log('      - 컴포넌트에서 에러 처리가 필요할 수 있습니다.');
    } else {
      console.log('\n   ℹ️  Firebase가 정상 작동 중이거나 다른 인증 시스템을 사용 중입니다.');
    }
    
  } catch (error) {
    console.error('\n❌ 테스트 중 에러 발생:', error.message);
    await page.screenshot({ path: 'fallback-test-error.png' });
  }
  
  await browser.close();
  console.log('\n🔧 Firebase Development Fallback 테스트 완료!');
}

// 서버가 실행 중인지 확인 후 테스트 실행
async function checkServerAndTest() {
  try {
    const response = await fetch('http://localhost:4000');
    if (response.ok) {
      console.log('✅ 서버가 실행 중입니다. 테스트를 시작합니다.\n');
      await testFirebaseFallback();
    } else {
      console.log('❌ 서버 응답 에러. 포트 4000에서 서버를 시작하세요.');
    }
  } catch (error) {
    console.log('❌ 서버에 연결할 수 없습니다. 포트 4000에서 서버를 시작하세요.');
    console.log('   명령어: npm run dev');
  }
}

// 테스트 실행
checkServerAndTest();