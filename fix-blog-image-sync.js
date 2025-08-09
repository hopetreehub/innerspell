const { chromium } = require('playwright');

async function fixBlogImageSync() {
  console.log('🔧 블로그 이미지 동기화 문제 해결 시작');
  
  let browser;
  try {
    browser = await chromium.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // 1단계: 관리자 대시보드에서 블로그 관리 탭 접근
    console.log('1️⃣ 관리자 대시보드 접근 중...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    // 블로그 관리 탭 클릭
    const blogTabSelectors = [
      '[role="tab"]:has-text("블로그 관리")',
      'button:has-text("블로그 관리")',
      '[data-testid="tab-blog-management"]',
      '.tabs [data-state="inactive"]:has-text("블로그")',
      '.tab-content button:has-text("블로그")'
    ];
    
    let blogTabClicked = false;
    for (const selector of blogTabSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          blogTabClicked = true;
          console.log(`✅ 블로그 탭 클릭 성공: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ 선택자 실패: ${selector}`);
      }
    }
    
    if (!blogTabClicked) {
      console.log('⚠️ 블로그 탭을 찾을 수 없어 직접 URL로 이동');
      await page.goto('http://localhost:4000/admin?tab=blog', { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
    }
    
    await page.waitForTimeout(3000);
    
    // 2단계: 첫 번째 포스트 찾기 및 편집
    console.log('2️⃣ 첫 번째 포스트 편집 시작...');
    
    // 테이블 행에서 첫 번째 포스트의 편집 버튼(연필 아이콘) 찾기
    const editSelectors = [
      'table tbody tr:first-child button[aria-label="편집"]',
      'table tbody tr:first-child td:last-child button:first-child',
      'tbody tr:first-child button:first-child',
      'tbody tr:first-child .action-buttons button:first-child',
      'tbody tr:first-child td button:first-child'
    ];
    
    let editClicked = false;
    for (const selector of editSelectors) {
      try {
        const editButton = await page.locator(selector).first();
        if (await editButton.isVisible()) {
          await editButton.click();
          editClicked = true;
          console.log(`✅ 편집 버튼 클릭 성공: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ 편집 버튼 선택자 실패: ${selector}`);
      }
    }
    
    if (!editClicked) {
      console.log('❌ 편집 버튼을 찾을 수 없습니다. 추가 시도...');
      
      // 대안: 첫 번째 행의 모든 버튼을 찾고 첫 번째 버튼 클릭
      try {
        const firstRowButtons = await page.locator('table tbody tr:first-child button').all();
        if (firstRowButtons.length > 0) {
          await firstRowButtons[0].click();
          editClicked = true;
          console.log('✅ 첫 번째 행의 첫 번째 버튼 클릭 성공');
        }
      } catch (e) {
        console.log('❌ 대안 방법도 실패');
      }
    }
    
    if (!editClicked) {
      console.log('❌ 편집 버튼을 찾을 수 없습니다.');
      throw new Error('편집 버튼 접근 실패');
    }
    
    await page.waitForTimeout(2000);
    
    // 3단계: 이미지 업로드 필드 확인 및 변경
    console.log('3️⃣ 이미지 업로드 필드 확인...');
    
    const imageSelectors = [
      'input[type="file"]',
      'input[accept*="image"]',
      '[data-testid="featured-image"]',
      'input[name="featuredImage"]',
      '.image-upload input'
    ];
    
    let imageInput = null;
    for (const selector of imageSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          imageInput = element;
          console.log(`✅ 이미지 입력 필드 발견: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ 이미지 입력 선택자 실패: ${selector}`);
      }
    }
    
    if (imageInput) {
      // 테스트 이미지 업로드 시뮬레이션
      console.log('📸 이미지 업로드 테스트 중...');
      
      // 실제 파일 업로드 대신 URL 변경 테스트
      const imageUrlSelectors = [
        'input[name="image"]',
        'input[placeholder*="이미지"]',
        'input[value*="/images/blog"]',
        '.image-url-input'
      ];
      
      for (const selector of imageUrlSelectors) {
        try {
          const urlInput = await page.locator(selector).first();
          if (await urlInput.isVisible()) {
            await urlInput.clear();
            await urlInput.fill('/images/test-new-image.png');
            console.log('✅ 이미지 URL 변경 완료');
            break;
          }
        } catch (e) {
          console.log(`❌ 이미지 URL 입력 실패: ${selector}`);
        }
      }
    }
    
    // 4단계: 저장 버튼 클릭
    console.log('4️⃣ 변경사항 저장 중...');
    
    const saveSelectors = [
      'button:has-text("저장")',
      'button:has-text("업데이트")',
      'button:has-text("수정")',
      '[data-testid="save-post"]',
      '.save-button',
      'button[type="submit"]'
    ];
    
    let saveClicked = false;
    for (const selector of saveSelectors) {
      try {
        const saveButton = await page.locator(selector).first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          saveClicked = true;
          console.log(`✅ 저장 버튼 클릭 성공: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ 저장 버튼 선택자 실패: ${selector}`);
      }
    }
    
    if (saveClicked) {
      await page.waitForTimeout(3000);
      console.log('💾 저장 완료 대기...');
    }
    
    // 5단계: 블로그 페이지에서 변경사항 확인
    console.log('5️⃣ 블로그 페이지에서 변경사항 확인...');
    
    await page.goto('http://localhost:4000/blog', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    // 변경 후 스크린샷 촬영
    const afterScreenshot = `fix-blog-images-after-${Date.now()}.png`;
    await page.screenshot({ 
      path: afterScreenshot,
      fullPage: true 
    });
    
    console.log(`📸 변경 후 스크린샷 저장: ${afterScreenshot}`);
    
    // 6단계: 이미지 소스 확인
    console.log('6️⃣ 이미지 소스 최종 확인...');
    
    const images = await page.locator('img[src*="/images/"], img[src*="/uploads/"]').all();
    console.log(`🖼️ 총 ${images.length}개 이미지 발견`);
    
    for (let i = 0; i < Math.min(images.length, 5); i++) {
      try {
        const src = await images[i].getAttribute('src');
        console.log(`   ${i + 1}. ${src}`);
      } catch (e) {
        console.log(`   ${i + 1}. 이미지 소스 읽기 실패`);
      }
    }
    
    console.log('✅ 블로그 이미지 동기화 테스트 완료');
    
  } catch (error) {
    console.error('❌ 블로그 이미지 동기화 테스트 실패:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 실행
if (require.main === module) {
  fixBlogImageSync().catch(console.error);
}

module.exports = { fixBlogImageSync };