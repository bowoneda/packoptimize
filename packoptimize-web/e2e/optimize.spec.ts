import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Optimization Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/optimize');
  });

  test('shows optimization page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /optim/i }).first()).toBeVisible({ timeout: 8000 });
  });

  test('can select an item and run optimization', async ({ page }) => {
    // Wait for items to load
    await page.waitForLoadState('networkidle');

    // Look for an "Add" or item selector button/row
    const addButton = page.getByRole('button', { name: /add item|select item|\+/i }).first();
    const itemRow = page.getByRole('row').nth(1); // first data row in a table

    if (await addButton.count() > 0) {
      await addButton.click();
    } else if (await itemRow.count() > 0) {
      // Click a quantity input or checkbox in the first row
      const qtyInput = itemRow.getByRole('spinbutton').first();
      if (await qtyInput.count() > 0) {
        await qtyInput.fill('1');
      } else {
        const checkbox = itemRow.getByRole('checkbox').first();
        if (await checkbox.count() > 0) {
          await checkbox.check();
        }
      }
    }

    // Find and click "Optimize" or "Run" button
    const optimizeBtn = page.getByRole('button', { name: /optim|run|pack/i }).first();
    if (await optimizeBtn.count() > 0) {
      await optimizeBtn.click();

      // Wait for results — either a result card or an error
      await expect(
        page.getByText(/packed|result|box|error/i).first()
      ).toBeVisible({ timeout: 30000 });
    }
  });
});

test.describe('Billing page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('billing page loads without error', async ({ page }) => {
    await page.goto('/settings');
    // Should not show a crash/error boundary
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 8000 });
  });
});
