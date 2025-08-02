import { test, expect } from '@playwright/test';

test.describe('관리자 타로 지침 관리 시스템', () => {
  test.beforeEach(async ({ page }) => {
    // 관리자 로그인 (실제 관리자 계정 사용)
    await page.goto('/sign-in');
    
    // Google 로그인 버튼 클릭
    await page.click('button:has-text("Google로 로그인")');
    
    // 로그인 완료 대기 (admin@innerspell.com으로 로그인 가정)
    await page.waitForURL('/', { timeout: 10000 });
    
    // 관리자 설정 메뉴로 이동
    await page.click('a[href="/admin"]');
    await page.waitForURL('/admin');
  });

  test('타로 지침 탭 접근 및 기본 UI 확인', async ({ page }) => {
    // 타로 지침 탭 클릭
    await page.click('button:has-text("타로 지침")');
    
    // 기본 UI 요소들 확인
    await expect(page.locator('h1:has-text("타로 해석 지침 관리")')).toBeVisible();
    
    // 3개 탭 존재 확인
    await expect(page.locator('button:has-text("지침 탐색")')).toBeVisible();
    await expect(page.locator('button:has-text("지침 관리")')).toBeVisible();
    await expect(page.locator('button:has-text("통계 및 분석")')).toBeVisible();
    
    // 새 지침 생성 버튼 확인
    await expect(page.locator('button:has-text("새 지침 생성")')).toBeVisible();
  });

  test('지침 탐색 기능 테스트', async ({ page }) => {
    await page.click('button:has-text("타로 지침")');
    
    // 지침 탐색 탭 활성화 확인
    await expect(page.locator('[data-state="active"]:has-text("지침 탐색")')).toBeVisible();
    
    // 스프레드 선택 드롭다운 확인
    await expect(page.locator('text=타로 스프레드')).toBeVisible();
    await expect(page.locator('text=해석 스타일')).toBeVisible();
    
    // 스프레드 선택 테스트
    await page.click('[data-testid="spread-select"] [role="combobox"]');
    await expect(page.locator('text=삼위일체 (과거-현재-미래)')).toBeVisible();
    await page.click('text=삼위일체 (과거-현재-미래)');
    
    // 해석 스타일 선택 테스트
    await page.click('[data-testid="style-select"] [role="combobox"]');
    await expect(page.locator('text=전통 라이더-웨이트')).toBeVisible();
    await page.click('text=전통 라이더-웨이트');
    
    // 지침 찾기 버튼 클릭
    await page.click('button:has-text("지침 찾기")');
    
    // 지침 상세 내용 표시 확인
    await expect(page.locator('text=삼위일체 - 전통 라이더-웨이트')).toBeVisible();
    await expect(page.locator('text=전반적 접근법')).toBeVisible();
    await expect(page.locator('text=핵심 포커스 영역')).toBeVisible();
  });

  test('통계 대시보드 확인', async ({ page }) => {
    await page.click('button:has-text("타로 지침")');
    await page.click('button:has-text("통계 및 분석")');
    
    // 통계 카드들 확인
    await expect(page.locator('text=총 지침 수')).toBeVisible();
    await expect(page.locator('text=스프레드 종류')).toBeVisible();
    await expect(page.locator('text=해석 스타일')).toBeVisible();
    await expect(page.locator('text=활성 지침')).toBeVisible();
    
    // 진행률 섹션 확인
    await expect(page.locator('text=지침 완성도 현황')).toBeVisible();
    await expect(page.locator('text=전체 진행률')).toBeVisible();
    await expect(page.locator('text=완성된 지침')).toBeVisible();
    await expect(page.locator('text=미완성 조합')).toBeVisible();
    
    // 스프레드별 완성도 확인
    await expect(page.locator('text=스프레드별 완성도')).toBeVisible();
    
    // 진행률이 0%가 아닌지 확인 (이미 지침들이 작성되어 있으므로)
    const progressText = await page.locator('text=/\\d+%/').first().textContent();
    expect(parseInt(progressText?.replace('%', '') || '0')).toBeGreaterThan(0);
  });

  test('새 지침 생성 폼 접근 및 기본 요소 확인', async ({ page }) => {
    await page.click('button:has-text("타로 지침")');
    await page.click('button:has-text("새 지침 생성")');
    
    // 지침 생성 폼 제목 확인
    await expect(page.locator('text=새 지침 생성')).toBeVisible();
    
    // 기본 정보 섹션 확인
    await expect(page.locator('text=기본 정보')).toBeVisible();
    await expect(page.locator('text=타로 스프레드')).toBeVisible();
    await expect(page.locator('text=해석 스타일')).toBeVisible();
    await expect(page.locator('text=지침 이름')).toBeVisible();
    await expect(page.locator('text=설명')).toBeVisible();
    await expect(page.locator('text=난이도')).toBeVisible();
    await expect(page.locator('text=예상 소요 시간')).toBeVisible();
    
    // 다른 섹션들 확인
    await expect(page.locator('text=전반적 접근법')).toBeVisible();
    await expect(page.locator('text=핵심 포커스 영역')).toBeVisible();
    await expect(page.locator('text=해석 팁')).toBeVisible();
    await expect(page.locator('text=피해야 할 실수들')).toBeVisible();
    
    // 우측 영역 확인
    await expect(page.locator('text=포지션별 가이드라인')).toBeVisible();
    
    // 하단 버튼들 확인
    await expect(page.locator('button:has-text("취소")')).toBeVisible();
    await expect(page.locator('button:has-text("저장")')).toBeVisible();
    await expect(page.locator('button:has-text("미리보기")')).toBeVisible();
    await expect(page.locator('button:has-text("템플릿 생성")')).toBeVisible();
  });

  test('템플릿 생성 기능 테스트', async ({ page }) => {
    await page.click('button:has-text("타로 지침")');
    await page.click('button:has-text("새 지침 생성")');
    
    // 스프레드 선택
    await page.click('[data-testid="spread-select"] [role="combobox"]');
    await page.click('text=정신-몸-영혼');
    
    // 해석 스타일 선택
    await page.click('[data-testid="style-select"] [role="combobox"]');
    await page.click('text=원소와 계절 중심');
    
    // 템플릿 생성 버튼 클릭
    await page.click('button:has-text("템플릿 생성")');
    
    // 성공 메시지 확인
    await expect(page.locator('text=템플릿이 생성되었습니다')).toBeVisible();
    
    // 자동 생성된 내용 확인
    await expect(page.locator('input[value*="정신-몸-영혼 - 원소와 계절 중심"]')).toBeVisible();
    
    // 핵심 포커스 영역이 자동 생성되었는지 확인
    await expect(page.locator('input[value*="접근법의 핵심 원리"]')).toBeVisible();
  });

  test('미리보기 모드 전환 테스트', async ({ page }) => {
    await page.click('button:has-text("타로 지침")');
    await page.click('button:has-text("새 지침 생성")');
    
    // 기본 정보 입력
    await page.fill('input[placeholder*="예: 삼위일체"]', '테스트 지침');
    await page.fill('textarea[placeholder*="이 지침의 특징"]', '테스트용 지침 설명입니다.');
    
    // 미리보기 모드로 전환
    await page.click('button:has-text("미리보기")');
    
    // 미리보기 내용 확인
    await expect(page.locator('text=미리보기')).toBeVisible();
    await expect(page.locator('text=테스트 지침')).toBeVisible();
    await expect(page.locator('text=테스트용 지침 설명입니다.')).toBeVisible();
    
    // 편집 모드로 다시 전환
    await page.click('button:has-text("편집 모드")');
    
    // 편집 폼이 다시 표시되는지 확인
    await expect(page.locator('text=포지션별 가이드라인')).toBeVisible();
  });

  test('지침 관리 탭 기능 확인', async ({ page }) => {
    await page.click('button:has-text("타로 지침")');
    await page.click('button:has-text("지침 관리")');
    
    // 검색 기능 확인
    await expect(page.locator('input[placeholder*="지침 검색"]')).toBeVisible();
    
    // 기존 지침들이 표시되는지 확인
    await expect(page.locator('text=삼위일체 - 전통 라이더-웨이트')).toBeVisible();
    
    // 지침 카드의 관리 버튼들 확인
    const firstGuidelineCard = page.locator('[data-testid="guideline-card"]').first();
    await expect(firstGuidelineCard.locator('button[title="활성화/비활성화"]')).toBeVisible();
    await expect(firstGuidelineCard.locator('button[title="편집"]')).toBeVisible();
    await expect(firstGuidelineCard.locator('button[title="삭제"]')).toBeVisible();
    
    // 검색 기능 테스트
    await page.fill('input[placeholder*="지침 검색"]', '삼위일체');
    await expect(page.locator('text=삼위일체 - 전통 라이더-웨이트')).toBeVisible();
    
    // 검색 결과 필터링 확인
    await page.fill('input[placeholder*="지침 검색"]', '존재하지않는지침');
    await expect(page.locator('text=삼위일체 - 전통 라이더-웨이트')).not.toBeVisible();
  });

  test('기존 지침 편집 기능 테스트', async ({ page }) => {
    await page.click('button:has-text("타로 지침")');
    await page.click('button:has-text("지침 관리")');
    
    // 첫 번째 지침의 편집 버튼 클릭
    const firstEditButton = page.locator('button[title="편집"]').first();
    await firstEditButton.click();
    
    // 편집 폼이 열리는지 확인
    await expect(page.locator('text=지침 수정')).toBeVisible();
    
    // 기존 데이터가 로드되었는지 확인
    const nameInput = page.locator('input[placeholder*="예: 삼위일체"]');
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);
    
    // 취소 버튼 클릭
    await page.click('button:has-text("취소")');
    
    // 관리 페이지로 돌아갔는지 확인
    await expect(page.locator('text=지침 관리')).toBeVisible();
  });
});