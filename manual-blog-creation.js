const { chromium } = require('playwright');

async function manualBlogCreation() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500 // Very slow for manual observation
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🎯 Manual Blog Post Creation - Step by Step');
    console.log('============================================');
    
    // Step 1: Navigate to admin
    console.log('\nSTEP 1: Navigating to Admin Panel...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'manual-01-admin.png' });
    console.log('✅ Admin panel loaded');
    console.log('⏸️  PAUSE: You can see the admin dashboard with various management tabs');
    
    // Step 2: Click Blog Management
    console.log('\nSTEP 2: Opening Blog Management...');
    await page.click('text=블로그 관리');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'manual-02-blog-management.png' });
    console.log('✅ Blog management section opened');
    console.log('⏸️  PAUSE: You can see the blog management interface with existing posts and "새 포스트" button');
    
    // Step 3: Click New Post
    console.log('\nSTEP 3: Clicking New Post Button...');
    await page.click('text=새 포스트');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'manual-03-new-post-modal.png' });
    console.log('✅ New post creation modal opened');
    console.log('⏸️  PAUSE: You can see the modal with fields for title, summary, category, and featured image');
    
    // Step 4: Fill Title
    console.log('\nSTEP 4: Filling Post Title...');
    const title = '2025년 AI 시대 타로카드 입문 가이드: 전통적 지혜와 현대 기술의 조화';
    await page.click('input[placeholder="포스트 제목을 입력하세요"]');
    await page.fill('input[placeholder="포스트 제목을 입력하세요"]', title);
    await page.screenshot({ path: 'manual-04-title-filled.png' });
    console.log('✅ Title filled:', title);
    
    // Step 5: Fill Summary/Excerpt
    console.log('\nSTEP 5: Filling Post Summary...');
    const excerpt = 'AI 기술이 발달한 2025년, 타로카드는 어떻게 진화하고 있을까요? 전통적인 타로 리딩에 현대 AI 기술이 더해져 더욱 정확하고 개인화된 영적 가이드를 제공합니다. 초보자를 위한 완전한 AI 타로 입문서를 소개합니다.';
    await page.click('textarea[placeholder="포스트 요약을 입력하세요 (검색 결과에 표시됩니다)"]');
    await page.fill('textarea[placeholder="포스트 요약을 입력하세요 (검색 결과에 표시됩니다)"]', excerpt);
    await page.screenshot({ path: 'manual-05-summary-filled.png' });
    console.log('✅ Summary filled');
    
    // Step 6: Handle Category Selection
    console.log('\nSTEP 6: Handling Category Selection...');
    try {
      // Click on category dropdown
      await page.click('text=카테고리');
      await page.waitForTimeout(1000);
      
      // Try to select or create a category
      const categories = ['타로', '영성', 'AI', '자기계발', '스피리추얼'];
      let categorySelected = false;
      
      for (const category of categories) {
        try {
          await page.click(`text=${category}`, { timeout: 2000 });
          console.log(`✅ Selected category: ${category}`);
          categorySelected = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!categorySelected) {
        console.log('⚠️ No matching category found, will skip category selection');
      }
    } catch (e) {
      console.log('⚠️ Category selection unavailable, skipping');
    }
    
    await page.screenshot({ path: 'manual-06-category-handled.png' });
    
    // Step 7: Handle Featured Image
    console.log('\nSTEP 7: Handling Featured Image...');
    try {
      // Close any featured image modal that might be open
      const closeButtons = await page.$$('button:has-text("×")');
      if (closeButtons.length > 0) {
        await closeButtons[closeButtons.length - 1].click(); // Click the last close button
        console.log('✅ Closed featured image modal');
      }
    } catch (e) {
      console.log('ℹ️ No featured image modal to close');
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'manual-07-image-handled.png' });
    
    // Step 8: Look for Next/Continue/Save button
    console.log('\nSTEP 8: Looking for form progression...');
    
    // We need to either find a "next" button or directly look for content fields
    let progressed = false;
    
    const progressButtons = [
      'button:has-text("다음")',
      'button:has-text("계속")',
      'button:has-text("저장")',
      'button:has-text("Next")',
      'button:has-text("Continue")'
    ];
    
    for (const selector of progressButtons) {
      try {
        const button = await page.locator(selector).first();
        if (await button.isVisible()) {
          await button.click();
          console.log(`✅ Clicked: ${selector}`);
          progressed = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'manual-08-after-progress.png' });
    
    // Step 9: Look for and fill content field
    console.log('\nSTEP 9: Looking for content editor...');
    
    const content = `# 2025년 AI 시대 타로카드 입문 가이드

안녕하세요, InnerSpell 여러분! 🔮

AI 기술이 일상에 깊숙이 자리 잡은 2025년, 우리의 영적 여정도 새로운 전환점을 맞이하고 있습니다. 수백 년 동안 인류와 함께해온 타로카드가 이제 인공지능과 만나 더욱 정확하고 개인화된 영적 가이드를 제공하고 있습니다.

## 🤖 AI 타로의 혁신적 변화

전통적인 타로 리딩은 리더의 직관과 경험에 크게 의존했습니다. 하지만 AI 시대의 타로는 다릅니다:

### 1. 개인화된 해석
- **데이터 기반 분석**: 개인의 질문 패턴과 라이프스타일 분석
- **맞춤형 가이드**: 각자의 상황에 최적화된 조언 제공  
- **학습형 시스템**: 피드백을 통한 지속적인 정확도 향상

### 2. 24시간 접근성
- **언제든 상담**: 시간과 장소의 제약 없이 영적 가이드 받기
- **즉시 응답**: 궁금한 순간 바로 얻는 타로 리딩
- **다양한 스프레드**: 상황별 최적 카드 배치 자동 추천

## 🎯 AI 타로 입문을 위한 5단계

### 1단계: 마음의 준비
타로는 단순한 점술이 아닙니다. 내면의 목소리를 듣고 삶의 방향을 찾는 영적 도구입니다.

- ✨ **개방적 마음가짐**: 새로운 관점을 받아들일 준비
- 🧘 **내적 고요**: 질문하기 전 마음을 고요히 하기  
- 💫 **구체적 질문**: 막연한 궁금함보다는 명확한 질문 준비

### 2단계: AI 타로의 이해
InnerSpell의 AI 타로 시스템은 어떻게 작동할까요?

- **딥러닝 알고리즘**: 수천 건의 타로 리딩 데이터 학습
- **패턴 인식**: 카드 조합의 숨겨진 의미 파악
- **컨텍스트 분석**: 질문의 맥락과 배경 고려

### 3단계: 첫 번째 리딩 경험
1. **질문 준비**: 진짜 알고 싶은 것이 무엇인지 명확히 하기
2. **카드 선택**: 직관을 믿고 끌리는 카드 고르기
3. **해석 받기**: AI의 분석과 전통적 의미 함께 이해하기
4. **내면 성찰**: 받은 메시지를 자신의 상황에 적용해보기

### 4단계: 지속적 학습
- **타로 카드별 의미 학습**: 78장 카드의 기본 상징과 의미
- **스프레드 이해**: 다양한 카드 배치법과 그 목적
- **해석 능력 향상**: AI 해석과 본인 직감의 조화

### 5단계: 일상 속 적용  
- **정기적 리딩**: 주 1-2회 정도의 꾸준한 타로 상담
- **저널링**: 리딩 결과와 실제 경험 비교 기록
- **명상과 결합**: 타로 메시지를 깊이 있게 성찰하기

## 💡 AI 타로 활용 팁

### 효과적인 질문법
❌ **좋지 않은 질문**: "내 미래는 어떻게 될까요?"
✅ **좋은 질문**: "새로운 직장에서 성공하기 위해 어떤 점에 주의해야 할까요?"

### 해석의 균형
AI는 데이터와 패턴을 제공하지만, 최종적인 의미는 여러분의 직관과 상황 인식이 완성합니다.

## 🌟 현대인을 위한 타로의 의미

2025년의 타로는 단순한 미래 예측이 아닙니다:

- **자기 성찰의 도구**: 내면의 목소리를 듣는 방법
- **의사결정 지원**: 중요한 선택 앞에서 다른 관점 제공
- **스트레스 관리**: 복잡한 현대 사회에서의 심리적 안정감  
- **영적 성장**: 물질만능주의 시대의 정신적 균형

## 🔮 마무리: 새로운 영적 여정의 시작

AI와 타로의 만남은 단순한 기술적 진보가 아닙니다. 고대의 지혜와 현대의 통찰력이 만나 더욱 풍부하고 정확한 영적 가이드를 만들어냅니다.

InnerSpell과 함께하는 AI 타로 여정에서 여러분은:
- 더 깊은 자기 이해를 얻게 됩니다
- 삶의 중요한 순간마다 현명한 선택을 할 수 있습니다
- 내면의 평화와 영적 성장을 경험하게 됩니다

**지금 바로 시작해보세요!** 첫 번째 AI 타로 리딩으로 2025년 여러분만의 특별한 영적 여정을 열어보세요.

---

*이 글이 도움이 되셨다면 다른 분들과도 공유해주세요. 함께하는 영적 성장이 더욱 의미 있습니다.* ✨`;

    // Try to find content editor
    const contentSelectors = [
      'textarea[placeholder="마크다운 형식으로 작성하세요"]',
      'textarea[name="content"]',
      'textarea[placeholder*="내용"]',
      '[contenteditable="true"]',
      '.editor textarea',
      'textarea:last-of-type'
    ];
    
    let contentFilled = false;
    for (const selector of contentSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          await element.fill(content);
          console.log(`✅ Content filled using: ${selector}`);
          contentFilled = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!contentFilled) {
      console.log('⚠️ Content field not found in current view');
      console.log('   This might mean the form is multi-step and we need to proceed further');
    }
    
    await page.screenshot({ path: 'manual-09-content-attempt.png' });
    
    // Step 10: Fill Tags if available
    console.log('\nSTEP 10: Filling Tags if available...');
    const tags = 'AI타로, 타로입문, 2025, 영적성장, 자기계발, 인공지능, 타로카드, 스피리추얼';
    
    const tagSelectors = [
      'input[placeholder="태그, 초보자, 가이드"]',
      'input[name="tags"]',
      'input[placeholder*="태그"]'
    ];
    
    for (const selector of tagSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          await element.fill(tags);
          console.log(`✅ Tags filled using: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    await page.screenshot({ path: 'manual-10-tags-filled.png' });
    
    // Step 11: Set Publish Status
    console.log('\nSTEP 11: Setting Publish Status...');
    try {
      // Look for publish toggle
      const publishToggleSelectors = [
        'text=게시하기',
        'text=발행',
        'text=Published'
      ];
      
      for (const selector of publishToggleSelectors) {
        try {
          const toggle = await page.locator(selector).locator('..').locator('input').first();
          if (await toggle.isVisible() && !(await toggle.isChecked())) {
            await toggle.click();
            console.log(`✅ Enabled publish toggle: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      console.log('⚠️ Could not find publish toggle');
    }
    
    await page.screenshot({ path: 'manual-11-publish-set.png' });
    
    // Step 12: Final Save
    console.log('\nSTEP 12: Attempting Final Save...');
    const saveSelectors = [
      'button:has-text("저장")',
      'button:has-text("발행")', 
      'button:has-text("게시")',
      'button:has-text("완료")',
      'button:has-text("생성")',
      'button:has-text("Save")',
      'button:has-text("Publish")',
      'button[type="submit"]'
    ];
    
    let saved = false;
    for (const selector of saveSelectors) {
      try {
        const button = await page.locator(selector).first();
        if (await button.isVisible()) {
          await button.click();
          console.log(`✅ Clicked save button: ${selector}`);
          saved = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!saved) {
      console.log('⚠️ No save button found - form might need more completion');
    }
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'manual-12-final-save.png' });
    
    // Step 13: Verification
    console.log('\nSTEP 13: Final Verification...');
    
    // Try to close any remaining modals
    try {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    } catch (e) {}
    
    // Navigate back to blog list
    await page.goto('http://localhost:4000/admin');
    await page.waitForTimeout(2000);
    await page.click('text=블로그 관리');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'manual-13-final-verification.png' });
    
    // Check for the new post
    const postExists = await page.locator('text=2025년 AI 시대 타로카드 입문 가이드').count() > 0;
    
    console.log('\n🎉 CREATION PROCESS COMPLETED!');
    console.log('=====================================');
    if (postExists) {
      console.log('✅ SUCCESS: Blog post appears to have been created!');
    } else {
      console.log('⚠️ Post not visible - check manual screenshots for troubleshooting');
    }
    
    console.log('\n📊 SUMMARY OF ATTEMPTED CREATION:');
    console.log('Title: "2025년 AI 시대 타로카드 입문 가이드: 전통적 지혜와 현대 기술의 조화"');
    console.log('Slug: "2025-ai-tarot-beginners-guide" (intended)');
    console.log('Excerpt: Comprehensive AI tarot guide description'); 
    console.log('Categories: 타로,AI,영성,자기계발 (intended)');
    console.log('Tags: AI타로,타로입문,2025,영적성장,자기계발,인공지능,타로카드,스피리추얼 (intended)');
    console.log('Status: Published (intended)');
    console.log('Content: Full markdown article with comprehensive AI tarot guide');
    
    console.log('\n📸 Screenshots saved for manual review:');
    console.log('- manual-01 through manual-13 showing each step');
    
  } catch (error) {
    console.error('❌ Error during manual creation:', error);
    await page.screenshot({ path: 'manual-error.png' });
  } finally {
    console.log('\n⏰ Keeping browser open for 60 seconds for manual inspection...');
    console.log('   Use this time to manually verify the blog post creation process');
    await page.waitForTimeout(60000);
    await browser.close();
  }
}

manualBlogCreation().catch(console.error);