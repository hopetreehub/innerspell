const { chromium } = require('playwright');

async function finalBlogEditTest() {
  console.log('🎯 최종 블로그 이미지 편집 테스트');
  
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
    
    // 1단계: 관리자 블로그 관리 페이지 접근
    console.log('1️⃣ 관리자 블로그 관리 페이지 접근...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(2000);
    
    // 블로그 관리 탭 클릭
    const blogTab = await page.locator('[role="tab"]:has-text("블로그 관리")');
    await blogTab.click();
    await page.waitForTimeout(3000);
    
    console.log('✅ 블로그 관리 페이지 준비 완료');
    
    // 2단계: 올바른 편집 버튼 클릭 (두 번째 버튼 - "포스트 수정")
    console.log('2️⃣ 포스트 수정 버튼 클릭...');
    
    const editButton = await page.locator('table tbody tr:first-child td:last-child button').nth(1); // 두 번째 버튼 (index 1)
    await editButton.click();
    await page.waitForTimeout(5000); // 편집 페이지 로딩 대기
    
    console.log('✅ 포스트 수정 버튼 클릭 완료');
    
    // 3단계: 편집 페이지 스크린샷
    const editPageScreenshot = `edit-page-final-${Date.now()}.png`;
    await page.screenshot({ 
      path: editPageScreenshot,
      fullPage: true,
      timeout: 15000 
    });
    console.log(`📸 편집 페이지 스크린샷: ${editPageScreenshot}`);
    
    // 4단계: 현재 URL과 페이지 상태 확인
    const currentUrl = page.url();
    console.log(`현재 URL: ${currentUrl}`);
    
    // 5단계: 편집 폼의 모든 입력 필드 확인
    console.log('3️⃣ 편집 폼 필드 분석...');
    
    await page.waitForTimeout(2000);
    
    const allInputs = await page.locator('input, textarea, select').all();
    console.log(`📝 편집 페이지 입력 필드 ${allInputs.length}개:`);
    
    for (let i = 0; i < allInputs.length; i++) {
      try {
        const tagName = await allInputs[i].evaluate(el => el.tagName);
        const type = await allInputs[i].getAttribute('type');
        const name = await allInputs[i].getAttribute('name');
        const placeholder = await allInputs[i].getAttribute('placeholder');
        const isVisible = await allInputs[i].isVisible();
        const value = await allInputs[i].inputValue().catch(() => 'N/A');
        
        console.log(`   ${i + 1}. ${tagName}${type ? `[${type}]` : ''} - name="${name}", placeholder="${placeholder}", visible=${isVisible}, value="${value ? value.substring(0, 50) : 'N/A'}${value && value.length > 50 ? '...' : ''}"`);
      } catch (e) {
        console.log(`   ${i + 1}. 필드 정보 읽기 실패`);
      }
    }
    
    // 6단계: 이미지 관련 필드 찾기 및 변경
    console.log('4️⃣ 이미지 필드 찾기 및 변경...');
    
    const imageKeywords = ['image', 'featuredImage', 'thumbnail', 'img', '이미지'];
    let imageFieldChanged = false;
    
    for (const keyword of imageKeywords) {
      const imageFields = await page.locator(`input[name*="${keyword}"], input[placeholder*="${keyword}"]`).all();
      
      if (imageFields.length > 0) {
        console.log(`🖼️ "${keyword}" 관련 필드 ${imageFields.length}개 발견`);
        
        for (let i = 0; i < imageFields.length; i++) {
          try {
            const isVisible = await imageFields[i].isVisible();
            if (isVisible) {
              const currentValue = await imageFields[i].inputValue();
              console.log(`   현재 이미지 값: "${currentValue}"`);
              
              // 이미지 URL 변경
              await imageFields[i].clear();
              const newImageUrl = '/images/blog2.png'; // 다른 이미지로 변경
              await imageFields[i].fill(newImageUrl);
              
              console.log(`   ✅ 이미지 URL 변경: "${newImageUrl}"`);
              imageFieldChanged = true;
              break;
            }
          } catch (e) {
            console.log(`   이미지 필드 처리 실패: ${e.message}`);
          }
        }
        
        if (imageFieldChanged) break;
      }
    }
    
    if (!imageFieldChanged) {
      console.log('⚠️ 이미지 필드를 찾지 못했습니다. 다른 방법 시도...');
      
      // 모든 텍스트 입력 필드에서 이미지 URL 패턴 찾기
      const textInputs = await page.locator('input[type="text"], input[type="url"], input:not([type])').all();
      
      for (let i = 0; i < textInputs.length; i++) {
        try {
          const value = await textInputs[i].inputValue();
          if (value && (value.includes('/images/') || value.includes('/uploads/') || value.includes('.png') || value.includes('.jpg'))) {
            console.log(`🎯 이미지 URL 패턴 발견: "${value}"`);
            
            await textInputs[i].clear();
            const newImageUrl = '/images/blog3.png';
            await textInputs[i].fill(newImageUrl);
            
            console.log(`   ✅ 이미지 URL 변경: "${newImageUrl}"`);
            imageFieldChanged = true;
            break;
          }
        } catch (e) {
          // 계속 진행
        }
      }
    }
    
    // 7단계: 저장 버튼 클릭
    console.log('5️⃣ 변경사항 저장...');
    
    if (imageFieldChanged) {
      const saveSelectors = [
        'button:has-text("저장")',
        'button:has-text("업데이트")',
        'button:has-text("수정 완료")',
        'button[type="submit"]',
        '.save-button'
      ];
      
      let saveClicked = false;
      for (const selector of saveSelectors) {
        try {
          const saveButton = await page.locator(selector).first();
          if (await saveButton.isVisible()) {
            await saveButton.click();
            saveClicked = true;
            console.log(`✅ 저장 버튼 클릭: ${selector}`);
            await page.waitForTimeout(3000);
            break;
          }
        } catch (e) {
          console.log(`❌ 저장 버튼 시도 실패: ${selector}`);
        }
      }
      
      if (!saveClicked) {
        console.log('⚠️ 저장 버튼을 찾지 못했습니다');
      }
    } else {
      console.log('⚠️ 이미지 필드를 변경하지 못해 저장하지 않습니다');
    }
    
    // 8단계: 블로그 페이지에서 변경사항 확인
    console.log('6️⃣ 블로그 페이지에서 변경사항 확인...');
    
    await page.goto('http://localhost:4000/blog', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    // 최종 블로그 페이지 스크린샷
    const finalScreenshot = `blog-after-edit-final-${Date.now()}.png`;
    await page.screenshot({ 
      path: finalScreenshot,
      fullPage: true,
      timeout: 15000
    });
    console.log(`📸 최종 블로그 페이지 스크린샷: ${finalScreenshot}`);
    
    // 9단계: 이미지 변경사항 분석
    console.log('7️⃣ 이미지 변경사항 분석...');
    
    const blogImages = await page.locator('img[src*="/images/"], img[src*="/uploads/"]').all();
    console.log(`🖼️ 블로그 페이지 이미지 ${blogImages.length}개 분석:`);
    
    let changedImages = 0;
    for (let i = 0; i < blogImages.length; i++) {
      try {
        const src = await blogImages[i].getAttribute('src');
        const alt = await blogImages[i].getAttribute('alt');
        
        if (src && (src.includes('blog2.png') || src.includes('blog3.png'))) {
          changedImages++;
          console.log(`   🎯 변경된 이미지 발견: src="${src}", alt="${alt}"`);
        } else {
          console.log(`   ${i + 1}. src="${src}", alt="${alt}"`);
        }
      } catch (e) {
        console.log(`   ${i + 1}. 이미지 분석 실패`);
      }
    }
    
    // 10단계: 테스트 결과 요약
    console.log('📊 테스트 결과 요약:');
    console.log(`   - 편집 페이지 접근: ✅`);
    console.log(`   - 이미지 필드 변경: ${imageFieldChanged ? '✅' : '❌'}`);
    console.log(`   - 변경된 이미지 확인: ${changedImages > 0 ? '✅' : '❌'} (${changedImages}개)`);
    
    if (imageFieldChanged && changedImages > 0) {
      console.log('🎉 블로그 이미지 편집 기능이 정상적으로 작동합니다!');
    } else if (imageFieldChanged) {
      console.log('⚠️ 이미지 필드는 변경했지만 블로그 페이지에 반영되지 않았습니다.');
    } else {
      console.log('❌ 이미지 편집 필드를 찾지 못했습니다.');
    }
    
    console.log('✅ 최종 블로그 이미지 편집 테스트 완료');
    
    // 브라우저 유지
    console.log('🔍 10초간 브라우저 유지 (결과 확인)...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 최종 테스트 실패:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 실행
if (require.main === module) {
  finalBlogEditTest().catch(console.error);
}

module.exports = { finalBlogEditTest };