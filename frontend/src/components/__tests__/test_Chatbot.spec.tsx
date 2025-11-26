import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, afterEach, vi } from 'vitest';

// Functional Requirement FR-009 and FR-010

const defaultSleep = [
  { id: 1, date: '2025-03-01', hours: 7 },
  { id: 2, date: '2025-03-02', hours: 6 },
  { id: 3, date: '2025-03-03', hours: 8 },
];
const defaultExercise = [
  { id: 1, date: '2025-03-01', steps: 8000 },
  { id: 2, date: '2025-03-02', steps: 10000 },
  { id: 3, date: '2025-03-03', steps: 7000 },
];
const defaultDiet = [
  { id: 1, date: '2025-03-01', calories: 2100 },
  { id: 2, date: '2025-03-02', calories: 1900 },
  { id: 3, date: '2025-03-03', calories: 2000 },
];

const setup = async ({
  sleep = defaultSleep,
  exercise = defaultExercise,
  diet = defaultDiet,
}: {
  sleep?: any[];
  exercise?: any[];
  diet?: any[];
}) => {
  vi.resetModules();
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

    await user.click(screen.getByRole('button', { name: /hours slept/i }));
    const sleepReplies = await screen.findAllByText(/hours in the last 7 days/i);
    expect(sleepReplies.at(-1)).toHaveTextContent('21.0');

    await user.click(screen.getByRole('button', { name: /average daily steps/i }));
    const stepReplies = await screen.findAllByText(/average daily steps/i);
    expect(stepReplies.at(-1)).toHaveTextContent('8,333');

    await user.click(screen.getByRole('button', { name: /calories vs 2000 target/i }));
    const calReplies = await screen.findAllByText(/avg daily calories/i);
    expect(calReplies.at(-1)).toHaveTextContent('2000');
    expect(screen.getByText(/calculated as average/i)).toBeInTheDocument();
  });

  test('returns helpful fallback when data is missing', async () => {
    const user = await setup({ sleep: [], exercise: [], diet: [] });

    await user.click(screen.getByRole('button', { name: /hours slept/i }));
    expect(await screen.findByText(/do not see any sleep data/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /average daily steps/i }));
    expect(await screen.findByText(/no steps data/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /calories vs 2000 target/i }));
    expect(await screen.findByText(/no nutrition data available/i)).toBeInTheDocument();
  });
});
