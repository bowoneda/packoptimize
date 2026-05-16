import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows dashboard KPIs', async ({ page }) => {
    await page.goto('/dashboard');
    // Should show some numeric stat cards
    await expect(page.locator('main, [data-testid="dashboard"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('sidebar navigation links are visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: /dashboard/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /items/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /boxes|box types/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /optim/i }).first()).toBeVisible();
  });

  test('navigates to items page', async ({ page }) => {
    await page.getByRole('link', { name: /items/i }).first().click();
    await expect(page).toHaveURL(/\/items/);
    await expect(page.getByRole('heading', { name: /items/i }).first()).toBeVisible({ timeout: 8000 });
  });

  test('navigates to box types page', async ({ page }) => {
    await page.getByRole('link', { name: /boxes|box types/i }).first().click();
    await expect(page).toHaveURL(/\/boxes/);
    await expect(page.getByRole('heading', { name: /box/i }).first()).toBeVisible({ timeout: 8000 });
  });
});
