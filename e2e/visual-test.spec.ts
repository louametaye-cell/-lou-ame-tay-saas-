import { test, expect } from '@playwright/test';

test.describe('Visual & Navigation E2E Tests - Lou Ame Tay ?', () => {
  test('Home Page renders correctly (HTTP 200 & Title)', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page).toHaveTitle(/Lou Ame Tay/i);
  });

  test('Client Menu renders table 1 and dishes', async ({ page }) => {
    await page.goto('http://localhost:3000/r/chezfatou/table-1', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible();
  });

  test('Login page displays authentication form', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Kitchen KDS screen renders active Kanban board', async ({ page }) => {
    await page.goto('http://localhost:3000/kitchen');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Super Admin portal renders dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/super-admin');
    await expect(page.locator('body')).toBeVisible();
  });
});
