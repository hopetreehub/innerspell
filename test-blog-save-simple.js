const { chromium } = require('playwright');

async function testBlogSaveSimple() {
  console.log('🚀 블로그 포스트 저장 기능 간단 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  try {
    const page = await browser.newPage();
    
    // API 응답 모니터링
    const apiCalls = [];
    page.on('response', response => {
      if (response.url().includes('/api/blog/posts') && response.request().method() === 'POST') {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        });
        console.log(`🔥 블로그 포스트 저장 API 호출 감지! Status: ${response.status()}`);
      }
    });
    
    // 1. 관리자 페이지 접속
    console.log('📍 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 2. 블로그 관리 탭
    console.log('📍 블로그 관리 탭 클릭...');
    await page.click('button:has-text("블로그 관리")');
    await page.waitForTimeout(1000);
    
    // 3. 새 포스트 버튼
    console.log('📍 새 포스트 모달 열기...');
    await page.click('button:has-text("새 포스트")');
    await page.waitForTimeout(1000);
    
    // 4. 필수 필드만 입력
    console.log('📍 필수 정보 입력...');
    
    // 제목
    await page.fill('input[placeholder="포스트 제목을 입력하세요"]', 'PM 테스트 - 저장 기능 검증');
    
    // 요약
    await page.fill('textarea[placeholder="포스트 요약을 입력하세요 (검색 결과에 표시됩니다)"]', 
      '블로그 저장 API 테스트');
    
    // 본문 - 페이지 아래로 스크롤 후 입력
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        const scrollContainer = dialog.querySelector('[class*="overflow-y"]') || dialog;
        scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
      }
    });
    await page.waitForTimeout(500);
    
    // MDX 에디터에 간단한 내용 입력
    const mdxEditor = page.locator('textarea').last();
    await mdxEditor.fill('# 테스트\n\n저장 기능 테스트 중입니다.');
    
    console.log('✅ 필수 정보 입력 완료');
    
    // 스크린샷
    await page.screenshot({ path: 'screenshots/blog-simple-before-save.png', fullPage: true });
    
    // 5. 저장 버튼 클릭
    console.log('📍 저장 버튼 찾기...');
    
    // 여러 방법으로 저장 버튼 찾기
    let saved = false;
    
    // 방법 1: "저장" 텍스트가 있는 버튼
    const saveBtn1 = page.locator('button:has-text("저장")').last();
    if (await saveBtn1.isVisible()) {
      console.log('✅ "저장" 버튼 발견!');
      await saveBtn1.click();
      saved = true;
    }
    
    // 방법 2: 모달 내 마지막 버튼들 중 하나
    if (!saved) {
      const modalButtons = await page.locator('[role="dialog"] button').all();
      for (let i = modalButtons.length - 1; i >= 0; i--) {
        const text = await modalButtons[i].textContent();
        if (text && (text.includes('저장') || text.includes('확인') || text.includes('생성'))) {
          console.log(`✅ "${text}" 버튼 클릭!`);
          await modalButtons[i].click();
          saved = true;
          break;
        }
      }
    }
    
    if (saved) {
      console.log('⏳ 저장 응답 대기 중...');
      await page.waitForTimeout(5000);
      
      // 결과 스크린샷
      await page.screenshot({ path: 'screenshots/blog-simple-after-save.png', fullPage: true });
      
      // API 호출 결과
      console.log('\n📊 API 호출 결과:');
      if (apiCalls.length > 0) {
        apiCalls.forEach(call => {
          console.log(`✅ ${call.method} ${call.url} : ${call.status}`);
        });
      } else {
        console.log('⚠️ POST API 호출이 감지되지 않았습니다.');
      }
      
      // 성공/실패 메시지 확인
      const messages = await page.locator('[role="alert"], [class*="toast"], [class*="message"]').allTextContents();
      if (messages.length > 0) {
        console.log('\n📢 시스템 메시지:');
        messages.forEach(msg => console.log(`  - ${msg}`));
      }
      
      // 모달이 닫혔는지 확인
      const modalClosed = !(await page.locator('[role="dialog"]').isVisible());
      console.log(`\n📍 모달 상태: ${modalClosed ? '닫힘 ✅' : '열려있음 ⚠️'}`);
      
      if (modalClosed) {
        // 포스트 목록 확인
        const newPost = await page.locator('text=/PM 테스트/').isVisible();
        console.log(`📍 포스트 목록에 표시: ${newPost ? '있음 ✅' : '없음 ⚠️'}`);
      }
    } else {
      console.log('❌ 저장 버튼을 찾을 수 없습니다!');
    }
    
    console.log('\n✅ 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    await page.screenshot({ path: 'screenshots/blog-simple-error.png', fullPage: true });
  } finally {
    console.log('\n브라우저를 열어둡니다. 네트워크 탭을 확인하세요.');
  }
}

testBlogSaveSimple();