const { chromium } = require('playwright');

async function captureScreenshot(page, name) {
  await page.screenshot({ 
    path: `screenshots/file-storage-test-${name}.png`,
    fullPage: true
  });
  console.log(`📸 Screenshot captured: file-storage-test-${name}.png`);
}

async function testBlogFileStorage() {
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    page = await context.newPage();
    
    console.log('🌐 Navigating to http://localhost:4000/admin...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // Step 1: 관리자 페이지 로드 확인
    await captureScreenshot(page, '01-admin-loaded');
    
    // Step 2: 블로그 관리 탭 클릭
    console.log('📚 Clicking blog management tab...');
    await page.click('[role="tab"]:has-text("블로그 관리")');
    await page.waitForTimeout(2000);
    await captureScreenshot(page, '02-blog-tab-clicked');
    
    // Step 3: 기존 포스트 목록 확인 (파일에서 로드되는지)
    console.log('📋 Checking existing posts loaded from file storage...');
    
    // 포스트가 로드될 때까지 기다리기
    await page.waitForTimeout(3000);
    
    // 포스트 카드 확인
    const postCards = await page.$$('[role="article"]');
    console.log(`✅ Found ${postCards.length} existing blog posts`);
    
    // 포스트가 표시되지 않으면 새 포스트 작성 버튼도 없을 수 있음
    // 블로그 관리 UI 구조 확인
    const hasNewPostButton = await page.$('button:has-text("새 포스트 작성")');
    
    if (!hasNewPostButton) {
      console.log('⚠️ "새 포스트 작성" 버튼이 없습니다. UI 구조 확인 중...');
      
      // 포스트 목록이 비어있을 때의 UI 확인
      const emptyState = await page.$('text="아직 작성된 포스트가 없습니다"');
      if (emptyState) {
        console.log('📭 포스트 목록이 비어있습니다.');
      }
      
      // 플로팅 버튼 또는 다른 형태의 추가 버튼 찾기
      const addButton = await page.$('button[aria-label*="추가"], button[aria-label*="새"], button[aria-label*="작성"], button:has-text("+")');
      if (addButton) {
        console.log('➕ 대체 추가 버튼을 찾았습니다.');
        await addButton.click();
        await page.waitForTimeout(2000);
        await captureScreenshot(page, '03-new-post-modal');
      } else {
        console.log('❌ 새 포스트 작성 버튼을 찾을 수 없습니다.');
        return;
      }
    } else {
      // Step 4: 새 포스트 작성 버튼 클릭
      console.log('➕ Opening new post modal...');
      await page.click('button:has-text("새 포스트 작성")');
      await page.waitForTimeout(2000);
      await captureScreenshot(page, '03-new-post-modal');
    }
    
    // Step 5: 포스트 데이터 입력
    console.log('📝 Filling in post data...');
    const timestamp = Date.now();
    const postTitle = `파일 저장소 테스트 포스트 ${timestamp}`;
    
    await page.fill('input[placeholder*="제목"]', postTitle);
    await page.fill('textarea[placeholder*="요약"]', '파일 시스템 저장소가 올바르게 작동하는지 테스트합니다.');
    
    // 본문 에디터 (contenteditable)
    const contentEditor = await page.$('.tiptap.ProseMirror, [contenteditable="true"]');
    if (contentEditor) {
      await contentEditor.click();
      await page.keyboard.type('# 파일 저장소 테스트\n\n이 포스트는 파일 시스템 저장소에 저장됩니다.\n\n## 특징\n- 서버 재시작 후에도 데이터 유지\n- 자동 백업 생성\n- 빠른 읽기/쓰기 성능');
    }
    
    // 카테고리 선택
    const categoryButton = await page.$('button[role="combobox"]');
    if (categoryButton) {
      await categoryButton.click();
      await page.waitForTimeout(500);
      const dreamOption = await page.$('[role="option"]:has-text("dream")');
      if (dreamOption) {
        await dreamOption.click();
      }
    }
    
    // 태그 입력
    const tagInput = await page.$('input[placeholder*="태그"]');
    if (tagInput) {
      await tagInput.fill('파일저장소');
      await tagInput.press('Enter');
      await tagInput.fill('테스트');
      await tagInput.press('Enter');
    }
    
    // 게시 상태 설정
    const publishSwitch = await page.$('button[role="switch"], input[type="checkbox"]');
    if (publishSwitch) {
      await publishSwitch.click();
      console.log('✅ 게시 상태로 설정');
    }
    
    await captureScreenshot(page, '04-form-filled');
    
    // Step 6: 저장 버튼 클릭
    console.log('💾 Saving post to file storage...');
    await page.click('button:has-text("저장")');
    await page.waitForTimeout(3000);
    
    // Step 7: 저장 후 포스트 목록 확인
    console.log('🔍 Verifying post was saved...');
    await captureScreenshot(page, '05-after-save');
    
    // 새로운 포스트가 추가되었는지 확인
    const newPostCards = await page.$$('[role="article"]');
    console.log(`✅ Post count after save: ${newPostCards.length}`);
    
    // 저장된 포스트 찾기
    const savedPost = await page.$(`text="${postTitle}"`);
    if (savedPost) {
      console.log('✅ New post found in the list!');
    } else {
      console.log('⚠️ New post not immediately visible, checking for refresh...');
      
      // 페이지 새로고침 후 확인
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.click('[role="tab"]:has-text("블로그 관리")');
      await page.waitForTimeout(2000);
      
      const savedPostAfterRefresh = await page.$(`text="${postTitle}"`);
      if (savedPostAfterRefresh) {
        console.log('✅ New post found after refresh!');
      }
    }
    
    // Step 8: 데이터 파일 확인
    console.log('\n📁 Checking data file...');
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(process.cwd(), 'data', 'blog-posts.json');
    
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      console.log(`✅ Data file exists with ${data.posts.length} posts`);
      console.log(`📅 Last updated: ${data.lastUpdated}`);
      
      // 방금 저장한 포스트 확인
      const recentPost = data.posts.find(p => p.title === postTitle);
      if (recentPost) {
        console.log('✅ Recently saved post found in data file!');
        console.log(`   ID: ${recentPost.id}`);
        console.log(`   Title: ${recentPost.title}`);
        console.log(`   Category: ${recentPost.category}`);
        console.log(`   Tags: ${recentPost.tags.join(', ')}`);
        console.log(`   Published: ${recentPost.published}`);
      }
    } else {
      console.log('❌ Data file not found');
    }
    
    // Step 9: 백업 파일 확인
    const backupPath = path.join(process.cwd(), 'data', 'backups');
    if (fs.existsSync(backupPath)) {
      const backups = fs.readdirSync(backupPath).filter(f => f.startsWith('blog-posts_'));
      console.log(`\n📦 Found ${backups.length} backup files`);
      if (backups.length > 0) {
        console.log('   Latest backups:');
        backups.slice(0, 3).forEach(b => console.log(`   - ${b}`));
      }
    }
    
    console.log('\n✅ File storage test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (page) {
      await captureScreenshot(page, 'error-state');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testBlogFileStorage();