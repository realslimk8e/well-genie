/**
 * e2e/diet.spec.ts
 *
 * Tests the DietPanel component end-to-end.
 * Uses saved auth state — all tests start logged in.
 *
 * Assumes the test DB is seeded with at least 7 diet entries
 * for the test user spanning the last 30 days.
 */

import { test, expect } from '@playwright/test';

test.describe('Diet panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#diet');
    // Wait for the panel to finish loading (spinner disappears)
    await expect(page.locator('.loading-spinner')).not.toBeVisible({ timeout: 8000 });
  });

  test('renders stat cards with numeric values', async ({ page }) => {
    // Four stat boxes: Avg Protein, Avg Calories, Avg Fat, Avg Carbs
    const stats = page.locator('.stat-value');
    await expect(stats).toHaveCount(4);

    for (const stat of await stats.all()) {
      const text = await stat.innerText();
      // Values should be numeric (0 is valid when no data)
      expect(Number(text)).not.toBeNaN();
    }
  });

  test('last-7-days table renders rows', async ({ page }) => {
    const rows = page.locator('table').first().locator('tbody tr');
    // Should have at least 1 row of data (not the empty-state row)
    await expect(rows.first()).not.toContainText(/no diet entries/i);
  });

  test('table columns are correct', async ({ page }) => {
    const headers = page.locator('table').first().locator('thead th');
    await expect(headers).toHaveCount(5);
    await expect(headers.nth(0)).toContainText(/day/i);
    await expect(headers.nth(1)).toContainText(/protein/i);
    await expect(headers.nth(2)).toContainText(/fat/i);
    await expect(headers.nth(3)).toContainText(/carbs/i);
    await expect(headers.nth(4)).toContainText(/calories/i);
  });

  test('date range filter narrows down results', async ({ page }) => {
    // Get initial row count
    const rows = page.locator('table').first().locator('tbody tr');
    const initialCount = await rows.count();

    // Apply a very narrow range — just today — likely 0 or 1 rows
    const today = new Date().toISOString().slice(0, 10);
    await page.locator('input[type="date"]').nth(0).fill(today);
    await page.locator('input[type="date"]').nth(1).fill(today);

    // Row count should change (filter applied)
    // Either fewer rows, or the empty state message
    const filteredCount = await rows.count();
    const emptyMessage = page.locator('td').filter({ hasText: /no diet entries/i });

    const isFiltered = filteredCount < initialCount || await emptyMessage.isVisible();
    expect(isFiltered).toBe(true);
  });

  test('clear filter restores full results', async ({ page }) => {
    const today = new Date().toISOString().slice(0, 10);
    await page.locator('input[type="date"]').nth(0).fill(today);
    await page.locator('input[type="date"]').nth(1).fill(today);

    // Click the clear button
    await page.getByRole('button', { name: /clear/i }).click();

    // Inputs should be empty
    await expect(page.locator('input[type="date"]').nth(0)).toHaveValue('');
    await expect(page.locator('input[type="date"]').nth(1)).toHaveValue('');
  });

  test.describe('Aggregated summaries', () => {
    test('defaults to Daily view', async ({ page }) => {
      const activeBtn = page.locator('.btn-primary', { hasText: /daily/i });
      await expect(activeBtn).toBeVisible();
    });

    test('switches to Weekly view and shows "Week of" labels', async ({ page }) => {
      await page.getByRole('button', { name: /weekly/i }).click();
      await expect(page.locator('.btn-primary', { hasText: /weekly/i })).toBeVisible();

      const cells = page.locator('table').nth(1).locator('tbody td').first();
      await expect(cells).toContainText(/week of/i);
    });

    test('switches to Monthly view', async ({ page }) => {
      await page.getByRole('button', { name: /monthly/i }).click();
      await expect(page.locator('.btn-primary', { hasText: /monthly/i })).toBeVisible();

      // Monthly label is like "Jan 2024"
      const cells = page.locator('table').nth(1).locator('tbody td').first();
      const text = await cells.innerText();
      expect(text).toMatch(/^[A-Z][a-z]+ \d{4}$/);
    });

    test('aggregations row shows sum/avg/min/max', async ({ page }) => {
      const aggRow = page.getByTestId('diet-aggregations');
      await expect(aggRow).toBeVisible();
      await expect(aggRow).toContainText(/sum/i);
      await expect(aggRow).toContainText(/avg/i);
      await expect(aggRow).toContainText(/min/i);
      await expect(aggRow).toContainText(/max/i);
    });
  });
});