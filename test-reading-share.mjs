import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. 리딩 경험 공유 페이지로 이동');
    await page.goto('http://localhost:4000/community/reading-share/new');
    await page.waitForLoadState('networkidle');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForTimeout(2000);
    
    // 스크린샷 1: 페이지 로드 확인
    await page.screenshot({ path: 'reading-share-form.png', fullPage: true });
    console.log('   - 페이지 로드 완료');

    console.log('2. 폼에 테스트 데이터 입력');
    
    // 제목 입력
    await page.fill('#title', '테스트 리딩 경험 공유');
    console.log('   - 제목 입력 완료');
    
    // 스프레드 종류 선택 (shadcn Select 커포넌트)
    await page.click('[role="combobox"]:has-text("스프레드를 선택하세요")');
    await page.waitForTimeout(500);
    await page.click('[role="option"]:has-text("3카드 스프레드")');
    console.log('   - 스프레드 종류 선택 완료');
    
    // 경험 내용 입력
    await page.fill('#content', '오늘 The Fool 카드를 뽑았는데, 새로운 프로젝트를 시작하기에 좋은 시기라는 메시지를 받았습니다. 이 카드는 새로운 시작과 모험을 상징하며, 지금이 제가 새로운 도전을 시작할 완벽한 시기라는 것을 알려주었습니다.');
    console.log('   - 경험 내용 입력 완료');
    
    // 사용한 카드 입력
    await page.fill('input[placeholder="예: The Fool, Three of Cups..."]', 'The Fool');
    await page.keyboard.press('Enter');
    console.log('   - 카드 추가 완료');
    
    // 태그 추가 (추천 태그 클릭)
    await page.click('text="첫리딩"');
    await page.click('text="메이저아르카나"');
    console.log('   - 태그 추가 완료');
    
    // 스크린샷 2: 입력된 폼
    await page.screenshot({ path: 'reading-share-form-filled.png', fullPage: true });

    console.log('3. 저장 버튼 클릭');
    await page.click('button[type="submit"]');
    
    console.log('4. 3초 대기');
    await page.waitForTimeout(3000);
    
    // 스크린샷 3: 저장 후 상태
    await page.screenshot({ path: 'reading-share-after-save.png', fullPage: true });
    
    console.log('5. 리딩 경험 목록 페이지로 이동');
    await page.goto('http://localhost:4000/community/reading-share');
    await page.waitForLoadState('networkidle');
    
    // 스크린샷 4: 목록 페이지
    await page.screenshot({ path: 'reading-share-list.png', fullPage: true });
    
    console.log('6. 저장된 게시글 확인');
    const savedPost = await page.locator('text="테스트 리딩 경험 공유"').first();
    
    if (await savedPost.isVisible()) {
      console.log('✅ 성공: 저장된 게시글이 목록에 표시됩니다!');
      
      // 게시글 클릭하여 상세 확인
      await savedPost.click();
      await page.waitForLoadState('networkidle');
      
      // 스크린샷 5: 상세 페이지
      await page.screenshot({ path: 'reading-share-detail.png', fullPage: true });
      console.log('   - 상세 페이지도 정상적으로 표시됩니다.');
    } else {
      console.log('❌ 실패: 저장된 게시글을 찾을 수 없습니다.');
      
      // 페이지 HTML 출력
      const pageContent = await page.content();
      console.log('페이지 내용:', pageContent.substring(0, 500) + '...');
    }
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();