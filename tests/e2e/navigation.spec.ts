import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000');
  });

  test('should have correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/InnerSpell/);
  });

  test('should navigate to all main pages', async ({ page }) => {
    // Home
    await expect(page.locator('h1')).toContainText('InnerSpell과 함께');
    
    // 타로리딩
    await page.click('text=타로리딩');
    await expect(page).toHaveURL(/.*reading/);
    await expect(page.locator('h1')).toContainText('타로 리딩');
    
    // 타로카드
    await page.click('text=타로카드');
    await expect(page).toHaveURL(/.*tarot/);
    
    // 꿈해몽
    await page.click('text=꿈해몽');
    await expect(page).toHaveURL(/.*dream-interpretation/);
    
    // 블로그
    await page.click('text=블로그');
    await expect(page).toHaveURL(/.*blog/);
    
    // 커뮤니티
    await page.click('text=커뮤니티');
    await expect(page).toHaveURL(/.*community/);
  });

  test('mobile navigation should work', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check hamburger menu is visible
    const menuButton = page.getByRole('button', { name: /메뉴 열기/i });
    await expect(menuButton).toBeVisible();
    
    // Open menu
    await menuButton.click();
    
    // Check menu items are visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('link', { name: '타로리딩' })).toBeVisible();
    
    // Navigate via mobile menu
    await page.getByRole('link', { name: '타로리딩' }).click();
    await expect(page).toHaveURL(/.*reading/);
    
    // Menu should be closed after navigation
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('logo should navigate to home', async ({ page }) => {
    // Navigate to another page first
    await page.click('text=타로리딩');
    await expect(page).toHaveURL(/.*reading/);
    
    // Click logo to go home
    await page.click('text=InnerSpell');
    await expect(page).toHaveURL('http://localhost:4000/');
  });

  test('should handle 404 pages', async ({ page }) => {
    await page.goto('http://localhost:4000/non-existent-page');
    await expect(page.locator('text=404')).toBeVisible();
  });
});