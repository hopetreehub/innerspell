const { chromium } = require('playwright');

async function continueBlogPost() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to admin panel...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // Click on Blog Management tab
    await page.click('text=블로그 관리');
    await page.waitForTimeout(2000);
    
    // Click on create new post button
    await page.click('text=+ 새 포스트');
    await page.waitForTimeout(3000);
    
    // Fill the title (if not already filled)
    const title = '2025년 AI 시대 타로카드 입문 가이드: 전통적 지혜와 현대 기술의 조화';
    await page.fill('input[placeholder*="제목"]', title);
    
    // Fill the summary/excerpt
    const excerpt = 'AI 기술이 발달한 2025년, 타로카드는 어떻게 진화하고 있을까요? 전통적인 타로 리딩에 현대 AI 기술이 더해져 더욱 정확하고 개인화된 영적 가이드를 제공합니다. 초보자를 위한 완전한 AI 타로 입문서를 소개합니다.';
    await page.fill('textarea[placeholder*="요약"]', excerpt);
    
    // Select category if there's a dropdown
    try {
      await page.click('text=카테고리');
      await page.waitForTimeout(1000);
      // Try to select a relevant category or create one
      await page.keyboard.type('타로');
    } catch (e) {
      console.log('Category selection skipped');
    }
    
    // Close the featured image modal if it's open
    try {
      await page.click('button:has-text("×")'); // Close button
    } catch (e) {
      console.log('No featured image modal to close');
    }
    
    await page.screenshot({ path: 'continue-step-1-form-basic.png' });
    console.log('Step 1: Basic form fields filled');
    
    // Look for a "다음" (Next) or "저장" (Save) or "계속" (Continue) button
    const nextButtons = [
      'text=다음',
      'text=계속',
      'text=저장',
      'text=Save',
      'text=Next',
      'text=Continue',
      'button[type="submit"]'
    ];
    
    let nextButtonFound = false;
    for (const selector of nextButtons) {
      try {
        await page.click(selector);
        nextButtonFound = true;
        console.log(`Found next button with selector: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!nextButtonFound) {
      // Look for any button that might advance the form
      const buttons = await page.$$('button');
      for (let button of buttons) {
        const text = await button.textContent();
        if (text && (text.includes('다음') || text.includes('계속') || text.includes('저장') || text.includes('작성') || text.includes('완료'))) {
          await button.click();
          nextButtonFound = true;
          console.log(`Found next button with text: ${text}`);
          break;
        }
      }
    }
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'continue-step-2-after-next.png' });
    console.log('Step 2: After clicking next/continue');
    
    // Now look for content field - this might be on the next step
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
    
    // Try to find content/body field
    const contentSelectors = [
      'textarea[placeholder*="내용"]',
      'textarea[placeholder*="content"]',
      'textarea[name="content"]',
      'textarea[name="body"]',
      '.editor textarea',
      '[contenteditable="true"]'
    ];
    
    let contentFilled = false;
    for (const selector of contentSelectors) {
      try {
        await page.fill(selector, content);
        console.log(`Filled content with selector: ${selector}`);
        contentFilled = true;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!contentFilled) {
      console.log('Could not find content field, trying to type content');
      // Try to type the content if no field found
      await page.keyboard.type(content.substring(0, 500) + '...'); // Truncated for typing
    }
    
    // Fill additional fields
    try {
      // Categories
      const categorySelectors = [
        'input[name="categories"]',
        'input[placeholder*="카테고리"]',
        'input[placeholder*="태그"]'
      ];
      
      for (const selector of categorySelectors) {
        try {
          await page.fill(selector, '타로,AI,영성,자기계발');
          break;
        } catch (e) {
          continue;
        }
      }
      
      // Tags
      const tagSelectors = [
        'input[name="tags"]',
        'input[placeholder*="태그"]',
        'input[placeholder*="tag"]'
      ];
      
      for (const selector of tagSelectors) {
        try {
          await page.fill(selector, 'AI타로,타로입문,2025,영적성장,자기계발,인공지능,타로카드,스피리추얼');
          break;
        } catch (e) {
          continue;
        }
      }
      
      // Slug
      const slugSelectors = [
        'input[name="slug"]',
        'input[placeholder*="slug"]',
        'input[placeholder*="URL"]'
      ];
      
      for (const selector of slugSelectors) {
        try {
          await page.fill(selector, '2025-ai-tarot-beginners-guide');
          break;
        } catch (e) {
          continue;
        }
      }
      
    } catch (e) {
      console.log('Some additional fields could not be filled');
    }
    
    await page.screenshot({ path: 'continue-step-3-content-filled.png' });
    console.log('Step 3: Content and additional fields filled');
    
    // Set status to published if possible
    try {
      await page.selectOption('select[name="status"]', 'published');
      console.log('Set status to published');
    } catch (e) {
      try {
        await page.click('input[value="published"]');
        console.log('Clicked published radio button');
      } catch (e2) {
        try {
          await page.click('text=발행');
          console.log('Clicked publish option');
        } catch (e3) {
          console.log('Could not set status to published');
        }
      }
    }
    
    // Final publish/save
    const finalButtons = [
      'text=발행',
      'text=게시',
      'text=저장',
      'text=완료',
      'text=Publish',
      'text=Save',
      'text=Complete',
      'button[type="submit"]'
    ];
    
    let finalButtonFound = false;
    for (const selector of finalButtons) {
      try {
        await page.click(selector);
        finalButtonFound = true;
        console.log(`Found final button with selector: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!finalButtonFound) {
      const buttons = await page.$$('button');
      for (let button of buttons) {
        const text = await button.textContent();
        if (text && (text.includes('발행') || text.includes('게시') || text.includes('저장') || text.includes('완료') || text.includes('Publish') || text.includes('Save'))) {
          await button.click();
          finalButtonFound = true;
          console.log(`Found final button with text: ${text}`);
          break;
        }
      }
    }
    
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'continue-step-4-final.png' });
    console.log('Step 4: Final state after publishing');
    
    // Navigate back to blog list to verify
    await page.goto('http://localhost:4000/admin');
    await page.waitForTimeout(2000);
    await page.click('text=블로그 관리');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'continue-step-5-blog-list.png' });
    console.log('Step 5: Blog list verification');
    
    console.log('Blog post creation completed!');
    
  } catch (error) {
    console.error('Error creating blog post:', error);
    await page.screenshot({ path: 'continue-error.png' });
  } finally {
    console.log('Keeping browser open for verification...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

continueBlogPost().catch(console.error);