// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * SecureBank – Admin E2E Tests
 * 
 * Covers:
 * - Admin Dashboard rendering
 * - Pagination components
 */

test.describe('Admin Dashboard', () => {
  test('should render paginated user list for admin', async ({ page }) => {
    // Mock authentication state as admin
    await page.route('**/api/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'admin_123',
            name: 'Super Admin',
            email: 'admin@securebank.com',
            accountBalance: 0,
            role: 'admin',
            hasTransferPin: true,
            twoFactorEnabled: true,
          },
        }),
      });
    });

    // Mock admin users endpoint
    await page.route('**/api/admin/users*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            users: [
              { _id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user', accountBalance: 100 },
              { _id: 'u2', name: 'Bob', email: 'bob@test.com', role: 'user', accountBalance: 50 },
            ],
            pagination: {
              total: 2,
              page: 1,
              pages: 1,
              limit: 10
            }
          }
        }),
      });
    });

    // Mock other endpoints
    await page.route('**/api/admin/transactions*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { transactions: [], pagination: { total: 0 } } })
      });
    });
    await page.route('**/api/admin/cards*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { cards: [], pagination: { total: 0 } } })
      });
    });
    await page.route('**/api/admin/audit-logs*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { logs: [], pagination: { total: 0 } } })
      });
    });

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Verify admin dashboard loaded
    const heading = page.locator('h1:has-text("SOC Terminal")');
    await expect(heading).toBeVisible();

    // Verify users are rendered
    await expect(page.locator('text=Alice')).toBeVisible();
    await expect(page.locator('text=Bob')).toBeVisible();

    // Verify pagination controls are visible
    const pagination = page.locator('text=Page 1 of 1');
    await expect(pagination).toBeVisible();
  });
});
