import { Page } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('admin@swiftship.com');
  await page.getByLabel(/password/i).fill('password123');
  const slugField = page.getByLabel(/tenant|slug|company/i).first();
  if (await slugField.count() > 0) {
    await slugField.fill('swiftship');
  }
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}
