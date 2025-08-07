const { chromium } = require('playwright');
const path = require('path');

async function testBlogImageUpload() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // 개발자 도구 자동 열기
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 메시지 수집
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  // 네트워크 요청 모니터링
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure(),
      method: request.method()
    });
  });
  
  // 응답 모니터링 (CORS, CSRF 오류 확인)
  page.on('response', response => {
    if (response.status() === 403 || response.status() === 401) {
      console.log(`❌ ${response.status()} Error on: ${response.url()}`);
      console.log('Headers:', response.headers());
    }
  });
  
  try {
    console.log('1. 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/admin-page-initial.png' });
    
    // 블로그 관리 탭 클릭
    console.log('2. 블로그 관리 탭으로 이동...');
    await page.waitForTimeout(2000);
    const blogTab = await page.locator('button:has-text("블로그 관리")').first();
    await blogTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/blog-tab-open.png' });
    
    // 새 포스트 버튼 찾기
    console.log('3. 새 포스트 버튼 클릭...');
    const newPostButton = await page.locator('button:has-text("새 포스트")').first();
    if (await newPostButton.isVisible()) {
      await newPostButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/new-post-modal.png' });
      
      // 이미지 업로드 테스트
      console.log('4. 이미지 업로드 테스트...');
      
      // 테스트용 이미지 파일 생성
      const fs = require('fs');
      const testImagePath = path.join(__dirname, 'test-image.png');
      
      // 간단한 1x1 PNG 이미지 생성
      const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
        0x01, 0x01, 0x00, 0x00, 0x5B, 0xDC, 0x3A, 0x7D,
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
        0xAE, 0x42, 0x60, 0x82
      ]);
      fs.writeFileSync(testImagePath, pngData);
      
      // 파일 입력 찾기
      const fileInput = await page.locator('input[type="file"]').first();
      if (await fileInput.count() > 0) {
        console.log('파일 입력 요소 발견, 이미지 업로드 시도...');
        
        // 네트워크 탭 열기 (개발자 도구가 이미 열려있음)
        await page.keyboard.press('Control+Shift+I');
        await page.waitForTimeout(1000);
        
        // 파일 선택
        await fileInput.setInputFiles(testImagePath);
        await page.waitForTimeout(3000);
        
        // 업로드 후 스크린샷
        await page.screenshot({ path: 'screenshots/after-image-upload-attempt.png' });
        
        // 콘솔 로그 확인
        if (consoleLogs.length > 0) {
          console.log('\n📋 콘솔 로그:');
          consoleLogs.forEach(log => {
            console.log(`[${log.type}] ${log.text}`);
          });
        }
        
        // 네트워크 오류 확인
        if (networkErrors.length > 0) {
          console.log('\n❌ 네트워크 오류:');
          networkErrors.forEach(error => {
            console.log(`Failed: ${error.method} ${error.url}`);
            console.log(`Reason: ${error.failure?.errorText}`);
          });
        }
      } else {
        console.log('⚠️ 파일 입력 요소를 찾을 수 없습니다.');
        
        // 에디터 내부의 이미지 버튼 찾기
        const imageButton = await page.locator('button[title*="이미지"], button[aria-label*="이미지"], button:has-text("이미지")').first();
        if (await imageButton.count() > 0) {
          console.log('에디터 내 이미지 버튼 발견');
          await imageButton.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: 'screenshots/image-button-clicked.png' });
        }
      }
      
      // 포스트 저장 테스트 (CSRF 토큰 오류 확인)
      console.log('\n5. 포스트 저장 테스트...');
      
      // 제목과 내용 입력
      const titleInput = await page.locator('input[placeholder*="제목"], input[name="title"]').first();
      if (await titleInput.count() > 0) {
        await titleInput.fill('테스트 포스트 - CSRF 검증');
      }
      
      // 내용 입력 (에디터 찾기)
      const contentEditor = await page.locator('[contenteditable="true"], textarea[name="content"], .editor-content').first();
      if (await contentEditor.count() > 0) {
        await contentEditor.click();
        await contentEditor.fill('테스트 내용입니다. CSRF 토큰 검증을 테스트합니다.');
      }
      
      // 저장 버튼 찾기
      const saveButton = await page.locator('button:has-text("저장"), button:has-text("게시"), button:has-text("발행")').first();
      if (await saveButton.count() > 0) {
        console.log('저장 버튼 클릭 전 스크린샷...');
        await page.screenshot({ path: 'screenshots/before-save-click.png' });
        
        // 저장 버튼 클릭
        await saveButton.click();
        await page.waitForTimeout(3000);
        
        // 저장 후 스크린샷
        await page.screenshot({ path: 'screenshots/after-save-attempt.png' });
        
        // 오류 메시지 확인
        const errorMessage = await page.locator('.error, .alert-error, [role="alert"]').first();
        if (await errorMessage.count() > 0) {
          const errorText = await errorMessage.textContent();
          console.log('❌ 오류 메시지:', errorText);
        }
      }
      
      // 테스트 이미지 삭제
      fs.unlinkSync(testImagePath);
      
    } else {
      console.log('⚠️ 새 포스트 버튼을 찾을 수 없습니다.');
      
      // 페이지 구조 확인
      const pageContent = await page.content();
      console.log('현재 페이지에 있는 버튼들:');
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const text = await button.textContent();
        console.log(`- ${text}`);
      }
    }
    
    // 최종 콘솔 로그 요약
    console.log('\n📊 최종 진단:');
    console.log(`- 콘솔 오류 수: ${consoleLogs.filter(log => log.type === 'error').length}`);
    console.log(`- 네트워크 실패 수: ${networkErrors.length}`);
    
    // 30초 대기 (수동 확인용)
    console.log('\n브라우저를 30초간 열어둡니다. 개발자 도구에서 직접 확인하세요...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'screenshots/error-state.png' });
  } finally {
    await browser.close();
  }
}

testBlogImageUpload();