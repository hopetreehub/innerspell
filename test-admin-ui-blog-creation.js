const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 네트워크 모니터링
  page.on('request', request => {
    if (request.url().includes('/api/blog/posts') && request.method() === 'POST') {
      console.log(`📡 POST 요청: ${request.url()}`);
      const headers = request.headers();
      console.log('🔑 헤더 확인:');
      console.log('  - x-api-secret:', headers['x-api-secret'] ? '있음' : '없음');
      console.log('  - x-csrf-token:', headers['x-csrf-token'] ? '있음' : '없음');
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/blog/posts') && response.request().method() === 'POST') {
      console.log(`📡 응답: ${response.status()} ${response.statusText()}`);
    }
  });
  
  console.log('🎯 관리자 UI로 블로그 작성 테스트...\n');
  
  try {
    // 1. 로그인
    console.log('1️⃣ 관리자 로그인...');
    await page.goto('http://localhost:4000/sign-in', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    
    const devButton = await page.$('button:has-text("관리자로 로그인")');
    if (devButton) {
      await devButton.click();
      await page.waitForTimeout(3000);
      await page.reload();
      await page.waitForTimeout(2000);
    }
    
    // 2. 관리자 페이지로 이동
    console.log('2️⃣ 관리자 대시보드 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 3. 블로그 관리 탭 클릭
    console.log('3️⃣ 블로그 관리 탭 선택...');
    const blogTab = await page.$('button[role="tab"]:has-text("블로그 관리")');
    if (blogTab) {
      await blogTab.click();
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'admin-ui-01-blog-tab.png', fullPage: true });
    
    // 4. 기존 블로그 글 목록 확인
    console.log('4️⃣ 기존 블로그 글 확인...');
    const existingPosts = await page.$$eval('table tbody tr', rows => 
      rows.map(row => {
        const cells = row.querySelectorAll('td');
        return cells[0]?.textContent?.trim() || '';
      }).filter(title => title)
    );
    
    console.log(`📝 기존 블로그 글: ${existingPosts.length}개`);
    existingPosts.forEach((title, index) => {
      console.log(`   ${index + 1}. ${title}`);
    });
    
    // 5. 새 포스트 작성
    console.log('5️⃣ 새 포스트 작성...');
    const newPostButton = await page.$('button:has-text("새 포스트")');
    if (newPostButton) {
      await newPostButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 6. 폼 작성
    console.log('6️⃣ 블로그 폼 작성...');
    
    // 제목
    const titleInput = await page.$('input[placeholder*="제목"]');
    if (titleInput) {
      await titleInput.fill('관리자 UI 테스트 - CSRF 수정 완료');
      console.log('✅ 제목 입력');
    }
    
    // 요약
    const excerptInput = await page.$('textarea[placeholder*="요약"]');
    if (excerptInput) {
      await excerptInput.fill('관리자 UI에서 CSRF 문제가 해결되었는지 확인하는 테스트 글입니다.');
      console.log('✅ 요약 입력');
    }
    
    // 본문
    const contentInput = await page.$('textarea[placeholder*="내용"]');
    if (contentInput) {
      const content = `# 관리자 UI 테스트 성공!

## CSRF 문제 해결 확인

이 글은 관리자 UI를 통해 정상적으로 작성된 테스트 글입니다.

### 해결된 문제들:
- ✅ CSRF 토큰 문제 해결
- ✅ API Secret 헤더 자동 추가
- ✅ 블로그 저장 기능 복구

### 테스트 정보:
- 작성 시간: ${new Date().toLocaleString('ko-KR')}
- 작성 방법: 관리자 UI (브라우저)
- 인증 방식: API Secret 헤더

이제 블로그 작성이 정상적으로 작동합니다! 🎉`;
      
      await contentInput.fill(content);
      console.log('✅ 본문 입력');
    }
    
    // 태그
    const tagsInput = await page.$('input[placeholder*="태그"]');
    if (tagsInput) {
      await tagsInput.fill('테스트, CSRF수정, 관리자UI, 블로그');
      console.log('✅ 태그 입력');
    }
    
    // 발행 체크박스
    const publishCheckbox = await page.$('input[type="checkbox"][name="published"]');
    if (publishCheckbox) {
      await publishCheckbox.check();
      console.log('✅ 발행 상태 체크');
    }
    
    await page.screenshot({ path: 'admin-ui-02-form-filled.png', fullPage: true });
    
    // 7. 저장
    console.log('7️⃣ 블로그 글 저장...');
    const saveButton = await page.$('button:has-text("저장")');
    if (saveButton) {
      await saveButton.click();
      console.log('⏳ 저장 버튼 클릭됨...');
      
      // 응답 대기
      await page.waitForTimeout(5000);
      
      // 성공 메시지 확인
      const successMessage = await page.$('.toast, [role="alert"], text=/성공|완료|저장/i');
      if (successMessage) {
        const messageText = await successMessage.textContent();
        console.log(`✅ 성공 메시지: ${messageText}`);
      } else {
        console.log('⚠️ 성공 메시지를 찾을 수 없음');
      }
      
      await page.screenshot({ path: 'admin-ui-03-after-save.png', fullPage: true });
    }
    
    // 8. 결과 확인
    console.log('8️⃣ 저장 결과 확인...');
    
    // 대화상자가 닫혔는지 확인
    const dialog = await page.$('[role="dialog"]');
    if (!dialog) {
      console.log('✅ 대화상자가 닫혔습니다 (저장 성공 표시)');
    } else {
      console.log('⚠️ 대화상자가 여전히 열려있습니다');
    }
    
    // 목록 새로고침 후 확인
    await page.waitForTimeout(2000);
    const updatedPosts = await page.$$eval('table tbody tr', rows => 
      rows.map(row => {
        const cells = row.querySelectorAll('td');
        return cells[0]?.textContent?.trim() || '';
      }).filter(title => title)
    );
    
    console.log(`📝 업데이트된 블로그 글: ${updatedPosts.length}개`);
    
    if (updatedPosts.includes('관리자 UI 테스트 - CSRF 수정 완료')) {
      console.log('🎉 성공! 새 글이 목록에 표시됩니다!');
    } else {
      console.log('❌ 새 글이 목록에 표시되지 않습니다');
      console.log('현재 목록:', updatedPosts);
    }
    
    // 9. API로도 확인
    console.log('9️⃣ API로 최종 확인...');
    await page.goto('http://localhost:4000/api/blog/posts');
    const apiResponse = await page.textContent('body');
    
    if (apiResponse.includes('관리자 UI 테스트')) {
      console.log('✅ API에서도 새 글 확인됨!');
    } else {
      console.log('❌ API에서 새 글을 찾을 수 없음');
    }
    
    await page.screenshot({ path: 'admin-ui-04-api-check.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await page.screenshot({ path: 'admin-ui-error.png', fullPage: true });
  } finally {
    console.log('\n🎯 관리자 UI 테스트 완료!');
    console.log('브라우저를 열어두었습니다. 확인 후 닫아주세요.');
  }
})();