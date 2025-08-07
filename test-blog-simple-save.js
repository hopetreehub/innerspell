const { chromium } = require('playwright');

(async () => {
  console.log('🚀 블로그 간단 저장 테스트 - 포트 4000');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 관리자 페이지 접속
    console.log('1️⃣ 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 2. 블로그 관리 탭
    console.log('2️⃣ 블로그 관리 탭...');
    await page.click('button:has-text("블로그 관리")');
    await page.waitForTimeout(3000);
    
    // 3. 새 포스트 작성
    console.log('3️⃣ 새 포스트 작성...');
    await page.click('button:has-text("새 포스트")');
    await page.waitForTimeout(1000);
    
    // 4. 최소한의 데이터만 입력
    console.log('4️⃣ 데이터 입력...');
    await page.fill('input[placeholder*="제목을 입력하세요"]', '간단 테스트 포스트 ' + new Date().toLocaleTimeString());
    await page.fill('textarea:first-of-type', '간단한 테스트를 위한 요약입니다.');
    
    // 5. 스크롤하여 내용 필드 찾기
    await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"] .overflow-y-auto');
      if (modal) modal.scrollTop = 400;
    });
    await page.waitForTimeout(500);
    
    // 내용 입력 (두 번째 textarea)
    const textareas = await page.locator('textarea').all();
    if (textareas.length > 1) {
      await textareas[1].fill('간단한 테스트 내용입니다.');
    }
    
    await page.screenshot({ path: 'screenshots/blog-simple-save-01-filled.png', fullPage: true });
    
    // 6. 저장 버튼 클릭
    console.log('5️⃣ 저장...');
    const saveButton = await page.locator('button:has-text("저장")').last();
    await saveButton.click();
    
    // 저장 대기
    await page.waitForTimeout(3000);
    
    // 토스트 메시지 캡처
    const toastExists = await page.locator('[class*="toast"]').count() > 0;
    if (toastExists) {
      const toastText = await page.locator('[class*="toast"]').textContent();
      console.log('✅ 토스트 메시지:', toastText);
    }
    
    await page.screenshot({ path: 'screenshots/blog-simple-save-02-after-save.png', fullPage: true });
    
    // 7. 결과 확인
    console.log('6️⃣ 결과 확인...');
    
    // 모달이 닫혔는지 확인
    const modalClosed = await page.locator('[role="dialog"]').count() === 0;
    console.log('   모달 닫힘:', modalClosed ? '✅' : '❌');
    
    // 포스트 목록 확인
    const postExists = await page.locator('td:has-text("간단 테스트 포스트")').count() > 0;
    console.log('   목록에 표시:', postExists ? '✅' : '❌');
    
    // API 확인
    const apiResponse = await page.evaluate(async () => {
      const response = await fetch('http://localhost:4000/api/blog/posts');
      return await response.json();
    });
    
    console.log('\n📊 API 응답:');
    console.log('   총 포스트:', apiResponse.posts?.length || 0);
    console.log('   테스트 포스트 존재:', apiResponse.posts?.some(p => p.title.includes('간단 테스트')) ? '✅' : '❌');
    
    // 최종 결과
    console.log('\n📋 결과 요약:');
    console.log('- 포스트 작성 폼: ✅');
    console.log('- 데이터 입력: ✅');
    console.log(`- 저장: ${modalClosed ? '✅' : '❌'}`);
    console.log(`- 목록 표시: ${postExists ? '✅' : '❌'}`);
    console.log(`- API 확인: ${apiResponse.posts ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ 오류:', error.message);
    await page.screenshot({ path: 'screenshots/blog-simple-save-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ 테스트 완료');
  }
})();