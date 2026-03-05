/**
 * e2e/auth.spec.ts
 * Tests the login/logout flow in isolation.
 * These tests do NOT use the saved auth state — they test the auth UI itself.
 */

import { test, expect } from '@playwright/test';

// Override storageState — these tests must start unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('login-form')).toBeVisible();
  });

  test('shows login form on first visit', async ({ page }) => {
    await expect(page.getByTestId('username')).toBeVisible();
    await expect(page.getByTestId('password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('submit button is disabled when fields are empty', async ({ page }) => {
    await expect(page.getByTestId('login-submit')).toBeDisabled();
  });

  test('submit button enables once both fields are filled', async ({ page }) => {
    await page.getByTestId('username').fill('someone');
    await page.getByTestId('password').fill('pass');
    await expect(page.getByTestId('login-submit')).toBeEnabled();
  });

  test('shows error on wrong credentials', async ({ page }) => {
    await page.getByTestId('username').fill('wronguser');
    await page.getByTestId('password').fill('wrongpass');
    await page.getByTestId('login-submit').click();

    await expect(page.locator('.alert-error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.alert-error')).toContainText(/incorrect|password|credentials|401/i);
    await expect(page.getByTestId('login-form')).toBeVisible();
  });

  test('switches to signup view', async ({ page }) => {
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page.getByTestId('login-form')).not.toBeVisible();
  });

  test('successful login redirects past AuthGate', async ({ page }) => {
    await page.getByTestId('username').fill(process.env.TEST_USERNAME ?? 'admin');
    await page.getByTestId('password').fill(process.env.TEST_PASSWORD ?? '123');
    await page.getByTestId('login-submit').click();

    // Wait for the sidebar nav to appear — it only renders after successful auth.
    // "Log out" is always visible in the sidebar regardless of which tab is active.
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 15000 });
  });
});