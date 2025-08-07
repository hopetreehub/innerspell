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
    await page.waitForTimeout(3000); // 데이터 로딩 대기
    
    await captureScreenshot(page, '02-blog-tab-clicked');
    
    // Step 3: 기존 포스트 목록 확인
    console.log('📋 Checking existing posts loaded from file storage...');
    
    // 테이블 구조 확인
    const table = await page.$('table');
    if (table) {
      const rows = await page.$$('tbody tr');
      console.log(`✅ Found ${rows.length} blog posts in table`);
    }
    
    // "새 포스트" 버튼 찾기
    const newPostButton = await page.$('button:has-text("새 포스트")');
    
    if (!newPostButton) {
      console.log('❌ 새 포스트 버튼을 찾을 수 없습니다.');
      
      // 페이지 구조 디버깅
      const pageContent = await page.content();
      if (pageContent.includes('로딩 중') || pageContent.includes('loading')) {
        console.log('⏳ 페이지가 아직 로딩 중입니다.');
      }
      
      return;
    }
    
    // Step 4: 새 포스트 작성 버튼 클릭
    console.log('➕ Opening new post modal...');
    await newPostButton.click();
    await page.waitForTimeout(2000);
    await captureScreenshot(page, '03-new-post-modal');
    
    // Step 5: 포스트 데이터 입력
    console.log('📝 Filling in post data...');
    const timestamp = Date.now();
    const postTitle = `파일 저장소 테스트 포스트 ${timestamp}`;
    
    // 제목 입력
    await page.fill('input[placeholder="포스트 제목을 입력하세요"]', postTitle);
    
    // 요약 입력
    await page.fill('textarea[placeholder*="요약"]', '파일 시스템 저장소가 올바르게 작동하는지 테스트합니다.');
    
    // 카테고리 선택
    await page.click('[role="combobox"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]:has-text("꿈해몽")');
    
    // 태그 입력
    await page.fill('input[placeholder*="타로, 초보자, 가이드"]', '파일저장소, 테스트, 2025');
    
    // 본문 입력
    await page.fill('textarea[placeholder*="마크다운"]', `# 파일 저장소 테스트

이 포스트는 파일 시스템 저장소에 저장됩니다.

## 특징
- 서버 재시작 후에도 데이터 유지
- 자동 백업 생성
- 빠른 읽기/쓰기 성능

## 테스트 시간
생성 시간: ${new Date().toISOString()}`);
    
    // 게시 상태 설정
    const publishSwitch = await page.$('label[for="published"]');
    if (publishSwitch) {
      await publishSwitch.click();
      console.log('✅ 게시 상태로 설정');
    }
    
    await captureScreenshot(page, '04-form-filled');
    
    // Step 6: 저장 버튼 클릭
    console.log('💾 Saving post to file storage...');
    await page.click('button:has-text("저장")');
    await page.waitForTimeout(3000);
    
    // Step 7: 저장 후 확인
    console.log('🔍 Verifying post was saved...');
    
    // 다이얼로그가 닫혔는지 확인
    const dialogClosed = await page.$('[role="dialog"]') === null;
    if (dialogClosed) {
      console.log('✅ 다이얼로그가 닫혔습니다.');
    }
    
    await captureScreenshot(page, '05-after-save');
    
    // 저장된 포스트 찾기
    const savedPost = await page.$(`text="${postTitle}"`);
    if (savedPost) {
      console.log('✅ New post found in the list!');
    } else {
      console.log('⚠️ New post not immediately visible, refreshing...');
      
      // 페이지 새로고침
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.click('[role="tab"]:has-text("블로그 관리")');
      await page.waitForTimeout(2000);
      
      const savedPostAfterRefresh = await page.$(`text="${postTitle}"`);
      if (savedPostAfterRefresh) {
        console.log('✅ New post found after refresh!');
      }
      
      await captureScreenshot(page, '06-after-refresh');
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
        console.log('\n✅ Recently saved post found in data file!');
        console.log(`   ID: ${recentPost.id}`);
        console.log(`   Title: ${recentPost.title}`);
        console.log(`   Category: ${recentPost.category}`);
        console.log(`   Tags: ${recentPost.tags.join(', ')}`);
        console.log(`   Published: ${recentPost.published}`);
        console.log(`   Created: ${recentPost.createdAt}`);
      } else {
        console.log('❌ New post not found in data file');
      }
    } else {
      console.log('❌ Data file not found at:', dataPath);
    }
    
    // Step 9: 백업 파일 확인
    const backupPath = path.join(process.cwd(), 'data', 'backups');
    if (fs.existsSync(backupPath)) {
      const backups = fs.readdirSync(backupPath).filter(f => f.startsWith('blog-posts_'));
      console.log(`\n📦 Found ${backups.length} backup files`);
      if (backups.length > 0) {
        console.log('   Latest backups:');
        backups.sort().reverse().slice(0, 3).forEach(b => console.log(`   - ${b}`));
      }
    }
    
    console.log('\n✅ File storage test completed!');
    
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