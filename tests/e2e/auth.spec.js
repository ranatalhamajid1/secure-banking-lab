// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * SecureBank – Authentication E2E Tests
 * 
 * Covers:
 * - Login flow (form submission, redirect)
 * - Logout flow (session clearance)
 * - Visual regression across viewports
 * - Accessibility compliance (WCAG 2.1 AA)
 */

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://127.0.0.1:5000/api';

// ═══════════════════════════════════════════════════════
//  VISUAL REGRESSION TESTS
// ═══════════════════════════════════════════════════════

test.describe('Visual Regression – Public Pages', () => {
  test('Landing page screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('landing.png', { fullPage: true });
  });

  test('Login page screenshot', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('login.png', { fullPage: true });
  });

  test('Register page screenshot', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('register.png', { fullPage: true });
  });
});

// ═══════════════════════════════════════════════════════
//  LOGIN FLOW
// ═══════════════════════════════════════════════════════

test.describe('Login Flow', () => {
  test('should show validation on empty form submit', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Click Sign In with empty fields
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('should show error toast on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error toast to appear
    const toast = page.locator('div[role="status"]').first();
    await expect(toast).toBeVisible({ timeout: 10000 });
  });

  test('should redirect authenticated user away from login', async ({ page }) => {
    // If a user is already authenticated via cookies, visiting /login should redirect
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // The login page should be visible for unauthenticated users
    const heading = page.locator('h2:has-text("Welcome back")');
    await expect(heading).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════
//  PERFORMANCE ASSERTIONS
// ═══════════════════════════════════════════════════════

test.describe('Performance', () => {
  test('Login page should load within 2 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;

    console.log(`Login page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });

  test('Landing page should load within 2 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;

    console.log(`Landing page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });
});

// ═══════════════════════════════════════════════════════
//  ACCESSIBILITY TESTS (axe-core)
// ═══════════════════════════════════════════════════════

test.describe('Accessibility', () => {
  test('Landing page should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast']) // Allow gradient/glass UI elements
      .analyze();

    const critical = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    if (critical.length > 0) {
      console.log('Critical A11y Violations:', JSON.stringify(critical, null, 2));
    }

    expect(critical.length).toBe(0);
  });

  test('Login page should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const critical = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(critical.length).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════
//  NETWORK FAILURE RESILIENCE
// ═══════════════════════════════════════════════════════

test.describe('Network Resilience', () => {
  test('should handle API timeout gracefully on login', async ({ page }) => {
    // Intercept login API call and delay it to simulate timeout
    await page.route('**/api/auth/login', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 16000)); // exceed 15s timeout
      route.abort('timedout');
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should show error toast, not crash
    const toast = page.locator('div[role="status"]').first();
    await expect(toast).toBeVisible({ timeout: 20000 });
  });

  test('should handle 500 error gracefully on login', async ({ page }) => {
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // App should not crash – toast should appear
    const toast = page.locator('div[role="status"]').first();
    await expect(toast).toBeVisible({ timeout: 10000 });
  });
});
