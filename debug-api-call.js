const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🔍 API 호출 디버깅...\n');
  
  try {
    // 1. 브라우저에서 직접 API 테스트
    await page.goto('http://localhost:4000/blog');
    
    const apiResult = await page.evaluate(async () => {
      try {
        console.log('📝 블로그 포스트 가져오기 시작...');
        
        const response = await fetch('/api/blog/posts');
        console.log('📡 API 응답 상태:', response.status);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📋 받은 데이터:', data);
        
        return {
          success: true,
          status: response.status,
          data: data,
          postsCount: data.posts?.length || 0
        };
      } catch (error) {
        console.error('❌ API 호출 실패:', error);
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    console.log('🎯 API 테스트 결과:', apiResult);
    
    if (apiResult.success && apiResult.postsCount > 0) {
      console.log('✅ API는 정상 작동, 프론트엔드 컴포넌트 문제일 수 있음');
      
      // 개발자 도구 콘솔 로그 확인
      page.on('console', msg => {
        console.log('📟 브라우저 콘솔:', msg.text());
      });
      
      // 페이지 새로고침
      await page.reload();
      await page.waitForTimeout(5000);
      
    } else {
      console.log('❌ API 호출 실패');
    }
    
    setTimeout(() => {
      browser.close();
    }, 3000);
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
    await browser.close();
  }
})();