const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 네트워크 요청 모니터링
  page.on('request', request => {
    if (request.url().includes('/api/blog/posts') && request.method() === 'POST') {
      console.log(`📡 POST 요청: ${request.url()}`);
      console.log('📝 헤더:', request.headers());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/blog/posts') && response.request().method() === 'POST') {
      console.log(`📡 POST 응답: ${response.status()}`);
    }
  });
  
  console.log('🎯 최종 블로그 저장 테스트...\n');
  
  try {
    // 간단히 기다린 후 테스트
    console.log('⏳ 서버 준비 대기...');
    await page.waitForTimeout(10000);
    
    // 로그인
    console.log('1️⃣ 로그인...');
    await page.goto('http://localhost:4000/sign-in', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    const devButton = await page.$('button:has-text("관리자로 로그인")');
    if (devButton) {
      await devButton.click();
      await page.waitForTimeout(5000);
      await page.reload();
      await page.waitForTimeout(3000);
    }
    
    // 관리자 페이지
    console.log('2️⃣ 관리자 페이지...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    const blogTab = await page.$('button[role="tab"]:has-text("블로그 관리")');
    if (blogTab) {
      await blogTab.click();
      await page.waitForTimeout(2000);
    }
    
    // 새 글 작성
    console.log('3️⃣ 새 글 작성...');
    const newPostButton = await page.$('button:has-text("새 포스트")');
    if (newPostButton) {
      await newPostButton.click();
      await page.waitForTimeout(3000);
    }
    
    // 폼 채우기
    console.log('4️⃣ 폼 채우기...');
    await page.fill('input[placeholder*="제목"]', '최종 테스트 - API Secret 사용');
    await page.fill('textarea[placeholder*="요약"]', 'API Secret을 사용한 최종 블로그 저장 테스트입니다.');
    await page.fill('textarea[placeholder*="내용"]', `# 최종 테스트

API Secret을 사용해서 CSRF 문제를 우회하는 테스트입니다.

시간: ${new Date().toLocaleString('ko-KR')}`);
    
    // 저장
    console.log('5️⃣ 저장...');
    const saveButton = await page.$('button:has-text("저장")');
    if (saveButton) {
      await saveButton.click();
      await page.waitForTimeout(8000);
    }
    
    // 결과 확인
    console.log('6️⃣ 결과 확인...');
    await page.goto('http://localhost:4000/api/blog/posts');
    const result = await page.textContent('body');
    
    if (result.includes('최종 테스트')) {
      console.log('🎉 성공! 블로그 글이 저장되었습니다!');
    } else {
      console.log('❌ 실패: 블로그 글이 저장되지 않았습니다.');
      console.log('API 응답:', result.substring(0, 200));
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    console.log('\n✅ 테스트 완료!');
  }
})();