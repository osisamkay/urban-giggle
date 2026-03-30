import { test, expect } from '@playwright/test';

test.describe('Buyer Journey', () => {
  test('homepage loads and shows hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('Browse Products')).toBeVisible();
  });

  test('can browse products page', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('h1')).toContainText('Products');
    // Should see category filters
    await expect(page.getByText('BEEF')).toBeVisible();
  });

  test('can view product detail', async ({ page }) => {
    await page.goto('/products');
    // Click first product if available
    const firstProduct = page.locator('a[href^="/products/"]').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.getByText('Add to Cart')).toBeVisible();
    }
  });

  test('can view group purchases', async ({ page }) => {
    await page.goto('/groups');
    await expect(page.locator('h1')).toContainText('Group');
  });

  test('can access search page', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('h1')).toContainText('Search');
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('can view community page', async ({ page }) => {
    await page.goto('/community');
    await expect(page.locator('h1')).toContainText('Community');
  });

  test('empty cart shows message', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByText(/cart is empty|no items/i)).toBeVisible();
  });

  test('unauthenticated user redirected from checkout', async ({ page }) => {
    await page.goto('/checkout');
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user redirected from orders', async ({ page }) => {
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/login/);
  });

  test('signup page loads', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByText(/create.*account/i)).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/sign in/i)).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('health endpoint returns ok', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });
});
