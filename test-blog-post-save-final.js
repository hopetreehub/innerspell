const { chromium } = require('playwright');

async function testBlogPostSaveFinal() {
  console.log('🚀 블로그 포스트 저장 기능 최종 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  let page;
  
  try {
    const context = await browser.newContext();
    page = await context.newPage();
    
    // 네트워크 모니터링 설정
    const apiResponses = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/')) {
        apiResponses.push({
          url,
          status: response.status(),
          method: response.request().method(),
          timestamp: new Date().toISOString()
        });
        console.log(`📡 API 호출: ${response.request().method()} ${url} -> ${response.status()}`);
      }
    });
    
    // 1. 관리자 페이지 접속
    console.log('\n📍 1단계: 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/blog-final-1-admin.png' });
    
    // 2. 블로그 관리 탭 클릭
    console.log('📍 2단계: 블로그 관리 탭 클릭...');
    await page.click('button:has-text("블로그 관리")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/blog-final-2-blog-tab.png' });
    
    // 3. 새 포스트 버튼 클릭
    console.log('📍 3단계: 새 포스트 버튼 클릭...');
    await page.click('button:has-text("새 포스트")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/blog-final-3-new-post-modal.png' });
    
    // 4. 포스트 정보 입력
    console.log('📍 4단계: 포스트 정보 입력...');
    
    // 제목 입력
    await page.fill('input[placeholder="포스트 제목을 입력하세요"]', '테스트 포스트 - PM 최종 검증');
    console.log('  ✅ 제목 입력 완료');
    
    // 요약 입력
    await page.fill('textarea[placeholder="포스트 요약을 입력하세요 (검색 결과에 표시됩니다)"]', 
      'SWARM PM이 Playwright로 직접 검증한 블로그 포스트 저장 기능 테스트입니다.');
    console.log('  ✅ 요약 입력 완료');
    
    // 카테고리 선택 - combobox 클릭
    console.log('  📍 카테고리 선택 시도...');
    const categoryButton = page.locator('[role="combobox"]').first();
    await categoryButton.click();
    await page.waitForTimeout(500);
    
    // 드롭다운에서 "타로" 선택
    const taroOption = page.locator('[role="option"]:has-text("타로")');
    if (await taroOption.isVisible()) {
      await taroOption.click();
      console.log('  ✅ 카테고리 "타로" 선택 완료');
    } else {
      console.log('  ⚠️ 타로 옵션을 찾을 수 없어 스킵');
    }
    
    // 본문 입력 - MDX 에디터
    const mdxEditor = page.locator('textarea[placeholder="마크다운 형식으로 작성하세요"]');
    const content = `# 테스트 포스트 - PM 최종 검증

이 포스트는 **SWARM PM**이 Playwright를 사용하여 직접 작성한 테스트 포스트입니다.

## 테스트 목적
블로그 포스트 저장 기능이 정상적으로 작동하는지 검증합니다.

### 테스트 항목
1. 포스트 제목 입력
2. 포스트 요약 입력
3. 카테고리 선택
4. MDX 본문 작성
5. 포스트 저장

### 테스트 환경
- 날짜: ${new Date().toLocaleString('ko-KR')}
- 테스트 도구: Playwright (Chromium)
- 포트: 4000

## 결론
이 메시지가 보인다면 테스트가 성공한 것입니다! 🎉`;
    
    await mdxEditor.fill(content);
    console.log('  ✅ 본문 입력 완료');
    
    // 입력 완료 스크린샷
    await page.screenshot({ path: 'screenshots/blog-final-4-filled.png' });
    
    // 5. 저장 버튼 클릭
    console.log('\n📍 5단계: 포스트 저장...');
    const saveButton = page.locator('button:has-text("저장")').last();
    
    if (await saveButton.isVisible()) {
      console.log('  ✅ 저장 버튼 발견');
      await saveButton.click();
      console.log('  ✅ 저장 버튼 클릭 완료');
      
      // 저장 응답 대기
      await page.waitForTimeout(3000);
      
      // 결과 스크린샷
      await page.screenshot({ path: 'screenshots/blog-final-5-after-save.png' });
      
      // 성공/에러 메시지 확인
      const successMsg = await page.locator('text=/성공|저장되었습니다|완료/').isVisible();
      const errorMsg = await page.locator('text=/오류|에러|실패/').isVisible();
      
      if (successMsg) {
        console.log('  ✅ 성공 메시지 확인됨!');
      }
      if (errorMsg) {
        console.log('  ❌ 에러 메시지가 표시되었습니다');
        const errorTexts = await page.locator('text=/오류|에러|실패/').allTextContents();
        console.log('  에러 내용:', errorTexts);
      }
      
      // 모달이 닫혔는지 확인
      await page.waitForTimeout(1000);
      const modalVisible = await page.locator('[role="dialog"]').isVisible();
      console.log(`  📍 모달 상태: ${modalVisible ? '열려있음' : '닫힘'}`);
      
      // 포스트 목록 확인
      if (!modalVisible) {
        console.log('\n📍 6단계: 포스트 목록에서 확인...');
        const newPost = await page.locator('text=/테스트 포스트 - PM 최종 검증/').isVisible();
        if (newPost) {
          console.log('  ✅ 새 포스트가 목록에 표시됩니다!');
        } else {
          console.log('  ⚠️ 새 포스트가 목록에 보이지 않습니다');
        }
      }
    } else {
      console.log('  ❌ 저장 버튼을 찾을 수 없습니다');
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'screenshots/blog-final-6-final-state.png' });
    
    // API 호출 요약
    console.log('\n📊 API 호출 요약:');
    console.log('총 API 호출 수:', apiResponses.length);
    
    // POST 요청만 필터링
    const postRequests = apiResponses.filter(r => r.method === 'POST');
    console.log('POST 요청 수:', postRequests.length);
    postRequests.forEach(req => {
      console.log(`  - ${req.method} ${req.url} : ${req.status}`);
    });
    
    console.log('\n✅ 테스트 완료!');
    console.log('📸 스크린샷 저장 위치: screenshots/blog-final-*.png');
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error);
    if (page) {
      await page.screenshot({ path: 'screenshots/blog-final-error.png' });
    }
  } finally {
    console.log('\n브라우저를 열어둡니다. 개발자 도구에서 네트워크 탭을 확인하세요.');
    console.log('확인 후 수동으로 브라우저를 닫아주세요.');
  }
}

// 테스트 실행
testBlogPostSaveFinal();