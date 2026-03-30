import { test, expect } from '@playwright/test';

test.describe('Seller Journey', () => {
  test('seller onboarding page requires auth', async ({ page }) => {
    await page.goto('/seller/onboarding');
    await expect(page).toHaveURL(/\/login/);
  });

  test('seller dashboard requires auth', async ({ page }) => {
    await page.goto('/dashboard/seller');
    await expect(page).toHaveURL(/\/login/);
  });

  test('seller products page requires auth', async ({ page }) => {
    await page.goto('/seller/products');
    await expect(page).toHaveURL(/\/login/);
  });

  test('admin page requires auth', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('create group purchase requires auth', async ({ page }) => {
    await page.goto('/groups/create');
    await expect(page).toHaveURL(/\/login/);
  });

  // Authenticated seller tests would go here
  // These require test fixtures with seeded Supabase data
  // test.describe('Authenticated Seller', () => {
  //   test.beforeEach(async ({ page }) => {
  //     // Login as test seller
  //   });
  //
  //   test('can view seller dashboard', async ({ page }) => {
  //     await page.goto('/dashboard/seller');
  //     await expect(page.locator('h1')).toContainText('Seller');
  //   });
  //
  //   test('can create a product', async ({ page }) => {
  //     await page.goto('/seller/products/new');
  //     await expect(page.getByText('Add Product')).toBeVisible();
  //   });
  // });
});
