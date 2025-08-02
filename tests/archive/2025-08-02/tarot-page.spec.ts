import { test, expect } from '@playwright/test';

test('타로 페이지 접근 테스트', async ({ page }) => {
  await page.goto('http://localhost:4000/tarot');
  
  // 페이지 제목 확인
  await expect(page.locator('h1')).toContainText('타로 카드 아카이브');
  
  // 페이지 내용 확인
  await expect(page.locator('text=78장의 타로 카드')).toBeVisible();
  await expect(page.locator('text=메이저 아르카나')).toBeVisible();
  await expect(page.locator('text=마이너 아르카나')).toBeVisible();
});