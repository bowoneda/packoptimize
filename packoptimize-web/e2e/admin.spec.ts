import { test, expect, type BrowserContext } from '@playwright/test';

// Log in once for the entire describe block to avoid hammering the auth rate limiter.
// Playwright's storageState (cookies) is shared via the reused context.

async function loginAs(
  context: BrowserContext,
  email: string,
  password: string,
  slug: string,
) {
  const page = await context.newPage();
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.locator('#tenantSlug').fill(slug);
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20000 });
  await page.close();
}

test.describe('Admin Dashboard', () => {
  let superCtx: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    superCtx = await browser.newContext();
    await loginAs(superCtx, 'admin@swiftship.com', 'password123', 'swiftship');
  });

  test.afterAll(async () => {
    await superCtx.close();
  });

  test('Platform Admin link appears in sidebar for super admin', async () => {
    const page = await superCtx.newPage();
    await page.goto('/dashboard');
    await expect(page.getByRole('link', { name: /platform admin/i })).toBeVisible({ timeout: 8000 });
    await page.close();
  });

  test('navigates to /admin and shows KPI cards', async () => {
    const page = await superCtx.newPage();
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: /platform admin/i })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/total tenants/i)).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/total users/i)).toBeVisible();
    await page.close();
  });

  test('/admin shows plan breakdown', async () => {
    const page = await superCtx.newPage();
    await page.goto('/admin');
    await expect(page.getByText(/plan breakdown/i)).toBeVisible({ timeout: 8000 });
    await page.close();
  });

  test('/admin shows recent sign-ups table with tenant rows', async () => {
    const page = await superCtx.newPage();
    await page.goto('/admin');
    await expect(page.getByText(/recent sign-ups/i)).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/swiftship|techdirect/i).first()).toBeVisible({ timeout: 10000 });
    await page.close();
  });

  test('/admin/tenants lists all tenants', async () => {
    const page = await superCtx.newPage();
    await page.goto('/admin/tenants');
    await expect(page.getByRole('heading', { name: /all tenants/i })).toBeVisible({ timeout: 8000 });
    // Scope to the table body to avoid strict mode violation with header text
    const table = page.locator('table');
    await expect(table.getByText('SwiftShip Logistics', { exact: true }).first()).toBeVisible({ timeout: 10000 });
    await expect(table.getByText('TechDirect', { exact: true }).first()).toBeVisible({ timeout: 10000 });
    await page.close();
  });

  test('tenant list search filters by name', async () => {
    const page = await superCtx.newPage();
    await page.goto('/admin/tenants');
    const table = page.locator('table');
    await expect(table.getByText('SwiftShip Logistics')).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder(/name or slug/i).fill('swift');
    await expect(table.getByText('SwiftShip Logistics')).toBeVisible();
    await expect(table.getByText('TechDirect')).not.toBeVisible();
    await page.close();
  });

  test('clicking View → navigates to tenant detail', async () => {
    const page = await superCtx.newPage();
    await page.goto('/admin/tenants');
    // Wait for table rows to render
    await page.locator('table tbody tr').first().waitFor({ timeout: 10000 });
    // Click the href link for the first tenant detail
    const viewLink = page.locator('a[href*="/admin/tenants/"]').first();
    const href = await viewLink.getAttribute('href');
    await page.goto(href!);
    await expect(page).toHaveURL(/\/admin\/tenants\/.+/);
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 8000 });
    await page.close();
  });

  test('tenant detail shows user list and suspend button', async () => {
    const page = await superCtx.newPage();
    await page.goto('/admin/tenants');
    await page.waitForSelector('text=TechDirect', { timeout: 10000 });
    await page.locator('tr', { hasText: 'TechDirect' }).getByRole('link', { name: /view →/i }).click();
    await expect(page).toHaveURL(/\/admin\/tenants\/.+/);
    await expect(page.getByRole('heading', { name: /TechDirect/i })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/users \(/i)).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: /suspend tenant/i })).toBeVisible();
    await page.close();
  });

  test('non-super-admin is redirected away from /admin', async ({ browser }) => {
    // Separate context — log in as techdirect (not super admin)
    const ctx = await browser.newContext();
    await loginAs(ctx, 'admin@techdirect.com', 'password123', 'techdirect');
    const page = await ctx.newPage();
    await page.goto('/admin');
    // React needs to hydrate + auth store initialize before the redirect fires.
    // Wait for navigation away — the admin page calls router.replace('/dashboard')
    // when it sees user.isSuperAdmin === false.
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(page).not.toHaveURL(/\/admin(?:\/|$)/);
    await ctx.close();
  });
});
