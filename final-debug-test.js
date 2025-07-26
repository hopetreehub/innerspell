const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🔍 최종 디버깅 테스트...\n');
  
  try {
    // 1. 로그 캐치 설정
    const logs = [];
    page.on('console', msg => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
      console.log(`📟 [${msg.type()}] ${msg.text()}`);
    });
    
    // 2. 블로그 페이지 접속
    console.log('1️⃣ 블로그 페이지 접속...');
    await page.goto('http://localhost:4000/blog');
    
    // 3. 10초 대기
    console.log('2️⃣ 10초 대기...');
    await page.waitForTimeout(10000);
    
    // 4. 우리가 추가한 로그 메시지 확인
    const hasOurLogs = logs.some(log => log.includes('📝 블로그 포스트 가져오기 시작'));
    console.log(`3️⃣ 우리 디버그 로그 발견: ${hasOurLogs ? '✅' : '❌'}`);
    
    // 5. 페이지 콘텐츠 확인
    const hasTestPost = await page.locator('text=프론트엔드 테스트용 블로그 글').count() > 0;
    console.log(`4️⃣ 테스트 블로그 글 표시: ${hasTestPost ? '✅' : '❌'}`);
    
    // 6. 디버그 로그가 없다면 수동으로 API 호출 테스트
    if (!hasOurLogs) {
      console.log('5️⃣ 컴포넌트 로드 안됨, 수동 API 테스트...');
      
      const manualTest = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/blog/posts');
          const data = await response.json();
          return {
            success: true,
            posts: data.posts || [],
            count: data.posts?.length || 0
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });
      
      console.log('📊 수동 테스트 결과:', manualTest);
    }
    
    // 7. 스크린샷
    await page.screenshot({ path: 'final-debug-result.png', fullPage: true });
    
    // 8. 모든 로그 출력
    console.log('\n📋 모든 브라우저 로그:');
    logs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log}`);
    });
    
    setTimeout(() => {
      browser.close();
    }, 5000);
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
    await browser.close();
  }
})();