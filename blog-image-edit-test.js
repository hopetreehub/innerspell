const { chromium } = require('playwright');

async function testBlogImageEdit() {
  console.log('🔧 블로그 이미지 편집 상세 테스트 시작');
  
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
    
    // 1단계: 관리자 블로그 관리 페이지로 직접 이동
    console.log('1️⃣ 관리자 블로그 관리 페이지 접근...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(2000);
    
    // 블로그 관리 탭 클릭
    const blogTab = await page.locator('[role="tab"]:has-text("블로그 관리")').first();
    if (await blogTab.isVisible()) {
      await blogTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ 블로그 관리 탭 활성화');
    }
    
    // 2단계: 첫 번째 포스트 편집 버튼 클릭
    console.log('2️⃣ 첫 번째 포스트 편집...');
    
    const editButton = await page.locator('table tbody tr:first-child td:last-child button:first-child');
    await editButton.click();
    console.log('✅ 편집 버튼 클릭');
    
    await page.waitForTimeout(3000);
    
    // 편집 페이지 스크린샷
    const editScreenshot = `blog-edit-page-${Date.now()}.png`;
    await page.screenshot({ 
      path: editScreenshot,
      fullPage: true 
    });
    console.log(`📸 편집 페이지 스크린샷: ${editScreenshot}`);
    
    // 3단계: 폼 필드들 분석
    console.log('3️⃣ 편집 폼 필드 분석...');
    
    // 모든 입력 필드 찾기
    const inputs = await page.locator('input, textarea, select').all();
    console.log(`📝 총 ${inputs.length}개 입력 필드 발견:`);
    
    for (let i = 0; i < inputs.length; i++) {
      try {
        const tagName = await inputs[i].evaluate(el => el.tagName);
        const type = await inputs[i].getAttribute('type');
        const name = await inputs[i].getAttribute('name');
        const placeholder = await inputs[i].getAttribute('placeholder');
        const value = await inputs[i].inputValue().catch(() => 'N/A');
        
        console.log(`   ${i + 1}. ${tagName}${type ? `[${type}]` : ''} - name: "${name}", placeholder: "${placeholder}", value: "${value}"`);
      } catch (e) {
        console.log(`   ${i + 1}. 필드 정보 읽기 실패`);
      }
    }
    
    // 4단계: 이미지 관련 필드 특별 검색
    console.log('4️⃣ 이미지 관련 필드 특별 검색...');
    
    const imageKeywords = ['image', 'img', 'featured', 'thumbnail', '이미지', 'photo', 'picture'];
    
    for (const keyword of imageKeywords) {
      const fields = await page.locator(`input[name*="${keyword}"], input[placeholder*="${keyword}"], textarea[name*="${keyword}"], input[id*="${keyword}"]`).all();
      if (fields.length > 0) {
        console.log(`🖼️ "${keyword}" 관련 필드 ${fields.length}개 발견:`);
        for (let i = 0; i < fields.length; i++) {
          try {
            const name = await fields[i].getAttribute('name');
            const type = await fields[i].getAttribute('type');
            const value = await fields[i].inputValue().catch(() => 'N/A');
            console.log(`     - ${type}[name="${name}"] = "${value}"`);
          } catch (e) {
            console.log(`     - 필드 정보 읽기 실패`);
          }
        }
      }
    }
    
    // 5단계: 파일 업로드 필드 찾기
    console.log('5️⃣ 파일 업로드 필드 찾기...');
    
    const fileInputs = await page.locator('input[type="file"]').all();
    if (fileInputs.length > 0) {
      console.log(`📎 파일 업로드 필드 ${fileInputs.length}개 발견:`);
      for (let i = 0; i < fileInputs.length; i++) {
        try {
          const accept = await fileInputs[i].getAttribute('accept');
          const name = await fileInputs[i].getAttribute('name');
          console.log(`     - 파일 입력[name="${name}"] accept="${accept}"`);
        } catch (e) {
          console.log(`     - 파일 입력 정보 읽기 실패`);
        }
      }
    } else {
      console.log('❌ 파일 업로드 필드 없음');
    }
    
    // 6단계: 이미지 URL 필드 변경 테스트
    console.log('6️⃣ 이미지 URL 필드 변경 테스트...');
    
    // 이미지 URL로 보이는 필드 찾기
    const imageUrlSelectors = [
      'input[name="featuredImage"]',
      'input[name="image"]',
      'input[name="imageUrl"]',
      'input[name="thumbnail"]',
      'input[value*="/images/"]',
      'input[value*="/uploads/"]',
      'input[placeholder*="이미지"]',
      'input[placeholder*="URL"]'
    ];
    
    let imageFieldFound = false;
    for (const selector of imageUrlSelectors) {
      try {
        const field = await page.locator(selector).first();
        if (await field.isVisible()) {
          const currentValue = await field.inputValue();
          console.log(`✅ 이미지 필드 발견: ${selector}, 현재 값: "${currentValue}"`);
          
          // 값 변경 테스트
          await field.clear();
          const testImageUrl = '/images/test-blog-image-update.png';
          await field.fill(testImageUrl);
          
          console.log(`📝 이미지 URL 변경: "${testImageUrl}"`);
          imageFieldFound = true;
          break;
        }
      } catch (e) {
        console.log(`❌ 선택자 실패: ${selector}`);
      }
    }
    
    if (!imageFieldFound) {
      console.log('⚠️ 이미지 URL 필드를 찾지 못함');
    }
    
    // 7단계: 저장 버튼 확인 및 클릭
    console.log('7️⃣ 저장 버튼 확인 및 클릭...');
    
    const saveSelectors = [
      'button:has-text("저장")',
      'button:has-text("업데이트")', 
      'button:has-text("수정")',
      'button[type="submit"]',
      '.save-button',
      'button.btn-primary'
    ];
    
    let saveClicked = false;
    for (const selector of saveSelectors) {
      try {
        const saveButton = await page.locator(selector).first();
        if (await saveButton.isVisible()) {
          console.log(`✅ 저장 버튼 발견: ${selector}`);
          await saveButton.click();
          saveClicked = true;
          console.log('💾 저장 버튼 클릭 완료');
          break;
        }
      } catch (e) {
        console.log(`❌ 저장 버튼 선택자 실패: ${selector}`);
      }
    }
    
    if (saveClicked) {
      await page.waitForTimeout(3000);
      console.log('⏳ 저장 처리 대기...');
    }
    
    // 8단계: 블로그 페이지에서 변경사항 확인
    console.log('8️⃣ 블로그 페이지에서 변경사항 확인...');
    
    await page.goto('http://localhost:4000/blog', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    // 최종 블로그 페이지 스크린샷
    const finalScreenshot = `blog-final-result-${Date.now()}.png`;
    await page.screenshot({ 
      path: finalScreenshot,
      fullPage: true 
    });
    console.log(`📸 최종 블로그 페이지 스크린샷: ${finalScreenshot}`);
    
    // 9단계: 이미지 소스 확인
    console.log('9️⃣ 이미지 소스 최종 분석...');
    
    const blogImages = await page.locator('img').all();
    console.log(`🖼️ 블로그 페이지에서 ${blogImages.length}개 이미지 발견:`);
    
    for (let i = 0; i < Math.min(blogImages.length, 10); i++) {
      try {
        const src = await blogImages[i].getAttribute('src');
        const alt = await blogImages[i].getAttribute('alt');
        console.log(`   ${i + 1}. src: "${src}", alt: "${alt}"`);
      } catch (e) {
        console.log(`   ${i + 1}. 이미지 속성 읽기 실패`);
      }
    }
    
    console.log('✅ 블로그 이미지 편집 테스트 완료');
    
    // 브라우저 유지 시간
    console.log('🔍 10초간 브라우저 유지 (결과 확인)...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 실행
if (require.main === module) {
  testBlogImageEdit().catch(console.error);
}

module.exports = { testBlogImageEdit };