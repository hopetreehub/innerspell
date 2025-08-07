const { chromium } = require('playwright');

(async () => {
  console.log('블로그 포스트 저장 디버깅 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 메시지 로깅
  page.on('console', msg => {
    console.log('브라우저 콘솔:', msg.type(), msg.text());
  });

  try {
    // 1. 관리자 페이지 접속
    console.log('1. 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.screenshot({ 
      path: 'screenshots/admin-loaded.png',
      fullPage: true 
    });
    console.log('관리자 페이지 스크린샷 저장됨');
    
    // 2. 블로그 관리 탭 찾기
    console.log('2. 블로그 관리 탭 확인...');
    await page.waitForTimeout(2000);
    
    // 다양한 셀렉터로 블로그 탭 찾기
    const blogTabSelectors = [
      'button:has-text("블로그 관리")',
      'button:has-text("블로그")',
      '[role="tab"]:has-text("블로그")',
      'button[data-state="active"]:has-text("블로그")',
      'button[data-state="inactive"]:has-text("블로그")'
    ];
    
    let blogTab = null;
    for (const selector of blogTabSelectors) {
      try {
        blogTab = await page.locator(selector).first();
        if (await blogTab.isVisible()) {
          console.log(`블로그 탭 발견: ${selector}`);
          break;
        }
      } catch (e) {
        // 다음 셀렉터 시도
      }
    }
    
    if (blogTab) {
      await blogTab.click();
      console.log('블로그 탭 클릭됨');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'screenshots/blog-tab-clicked.png',
        fullPage: true 
      });
      console.log('블로그 탭 클릭 후 스크린샷 저장됨');
    } else {
      console.log('블로그 탭을 찾을 수 없습니다');
    }
    
    // 3. 새 포스트 버튼 찾기
    console.log('3. 새 포스트 버튼 확인...');
    const newPostSelectors = [
      'button:has-text("새 포스트")',
      'button:has-text("새 글")',
      'button:has-text("작성")',
      'button:has-text("추가")',
      'button:has-text("New Post")',
      'button:has-text("+")'
    ];
    
    let newPostButton = null;
    for (const selector of newPostSelectors) {
      try {
        newPostButton = await page.locator(selector).first();
        if (await newPostButton.isVisible()) {
          console.log(`새 포스트 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {
        // 다음 셀렉터 시도
      }
    }
    
    if (newPostButton) {
      await newPostButton.click();
      console.log('새 포스트 버튼 클릭됨');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'screenshots/new-post-form.png',
        fullPage: true 
      });
      console.log('새 포스트 폼 스크린샷 저장됨');
      
      // 4. 폼 필드 찾기
      console.log('4. 폼 필드 확인...');
      
      // 모든 input 필드 확인
      const inputs = await page.locator('input').all();
      console.log(`발견된 input 필드 수: ${inputs.length}`);
      
      for (let i = 0; i < inputs.length; i++) {
        const placeholder = await inputs[i].getAttribute('placeholder');
        const name = await inputs[i].getAttribute('name');
        const id = await inputs[i].getAttribute('id');
        console.log(`Input ${i}: placeholder="${placeholder}", name="${name}", id="${id}"`);
      }
      
      // 모든 textarea 필드 확인
      const textareas = await page.locator('textarea').all();
      console.log(`발견된 textarea 필드 수: ${textareas.length}`);
      
      // 실제 필드 입력 시도
      console.log('5. 필드 입력 시도...');
      
      // 제목 입력
      const titleInput = await page.locator('input').first();
      if (await titleInput.isVisible()) {
        await titleInput.fill('CSRF 수정 후 테스트');
        console.log('제목 입력 완료');
      }
      
      // 요약 입력 (두 번째 input)
      const summaryInput = await page.locator('input').nth(1);
      if (await summaryInput.isVisible()) {
        await summaryInput.fill('미들웨어 수정 후 포스트 저장 테스트');
        console.log('요약 입력 완료');
      }
      
      // 본문 입력
      const contentTextarea = await page.locator('textarea').first();
      if (await contentTextarea.isVisible()) {
        await contentTextarea.fill('# 성공!\n\nCSRF 문제가 해결되었습니다.');
        console.log('본문 입력 완료');
      }
      
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'screenshots/form-filled-debug.png',
        fullPage: true 
      });
      console.log('폼 입력 후 스크린샷 저장됨');
      
      // 6. 저장 버튼 찾기
      console.log('6. 저장 버튼 확인...');
      const saveSelectors = [
        'button:has-text("저장")',
        'button:has-text("Save")',
        'button[type="submit"]',
        'button:has-text("포스트 저장")',
        'button:has-text("발행")'
      ];
      
      let saveButton = null;
      for (const selector of saveSelectors) {
        try {
          saveButton = await page.locator(selector).first();
          if (await saveButton.isVisible()) {
            console.log(`저장 버튼 발견: ${selector}`);
            break;
          }
        } catch (e) {
          // 다음 셀렉터 시도
        }
      }
      
      if (saveButton) {
        // 네트워크 응답 대기
        const [response] = await Promise.all([
          page.waitForResponse(response => 
            response.url().includes('/api/') && 
            response.request().method() === 'POST',
            { timeout: 10000 }
          ).catch(() => null),
          saveButton.click()
        ]);
        
        console.log('저장 버튼 클릭됨');
        
        if (response) {
          console.log(`API 응답: ${response.url()} - 상태: ${response.status()}`);
          if (response.status() === 200 || response.status() === 201) {
            console.log('✅ 저장 성공!');
          } else {
            console.log('❌ 저장 실패');
            const responseText = await response.text();
            console.log('응답:', responseText);
          }
        }
        
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: 'screenshots/save-result-debug.png',
          fullPage: true 
        });
        console.log('저장 결과 스크린샷 저장됨');
      }
    }
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    
    await page.screenshot({ 
      path: 'screenshots/error-debug.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('테스트 완료');
  }
})();