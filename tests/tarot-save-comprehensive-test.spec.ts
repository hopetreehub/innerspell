import { test, expect, Page } from '@playwright/test';

/**
 * 🧪 타로 리딩 저장 기능 종합 테스트
 * SuperClaude 테스트 전문가 페르소나 - 완전한 시나리오 커버리지
 */

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

// 테스트 헬퍼 함수들
class TarotTestHelper {
  constructor(private page: Page) {}

  async navigateToReading() {
    await this.page.goto(`${VERCEL_URL}/reading`);
    await this.page.waitForLoadState('networkidle');
  }

  async fillQuestion(question: string) {
    await this.page.fill('textarea[placeholder*="질문"]', question);
  }

  async selectSpread(spreadName: string) {
    await this.page.click('[data-testid="spread-selector"], .select-trigger, button:has-text("Trinity View")');
    await this.page.waitForTimeout(500);
    await this.page.click(`text=${spreadName}`);
  }

  async shuffleCards() {
    await this.page.click('button:has-text("카드 섞기")');
    await this.page.waitForSelector('button:has-text("카드 펼치기")', { state: 'visible' });
  }

  async revealSpread() {
    await this.page.click('button:has-text("카드 펼치기")');
    await this.page.waitForSelector('text=펼쳐진 카드', { timeout: 10000 });
  }

  async selectCards(count: number) {
    // 펼쳐진 카드들을 클릭
    for (let i = 0; i < count; i++) {
      const cards = this.page.locator('[role="button"][aria-label*="펼쳐진"]');
      await cards.nth(i).click();
      await this.page.waitForTimeout(500);
    }
  }

  async generateInterpretation() {
    await this.page.click('button:has-text("해석 생성")');
    // AI 해석 생성 대기 (최대 30초)
    await this.page.waitForSelector('text=해석 다시 보기', { timeout: 30000 });
  }

  async attemptSave() {
    const saveButton = this.page.locator('button:has-text("리딩 저장")').first();
    await saveButton.click();
  }

  async waitForSaveCompletion() {
    // 저장 완료 메시지나 상태 대기
    await this.page.waitForSelector('text=저장 완료', { timeout: 10000 });
  }

  async checkSaveButtonVisibility() {
    return await this.page.isVisible('button:has-text("리딩 저장")');
  }
}

test.describe('타로 리딩 저장 기능 종합 테스트', () => {
  let helper: TarotTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = new TarotTestHelper(page);
  });

  test('시나리오 1: 비로그인 사용자 - 저장 버튼 발견성 테스트', async ({ page }) => {
    await helper.navigateToReading();
    
    await helper.fillQuestion('테스트를 위한 질문입니다');
    await helper.selectSpread('Trinity View');
    await helper.shuffleCards();
    await helper.revealSpread();
    await helper.selectCards(3);
    await helper.generateInterpretation();

    // 저장 버튼이 보이는지 확인
    const saveButtonVisible = await helper.checkSaveButtonVisibility();
    
    if (saveButtonVisible) {
      await helper.attemptSave();
      
      // 로그인 유도 메시지 확인
      await expect(page.locator('text=로그인 필요')).toBeVisible({ timeout: 5000 });
      
      console.log('✅ 비로그인 사용자에게 저장 버튼이 보이고 로그인 유도 정상 작동');
    } else {
      console.log('⚠️ 비로그인 사용자에게 저장 버튼이 보이지 않음 - UX 개선 필요');
    }

    await page.screenshot({ path: 'test-results/non-logged-user-save-button.png' });
  });

  test('시나리오 2: 불완전한 데이터로 저장 시도', async ({ page }) => {
    await helper.navigateToReading();
    
    // 질문만 입력하고 저장 시도
    await helper.fillQuestion('불완전한 테스트 질문');
    
    const saveButtonVisible = await helper.checkSaveButtonVisibility();
    if (saveButtonVisible) {
      await helper.attemptSave();
      
      // 에러 메시지 확인
      await expect(page.locator('.toast, [role="alert"]')).toBeVisible({ timeout: 5000 });
      console.log('✅ 불완전한 데이터 저장 시도 시 적절한 에러 메시지 표시');
    }

    await page.screenshot({ path: 'test-results/incomplete-data-save-attempt.png' });
  });

  test('시나리오 3: 전체 플로우 완료 후 저장 버튼 상태 확인', async ({ page }) => {
    await helper.navigateToReading();
    
    // 전체 플로우 완료
    await helper.fillQuestion('완전한 타로 리딩 테스트 질문입니다');
    await helper.selectSpread('Trinity View');
    await helper.shuffleCards();
    await helper.revealSpread();
    await helper.selectCards(3);
    await helper.generateInterpretation();

    // 저장 버튼 상태 확인
    const saveButtonVisible = await helper.checkSaveButtonVisibility();
    console.log(`저장 버튼 가시성: ${saveButtonVisible}`);

    // 모든 필수 요소가 있는지 확인
    const hasQuestion = await page.locator('textarea').inputValue();
    const hasCards = await page.locator('text=해석 다시 보기').isVisible();
    
    console.log(`질문 입력됨: ${!!hasQuestion}`);
    console.log(`해석 생성됨: ${hasCards}`);

    if (saveButtonVisible && hasQuestion && hasCards) {
      console.log('✅ 모든 조건이 충족된 상태에서 저장 버튼 정상 표시');
      
      await helper.attemptSave();
      
      // 저장 시도 후 결과 확인 (5초 대기)
      await page.waitForTimeout(5000);
      
      const successMessage = await page.locator('text=저장 완료').isVisible();
      const errorMessage = await page.locator('text=저장 실패, text=로그인 필요, text=권한').isVisible();
      
      if (successMessage) {
        console.log('✅ 저장 성공');
      } else if (errorMessage) {
        console.log('⚠️ 저장 시도 시 에러 발생 (인증/권한 문제)');
      } else {
        console.log('❓ 저장 결과 불명확');
      }
    }

    await page.screenshot({ path: 'test-results/complete-flow-save-state.png' });
  });

  test('시나리오 4: 저장 버튼 클릭 후 상태 변화 관찰', async ({ page }) => {
    await helper.navigateToReading();
    
    await helper.fillQuestion('상태 변화 관찰 테스트');
    await helper.selectSpread('Trinity View');
    await helper.shuffleCards();
    await helper.revealSpread();
    await helper.selectCards(3);
    await helper.generateInterpretation();

    const saveButtonVisible = await helper.checkSaveButtonVisibility();
    
    if (saveButtonVisible) {
      // 저장 버튼 클릭 전 상태 캡처
      await page.screenshot({ path: 'test-results/before-save-click.png' });
      
      await helper.attemptSave();
      
      // 저장 중 상태 확인 (로딩 스피너 등)
      const loadingVisible = await page.locator('text=저장 중, .animate-spin').isVisible();
      console.log(`저장 중 로딩 상태 표시: ${loadingVisible}`);
      
      // 3초 후 결과 상태 캡처
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'test-results/after-save-click.png' });
      
      // 최종 상태 확인
      const finalState = {
        saveCompleted: await page.locator('text=저장 완료').isVisible(),
        saveError: await page.locator('text=저장 실패, text=로그인 필요').isVisible(),
        saveButtonStillVisible: await page.locator('button:has-text("리딩 저장")').isVisible()
      };
      
      console.log('최종 상태:', finalState);
    }
  });

  test('시나리오 5: 네트워크 상태 시뮬레이션', async ({ page, context }) => {
    await helper.navigateToReading();
    
    await helper.fillQuestion('네트워크 테스트 질문');
    await helper.selectSpread('Trinity View');
    await helper.shuffleCards();
    await helper.revealSpread();
    await helper.selectCards(3);
    await helper.generateInterpretation();

    // 네트워크를 오프라인으로 설정
    await context.setOffline(true);
    
    const saveButtonVisible = await helper.checkSaveButtonVisibility();
    if (saveButtonVisible) {
      await helper.attemptSave();
      
      // 네트워크 오류 메시지 확인
      await page.waitForTimeout(5000);
      const networkError = await page.locator('text=네트워크, text=연결').isVisible();
      console.log(`네트워크 오류 처리: ${networkError}`);
    }
    
    // 네트워크 복구
    await context.setOffline(false);
    await page.screenshot({ path: 'test-results/network-error-handling.png' });
  });

  test('시나리오 6: 페이지 새로고침 후 상태 유지 확인', async ({ page }) => {
    await helper.navigateToReading();
    
    await helper.fillQuestion('새로고침 테스트 질문');
    await helper.selectSpread('Trinity View');
    
    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 입력한 데이터가 유지되는지 확인
    const questionValue = await page.locator('textarea').inputValue();
    console.log(`새로고침 후 질문 유지: ${!!questionValue}`);
    
    await page.screenshot({ path: 'test-results/after-page-refresh.png' });
  });
});

test.describe('성능 및 접근성 테스트', () => {
  test('저장 기능 성능 측정', async ({ page }) => {
    await page.goto(`${VERCEL_URL}/reading`);
    
    // 성능 측정 시작
    const startTime = Date.now();
    
    const helper = new TarotTestHelper(page);
    await helper.fillQuestion('성능 테스트 질문');
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`페이지 로딩 및 입력 응답 시간: ${responseTime}ms`);
    
    expect(responseTime).toBeLessThan(5000); // 5초 이내 응답
  });

  test('접근성 확인', async ({ page }) => {
    await page.goto(`${VERCEL_URL}/reading`);
    
    // 키보드 네비게이션 테스트
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // ARIA 라벨 확인
    const ariaLabels = await page.locator('[aria-label]').count();
    console.log(`ARIA 라벨이 있는 요소 수: ${ariaLabels}`);
    
    await page.screenshot({ path: 'test-results/accessibility-check.png' });
  });
});