const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 브라우저 콘솔 로그 캡처
  page.on('console', msg => {
    console.log(`🖥️ Browser: ${msg.text()}`);
  });
  
  // 네트워크 요청 모니터링
  page.on('request', request => {
    if (request.url().includes('/api/blog/posts')) {
      console.log(`📡 API 요청: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/blog/posts')) {
      console.log(`📡 API 응답: ${response.status()} ${response.url()}`);
    }
  });
  
  console.log('🐛 블로그 폼 디버깅 시작...\n');
  
  try {
    // 1. 로그인
    console.log('1️⃣ 관리자 로그인...');
    await page.goto('http://localhost:4000/sign-in');
    await page.waitForLoadState('networkidle');
    
    const devButton = await page.$('button:has-text("관리자로 로그인")');
    if (devButton) {
      await devButton.click();
      await page.waitForTimeout(5000);
      await page.reload();
      await page.waitForTimeout(3000);
    }
    
    // 2. 관리자 대시보드 > 블로그 관리
    console.log('2️⃣ 블로그 관리 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    const blogTab = await page.$('button[role="tab"]:has-text("블로그 관리")');
    if (blogTab) {
      await blogTab.click();
      await page.waitForTimeout(2000);
    }
    
    // 3. 새 글 작성 버튼 클릭
    console.log('3️⃣ 새 글 작성 대화상자 열기...');
    const newPostButton = await page.$('button:has-text("새 포스트")');
    if (newPostButton) {
      await newPostButton.click();
      await page.waitForTimeout(3000);
    }
    
    // 4. 모든 폼 필드 찾기
    console.log('4️⃣ 폼 필드 분석...');
    
    const formFields = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return { error: 'Dialog not found' };
      
      const inputs = dialog.querySelectorAll('input, textarea, select');
      const fields = [];
      
      inputs.forEach((input, index) => {
        fields.push({
          index,
          type: input.type || input.tagName.toLowerCase(),
          name: input.name || '',
          placeholder: input.placeholder || '',
          id: input.id || '',
          required: input.required || false,
          value: input.value || ''
        });
      });
      
      return { fields, dialogFound: true };
    });
    
    console.log('📝 발견된 폼 필드들:', JSON.stringify(formFields, null, 2));
    
    // 5. 필수 필드 채우기
    console.log('5️⃣ 필수 필드 채우기...');
    
    // 제목
    const titleField = await page.$('input[placeholder*="제목"]') || await page.$('input[name="title"]');
    if (titleField) {
      await titleField.fill('디버그 테스트 - 블로그 폼 검증');
      console.log('✅ 제목 입력');
    } else {
      console.log('❌ 제목 필드를 찾을 수 없음');
    }
    
    // Slug (선택사항이지만 채워보기)
    const slugField = await page.$('input[placeholder*="slug"]') || await page.$('input[name="slug"]');
    if (slugField) {
      await slugField.fill('debug-test-blog-form');
      console.log('✅ Slug 입력');
    }
    
    // 요약
    const excerptField = await page.$('textarea[placeholder*="요약"]') || await page.$('textarea[name="excerpt"]');
    if (excerptField) {
      await excerptField.fill('블로그 폼 저장 기능을 디버깅하기 위한 테스트 글입니다.');
      console.log('✅ 요약 입력');
    } else {
      console.log('❌ 요약 필드를 찾을 수 없음');
    }
    
    // 본문 내용
    const contentField = await page.$('textarea[placeholder*="내용"]') || 
                        await page.$('textarea[name="content"]') ||
                        await page.$('textarea:not([placeholder*="요약"])');
    if (contentField) {
      await contentField.fill(`# 디버그 테스트 글

## 목적
블로그 저장 기능이 작동하지 않는 문제를 디버깅합니다.

## 확인 사항
- CSRF 토큰 헤더 추가
- 필수 필드 검증
- API 요청 전송 여부
- 응답 처리 로직

작성 시간: ${new Date().toLocaleString('ko-KR')}`);
      console.log('✅ 본문 입력');
    } else {
      console.log('❌ 본문 필드를 찾을 수 없음');
    }
    
    // 카테고리 선택
    const categorySelect = await page.$('select[name="category"]') || await page.$('[role="combobox"]');
    if (categorySelect) {
      console.log('✅ 카테고리 필드 발견');
    }
    
    await page.screenshot({ path: 'debug-form-01-filled.png', fullPage: true });
    
    // 6. 폼 상태 확인
    console.log('6️⃣ 저장 전 폼 상태 확인...');
    const formData = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      
      const title = dialog.querySelector('input[placeholder*="제목"]')?.value || '';
      const excerpt = dialog.querySelector('textarea[placeholder*="요약"]')?.value || '';
      const content = dialog.querySelector('textarea[placeholder*="내용"]')?.value || '';
      
      return { title, excerpt, content, titleLength: title.length, excerptLength: excerpt.length, contentLength: content.length };
    });
    
    console.log('📊 폼 데이터:', formData);
    
    // 7. 저장 버튼 상태 확인 및 클릭
    console.log('7️⃣ 저장 버튼 확인 및 클릭...');
    const saveButton = await page.$('button:has-text("저장")');
    if (saveButton) {
      const buttonState = await page.evaluate((btn) => {
        return {
          disabled: btn.disabled,
          textContent: btn.textContent,
          className: btn.className
        };
      }, saveButton);
      
      console.log('🔘 저장 버튼 상태:', buttonState);
      
      if (!buttonState.disabled) {
        console.log('⏳ 저장 버튼 클릭...');
        await saveButton.click();
        await page.waitForTimeout(8000);
        
        await page.screenshot({ path: 'debug-form-02-after-save.png', fullPage: true });
      } else {
        console.log('❌ 저장 버튼이 비활성화되어 있음');
      }
    } else {
      console.log('❌ 저장 버튼을 찾을 수 없음');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await page.screenshot({ path: 'debug-form-error.png', fullPage: true });
  } finally {
    console.log('\n🐛 디버깅 완료! 브라우저를 열어두었습니다.');
  }
})();