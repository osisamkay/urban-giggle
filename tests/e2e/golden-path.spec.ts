import { test, expect } from '@playwright/test';

test.describe('ShareStake Golden Path - End-to-End', () => {
  
  test('User can sign up and join a group to save money', async ({ page }) => {
    // 1. Sign Up
    await page.goto('/signup');
    await page.fill('input[name="email"]', `tester_${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Discovery: Find a group
    await page.goto('/groups');
    const firstGroup = page.locator('.group-card').first();
    await expect(firstGroup).toBeVisible();
    await firstGroup.click();

    // 3. Join Group
    const joinButton = page.locator('button:has-text("Join Group")');
    await expect(joinButton).toBeVisible();
    await joinButton.click();
    
    // Verify success notification or state change
    await expect(page.locator('text=Joined successfully')).toBeVisible();

    // 4. Verify Savings in Buyer Hub
    await page.goto('/dashboard');
    const savingsVault = page.locator('.savings-vault');
    await expect(savingsVault).toBeVisible();
  });

  test('Seller can create a product and manage it', async ({ page }) => {
    // 1. Login as Seller
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'SellerPass123!');
    await page.click('button[type="submit"]');

    // 2. Access Seller Command Center
    await page.goto('/dashboard/seller');
    await expect(page.locator('h1:has-text("Command Center")')).toBeVisible();

    // 3. Create Product
    await page.click('button:has-text("New Product")');
    await page.fill('input[name="name"]', 'Premium Wagyu A5');
    await page.fill('input[name="price"]', '250');
    await page.fill('input[name="quantity"]', '10');
    await page.click('button[type="submit"]');

    // 4. Verify Product appears in list
    await expect(page.locator('text=Premium Wagyu A5')).toBeVisible();
  });
});
