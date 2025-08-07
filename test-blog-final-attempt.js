const { chromium } = require('playwright');

(async () => {
  console.log('🚀 블로그 포스트 최종 저장 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 네트워크 모니터링
  page.on('response', async response => {
    if (response.url().includes('/api/blog/mdx-posts') && response.request().method() === 'POST') {
      console.log(`\n📡 POST API 응답: ${response.status()}`);
      if (response.status() === 200 || response.status() === 201) {
        try {
          const data = await response.json();
          console.log('✅ 저장 성공! 포스트 ID:', data.id || 'N/A');
        } catch (e) {
          console.log('✅ 저장 성공! (응답 파싱 실패)');
        }
      } else if (response.status() === 403) {
        console.log('❌ 403 Forbidden - CSRF 문제 재발생');
      } else {
        console.log('❌ 저장 실패');
      }
    }
  });

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
    
    // 4. 필수 필드 정확히 입력
    console.log('4. 필수 필드 입력...');
    
    // 제목 입력 (첫 번째 input)
    const titleInput = await page.locator('input#title').first();
    await titleInput.fill('CSRF 해결 후 블로그 포스트 저장 테스트');
    console.log('✓ 제목 입력');
    
    // 요약 입력 (첫 번째 textarea)
    const summaryTextarea = await page.locator('textarea').first();
    await summaryTextarea.fill('CSRF 토큰 문제를 해결한 후 블로그 포스트 저장 기능이 정상 작동하는지 확인하는 테스트입니다.');
    console.log('✓ 요약 입력');
    
    // 본문 입력 (두 번째 textarea)  
    const contentTextarea = await page.locator('textarea').nth(1);
    await contentTextarea.fill(`# CSRF 문제 해결 완료!

미들웨어 설정을 수정하여 CSRF 토큰 문제를 해결했습니다.

## 변경사항
- API 라우트에서 CSRF 검증 제외
- 403 Forbidden 에러 해결
- 블로그 포스트 저장 기능 정상화

## 테스트 결과
모든 필수 필드를 입력하고 저장이 성공적으로 완료되었습니다.`);
    console.log('✓ 본문 입력');
    
    // 입력 완료 후 잠시 대기
    await page.waitForTimeout(1000);
    
    // 입력 완료 스크린샷
    await page.screenshot({ 
      path: 'screenshots/ready-to-save.png',
      fullPage: true 
    });
    
    // 5. 저장 버튼 클릭
    console.log('\n5. 저장 버튼 클릭...');
    const saveButton = await page.locator('button:has-text("저장")').first();
    await saveButton.click();
    console.log('저장 버튼 클릭 완료');
    
    // 6. 결과 대기
    await page.waitForTimeout(5000);
    
    // 최종 결과 스크린샷
    await page.screenshot({ 
      path: 'screenshots/save-final-result.png',
      fullPage: true 
    });
    
    // 7. 모달 상태 확인
    const modal = await page.locator('[role="dialog"]').first();
    const isModalVisible = await modal.isVisible();
    
    if (!isModalVisible) {
      console.log('\n🎉 모달 닫힘 - 저장 성공 추정!');
      
      // 포스트 목록에서 확인
      await page.waitForTimeout(2000);
      const newPost = await page.locator('text="CSRF 해결 후 블로그 포스트 저장 테스트"').first();
      if (await newPost.isVisible()) {
        console.log('✅ 새 포스트가 목록에 표시됨!');
        
        // 성공 스크린샷
        await page.screenshot({ 
          path: 'screenshots/success-post-in-list.png',
          fullPage: true 
        });
      } else {
        console.log('⚠️ 포스트가 목록에 보이지 않음');
      }
    } else {
      console.log('\n⚠️ 모달이 여전히 열려있음');
      
      // 토스트 메시지 확인
      const toastMessages = await page.locator('[role="status"]').allTextContents();
      if (toastMessages.length > 0) {
        console.log('토스트 메시지:', toastMessages.join(', '));
      }
      
      // 에러 메시지 확인
      const errorElements = await page.locator('.text-destructive, .text-red-500').allTextContents();
      if (errorElements.length > 0) {
        console.log('에러 메시지:', errorElements.join(', '));
      }
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
    
    await page.screenshot({ 
      path: 'screenshots/final-test-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n🏁 테스트 완료');
  }
})();