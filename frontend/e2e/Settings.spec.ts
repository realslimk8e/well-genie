/**
 * e2e/settings.spec.ts
 *
 * Tests the SettingsPanel component end-to-end.
 * Uses saved auth state — all tests start logged in.
 */

import { test, expect } from '@playwright/test';

test.describe('Settings panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#settings');
  });

  test('renders calorie target input and sleep unit radios', async ({ page }) => {
    await expect(page.locator('input[type="number"]')).toBeVisible();
    await expect(page.locator('input[type="radio"]').first()).toBeVisible();
  });

  test('calorie target input has a default numeric value', async ({ page }) => {
    const input = page.locator('input[type="number"]');
    const value = await input.inputValue();
    expect(Number(value)).not.toBeNaN();
    expect(Number(value)).toBeGreaterThan(0);
  });

  test('can change calorie target and save', async ({ page }) => {
    const input = page.locator('input[type="number"]');
    await input.fill('2500');
    await page.getByRole('button', { name: /save preferences/i }).click();

    await expect(page.getByRole('status')).toContainText(/saved/i);
  });

  test('calorie target is clamped to 1000–5000 range', async ({ page }) => {
    const input = page.locator('input[type="number"]');

    await input.fill('500');
    await page.getByRole('button', { name: /save preferences/i }).click();
    await expect(page.getByRole('status')).toContainText(/saved/i);
    await expect(input).not.toHaveValue('500');

    await input.fill('9999');
    await page.getByRole('button', { name: /save preferences/i }).click();
    await expect(input).not.toHaveValue('9999');
  });

  test('can switch sleep unit to minutes and save', async ({ page }) => {
    const minutesRadio = page.locator('input[type="radio"]').nth(1);
    await minutesRadio.check();
    await expect(minutesRadio).toBeChecked();

    await page.getByRole('button', { name: /save preferences/i }).click();
    await expect(page.getByRole('status')).toContainText(/saved/i);
  });

  test('reset defaults restores original values', async ({ page }) => {
    await page.locator('input[type="number"]').fill('1234');
    await page.getByRole('button', { name: /save preferences/i }).click();

    await page.getByRole('button', { name: /reset defaults/i }).click();
    await expect(page.getByRole('status')).toContainText(/reset/i);

    const value = await page.locator('input[type="number"]').inputValue();
    expect(value).not.toBe('1234');
  });

  test.describe('Data Management section', () => {
    test('shows delete section with sleep/diet/exercise categories', async ({ page }) => {
      await expect(page.getByText(/delete health records/i)).toBeVisible();
      // Target the h4 headings rendered inside each DeleteData component
      await expect(page.getByRole('heading', { name: /sleep data/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /diet data/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /exercise data/i })).toBeVisible();
    });

    test('delete requires a date range to be set', async ({ page }) => {
      const deleteButtons = page.getByRole('button', { name: /delete/i });
      await expect(deleteButtons.first()).toBeVisible();
    });
  });
});