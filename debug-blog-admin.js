const { chromium } = require('playwright');

async function debugBlogAdmin() {
  console.log('🔍 블로그 관리 페이지 디버깅 시작');
  
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
    
    // 1. 관리자 페이지 접근
    console.log('1️⃣ 관리자 페이지 접근...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // 초기 스크린샷
    const adminScreenshot = `debug-admin-${Date.now()}.png`;
    await page.screenshot({ 
      path: adminScreenshot,
      fullPage: true 
    });
    console.log(`📸 관리자 페이지 스크린샷: ${adminScreenshot}`);
    
    await page.waitForTimeout(3000);
    
    // 2. 모든 탭 확인
    console.log('2️⃣ 사용 가능한 탭들 확인...');
    const tabs = await page.locator('[role="tab"], .tab, button[data-state]').all();
    console.log(`📋 총 ${tabs.length}개 탭 발견:`);
    
    for (let i = 0; i < tabs.length; i++) {
      try {
        const text = await tabs[i].textContent();
        const isVisible = await tabs[i].isVisible();
        console.log(`   ${i + 1}. "${text}" (visible: ${isVisible})`);
      } catch (e) {
        console.log(`   ${i + 1}. 탭 텍스트 읽기 실패`);
      }
    }
    
    // 3. 블로그 관리 탭 찾기 및 클릭
    console.log('3️⃣ 블로그 관리 탭 클릭 시도...');
    const blogTabSelectors = [
      '[role="tab"]:has-text("블로그 관리")',
      'button:has-text("블로그 관리")',
      '[data-testid="tab-blog-management"]',
      '.tabs [data-state="inactive"]:has-text("블로그")',
      'button[data-state="inactive"]:has-text("블로그")',
      'div[role="tablist"] button:has-text("블로그")'
    ];
    
    let blogTabClicked = false;
    for (const selector of blogTabSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          blogTabClicked = true;
          console.log(`✅ 블로그 탭 클릭 성공: ${selector}`);
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        console.log(`❌ 선택자 실패: ${selector}`);
      }
    }
    
    if (!blogTabClicked) {
      console.log('⚠️ 직접 URL로 블로그 탭 접근 시도');
      await page.goto('http://localhost:4000/admin?tab=blog', { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
      await page.waitForTimeout(3000);
    }
    
    // 4. 블로그 탭 활성화 후 스크린샷
    const blogTabScreenshot = `debug-blog-tab-${Date.now()}.png`;
    await page.screenshot({ 
      path: blogTabScreenshot,
      fullPage: true 
    });
    console.log(`📸 블로그 탭 스크린샷: ${blogTabScreenshot}`);
    
    // 5. 블로그 포스트 목록 확인
    console.log('4️⃣ 블로그 포스트 목록 확인...');
    
    // 다양한 방법으로 포스트 목록 찾기
    const postContainerSelectors = [
      '.blog-posts',
      '.post-list',
      'table tbody tr',
      '[data-testid="blog-posts-list"]',
      '.posts-container',
      'div:has(button:has-text("편집"))'
    ];
    
    for (const selector of postContainerSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          console.log(`✅ 포스트 컨테이너 발견: ${selector} (${elements.length}개)`);
          
          // 각 포스트의 편집 버튼 찾기
          for (let i = 0; i < Math.min(elements.length, 3); i++) {
            const editButtons = await elements[i].locator('button').all();
            console.log(`   포스트 ${i + 1}: ${editButtons.length}개 버튼 발견`);
            
            for (let j = 0; j < editButtons.length; j++) {
              try {
                const buttonText = await editButtons[j].textContent();
                console.log(`      버튼 ${j + 1}: "${buttonText}"`);
              } catch (e) {
                console.log(`      버튼 ${j + 1}: 텍스트 읽기 실패`);
              }
            }
          }
        }
      } catch (e) {
        console.log(`❌ 컨테이너 선택자 실패: ${selector}`);
      }
    }
    
    // 6. 모든 버튼 찾기
    console.log('5️⃣ 페이지의 모든 버튼 확인...');
    const allButtons = await page.locator('button').all();
    console.log(`🔘 총 ${allButtons.length}개 버튼 발견:`);
    
    for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
      try {
        const text = await allButtons[i].textContent();
        const isVisible = await allButtons[i].isVisible();
        console.log(`   ${i + 1}. "${text}" (visible: ${isVisible})`);
      } catch (e) {
        console.log(`   ${i + 1}. 버튼 텍스트 읽기 실패`);
      }
    }
    
    // 7. 편집 관련 버튼 특별 검색
    console.log('6️⃣ 편집 관련 버튼 특별 검색...');
    const editKeywords = ['편집', 'edit', '수정', 'modify', 'update'];
    
    for (const keyword of editKeywords) {
      const buttons = await page.locator(`button:has-text("${keyword}")`).all();
      if (buttons.length > 0) {
        console.log(`🎯 "${keyword}" 버튼 ${buttons.length}개 발견`);
        
        for (let i = 0; i < buttons.length; i++) {
          try {
            const isVisible = await buttons[i].isVisible();
            const text = await buttons[i].textContent();
            console.log(`   ${i + 1}. "${text}" (visible: ${isVisible})`);
          } catch (e) {
            console.log(`   ${i + 1}. 버튼 정보 읽기 실패`);
          }
        }
      }
    }
    
    console.log('✅ 블로그 관리 페이지 디버깅 완료');
    
    // 브라우저를 5초간 유지하여 수동 확인 가능
    console.log('🔍 5초간 브라우저 유지 (수동 확인 가능)...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 디버깅 실패:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 실행
if (require.main === module) {
  debugBlogAdmin().catch(console.error);
}

module.exports = { debugBlogAdmin };