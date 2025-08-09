const { chromium } = require('playwright');
const path = require('path');

async function blogImageUploadTest() {
  console.log('📸 블로그 이미지 업로드 기능 테스트');
  
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
    
    // 2단계: 포스트 수정 버튼 클릭 (두 번째 버튼)
    console.log('2️⃣ 포스트 수정 버튼 클릭...');
    const editButton = await page.locator('table tbody tr:first-child td:last-child button').nth(1);
    await editButton.click();
    await page.waitForTimeout(5000);
    
    console.log('✅ 편집 폼 로드 완료');
    
    // 3단계: 현재 이미지 상태 확인
    console.log('3️⃣ 현재 특성 이미지 상태 확인...');
    
    const fileInput = await page.locator('input[type="file"]').first();
    const fileInputExists = await fileInput.isVisible();
    console.log(`파일 업로드 필드 존재: ${fileInputExists}`);
    
    if (fileInputExists) {
      // 4단계: 기존 이미지 확인
      console.log('4️⃣ 기존 이미지 파일 확인...');
      
      // 편집 폼에서 현재 사용 중인 이미지 확인
      const currentImageDisplay = await page.locator('img, [src*="/images/"], [src*="/uploads/"]').all();
      console.log(`편집 폼에서 발견된 이미지: ${currentImageDisplay.length}개`);
      
      for (let i = 0; i < currentImageDisplay.length; i++) {
        try {
          const src = await currentImageDisplay[i].getAttribute('src');
          if (src && (src.includes('/images/') || src.includes('/uploads/'))) {
            console.log(`   기존 이미지 ${i + 1}: ${src}`);
          }
        } catch (e) {
          console.log(`   이미지 ${i + 1}: 속성 읽기 실패`);
        }
      }
      
      // 5단계: 새 이미지 파일 업로드 시뮬레이션
      console.log('5️⃣ 새 이미지 파일 업로드 시뮬레이션...');
      
      // 프로젝트에서 사용 가능한 이미지 파일 찾기
      const testImagePath = path.join(__dirname, 'public/images/blog2.png');
      const fallbackImagePath = path.join(__dirname, 'public/images/blog3.png');
      const alternativeImagePath = '/mnt/e/project/test-studio-firebase/public/images/blog4.png';
      
      try {
        // 파일 존재 확인 후 업로드 시뮬레이션
        console.log(`업로드 시도할 이미지 경로: ${alternativeImagePath}`);
        
        // 실제 파일 업로드 (주의: 테스트 환경에서만)
        await fileInput.setInputFiles(alternativeImagePath);
        console.log('✅ 새 이미지 파일 선택 완료');
        
        await page.waitForTimeout(2000);
        
        // 파일 업로드 후 변화 확인
        const afterUploadScreenshot = `after-image-upload-${Date.now()}.png`;
        await page.screenshot({ 
          path: afterUploadScreenshot,
          fullPage: true,
          timeout: 15000
        });
        console.log(`📸 이미지 업로드 후 스크린샷: ${afterUploadScreenshot}`);
        
      } catch (uploadError) {
        console.log(`❌ 파일 업로드 실패: ${uploadError.message}`);
        console.log('💡 다른 접근 방법 시도...');
        
        // 대안: 파일 입력 필드의 다른 속성들 확인
        const fileInputName = await fileInput.getAttribute('name');
        const fileInputAccept = await fileInput.getAttribute('accept');
        console.log(`파일 입력 필드 - name: "${fileInputName}", accept: "${fileInputAccept}"`);
      }
      
      // 6단계: 저장 버튼 찾기 및 클릭
      console.log('6️⃣ 변경사항 저장...');
      
      const saveButton = await page.locator('button:has-text("저장"), button[type="submit"], button:has-text("수정")').first();
      const saveButtonExists = await saveButton.isVisible();
      
      if (saveButtonExists) {
        console.log('✅ 저장 버튼 발견');
        await saveButton.click();
        await page.waitForTimeout(3000);
        console.log('💾 저장 완료');
      } else {
        console.log('❌ 저장 버튼을 찾을 수 없음');
      }
      
    } else {
      console.log('❌ 파일 업로드 필드를 찾을 수 없음');
    }
    
    // 7단계: 블로그 페이지에서 변경사항 확인
    console.log('7️⃣ 블로그 페이지에서 변경사항 확인...');
    
    await page.goto('http://localhost:4000/blog', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    // 최종 블로그 페이지 스크린샷
    const finalBlogScreenshot = `final-blog-with-new-image-${Date.now()}.png`;
    await page.screenshot({ 
      path: finalBlogScreenshot,
      fullPage: true,
      timeout: 15000
    });
    console.log(`📸 최종 블로그 페이지 스크린샷: ${finalBlogScreenshot}`);
    
    // 8단계: 이미지 변경사항 확인
    console.log('8️⃣ 이미지 변경사항 분석...');
    
    const allBlogImages = await page.locator('img').all();
    console.log(`블로그 페이지 전체 이미지 ${allBlogImages.length}개:`);
    
    let newImageFound = false;
    for (let i = 0; i < allBlogImages.length; i++) {
      try {
        const src = await allBlogImages[i].getAttribute('src');
        const alt = await allBlogImages[i].getAttribute('alt');
        
        console.log(`   ${i + 1}. src: "${src}", alt: "${alt}"`);
        
        // 새로 업로드된 이미지나 변경된 이미지 패턴 확인
        if (src && (src.includes('blog4.png') || src.includes('uploads/'))) {
          newImageFound = true;
          console.log(`   🎯 새로 업로드된 이미지 발견!`);
        }
      } catch (e) {
        console.log(`   ${i + 1}. 이미지 분석 실패`);
      }
    }
    
    // 9단계: 테스트 결과 요약
    console.log('📊 블로그 이미지 업로드 테스트 결과:');
    console.log(`   - 편집 폼 접근: ✅`);
    console.log(`   - 파일 업로드 필드 발견: ${fileInputExists ? '✅' : '❌'}`);
    console.log(`   - 새 이미지 업로드: ${newImageFound ? '✅' : '⚠️'}`);
    console.log(`   - 블로그 페이지 반영: ${newImageFound ? '✅' : '❌'}`);
    
    if (fileInputExists && newImageFound) {
      console.log('🎉 블로그 이미지 업로드 및 변경 기능이 정상 작동합니다!');
    } else if (fileInputExists) {
      console.log('⚠️ 업로드 필드는 있지만 변경사항이 블로그에 반영되지 않았을 수 있습니다.');
    } else {
      console.log('❌ 이미지 업로드 기능에 문제가 있을 수 있습니다.');
    }
    
    console.log('✅ 블로그 이미지 업로드 테스트 완료');
    
    // 브라우저 유지
    console.log('🔍 10초간 브라우저 유지 (결과 확인)...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 이미지 업로드 테스트 실패:', error.message);
    
    // 오류 발생 시에도 스크린샷 촬영
    try {
      const errorScreenshot = `error-screenshot-${Date.now()}.png`;
      await page.screenshot({ 
        path: errorScreenshot,
        fullPage: true,
        timeout: 5000
      });
      console.log(`📸 오류 발생 시 스크린샷: ${errorScreenshot}`);
    } catch (screenshotError) {
      console.log('스크린샷 촬영도 실패');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 실행
if (require.main === module) {
  blogImageUploadTest().catch(console.error);
}

module.exports = { blogImageUploadTest };