const { chromium } = require('playwright');

(async () => {
  console.log('블로그 포스트 모든 필수 필드 입력 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  try {
    // 1. 관리자 페이지 접속
    console.log('1. 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 2. 블로그 관리 탭 클릭
    console.log('2. 블로그 관리 탭 클릭...');
    const blogTab = await page.locator('button:has-text("블로그 관리")').first();
    await blogTab.click();
    await page.waitForTimeout(2000);
    
    // 3. 새 포스트 버튼 클릭
    console.log('3. 새 포스트 버튼 클릭...');
    const newPostButton = await page.locator('button:has-text("새 포스트")').first();
    await newPostButton.click();
    await page.waitForTimeout(2000);
    
    // 4. 모달 내부를 스크롤하여 모든 필드 확인
    console.log('4. 모든 필드 확인...');
    const modal = await page.locator('[role="dialog"]').first();
    
    // 모달 내부 스크롤
    await modal.evaluate(el => el.scrollTop = el.scrollHeight);
    await page.waitForTimeout(500);
    
    // 스크롤 후 스크린샷
    await page.screenshot({ 
      path: 'screenshots/form-scrolled.png',
      fullPage: true 
    });
    
    // 다시 맨 위로 스크롤
    await modal.evaluate(el => el.scrollTop = 0);
    await page.waitForTimeout(500);
    
    // 5. 필수 필드 입력
    console.log('5. 필수 필드 입력 시작...');
    
    // 제목 입력
    const titleInput = await page.locator('input#title').first();
    await titleInput.fill('CSRF 문제 해결 후 블로그 포스트 테스트');
    console.log('✓ 제목 입력 완료');
    
    // 요약 필드 찾기 (여러 방법으로 시도)
    const summarySelectors = [
      'input[placeholder*="요약"]',
      'input[name="summary"]',
      'input#summary',
      'textarea[placeholder*="요약"]',
      'input[type="text"]'
    ];
    
    let summaryFound = false;
    for (const selector of summarySelectors) {
      try {
        const summaryFields = await page.locator(selector).all();
        for (let i = 0; i < summaryFields.length; i++) {
          const field = summaryFields[i];
          const placeholder = await field.getAttribute('placeholder');
          const name = await field.getAttribute('name');
          
          // 제목 필드가 아니고, 검색 필드가 아닌 경우
          if (placeholder && !placeholder.includes('제목') && !placeholder.includes('검색') && 
              !placeholder.includes('태그') && !placeholder.includes('이메일')) {
            await field.fill('CSRF 토큰 문제가 해결되어 블로그 포스트를 정상적으로 저장할 수 있습니다.');
            console.log(`✓ 요약 입력 완료 (필드: ${placeholder || name})`);
            summaryFound = true;
            break;
          }
        }
        if (summaryFound) break;
      } catch (e) {
        // 다음 셀렉터 시도
      }
    }
    
    if (!summaryFound) {
      console.log('⚠️ 요약 필드를 찾지 못함 - 본문에서 자동 생성될 수 있음');
    }
    
    // 본문 입력
    const contentTextarea = await page.locator('textarea').first();
    await contentTextarea.fill(`# CSRF 문제 해결 완료!

이제 블로그 포스트를 정상적으로 저장할 수 있습니다.

## 해결 내용

1. CSRF 미들웨어에서 API 라우트 제외
2. 403 Forbidden 에러 해결
3. 정상적인 포스트 저장 가능

## 테스트 결과

- 제목, 요약, 본문 모두 정상 입력
- API 호출 성공
- 포스트 목록에 추가됨`);
    console.log('✓ 본문 입력 완료');
    
    // 입력 완료 후 스크린샷
    await page.screenshot({ 
      path: 'screenshots/all-fields-filled.png',
      fullPage: true 
    });
    
    // 6. 저장 시도
    console.log('\n6. 저장 버튼 클릭...');
    const saveButton = await page.locator('button:has-text("저장")').first();
    
    // 네트워크 응답 모니터링
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/blog/mdx-posts') && 
                  response.request().method() === 'POST',
      { timeout: 10000 }
    ).catch(() => null);
    
    await saveButton.click();
    console.log('저장 버튼 클릭됨');
    
    // 응답 확인
    const response = await responsePromise;
    if (response) {
      console.log(`\n🔍 API 응답 상태: ${response.status()}`);
      
      if (response.status() === 200 || response.status() === 201) {
        console.log('✅ 포스트 저장 성공!');
        try {
          const data = await response.json();
          console.log('저장된 포스트 정보:');
          console.log('- ID:', data.id);
          console.log('- 제목:', data.title);
          console.log('- 슬러그:', data.slug);
        } catch (e) {
          console.log('응답 데이터 파싱 실패');
        }
      } else {
        console.log('❌ 저장 실패');
        const errorText = await response.text();
        console.log('에러 응답:', errorText);
      }
    } else {
      console.log('⚠️ API 응답 없음 - 클라이언트 검증 실패');
      
      // 토스트 메시지 확인
      await page.waitForTimeout(1000);
      const toastTexts = await page.locator('[role="status"]').allTextContents();
      if (toastTexts.length > 0) {
        console.log('토스트 메시지:', toastTexts);
      }
    }
    
    // 7. 최종 결과 확인
    await page.waitForTimeout(3000);
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'screenshots/final-result.png',
      fullPage: true 
    });
    
    // 모달 상태 확인
    const modalStillOpen = await modal.isVisible();
    if (!modalStillOpen) {
      console.log('\n✅ 모달이 닫힘 - 저장 성공!');
      
      // 포스트 목록에서 확인
      const newPost = await page.locator('text="CSRF 문제 해결 후 블로그 포스트 테스트"').first();
      if (await newPost.isVisible()) {
        console.log('✅ 새 포스트가 목록에 표시됨!');
        
        // 목록 스크린샷
        await page.screenshot({ 
          path: 'screenshots/post-in-list.png',
          fullPage: true 
        });
      }
    } else {
      console.log('\n⚠️ 모달이 여전히 열려있음');
      
      // 에러 메시지 확인
      const errorMessages = await page.locator('.text-destructive').allTextContents();
      if (errorMessages.length > 0) {
        console.log('에러 메시지:', errorMessages);
      }
    }
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    
    await page.screenshot({ 
      path: 'screenshots/test-error-final.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n테스트 완료');
  }
})();