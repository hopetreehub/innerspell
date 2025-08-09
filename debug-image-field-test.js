const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'debug-step-1-admin-loaded.png' });
    
    console.log('2. 블로그 관리 탭 찾기...');
    // 모든 버튼 텍스트 확인
    const allButtons = await page.locator('button').allTextContents();
    console.log('페이지의 모든 버튼:', allButtons);
    
    // 블로그 관리 탭 클릭 시도
    const blogTab = page.locator('button:has-text("블로그")');
    if (await blogTab.isVisible()) {
      await blogTab.click();
      console.log('블로그 탭 클릭 성공');
    } else {
      console.log('블로그 탭을 찾을 수 없음');
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-step-2-blog-tab-clicked.png' });
    
    console.log('3. 새 포스트 작성 버튼 찾기...');
    const newPostButtons = await page.locator('button').allTextContents();
    console.log('블로그 탭에서 사용 가능한 버튼들:', newPostButtons);
    
    const newPostButton = page.locator('button:has-text("새 포스트")');
    if (await newPostButton.isVisible()) {
      await newPostButton.click();
      console.log('새 포스트 버튼 클릭 성공');
    } else {
      console.log('새 포스트 버튼을 찾을 수 없음');
      // 다른 가능한 버튼들 시도
      const plusButton = page.locator('button:has-text("+")');
      if (await plusButton.isVisible()) {
        await plusButton.click();
        console.log('+ 버튼 클릭 시도');
      }
    }
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'debug-step-3-new-post-clicked.png' });
    
    console.log('4. 다이얼로그 내용 상세 확인...');
    
    // 다이얼로그가 열렸는지 확인
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible()) {
      console.log('다이얼로그가 열렸습니다.');
      
      // 다이얼로그 내의 모든 텍스트 확인
      const dialogText = await dialog.textContent();
      console.log('다이얼로그 전체 텍스트:', dialogText);
      
      // 모든 라벨 확인
      const labels = await dialog.locator('label').allTextContents();
      console.log('다이얼로그 내 모든 라벨:', labels);
      
      // 모든 입력 필드 확인
      const inputs = await dialog.locator('input, textarea, select').count();
      console.log('다이얼로그 내 입력 필드 개수:', inputs);
      
      // 각 입력 필드의 타입과 이름 확인
      for (let i = 0; i < inputs; i++) {
        const input = dialog.locator('input, textarea, select').nth(i);
        const tagName = await input.evaluate(el => el.tagName);
        const type = await input.getAttribute('type') || 'N/A';
        const name = await input.getAttribute('name') || 'N/A';
        const placeholder = await input.getAttribute('placeholder') || 'N/A';
        console.log(`입력 필드 ${i}: ${tagName}, type: ${type}, name: ${name}, placeholder: ${placeholder}`);
      }
      
      // 이미지 업로드 관련 요소 찾기
      console.log('\n5. 이미지 업로드 필드 상세 검색...');
      
      const fileInputs = await dialog.locator('input[type="file"]').count();
      console.log('파일 입력 필드 개수:', fileInputs);
      
      const imageLabels = await dialog.locator('label:has-text("이미지"), label:has-text("Image")').count();
      console.log('이미지 관련 라벨 개수:', imageLabels);
      
      // ImageUpload 컴포넌트 찾기
      const imageUploadDivs = await dialog.locator('div').allTextContents();
      const imageRelatedDivs = imageUploadDivs.filter(text => 
        text.includes('이미지') || 
        text.includes('업로드') || 
        text.includes('Image') ||
        text.includes('Upload')
      );
      console.log('이미지 관련 div 텍스트:', imageRelatedDivs.slice(0, 3));
      
      // 대표 이미지 라벨 확인
      const featuredImageLabel = dialog.locator('label:has-text("대표 이미지")');
      const isLabelVisible = await featuredImageLabel.isVisible();
      console.log('"대표 이미지" 라벨이 보이는가?', isLabelVisible);
      
      if (isLabelVisible) {
        // 라벨 다음에 있는 요소들 확인
        const nextSiblings = await featuredImageLabel.locator('xpath=following-sibling::*').count();
        console.log('대표 이미지 라벨 다음 요소 개수:', nextSiblings);
        
        // 부모 div 확인
        const parentDiv = featuredImageLabel.locator('xpath=parent::*');
        const parentContent = await parentDiv.textContent();
        console.log('대표 이미지 라벨의 부모 div 내용:', parentContent);
      }
      
    } else {
      console.log('다이얼로그가 열리지 않았습니다.');
    }
    
    await page.screenshot({ path: 'debug-step-4-dialog-analysis.png' });
    
    // 스크롤해서 숨겨진 요소가 있는지 확인
    console.log('6. 스크롤해서 숨겨진 요소 확인...');
    if (await dialog.isVisible()) {
      await dialog.evaluate(el => el.scrollTop = el.scrollHeight);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'debug-step-5-dialog-scrolled.png' });
      
      // 스크롤 후 다시 이미지 필드 찾기
      const fileInputsAfterScroll = await dialog.locator('input[type="file"]').count();
      console.log('스크롤 후 파일 입력 필드 개수:', fileInputsAfterScroll);
    }
    
    console.log('\n✅ 디버깅 완료!');
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'debug-error-screenshot.png' });
  }

  await browser.close();
})();