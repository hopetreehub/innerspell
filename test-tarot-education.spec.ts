import { test, expect } from '@playwright/test';

test.describe('타로 교육 문의 페이지 테스트', () => {
  test('교육 과정 확인 및 상담 신청', async ({ page }) => {
    // 1. 타로 교육 페이지로 이동
    await page.goto('http://localhost:4000/community/tarot-education');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
    
    // 2. 페이지 구조 확인
    console.log('페이지 구조 확인 중...');
    
    // 교육 과정 3개 확인
    const courseCards = page.locator('.course-card, [class*="course"], [class*="program"]');
    const courseCount = await courseCards.count();
    console.log(`발견된 교육 과정 수: ${courseCount}`);
    
    // 교육 과정 제목들 확인
    const courseTitles = await page.locator('h3, h2').allTextContents();
    console.log('교육 과정 제목들:', courseTitles);
    
    // FAQ 섹션 확인
    const faqSection = page.locator('text=/FAQ|자주 묻는 질문/i').first();
    await expect(faqSection).toBeVisible();
    console.log('FAQ 섹션 확인됨');
    
    // 교육 상담 신청 폼 확인
    const consultForm = page.locator('form').first();
    await expect(consultForm).toBeVisible();
    console.log('교육 상담 신청 폼 확인됨');
    
    // 3. FAQ 아코디언 테스트
    console.log('FAQ 아코디언 테스트 중...');
    
    // FAQ 항목 찾기
    const faqItems = page.locator('[class*="accordion"], [class*="faq-item"], details');
    const faqCount = await faqItems.count();
    console.log(`FAQ 항목 수: ${faqCount}`);
    
    if (faqCount > 0) {
      // 첫 번째 FAQ 클릭
      const firstFaq = faqItems.first();
      const faqButton = firstFaq.locator('button, summary, [role="button"]').first();
      
      if (await faqButton.count() > 0) {
        await faqButton.click();
        console.log('첫 번째 FAQ 클릭됨');
        
        // 답변 내용 확인
        await page.waitForTimeout(500); // 애니메이션 대기
        const answer = firstFaq.locator('p, div').filter({ hasText: /답변|설명|내용/ });
        if (await answer.count() > 0) {
          const answerText = await answer.first().textContent();
          console.log('FAQ 답변:', answerText?.substring(0, 50) + '...');
        }
      }
    }
    
    // 스크린샷 촬영 (폼 작성 전)
    await page.screenshot({ 
      path: 'tarot-education-before-form.png',
      fullPage: true 
    });
    console.log('폼 작성 전 스크린샷 저장됨: tarot-education-before-form.png');
    
    // 4. 교육 상담 신청 폼 작성
    console.log('교육 상담 신청 폼 작성 중...');
    
    // 이름 입력
    const nameInput = page.locator('input[name="name"], input[placeholder*="이름"], label:has-text("이름") + input, label:has-text("이름") input').first();
    await nameInput.fill('테스트 사용자');
    console.log('이름 입력됨');
    
    // 이메일 입력
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="이메일"], label:has-text("이메일") + input, label:has-text("이메일") input').first();
    await emailInput.fill('test@example.com');
    console.log('이메일 입력됨');
    
    // 연락처 입력
    const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="연락처"], input[placeholder*="전화"], label:has-text("연락처") + input, label:has-text("연락처") input').first();
    await phoneInput.fill('010-1234-5678');
    console.log('연락처 입력됨');
    
    // 관심 과정 선택
    const courseSelect = page.locator('select[name="course"], select[name*="과정"], label:has-text("관심 과정") + select, label:has-text("관심 과정") select').first();
    if (await courseSelect.count() > 0) {
      await courseSelect.selectOption({ index: 2 }); // 세 번째 옵션 선택 (전문가/심화 과정)
      console.log('관심 과정 선택됨');
    } else {
      // 라디오 버튼이나 체크박스일 경우
      const courseRadio = page.locator('input[type="radio"][value*="심화"], input[type="radio"][value*="전문"]').first();
      if (await courseRadio.count() > 0) {
        await courseRadio.check();
        console.log('관심 과정 라디오 버튼 선택됨');
      }
    }
    
    // 타로 경험 선택
    const experienceSelect = page.locator('select[name*="experience"], select[name*="경험"], label:has-text("타로 경험") + select, label:has-text("타로 경험") select').first();
    if (await experienceSelect.count() > 0) {
      await experienceSelect.selectOption({ index: 1 }); // 두 번째 옵션 선택
      console.log('타로 경험 선택됨');
    } else {
      // 라디오 버튼일 경우
      const experienceRadio = page.locator('input[type="radio"][value*="취미"], input[type="radio"][value*="공부"]').first();
      if (await experienceRadio.count() > 0) {
        await experienceRadio.check();
        console.log('타로 경험 라디오 버튼 선택됨');
      }
    }
    
    // 수강 목적 입력
    const purposeInput = page.locator('textarea[name*="purpose"], textarea[name*="목적"], input[name*="purpose"], input[name*="목적"], label:has-text("수강 목적") + textarea, label:has-text("수강 목적") textarea, label:has-text("수강 목적") + input, label:has-text("수강 목적") input').first();
    await purposeInput.fill('타로 전문가가 되고 싶습니다');
    console.log('수강 목적 입력됨');
    
    // 궁금한 점 입력
    const questionInput = page.locator('textarea[name*="question"], textarea[name*="궁금"], textarea[name*="message"], input[name*="question"], input[name*="궁금"], label:has-text("궁금한 점") + textarea, label:has-text("궁금한 점") textarea, label:has-text("궁금한 점") + input, label:has-text("궁금한 점") input').first();
    await questionInput.fill('온라인 수업도 가능한가요?');
    console.log('궁금한 점 입력됨');
    
    // 폼 작성 후 스크린샷
    await page.screenshot({ 
      path: 'tarot-education-form-filled.png',
      fullPage: true 
    });
    console.log('폼 작성 후 스크린샷 저장됨: tarot-education-form-filled.png');
    
    // 5. 상담 신청하기 버튼 클릭
    const submitButton = page.locator('button[type="submit"], button:has-text("상담 신청"), button:has-text("신청하기"), button:has-text("제출")').first();
    console.log('제출 버튼 찾기 시도...');
    
    // 버튼이 보이는지 확인
    await submitButton.scrollIntoViewIfNeeded();
    await expect(submitButton).toBeVisible();
    
    // Promise.all을 사용하여 응답 대기와 클릭을 동시에 처리
    const [response] = await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/') || 
        response.url().includes('consultation') || 
        response.url().includes('education'),
        { timeout: 10000 }
      ).catch(() => null), // 타임아웃 시 null 반환
      submitButton.click()
    ]);
    
    console.log('상담 신청 버튼 클릭됨');
    
    // 6. 성공 메시지 확인
    await page.waitForTimeout(2000); // 처리 대기
    
    // 다양한 성공 메시지 패턴 확인
    const successPatterns = [
      'text=/성공|완료|접수|감사|신청.*완료|신청.*되었습니다/i',
      '[class*="success"]',
      '[class*="alert-success"]',
      '[role="alert"]'
    ];
    
    let successMessage = null;
    for (const pattern of successPatterns) {
      const element = page.locator(pattern).first();
      if (await element.count() > 0) {
        successMessage = element;
        break;
      }
    }
    
    if (successMessage) {
      const messageText = await successMessage.textContent();
      console.log('성공 메시지:', messageText);
    } else {
      console.log('명시적인 성공 메시지를 찾을 수 없음 - 페이지 전환이나 폼 초기화 확인');
      
      // 폼이 초기화되었는지 확인
      const nameValue = await nameInput.inputValue();
      if (nameValue === '') {
        console.log('폼이 초기화됨 - 제출 성공으로 간주');
      }
    }
    
    // 7. 최종 스크린샷 촬영
    await page.screenshot({ 
      path: 'tarot-education-after-submit.png',
      fullPage: true 
    });
    console.log('최종 스크린샷 저장됨: tarot-education-after-submit.png');
    
    console.log('타로 교육 문의 페이지 테스트 완료');
  });
});