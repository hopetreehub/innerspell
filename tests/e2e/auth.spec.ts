import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000');
  });

  test('should display login button when not authenticated', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /로그인/i });
    await expect(loginButton).toBeVisible();
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.click('text=로그인');
    await expect(page).toHaveURL(/.*sign-in/);
    await expect(page.getByRole('heading', { name: /로그인/i })).toBeVisible();
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('http://localhost:4000/sign-in');
    
    // Click submit without filling form
    await page.getByRole('button', { name: /로그인/i }).click();
    
    // Check validation messages
    await expect(page.getByText(/이메일을 입력해주세요/i)).toBeVisible();
    await expect(page.getByText(/비밀번호를 입력해주세요/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('http://localhost:4000/sign-in');
    
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /로그인/i }).click();
    
    await expect(page.getByText(/올바른 이메일 형식이 아닙니다/i)).toBeVisible();
  });

  test('should navigate between sign in and sign up', async ({ page }) => {
    await page.goto('http://localhost:4000/sign-in');
    
    // Navigate to sign up
    await page.click('text=계정이 없으신가요?');
    await expect(page).toHaveURL(/.*sign-up/);
    
    // Navigate back to sign in
    await page.click('text=이미 계정이 있으신가요?');
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('should handle password visibility toggle', async ({ page }) => {
    await page.goto('http://localhost:4000/sign-in');
    
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.getByRole('button', { name: /비밀번호 표시/i });
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});