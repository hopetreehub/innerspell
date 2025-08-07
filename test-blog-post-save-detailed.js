const { chromium } = require('playwright');

async function testBlogPostSaveDetailed() {
  console.log('🚀 블로그 포스트 저장 기능 상세 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  let page;
  
  try {
    const context = await browser.newContext();
    page = await context.newPage();
    
    // 1. 관리자 페이지 접속
    console.log('📍 관리자 페이지 접속 중...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 2. 블로그 관리 탭으로 이동
    console.log('📍 블로그 관리 탭으로 이동...');
    await page.click('button:has-text("블로그 관리")');
    await page.waitForTimeout(1000);
    
    // 3. 새 포스트 버튼 클릭
    console.log('📍 새 포스트 버튼 클릭...');
    await page.click('button:has-text("새 포스트")');
    await page.waitForTimeout(1000);
    
    // 4. 모달 내부 요소 상세 분석
    console.log('📍 모달 내부 요소 분석 중...');
    
    // 모든 input 요소 찾기
    const inputs = await page.locator('input').all();
    console.log(`\n📝 발견된 input 개수: ${inputs.length}`);
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const type = await inputs[i].getAttribute('type');
      const value = await inputs[i].inputValue();
      console.log(`  Input ${i}: type="${type}", placeholder="${placeholder}", value="${value}"`);
    }
    
    // 모든 textarea 요소 찾기
    const textareas = await page.locator('textarea').all();
    console.log(`\n📝 발견된 textarea 개수: ${textareas.length}`);
    for (let i = 0; i < textareas.length; i++) {
      const placeholder = await textareas[i].getAttribute('placeholder');
      const value = await textareas[i].inputValue();
      console.log(`  Textarea ${i}: placeholder="${placeholder}", value="${value}"`);
    }
    
    // 모든 select 요소 찾기
    const selects = await page.locator('select').all();
    console.log(`\n📝 발견된 select 개수: ${selects.length}`);
    
    // 모든 버튼 찾기
    const buttons = await page.locator('button').all();
    console.log(`\n📝 발견된 button 개수: ${buttons.length}`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      if (isVisible && text && text.trim()) {
        console.log(`  Button ${i}: "${text.trim()}"`);
      }
    }
    
    // 카테고리 선택 요소 찾기 - 다양한 방법 시도
    console.log('\n📍 카테고리 선택 요소 찾기...');
    
    // 방법 1: select 태그
    const categorySelect = await page.locator('select').count();
    console.log(`select 태그 개수: ${categorySelect}`);
    
    // 방법 2: 카테고리 관련 텍스트 찾기
    const categoryLabel = await page.locator('text=/카테고리/').count();
    console.log(`"카테고리" 텍스트 개수: ${categoryLabel}`);
    
    // 방법 3: dropdown 버튼
    const dropdownButtons = await page.locator('[role="combobox"], [aria-haspopup="listbox"]').count();
    console.log(`Dropdown 버튼 개수: ${dropdownButtons}`);
    
    // 5. 포스트 정보 입력
    console.log('\n📍 포스트 정보 입력 시작...');
    
    // 제목 입력
    await page.fill('input[placeholder="포스트 제목을 입력하세요"]', '테스트 포스트 - PM 검증');
    console.log('✅ 제목 입력 완료');
    
    // 요약 입력
    await page.fill('textarea[placeholder="포스트 요약을 입력하세요 (검색 결과에 표시됩니다)"]', 'SWARM PM이 작성한 테스트 포스트입니다.');
    console.log('✅ 요약 입력 완료');
    
    // 카테고리 선택 - 카테고리 필드가 있다면
    if (categoryLabel > 0) {
      console.log('📍 카테고리 선택 시도...');
      
      // 카테고리 필드 근처의 클릭 가능한 요소 찾기
      const categoryField = page.locator('text=/카테고리/').locator('xpath=../following-sibling::*').first();
      if (await categoryField.isVisible()) {
        await categoryField.click();
        await page.waitForTimeout(500);
        
        // 드롭다운 메뉴에서 "타로" 선택
        const taroOption = page.locator('text=/^타로$/');
        if (await taroOption.isVisible()) {
          await taroOption.click();
          console.log('✅ 카테고리 "타로" 선택 완료');
        }
      }
    }
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'screenshots/blog-test-detailed-form.png',
      fullPage: true 
    });
    
    // 6. MDX 에디터에 본문 입력
    console.log('\n📍 본문 입력 시도...');
    
    // 대표 이미지 섹션 아래로 스크롤
    await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]') || document.querySelector('.fixed');
      if (modal) {
        const scrollContainer = modal.querySelector('[class*="overflow"]') || modal;
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    });
    await page.waitForTimeout(500);
    
    // MDX 에디터 찾기 - 보통 마지막 textarea
    const allTextareas = await page.locator('textarea').all();
    if (allTextareas.length > 0) {
      const mdxEditor = allTextareas[allTextareas.length - 1];
      const mdxContent = `# 테스트 포스트

이것은 블로그 포스트 저장 기능을 테스트하기 위한 내용입니다.

## 주요 기능
- 포스트 생성
- 이미지 업로드
- MDX 지원

### 테스트 시간
${new Date().toLocaleString('ko-KR')}`;
      
      await mdxEditor.fill(mdxContent);
      console.log('✅ 본문 입력 완료');
    }
    
    // 최종 상태 스크린샷
    await page.screenshot({ 
      path: 'screenshots/blog-test-detailed-final.png',
      fullPage: true 
    });
    
    // 7. 저장 버튼 찾기
    console.log('\n📍 저장 버튼 찾기...');
    const saveButtons = await page.locator('button').filter({ hasText: /저장|생성|추가|확인|완료/i }).all();
    console.log(`저장 관련 버튼 개수: ${saveButtons.length}`);
    
    for (let i = 0; i < saveButtons.length; i++) {
      const text = await saveButtons[i].textContent();
      const isVisible = await saveButtons[i].isVisible();
      console.log(`  저장 버튼 ${i}: "${text}" (visible: ${isVisible})`);
    }
    
    // 네트워크 모니터링 설정
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        });
      }
    });
    
    // 저장 버튼 클릭
    if (saveButtons.length > 0) {
      const saveButton = saveButtons[0];
      if (await saveButton.isVisible()) {
        console.log('\n📍 저장 버튼 클릭...');
        await saveButton.click();
        await page.waitForTimeout(3000);
        
        // 결과 스크린샷
        await page.screenshot({ 
          path: 'screenshots/blog-test-detailed-result.png',
          fullPage: true 
        });
        
        // 네트워크 요청 결과
        console.log('\n📊 API 요청 결과:');
        responses.forEach(res => {
          console.log(`  ${res.method} ${res.url} : ${res.status}`);
        });
      }
    }
    
    console.log('\n✅ 상세 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    if (page) {
      await page.screenshot({ 
        path: 'screenshots/blog-test-detailed-error.png',
        fullPage: true 
      });
    }
  } finally {
    console.log('\n브라우저를 열어둡니다. 수동으로 확인 후 닫아주세요.');
  }
}

// 테스트 실행
testBlogPostSaveDetailed();