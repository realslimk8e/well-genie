/**
 * e2e/chat.spec.ts
 * Tests the chatbot panel using mocked API only.
 * Uses saved auth state — all tests start logged in.
 */

import { test, expect } from '@playwright/test';

test.describe('Chat panel — mocked API', () => {
  test.beforeEach(async ({ page }) => {
    // Mock /api/chat/suggestions
    await page.route('**/api/chat/suggestions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          suggestions: [
            'How much sleep did I get last week?',
            'What was my average step count?',
            'How many calories did I eat?',
          ],
        }),
      });
    });

    // Default mock for /api/chat
    await page.route('**/api/chat', async (route) => {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: `Mock reply to: "${body.message}"`,
          function_called: null,
        }),
      });
    });

    await page.goto('/#chatbot');
  });

  test('shows the initial greeting from the bot', async ({ page }) => {
    await expect(
      page.getByText(/hi!.*ask me about your health/i)
    ).toBeVisible();
  });

  test('suggestion chips render from mocked response', async ({ page }) => {
    await expect(page.getByText('How much sleep did I get last week?').first()).toBeVisible();
    await expect(page.getByText('What was my average step count?').first()).toBeVisible();
  });

  test('typing a message enables send', async ({ page }) => {
    const input = page.getByPlaceholder(/ask about your health/i);
    const sendBtn = page.getByRole('button', { name: /send/i });

    await expect(sendBtn).toBeDisabled();
    await input.fill('Hello');
    await expect(sendBtn).toBeEnabled();
  });

  test('sending a message shows it in the chat', async ({ page }) => {
    await page.getByPlaceholder(/ask about your health/i).fill('How much sleep did I get last week?');
    await page.keyboard.press('Enter');

    // Target the user's chat bubble specifically, not suggestion chips or bot reply
    await expect(
      page.locator('.chat-bubble-primary', { hasText: 'How much sleep did I get last week?' })
    ).toBeVisible();
  });

  test('mocked bot reply appears correctly', async ({ page }) => {
    await page.getByPlaceholder(/ask about your health/i).fill('Hello bot');
    await page.keyboard.press('Enter');

    await expect(
      page.getByText(/mock reply to.*hello bot/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('handles 429 rate limit error gracefully', async ({ page }) => {
    await page.unroute('**/api/chat');
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Resource exhausted' }),
      });
    });

    await page.getByPlaceholder(/ask about your health/i).fill('Overload me');
    await page.keyboard.press('Enter');

    await expect(
      page.getByText(/high demand|try again/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('handles 401 session expiry gracefully', async ({ page }) => {
    await page.unroute('**/api/chat');
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Unauthorized' }),
      });
    });

    await page.getByPlaceholder(/ask about your health/i).fill('Am I logged in?');
    await page.keyboard.press('Enter');

    await expect(
      page.getByText(/session.*expired|log.*in again/i)
    ).toBeVisible({ timeout: 5000 });
  });
});