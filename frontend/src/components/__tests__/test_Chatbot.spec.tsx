import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, afterEach, vi } from 'vitest';
import type { SleepItem } from '../../hooks/useSleep';
import type { DietItem } from '../../hooks/useDiet';
import type { ExerciseItem } from '../../hooks/useExercise';

// Functional Requirement FR-009 and FR-010

const defaultSleep: SleepItem[] = [
  { id: 1, date: '2025-03-01', hours: 7, quality: 'good' },
  { id: 2, date: '2025-03-02', hours: 6, quality: 'fair' },
  { id: 3, date: '2025-03-03', hours: 8, quality: 'poor' },
];
const defaultExercise: ExerciseItem[] = [
  { id: 1, date: '2025-03-01', steps: 8000 },
  { id: 2, date: '2025-03-02', steps: 10000 },
  { id: 3, date: '2025-03-03', steps: 7000 },
];
const defaultDiet: DietItem[] = [
  {
    id: 1,
    date: '2025-03-01',
    calories: 2100,
    score: 85,
    protein_g: 120,
    fat_g: 70,
    carbs_g: 250,
  },
  {
    id: 2,
    date: '2025-03-02',
    calories: 1900,
    score: 90,
    protein_g: 110,
    fat_g: 60,
    carbs_g: 230,
  },
  {
    id: 3,
    date: '2025-03-03',
    calories: 2000,
    score: 88,
    protein_g: 115,
    fat_g: 65,
    carbs_g: 240,
  },
];

const setup = async ({
  sleep = defaultSleep,
  exercise = defaultExercise,
  diet = defaultDiet,
}: {
  sleep?: SleepItem[];
  exercise?: ExerciseItem[];
  diet?: DietItem[];
}) => {
  vi.resetModules();

  // Mock scrollIntoView to prevent TypeError in jsdom
  window.HTMLElement.prototype.scrollIntoView = vi.fn();

  // Mock global fetch to simulate backend responses based on test data
  global.fetch = vi.fn((url: string, options?: RequestInit) => {
    const urlStr = url.toString();

    // Mock Suggestions Endpoint
    if (urlStr.endsWith('/suggestions')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            suggestions: [
              'Show hours slept',
              'Show average daily steps',
              'Show calories vs 2000 target',
            ],
          }),
      });
    }

    // Mock Chat Endpoint
    if (urlStr.endsWith('/chat')) {
      let message = '';
      if (options && options.body) {
        const body = JSON.parse(options.body as string);
        message = body.message || '';
      }

      let responseText = "I don't understand.";

      if (/hours slept/i.test(message)) {
        if (sleep.length === 0) {
          responseText = 'I do not see any sleep data.';
        } else {
          const total = sleep.reduce((acc, item) => acc + item.hours, 0);
          responseText = `You slept ${total.toFixed(1)} hours in the last 7 days.`;
        }
      } else if (/steps/i.test(message)) {
        if (exercise.length === 0) {
          responseText = 'There is no steps data.';
        } else {
          const total = exercise.reduce(
            (acc, item) => acc + (item.steps ?? 0),
            0,
          );
          const avg = Math.round(total / exercise.length);
          responseText = `Your average daily steps were ${avg.toLocaleString()}.`;
        }
      } else if (/calories/i.test(message) || /target/i.test(message)) {
        if (diet.length === 0) {
          responseText = 'No nutrition data available.';
        } else {
          const total = diet.reduce((acc, item) => acc + item.calories, 0);
          const avg = Math.round(total / diet.length);
          responseText = `Your avg daily calories were ${avg}. This is calculated as average.`;
        }
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            message: responseText,
            function_called: null,
          }),
      });
    }

    return Promise.resolve({ ok: false });
  }) as unknown as typeof fetch;

  vi.doMock('../../hooks/useSleep', () => ({
    useSleep: () => ({ items: sleep, loading: false, error: null }),
  }));
  vi.doMock('../../hooks/useExercise', () => ({
    useExercise: () => ({ items: exercise, loading: false, error: null }),
  }));
  vi.doMock('../../hooks/useDiet', () => ({
    useDiet: () => ({ items: diet, loading: false, error: null }),
  }));
  const { default: ChatbotPanel } = await import('../panels/ChatbotPanel');
  const user = userEvent.setup();
  render(<ChatbotPanel />);
  return user;
};

afterEach(() => cleanup());

describe('ChatbotPanel predefined intents and fallbacks', () => {
  test('answers three intents with brief calculation explanations', async () => {
    const user = await setup({});

    // Wait for suggestions to load
    const sleepButton = await screen.findByRole('button', {
      name: /hours slept/i,
    });
    await user.click(sleepButton);

    const sleepReplies = await screen.findAllByText(
      /hours in the last 7 days/i,
    );
    expect(sleepReplies.at(-1)).toHaveTextContent('21.0');

    await user.click(
      screen.getByRole('button', { name: /average daily steps/i }),
    );
    const stepReplies = await screen.findAllByText(/average daily steps were/i);
    expect(stepReplies.at(-1)).toHaveTextContent('8,333');

    await user.click(
      screen.getByRole('button', { name: /calories vs 2000 target/i }),
    );
    const calReplies = await screen.findAllByText(/avg daily calories/i);
    expect(calReplies.at(-1)).toHaveTextContent('2000');
    expect(screen.getByText(/calculated as average/i)).toBeInTheDocument();
  });

  test('returns helpful fallback when data is missing', async () => {
    const user = await setup({ sleep: [], exercise: [], diet: [] });

    // Wait for suggestions to load
    const sleepButton = await screen.findByRole('button', {
      name: /hours slept/i,
    });
    await user.click(sleepButton);

    expect(
      await screen.findByText(/do not see any sleep data/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /average daily steps/i }),
    );
    expect(await screen.findByText(/no steps data/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /calories vs 2000 target/i }),
    );
    expect(
      await screen.findByText(/no nutrition data available/i),
    ).toBeInTheDocument();
  });
});
