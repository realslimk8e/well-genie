/**
 * e2e/exercise.spec.ts
 *
 * Tests the ExercisePanel component end-to-end.
 * Uses saved auth state — all tests start logged in.
 *
 * Assumes the test DB is seeded with at least 7 exercise entries
 * for the test user spanning the last 30 days.
 */

import { test, expect } from '@playwright/test';

test.describe('Exercise panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#exercise');
    await expect(page.locator('.loading-spinner')).not.toBeVisible({ timeout: 8000 });
  });

  test('renders three stat cards with numeric values', async ({ page }) => {
    // Avg Minutes, Avg Calories Burned, Avg Steps
    const statValues = page.locator('.stat-value');
    await expect(statValues).toHaveCount(3);

    for (const stat of await statValues.all()) {
      const text = await stat.innerText();
      // Strip commas and whitespace, should parse to a number
      expect(Number(text.replace(/[,\s]/g, ''))).not.toBeNaN();
    }
  });

  test('last-7-days table renders correct columns', async ({ page }) => {
    const headers = page.locator('table').first().locator('thead th');
    await expect(headers).toHaveCount(4);
    await expect(headers.nth(0)).toContainText(/day/i);
    await expect(headers.nth(1)).toContainText(/minutes/i);
    await expect(headers.nth(2)).toContainText(/calories/i);
    await expect(headers.nth(3)).toContainText(/steps/i);
  });

  test('last-7-days table has data rows', async ({ page }) => {
    const rows = page.locator('table').first().locator('tbody tr');
    await expect(rows.first()).not.toContainText(/no exercise entries/i);
  });

  test('date range filter narrows results', async ({ page }) => {
    const rows = page.locator('table').first().locator('tbody tr');
    const initialCount = await rows.count();

    const today = new Date().toISOString().slice(0, 10);
    await page.locator('input[type="date"]').nth(0).fill(today);
    await page.locator('input[type="date"]').nth(1).fill(today);

    const filteredCount = await rows.count();
    const emptyMsg = page.locator('td').filter({ hasText: /no exercise entries/i });
    const isFiltered = filteredCount < initialCount || await emptyMsg.isVisible();
    expect(isFiltered).toBe(true);
  });

  test('clear filter restores full results', async ({ page }) => {
    const today = new Date().toISOString().slice(0, 10);
    await page.locator('input[type="date"]').nth(0).fill(today);
    await page.locator('input[type="date"]').nth(1).fill(today);

    await page.getByRole('button', { name: /clear/i }).click();

    await expect(page.locator('input[type="date"]').nth(0)).toHaveValue('');
    await expect(page.locator('input[type="date"]').nth(1)).toHaveValue('');
  });

  test.describe('Aggregated summaries', () => {
    test('defaults to Daily view', async ({ page }) => {
      await expect(page.locator('.btn-primary', { hasText: /daily/i })).toBeVisible();
    });

    test('switches to Weekly view and shows "Week of" labels', async ({ page }) => {
      await page.getByRole('button', { name: /weekly/i }).click();
      await expect(page.locator('.btn-primary', { hasText: /weekly/i })).toBeVisible();

      const firstCell = page.locator('table').nth(1).locator('tbody td').first();
      await expect(firstCell).toContainText(/week of/i);
    });

    test('switches to Monthly view and shows month labels', async ({ page }) => {
      await page.getByRole('button', { name: /monthly/i }).click();
      await expect(page.locator('.btn-primary', { hasText: /monthly/i })).toBeVisible();

      const firstCell = page.locator('table').nth(1).locator('tbody td').first();
      await expect(firstCell).toContainText(/^[A-Z][a-z]+ \d{4}$/);
    });

    test('aggregations row shows sum/avg/min/max for minutes', async ({ page }) => {
      const aggRow = page.getByTestId('exercise-aggregations');
      await expect(aggRow).toBeVisible();
      await expect(aggRow).toContainText(/sum/i);
      await expect(aggRow).toContainText(/avg/i);
      await expect(aggRow).toContainText(/min/i);
      await expect(aggRow).toContainText(/max/i);
    });
  });
});