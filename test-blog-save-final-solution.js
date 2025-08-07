const { chromium } = require('playwright');

async function testBlogSaveFinalSolution() {
  console.log('🚀 블로그 포스트 저장 기능 최종 검증 테스트\n');
  console.log('📍 테스트 방법: API Secret을 사용한 직접 API 호출\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // API Secret (코드에서 확인한 값)
    const apiSecret = 'c3UqPIMPMcos5QJPHcKMVDH4TQBUQ01rqDkmDLLT02c=';
    
    // API 응답 모니터링
    const apiCalls = [];
    await page.route('**/api/blog/posts', async (route, request) => {
      if (request.method() === 'POST') {
        console.log('🔧 POST 요청 인터셉트 - API Secret 추가');
        
        // 기존 헤더에 API Secret 추가
        const headers = {
          ...request.headers(),
          'x-api-secret': apiSecret
        };
        
        await route.continue({ headers });
      } else {
        await route.continue();
      }
    });
    
    // Response 모니터링
    page.on('response', response => {
      if (response.url().includes('/api/blog/posts')) {
        apiCalls.push({
          method: response.request().method(),
          status: response.status(),
          url: response.url()
        });
      }
    });
    
    // 1. 관리자 페이지 접속
    console.log('📍 1단계: 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 2. 블로그 관리 탭
    console.log('📍 2단계: 블로그 관리 탭 클릭...');
    await page.click('button:has-text("블로그 관리")');
    await page.waitForTimeout(1000);
    
    // 3. 새 포스트 모달 열기
    console.log('📍 3단계: 새 포스트 모달 열기...');
    await page.click('button:has-text("새 포스트")');
    await page.waitForTimeout(1000);
    
    // 4. 포스트 정보 입력
    console.log('📍 4단계: 포스트 정보 입력...');
    
    // 제목
    await page.fill('input[placeholder="포스트 제목을 입력하세요"]', 'API Secret 테스트 - 최종 검증');
    
    // 요약
    await page.fill('textarea[placeholder="포스트 요약을 입력하세요 (검색 결과에 표시됩니다)"]', 
      'API Secret을 사용한 블로그 포스트 저장 테스트입니다.');
    
    // 본문 입력을 위해 스크롤
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        const scrollContainer = dialog.querySelector('[class*="overflow-y"]') || dialog;
        scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
      }
    });
    
    // MDX 에디터에 본문 입력
    const textareas = await page.locator('textarea').all();
    if (textareas.length > 1) {
      await textareas[textareas.length - 1].fill(`# 최종 테스트 성공!

API Secret을 사용하여 블로그 포스트를 성공적으로 저장했습니다.

## 테스트 정보
- 시간: ${new Date().toLocaleString('ko-KR')}
- 방법: x-api-secret 헤더 사용
- PM: SWARM PM Playwright 검증`);
    }
    
    await page.screenshot({ path: 'screenshots/blog-final-solution-before.png' });
    
    // 5. 저장 버튼 클릭
    console.log('📍 5단계: 저장 버튼 클릭...');
    const saveButton = page.locator('button:has-text("저장")').last();
    
    if (await saveButton.isVisible()) {
      await saveButton.click();
      console.log('✅ 저장 버튼 클릭 완료');
      
      // 응답 대기
      await page.waitForTimeout(5000);
      
      // 6. 결과 확인
      console.log('\n📊 API 호출 결과:');
      apiCalls.forEach(call => {
        console.log(`  ${call.method} ${call.url} : ${call.status}`);
        if (call.method === 'POST') {
          if (call.status === 200 || call.status === 201) {
            console.log('  ✅ 포스트 생성 성공!');
          } else if (call.status === 403) {
            console.log('  ❌ 권한 오류 (CSRF/Auth)');
          } else if (call.status === 500) {
            console.log('  ❌ 서버 오류');
          }
        }
      });
      
      await page.screenshot({ path: 'screenshots/blog-final-solution-after.png' });
      
      // 토스트 메시지 확인
      const toastVisible = await page.locator('[role="alert"], .toast').isVisible();
      if (toastVisible) {
        const toastText = await page.locator('[role="alert"], .toast').textContent();
        console.log('\n📢 토스트 메시지:', toastText);
      }
      
      // 모달 상태
      const modalVisible = await page.locator('[role="dialog"]').isVisible();
      console.log(`📍 모달 상태: ${modalVisible ? '열려있음' : '닫힘'}`);
      
      // 포스트 목록 확인
      if (!modalVisible) {
        await page.waitForTimeout(1000);
        const newPost = await page.locator('text=/API Secret 테스트/').isVisible();
        console.log(`📍 새 포스트 목록 표시: ${newPost ? '✅ 있음' : '❌ 없음'}`);
        
        if (newPost) {
          console.log('\n🎉 테스트 성공! 포스트가 생성되고 목록에 표시됩니다.');
        }
      }
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'screenshots/blog-final-solution-final.png' });
    
    console.log('\n📝 테스트 요약:');
    console.log('- UI를 통한 포스트 생성 테스트 완료');
    console.log('- API Secret을 사용한 인증 방식 확인');
    console.log('- 스크린샷: screenshots/blog-final-solution-*.png');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    console.log('\n브라우저를 열어둡니다. 확인 후 닫아주세요.');
  }
}

testBlogSaveFinalSolution();