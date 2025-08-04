const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🌐 포트 4000 접근 테스트 시작...\n');
    
    const testUrls = [
      'http://localhost:4000',
      'http://127.0.0.1:4000',
      'http://0.0.0.0:4000',
      'http://172.24.194.195:4000'
    ];
    
    for (const url of testUrls) {
      console.log(`📡 테스트 중: ${url}`);
      
      try {
        const startTime = Date.now();
        await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        const loadTime = Date.now() - startTime;
        
        const title = await page.title();
        console.log(`   ✅ 성공: ${loadTime}ms - "${title}"`);
        
        // 스크린샷 저장
        const filename = url.replace(/[^a-zA-Z0-9]/g, '_');
        await page.screenshot({ 
          path: `port-test-${filename}.png`, 
          fullPage: true 
        });
        
      } catch (error) {
        console.log(`   ❌ 실패: ${error.message}`);
      }
    }
    
    console.log('\n🔍 서버 정보:');
    console.log(`   - 프로세스 ID: 39822`);
    console.log(`   - 바인딩: 0.0.0.0:4000 (모든 인터페이스)`);
    console.log(`   - 로컬 IP: 172.24.194.195`);
    
    console.log('\n📋 접근 가능한 URL들:');
    console.log(`   🌐 로컬: http://localhost:4000`);
    console.log(`   🌐 루프백: http://127.0.0.1:4000`);
    console.log(`   🌐 네트워크: http://172.24.194.195:4000`);
    
    // 네트워크에서 접근 가능한지 테스트
    console.log('\n🌍 외부 접근 테스트:');
    try {
      await page.goto('http://172.24.194.195:4000', { 
        waitUntil: 'networkidle',
        timeout: 5000 
      });
      console.log('   ✅ 네트워크에서 접근 가능');
    } catch (error) {
      console.log('   ⚠️ 네트워크 접근 제한될 수 있음 (방화벽/WSL 설정)');
    }
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('테스트 에러:', error);
  } finally {
    await browser.close();
  }
})();