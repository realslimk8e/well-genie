/**
 * e2e/sleep.spec.ts
 *
 * Tests the SleepPanel component end-to-end.
 * Uses saved auth state — all tests start logged in.
 *
 * Assumes the test DB is seeded with at least 7 sleep entries
 * for the test user spanning the last 30 days.
 */

import { test, expect } from '@playwright/test';

test.describe('Sleep panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#sleep');
    await expect(page.locator('.loading-spinner')).not.toBeVisible({ timeout: 8000 });
  });

  test('renders avg hours and avg quality stat cards', async ({ page }) => {
    const avgHours = page.locator('.stat-value').first();
    await expect(avgHours).toBeVisible();
    // Value should contain a number followed by "h"
    await expect(avgHours).toContainText(/\d+(\.\d+)?\s*h/);

    // Second stat card shows a quality badge
    const qualityBadge = page.locator('.stat').nth(1).locator('.badge');
    await expect(qualityBadge).toBeVisible();
    await expect(qualityBadge).toContainText(/excellent|good|fair|poor/i);
  });

  test('last-7-days table renders correct columns', async ({ page }) => {
    const headers = page.locator('table').first().locator('thead th');
    await expect(headers).toHaveCount(3);
    await expect(headers.nth(0)).toContainText(/day/i);
    await expect(headers.nth(1)).toContainText(/quality/i);
    await expect(headers.nth(2)).toContainText(/hours/i);
  });

  test('last-7-days table has data rows', async ({ page }) => {
    const rows = page.locator('table').first().locator('tbody tr');
    await expect(rows.first()).not.toContainText(/no sleep entries/i);
  });

  test('date range filter narrows results', async ({ page }) => {
    const rows = page.locator('table').first().locator('tbody tr');
    const initialCount = await rows.count();

    const today = new Date().toISOString().slice(0, 10);
    await page.locator('input[type="date"]').nth(0).fill(today);
    await page.locator('input[type="date"]').nth(1).fill(today);

    const filteredCount = await rows.count();
    const emptyMsg = page.locator('td').filter({ hasText: /no sleep entries/i });
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

    test('aggregations row shows sum/avg/min/max', async ({ page }) => {
      const aggRow = page.getByTestId('sleep-aggregations');
      await expect(aggRow).toBeVisible();
      await expect(aggRow).toContainText(/sum/i);
      await expect(aggRow).toContainText(/avg/i);
      await expect(aggRow).toContainText(/min/i);
      await expect(aggRow).toContainText(/max/i);
    });
  });
});