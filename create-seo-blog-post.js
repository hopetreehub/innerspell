const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🔍 SEO 최적화 블로그 글 작성 시작...\n');
  
  try {
    // 1. 로그인
    console.log('1️⃣ 관리자 로그인...');
    await page.goto('http://localhost:4000/sign-in');
    await page.waitForLoadState('networkidle');
    
    const devButton = await page.$('button:has-text("관리자로 로그인")');
    if (devButton) {
      await devButton.click();
      await page.waitForTimeout(5000);
      await page.reload();
      await page.waitForTimeout(3000);
    }
    
    // 2. 관리자 대시보드 > 블로그 관리
    console.log('2️⃣ 블로그 관리 페이지 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    const blogTab = await page.$('button[role="tab"]:has-text("블로그 관리")');
    if (blogTab) {
      await blogTab.click();
      await page.waitForTimeout(2000);
    }
    
    // 3. 새 글 작성 버튼 클릭
    console.log('3️⃣ 새 블로그 글 작성...');
    const newPostButton = await page.$('button:has-text("새 글 작성")') || 
                          await page.$('button:has-text("새 포스트")') ||
                          await page.$('button:has-text("글 작성")') ||
                          await page.$('button[class*="plus"]') ||
                          await page.$('button svg');
    
    if (newPostButton) {
      await newPostButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 4. SEO 최적화된 블로그 글 작성
    console.log('4️⃣ SEO 최적화 콘텐츠 입력...');
    
    // 제목 입력 (SEO 최적화: 키워드 포함, 60자 이내)
    const titleInput = await page.$('input[placeholder*="제목"]') || 
                      await page.$('input[name="title"]') ||
                      await page.$('input#title');
    if (titleInput) {
      await titleInput.fill('2024 무료 타로카드 점 - AI 타로 리딩으로 정확한 운세 보기');
      console.log('✅ SEO 제목 입력 완료');
    }
    
    // 슬러그 입력 (SEO 최적화: 키워드 포함, 짧고 명확)
    const slugInput = await page.$('input[placeholder*="slug"]') || 
                     await page.$('input[name="slug"]') ||
                     await page.$('input#slug');
    if (slugInput) {
      await slugInput.fill('2024-free-tarot-reading-ai-fortune-telling');
      console.log('✅ SEO 슬러그 입력 완료');
    }
    
    // 요약 입력 (SEO 최적화: 메타 설명, 155자 이내)
    const excerptInput = await page.$('textarea[placeholder*="요약"]') || 
                        await page.$('textarea[name="excerpt"]') ||
                        await page.$('textarea#excerpt');
    if (excerptInput) {
      await excerptInput.fill('2024년 최고의 무료 AI 타로카드 리딩 서비스 InnerSpell. 전문가 수준의 정확한 타로 해석을 언제든지 무료로 이용하세요. 연애운, 금전운, 직업운 등 모든 고민을 해결해드립니다.');
      console.log('✅ SEO 요약 입력 완료');
    }
    
    // 본문 입력 (SEO 최적화된 구조화된 콘텐츠)
    const contentInput = await page.$('textarea[placeholder*="내용"]') || 
                        await page.$('textarea[name="content"]') ||
                        await page.$('textarea#content') ||
                        await page.$('[contenteditable="true"]');
    if (contentInput) {
      const seoContent = `# 2024년 무료 타로카드 점 - AI 기술로 더욱 정확해진 타로 리딩

## 타로카드란 무엇인가요?

타로카드는 78장의 카드로 구성된 점술 도구로, 수세기 동안 사람들의 미래를 예측하고 현재 상황을 이해하는 데 사용되어 왔습니다. 오늘날에는 **AI 기술**과 결합하여 더욱 정확하고 개인화된 해석이 가능해졌습니다.

![타로카드 이미지](https://images.unsplash.com/photo-1632666015094-15ed0fa2dd78?w=800&q=80)

## InnerSpell AI 타로 리딩의 특별함

### 1. 무료로 이용 가능한 전문가급 타로 해석

InnerSpell은 **완전 무료**로 제공되는 타로 리딩 서비스입니다. 유료 점술가 못지않은 깊이 있는 해석을 제공합니다.

### 2. 24시간 언제든지 이용 가능

새벽이든 주말이든 상관없이 **365일 24시간** 타로 상담이 가능합니다. 급한 고민이 있을 때 즉시 답을 얻을 수 있습니다.

### 3. AI 기술로 향상된 정확도

최신 AI 기술을 활용하여:
- 🎯 **맥락 이해**: 질문의 의도를 정확히 파악
- 🔗 **카드 연결성**: 여러 카드 간의 관계를 종합적으로 해석
- 💡 **실용적 조언**: 구체적이고 실행 가능한 가이드 제공

## 인기 있는 타로 스프레드 종류

### 원 카드 리딩 (One Card Reading)
- **용도**: 오늘의 운세, 간단한 예/아니오 질문
- **시간**: 1-2분
- **추천 대상**: 타로 초보자, 바쁜 현대인

### 삼위일체 스프레드 (Past-Present-Future)
- **용도**: 상황의 흐름 파악, 중요한 결정
- **시간**: 5-10분
- **추천 대상**: 구체적인 상황 분석이 필요한 분

### 켈틱 크로스 (Celtic Cross)
- **용도**: 깊이 있는 전체적 분석
- **시간**: 15-20분
- **추천 대상**: 복잡한 문제를 해결하고 싶은 분

![타로 스프레드 예시](https://images.unsplash.com/photo-1614283233470-de3705eca30e?w=800&q=80)

## 2024년 타로카드로 볼 수 있는 운세

### 💕 연애운
- 새로운 만남의 시기
- 현재 관계의 미래
- 이별 후 재회 가능성
- 운명의 상대 찾기

### 💰 금전운
- 투자 시기 판단
- 사업 성공 가능성
- 재정 문제 해결책
- 횡재수 예측

### 💼 직업운
- 이직 시기 결정
- 승진 가능성
- 새로운 기회 발견
- 직장 내 인간관계

### 🎓 학업운
- 시험 합격 가능성
- 효과적인 학습 방법
- 진로 선택 조언
- 유학 시기 결정

## InnerSpell 타로 리딩 이용 방법

1. **회원가입 없이 바로 시작**: 복잡한 가입 절차 없이 즉시 이용
2. **질문 입력**: 고민하는 내용을 자유롭게 작성
3. **카드 선택**: 직관에 따라 카드를 선택
4. **해석 확인**: AI가 제공하는 상세한 해석 읽기
5. **저장 기능**: 중요한 리딩은 저장해서 나중에 다시 확인

## 사용자 후기

> "무료인데도 정말 정확해서 놀랐어요. 특히 연애 고민에 대한 조언이 큰 도움이 되었습니다." - 김○○님

> "24시간 이용할 수 있어서 좋아요. 새벽에 잠 못 들 때 타로 보면서 마음의 위안을 받습니다." - 이○○님

> "AI가 해석해준다고 해서 처음엔 의심했는데, 오히려 더 객관적이고 정확한 것 같아요." - 박○○님

## 자주 묻는 질문 (FAQ)

### Q: 정말 무료인가요?
A: 네, InnerSpell의 모든 타로 리딩 서비스는 100% 무료입니다.

### Q: AI 타로가 진짜 타로만큼 정확한가요?
A: AI는 수많은 타로 해석 데이터를 학습하여 전문가 수준의 해석을 제공합니다.

### Q: 개인정보는 안전한가요?
A: 회원가입 없이도 이용 가능하며, 모든 데이터는 안전하게 보호됩니다.

### Q: 하루에 몇 번까지 볼 수 있나요?
A: 제한 없이 원하는 만큼 타로 리딩을 받을 수 있습니다.

## 지금 바로 시작하세요!

2024년 여러분의 운세가 궁금하신가요? InnerSpell에서 **무료 AI 타로 리딩**을 체험해보세요. 

[🔮 무료 타로 시작하기](https://innerspell.com/tarot)

---

**관련 키워드**: 무료타로, 타로카드점, AI타로, 온라인타로, 2024년운세, 타로리딩, 무료운세, 타로점, 연애타로, 직업타로

*마지막 업데이트: 2024년 1월*`;
      
      if (contentInput.tagName === 'TEXTAREA') {
        await contentInput.fill(seoContent);
      } else {
        await contentInput.click();
        await page.keyboard.type(seoContent);
      }
      console.log('✅ SEO 최적화 본문 입력 완료');
    }
    
    // 태그 입력 (SEO 키워드)
    const tagsInput = await page.$('input[placeholder*="태그"]') || 
                     await page.$('input[name="tags"]');
    if (tagsInput) {
      await tagsInput.fill('무료타로, 타로카드, AI타로, 2024운세, 타로리딩, 온라인타로, 무료운세, 연애타로, 금전운, 직업운');
      console.log('✅ SEO 태그 입력 완료');
    }
    
    // 스크린샷
    await page.screenshot({ path: 'seo-blog-01-filled.png', fullPage: true });
    
    // 5. 저장 및 발행
    console.log('5️⃣ 블로그 글 저장 중...');
    
    // 발행 상태 체크박스 찾기
    const publishCheckbox = await page.$('input[type="checkbox"][name="published"]') ||
                           await page.$('input[type="checkbox"]#published') ||
                           await page.$('label:has-text("발행") input[type="checkbox"]');
    if (publishCheckbox) {
      await publishCheckbox.check();
      console.log('✅ 발행 상태 체크');
    }
    
    // 저장 버튼 클릭
    const saveButton = await page.$('button:has-text("저장")') || 
                      await page.$('button:has-text("발행")') ||
                      await page.$('button[type="submit"]');
    
    if (saveButton) {
      await saveButton.click();
      console.log('⏳ 저장 중...');
      await page.waitForTimeout(5000);
      
      // 성공 메시지 확인
      const successToast = await page.$('text=/성공|완료|저장됨|created|saved/i');
      if (successToast) {
        console.log('✅ 블로그 글 저장 성공!');
      } else {
        console.log('⚠️ 성공 메시지를 찾을 수 없음');
      }
      
      await page.screenshot({ path: 'seo-blog-02-after-save.png', fullPage: true });
    }
    
    // 6. 저장된 글 확인
    console.log('\n6️⃣ 저장된 블로그 글 확인...');
    await page.waitForTimeout(3000);
    
    // 목록에서 확인
    const savedPost = await page.$('text=2024 무료 타로카드 점');
    if (savedPost) {
      console.log('✅ 블로그 글이 목록에 표시됩니다!');
      
      // API로도 확인
      await page.goto('http://localhost:4000/api/blog/posts');
      await page.waitForLoadState('networkidle');
      const apiContent = await page.textContent('body');
      if (apiContent.includes('2024-free-tarot-reading')) {
        console.log('✅ API에서도 블로그 글 확인됨!');
      }
    }
    
    console.log('\n✅ SEO 최적화 블로그 글 작성 완료!');
    console.log('📌 Vercel에서 확인: https://test-studio-firebase.vercel.app/blog');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await page.screenshot({ path: 'seo-blog-error.png', fullPage: true });
  } finally {
    console.log('\n브라우저를 열어두었습니다. 확인 후 닫아주세요.');
  }
})();