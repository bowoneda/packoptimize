import { test, expect } from '@playwright/test';

const CREDENTIALS = {
  email: 'admin@swiftship.com',
  password: 'password123',
  tenantSlug: 'swiftship',
};

test.describe('Authentication', () => {
  test('redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('badpassword');
    // tenant slug field (may be labelled differently)
    const slugField = page.getByLabel(/tenant|slug|company/i).first();
    if (await slugField.count() > 0) {
      await slugField.fill('fakeslug');
    }
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await expect(page.getByRole('alert').or(page.locator('[role="status"]'))).toBeVisible({ timeout: 5000 });
  });

  test('logs in and reaches dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(CREDENTIALS.email);
    await page.getByLabel(/password/i).fill(CREDENTIALS.password);
    const slugField = page.getByLabel(/tenant|slug|company/i).first();
    if (await slugField.count() > 0) {
      await slugField.fill(CREDENTIALS.tenantSlug);
    }
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('logs out and redirects to /login', async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(CREDENTIALS.email);
    await page.getByLabel(/password/i).fill(CREDENTIALS.password);
    const slugField = page.getByLabel(/tenant|slug|company/i).first();
    if (await slugField.count() > 0) {
      await slugField.fill(CREDENTIALS.tenantSlug);
    }
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Open user menu and logout
    const userMenuButton = page.getByRole('button', { name: /user|account|profile|logout|sign out/i }).first();
    if (await userMenuButton.count() > 0) {
      await userMenuButton.click();
    }
    const logoutButton = page.getByRole('menuitem', { name: /logout|sign out/i })
      .or(page.getByRole('button', { name: /logout|sign out/i }));
    await logoutButton.click({ timeout: 5000 });
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
