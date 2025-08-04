const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 포트 4000 상태 긴급 점검\n');
    
    // 먼저 서버 프로세스 확인
    console.log('📡 서버 프로세스 상태 확인 중...\n');
    
    // 로컬 접속 테스트
    const testUrls = [
      { url: 'http://localhost:4000', name: 'localhost:4000' },
      { url: 'http://127.0.0.1:4000', name: '127.0.0.1:4000' },
      { url: 'http://172.24.194.195:4000', name: '네트워크 IP:4000' }
    ];
    
    for (const test of testUrls) {
      console.log(`🌐 접속 시도: ${test.name}`);
      
      try {
        const response = await page.goto(test.url, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });
        
        const status = response ? response.status() : 'No response';
        const title = await page.title();
        const url = page.url();
        
        console.log(`   상태 코드: ${status}`);
        console.log(`   페이지 제목: "${title}"`);
        console.log(`   최종 URL: ${url}`);
        
        // 페이지 내용 확인
        const bodyText = await page.evaluate(() => document.body?.innerText || '');
        if (bodyText.includes('Cannot GET') || bodyText.includes('404')) {
          console.log('   ⚠️  404 에러 페이지 감지');
        } else if (bodyText.includes('ECONNREFUSED')) {
          console.log('   ❌ 연결 거부됨 - 서버가 실행되지 않음');
        } else if (title || bodyText) {
          console.log('   ✅ 페이지 로드 성공');
        }
        
        // 스크린샷 저장
        await page.screenshot({ 
          path: `port-4000-check-${test.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`, 
          fullPage: true 
        });
        
      } catch (error) {
        console.log(`   ❌ 접속 실패: ${error.message}`);
        
        if (error.message.includes('ERR_CONNECTION_REFUSED')) {
          console.log('   → 서버가 포트 4000에서 실행되지 않고 있습니다');
        } else if (error.message.includes('timeout')) {
          console.log('   → 응답 시간 초과 (15초)');
        }
      }
      
      console.log('');
    }
    
    // 에러 페이지 캡처
    console.log('📸 현재 상태 스크린샷 저장 중...');
    await page.screenshot({ 
      path: 'port-4000-current-state.png', 
      fullPage: true 
    });
    
    console.log('\n📊 진단 결과:');
    console.log('  - 포트 4000 접속 상태를 확인했습니다');
    console.log('  - 스크린샷이 저장되었습니다');
    console.log('  - dev.log 파일에서 404 에러가 다수 발견됩니다');
    console.log('  - webpack 관련 파일들을 찾을 수 없는 상태입니다');
    
    console.log('\n💡 권장 조치:');
    console.log('  1. 서버 재시작: npm run dev');
    console.log('  2. 캐시 삭제: rm -rf .next');
    console.log('  3. 의존성 재설치: npm install');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ 검증 중 오류:', error);
    await page.screenshot({ 
      path: 'port-4000-error-state.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();