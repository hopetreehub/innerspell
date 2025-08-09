const { chromium } = require('playwright');

async function completeBlogEditTest() {
  console.log('🔧 완전한 블로그 편집 기능 테스트');
  
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
    
    // 1단계: 관리자 페이지 접근
    console.log('1️⃣ 관리자 페이지 접근...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // 블로그 관리 탭 클릭
    await page.waitForTimeout(2000);
    const blogTab = await page.locator('[role="tab"]:has-text("블로그 관리")').first();
    await blogTab.click();
    await page.waitForTimeout(3000);
    
    console.log('✅ 블로그 관리 페이지 접근 완료');
    
    // 2단계: 첫 번째 포스트 선택 상태 확인
    console.log('2️⃣ 첫 번째 포스트 상태 확인...');
    
    const firstRow = page.locator('table tbody tr:first-child');
    const firstRowState = await firstRow.getAttribute('class');
    console.log(`첫 번째 행 상태: ${firstRowState}`);
    
    // 3단계: 편집 버튼들 모두 테스트
    console.log('3️⃣ 편집 버튼 상세 테스트...');
    
    const actionButtons = await page.locator('table tbody tr:first-child td:last-child button').all();
    console.log(`액션 버튼 ${actionButtons.length}개 발견`);
    
    for (let i = 0; i < actionButtons.length; i++) {
      try {
        const ariaLabel = await actionButtons[i].getAttribute('aria-label');
        const title = await actionButtons[i].getAttribute('title');
        const innerHTML = await actionButtons[i].innerHTML();
        console.log(`   버튼 ${i + 1}: aria-label="${ariaLabel}", title="${title}", html="${innerHTML.substring(0, 50)}..."`);
      } catch (e) {
        console.log(`   버튼 ${i + 1}: 속성 읽기 실패`);
      }
    }
    
    // 4단계: 편집 버튼(첫 번째) 클릭 후 상태 변화 관찰
    console.log('4️⃣ 편집 버튼 클릭 후 변화 관찰...');
    
    if (actionButtons.length > 0) {
      await actionButtons[0].click();
      await page.waitForTimeout(2000);
      console.log('✅ 첫 번째 액션 버튼 클릭 완료');
      
      // 클릭 후 스크린샷
      const afterClickScreenshot = `after-edit-click-${Date.now()}.png`;
      await page.screenshot({ 
        path: afterClickScreenshot,
        fullPage: true 
      });
      console.log(`📸 편집 클릭 후 스크린샷: ${afterClickScreenshot}`);
      
      // 모달이나 새 요소가 나타났는지 확인
      const modals = await page.locator('[role="dialog"], .modal, .dialog, .popup').all();
      if (modals.length > 0) {
        console.log(`🎪 ${modals.length}개 모달/다이얼로그 발견`);
        
        // 각 모달의 내용 확인
        for (let i = 0; i < modals.length; i++) {
          try {
            const isVisible = await modals[i].isVisible();
            if (isVisible) {
              const modalText = await modals[i].textContent();
              console.log(`   모달 ${i + 1}: "${modalText.substring(0, 100)}..."`);
              
              // 모달 내의 입력 필드 찾기
              const modalInputs = await modals[i].locator('input, textarea, select').all();
              console.log(`   모달 내 입력 필드 ${modalInputs.length}개:`);
              
              for (let j = 0; j < modalInputs.length; j++) {
                try {
                  const name = await modalInputs[j].getAttribute('name');
                  const type = await modalInputs[j].getAttribute('type');
                  const placeholder = await modalInputs[j].getAttribute('placeholder');
                  console.log(`      필드 ${j + 1}: ${type}[name="${name}"] placeholder="${placeholder}"`);
                } catch (e) {
                  console.log(`      필드 ${j + 1}: 정보 읽기 실패`);
                }
              }
            }
          } catch (e) {
            console.log(`   모달 ${i + 1}: 내용 읽기 실패`);
          }
        }
      } else {
        console.log('❌ 모달이나 다이얼로그 없음');
      }
      
      // 새로운 페이지나 섹션이 로드되었는지 확인
      const currentUrl = page.url();
      console.log(`현재 URL: ${currentUrl}`);
      
      // 페이지의 모든 입력 필드 다시 확인
      const allInputs = await page.locator('input, textarea, select').all();
      console.log(`📝 페이지 전체 입력 필드 ${allInputs.length}개:`);
      
      for (let i = 0; i < Math.min(allInputs.length, 10); i++) {
        try {
          const name = await allInputs[i].getAttribute('name');
          const type = await allInputs[i].getAttribute('type');
          const placeholder = await allInputs[i].getAttribute('placeholder');
          const isVisible = await allInputs[i].isVisible();
          console.log(`   ${i + 1}. ${type}[name="${name}"] placeholder="${placeholder}" visible=${isVisible}`);
        } catch (e) {
          console.log(`   ${i + 1}. 필드 정보 읽기 실패`);
        }
      }
    }
    
    // 5단계: "새 포스트 작성" 버튼 테스트
    console.log('5️⃣ "새 포스트 작성" 버튼 테스트...');
    
    const newPostButton = page.locator('button:has-text("새 포스트 작성")');
    if (await newPostButton.isVisible()) {
      console.log('✅ 새 포스트 작성 버튼 발견');
      await newPostButton.click();
      await page.waitForTimeout(3000);
      
      const newPostScreenshot = `new-post-form-${Date.now()}.png`;
      await page.screenshot({ 
        path: newPostScreenshot,
        fullPage: true 
      });
      console.log(`📸 새 포스트 폼 스크린샷: ${newPostScreenshot}`);
      
      // 새 포스트 폼의 모든 필드 확인
      const newPostInputs = await page.locator('input, textarea, select').all();
      console.log(`📝 새 포스트 폼 입력 필드 ${newPostInputs.length}개:`);
      
      for (let i = 0; i < newPostInputs.length; i++) {
        try {
          const name = await newPostInputs[i].getAttribute('name');
          const type = await newPostInputs[i].getAttribute('type');
          const placeholder = await newPostInputs[i].getAttribute('placeholder');
          const isVisible = await newPostInputs[i].isVisible();
          console.log(`   ${i + 1}. ${type}[name="${name}"] placeholder="${placeholder}" visible=${isVisible}`);
        } catch (e) {
          console.log(`   ${i + 1}. 필드 정보 읽기 실패`);
        }
      }
      
      // 6단계: 이미지 필드 테스트
      console.log('6️⃣ 이미지 필드 테스트 및 변경...');
      
      // 이미지 관련 필드 찾기
      const imageFields = await page.locator('input[name*="image"], input[placeholder*="이미지"], input[type="file"], input[accept*="image"]').all();
      
      if (imageFields.length > 0) {
        console.log(`🖼️ 이미지 관련 필드 ${imageFields.length}개 발견:`);
        
        for (let i = 0; i < imageFields.length; i++) {
          try {
            const name = await imageFields[i].getAttribute('name');
            const type = await imageFields[i].getAttribute('type');
            const accept = await imageFields[i].getAttribute('accept');
            const placeholder = await imageFields[i].getAttribute('placeholder');
            const isVisible = await imageFields[i].isVisible();
            
            console.log(`   ${i + 1}. ${type}[name="${name}"] accept="${accept}" placeholder="${placeholder}" visible=${isVisible}`);
            
            if (isVisible && type !== 'file') {
              // URL 입력 필드인 경우 테스트
              await imageFields[i].clear();
              const testImageUrl = '/images/test-blog-edit.png';
              await imageFields[i].fill(testImageUrl);
              console.log(`     ✅ 테스트 이미지 URL 입력: ${testImageUrl}`);
            }
          } catch (e) {
            console.log(`   ${i + 1}. 이미지 필드 처리 실패`);
          }
        }
      } else {
        console.log('❌ 이미지 관련 필드 없음');
      }
      
      // 7단계: 저장/제출 버튼 확인
      console.log('7️⃣ 저장/제출 버튼 확인...');
      
      const submitButtons = await page.locator('button[type="submit"], button:has-text("저장"), button:has-text("등록"), button:has-text("작성")').all();
      
      if (submitButtons.length > 0) {
        console.log(`💾 저장 버튼 ${submitButtons.length}개 발견:`);
        
        for (let i = 0; i < submitButtons.length; i++) {
          try {
            const text = await submitButtons[i].textContent();
            const isVisible = await submitButtons[i].isVisible();
            console.log(`   ${i + 1}. "${text}" visible=${isVisible}`);
          } catch (e) {
            console.log(`   ${i + 1}. 버튼 정보 읽기 실패`);
          }
        }
        
        // 첫 번째 저장 버튼 클릭 시뮬레이션 (실제로는 클릭하지 않음)
        console.log('⚠️ 실제 저장은 하지 않고 테스트만 수행');
      } else {
        console.log('❌ 저장 버튼 없음');
      }
    } else {
      console.log('❌ 새 포스트 작성 버튼 없음');
    }
    
    // 8단계: 현재 블로그 페이지 확인
    console.log('8️⃣ 현재 블로그 페이지 상태 확인...');
    
    await page.goto('http://localhost:4000/blog', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    // 최종 블로그 페이지 스크린샷
    const finalBlogScreenshot = `final-blog-state-${Date.now()}.png`;
    await page.screenshot({ 
      path: finalBlogScreenshot,
      fullPage: true 
    });
    console.log(`📸 최종 블로그 페이지: ${finalBlogScreenshot}`);
    
    // 블로그 이미지들 분석
    const blogImages = await page.locator('img[src*="/images/"], img[src*="/uploads/"]').all();
    console.log(`🖼️ 블로그 이미지 ${blogImages.length}개 분석:`);
    
    for (let i = 0; i < blogImages.length; i++) {
      try {
        const src = await blogImages[i].getAttribute('src');
        const alt = await blogImages[i].getAttribute('alt');
        console.log(`   ${i + 1}. src: "${src}", alt: "${alt}"`);
      } catch (e) {
        console.log(`   ${i + 1}. 이미지 분석 실패`);
      }
    }
    
    console.log('✅ 완전한 블로그 편집 기능 테스트 완료');
    
    // 브라우저 유지
    console.log('🔍 15초간 브라우저 유지 (결과 확인)...');
    await page.waitForTimeout(15000);
    
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
  completeBlogEditTest().catch(console.error);
}

module.exports = { completeBlogEditTest };