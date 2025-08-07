const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testBlogDetailed() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    slowMo: 500 // 액션 사이 500ms 대기
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 모든 오류와 네트워크 요청 추적
  const allLogs = [];
  const networkRequests = [];
  
  // 콘솔 로그 수집
  page.on('console', msg => {
    const log = {
      type: 'console',
      level: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    allLogs.push(log);
    console.log(`[${log.level.toUpperCase()}] ${log.text}`);
  });
  
  // 네트워크 요청/응답 모니터링
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      networkRequests.push({
        type: 'request',
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      const responseData = {
        type: 'response',
        status: response.status(),
        url: response.url(),
        headers: response.headers(),
        timestamp: new Date().toISOString()
      };
      networkRequests.push(responseData);
      
      if (response.status() >= 400) {
        console.log(`❌ HTTP ${response.status()}: ${response.url()}`);
        console.log('Response Headers:', response.headers());
      }
    }
  });
  
  try {
    console.log('=== 블로그 이미지 업로드 테스트 시작 ===');
    
    // 1. 관리자 페이지 접속
    console.log('\n1. 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/blog-test-1-admin-page.png' });
    console.log('✅ 관리자 페이지 접속 완료');
    
    // 2. 블로그 관리 탭 클릭
    console.log('\n2. 블로그 관리 탭 클릭...');
    const blogTab = await page.locator('button:has-text("블로그")').first();
    
    if (await blogTab.isVisible()) {
      await blogTab.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/blog-test-2-blog-tab-opened.png' });
      console.log('✅ 블로그 관리 탭 클릭 완료');
      
      // 3. 새 포스트 버튼 찾기
      console.log('\n3. 새 포스트 버튼 찾기...');
      
      // 다양한 가능성의 버튼 텍스트로 찾기
      const newPostSelectors = [
        'button:has-text("새 포스트")',
        'button:has-text("새 글")',
        'button:has-text("포스트 작성")',
        'button:has-text("글 작성")',
        'button:has-text("작성")',
        'button:has-text("추가")',
        'button[data-action="new-post"]',
        '.new-post-button'
      ];
      
      let newPostButton = null;
      for (const selector of newPostSelectors) {
        const button = page.locator(selector).first();
        if (await button.count() > 0 && await button.isVisible()) {
          newPostButton = button;
          console.log(`✅ 새 포스트 버튼 발견: ${selector}`);
          break;
        }
      }
      
      if (newPostButton) {
        await newPostButton.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/blog-test-3-new-post-modal.png' });
        console.log('✅ 새 포스트 모달 열기 완료');
        
        // 4. 이미지 업로드 테스트
        console.log('\n4. 이미지 업로드 테스트...');
        
        // 테스트용 작은 이미지 생성
        const testImagePath = path.join(__dirname, 'test-upload-image.png');
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
        console.log('✅ 테스트 이미지 생성 완료');
        
        // 파일 입력 찾기
        const fileInputs = await page.locator('input[type="file"]').all();
        console.log(`발견된 파일 입력 수: ${fileInputs.length}`);
        
        if (fileInputs.length > 0) {
          console.log('📁 파일 입력 요소 발견됨');
          
          // 네트워크 요청 모니터링 시작
          console.log('📡 네트워크 요청 모니터링 시작...');
          
          // 파일 업로드 시도
          await fileInputs[0].setInputFiles(testImagePath);
          console.log('📤 파일 선택 완료, 업로드 대기 중...');
          
          // 업로드 처리 대기
          await page.waitForTimeout(5000);
          
          // 업로드 후 스크린샷
          await page.screenshot({ path: 'screenshots/blog-test-4-after-image-upload.png' });
          
          // 업로드 결과 확인
          const uploadErrors = allLogs.filter(log => 
            log.level === 'error' && 
            (log.text.includes('CORS') || log.text.includes('403') || log.text.includes('CSRF'))
          );
          
          if (uploadErrors.length > 0) {
            console.log('❌ 이미지 업로드 오류 발견:');
            uploadErrors.forEach(error => {
              console.log(`  - ${error.text}`);
            });
          }
          
        } else {
          console.log('⚠️ 파일 입력 요소가 없습니다. 에디터 내 이미지 버튼 찾기...');
          
          // 에디터 내 이미지 업로드 버튼 찾기
          const imageButtonSelectors = [
            'button[title*="이미지"]',
            'button[aria-label*="이미지"]',
            'button:has-text("이미지")',
            '.image-upload-button',
            '[data-testid="image-button"]'
          ];
          
          for (const selector of imageButtonSelectors) {
            const button = page.locator(selector).first();
            if (await button.count() > 0 && await button.isVisible()) {
              console.log(`🔘 이미지 버튼 발견: ${selector}`);
              await button.click();
              await page.waitForTimeout(2000);
              await page.screenshot({ path: 'screenshots/blog-test-4-image-button-clicked.png' });
              break;
            }
          }
        }
        
        // 5. 포스트 저장 테스트 (CSRF 토큰 검증)
        console.log('\n5. 포스트 저장 테스트 (CSRF 검증)...');
        
        // 제목 입력
        const titleSelectors = [
          'input[name="title"]',
          'input[placeholder*="제목"]',
          '.title-input',
          '#post-title'
        ];
        
        for (const selector of titleSelectors) {
          const titleInput = page.locator(selector).first();
          if (await titleInput.count() > 0 && await titleInput.isVisible()) {
            await titleInput.fill('테스트 포스트 - CSRF 검증');
            console.log('✅ 제목 입력 완료');
            break;
          }
        }
        
        // 내용 입력
        const contentSelectors = [
          '[contenteditable="true"]',
          'textarea[name="content"]',
          '.editor-content',
          '#post-content'
        ];
        
        for (const selector of contentSelectors) {
          const contentInput = page.locator(selector).first();
          if (await contentInput.count() > 0 && await contentInput.isVisible()) {
            await contentInput.click();
            await contentInput.fill('테스트 내용입니다. CSRF 토큰 검증을 확인합니다.');
            console.log('✅ 내용 입력 완료');
            break;
          }
        }
        
        // 저장 전 스크린샷
        await page.screenshot({ path: 'screenshots/blog-test-5-before-save.png' });
        
        // 저장 버튼 클릭
        const saveSelectors = [
          'button:has-text("저장")',
          'button:has-text("게시")',
          'button:has-text("발행")',
          'button:has-text("등록")',
          '.save-button',
          '#save-post'
        ];
        
        for (const selector of saveSelectors) {
          const saveButton = page.locator(selector).first();
          if (await saveButton.count() > 0 && await saveButton.isVisible()) {
            console.log(`💾 저장 버튼 클릭: ${selector}`);
            
            // 네트워크 요청 모니터링 강화
            console.log('📡 저장 요청 모니터링...');
            
            await saveButton.click();
            await page.waitForTimeout(5000);
            
            // 저장 후 스크린샷
            await page.screenshot({ path: 'screenshots/blog-test-6-after-save.png' });
            console.log('✅ 저장 요청 완료');
            break;
          }
        }
        
        // 테스트 이미지 정리
        fs.unlinkSync(testImagePath);
        
      } else {
        console.log('⚠️ 새 포스트 버튼을 찾을 수 없습니다.');
        
        // 현재 페이지의 모든 버튼 나열
        console.log('\n현재 페이지의 모든 버튼:');
        const allButtons = await page.locator('button').all();
        for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
          const button = allButtons[i];
          const text = await button.textContent();
          const isVisible = await button.isVisible();
          console.log(`  - "${text?.trim()}" (visible: ${isVisible})`);
        }
      }
      
    } else {
      console.log('⚠️ 블로그 관리 탭을 찾을 수 없습니다.');
    }
    
    // 6. 오류 분석 및 보고서 작성
    console.log('\n=== 오류 분석 결과 ===');
    
    const corsErrors = allLogs.filter(log => log.text.toLowerCase().includes('cors'));
    const csrfErrors = allLogs.filter(log => log.text.toLowerCase().includes('csrf'));
    const authErrors = allLogs.filter(log => log.text.includes('403') || log.text.includes('401'));
    
    console.log(`🔍 CORS 오류 수: ${corsErrors.length}`);
    console.log(`🔍 CSRF 오류 수: ${csrfErrors.length}`);
    console.log(`🔍 인증 오류 수: ${authErrors.length}`);
    
    if (corsErrors.length > 0) {
      console.log('\n❌ CORS 오류들:');
      corsErrors.forEach(error => console.log(`  - ${error.text}`));
    }
    
    if (csrfErrors.length > 0) {
      console.log('\n❌ CSRF 오류들:');
      csrfErrors.forEach(error => console.log(`  - ${error.text}`));
    }
    
    if (authErrors.length > 0) {
      console.log('\n❌ 인증 오류들:');
      authErrors.forEach(error => console.log(`  - ${error.text}`));
    }
    
    // API 요청 분석
    const apiRequests = networkRequests.filter(req => req.url.includes('/api/'));
    const failedApiRequests = apiRequests.filter(req => req.type === 'response' && req.status >= 400);
    
    console.log(`\n📡 API 요청 수: ${apiRequests.filter(req => req.type === 'request').length}`);
    console.log(`📡 실패한 API 요청: ${failedApiRequests.length}`);
    
    if (failedApiRequests.length > 0) {
      console.log('\n❌ 실패한 API 요청들:');
      failedApiRequests.forEach(req => {
        console.log(`  - ${req.status} ${req.url}`);
        if (req.status === 403) {
          console.log('    → CSRF 토큰 문제일 가능성');
        }
      });
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'screenshots/blog-test-final.png' });
    
    // 로그 파일 저장
    fs.writeFileSync('screenshots/blog-test-logs.json', JSON.stringify({
      allLogs,
      networkRequests,
      corsErrors,
      csrfErrors,
      authErrors,
      failedApiRequests
    }, null, 2));
    
    console.log('\n📊 테스트 완료! 브라우저를 30초 더 열어둡니다...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
    await page.screenshot({ path: 'screenshots/blog-test-error.png' });
  } finally {
    await browser.close();
  }
}

testBlogDetailed();