import { render, screen, cleanup, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, afterEach, vi } from 'vitest';
import SleepPanel from '../panels/SleepPanel';
import DietPanel from '../panels/DietPanel';
import ExercisePanel from '../panels/ExercisePanel';
import SummaryFilters from '../filters/SummaryFilters';

// Functional Requirement FR-005

vi.mock('../../hooks/useSleep', () => ({
  useSleep: () => ({
    items: [
      { id: 1, date: '2025-03-01', hours: 7, quality: 'good' },
      { id: 2, date: '2025-03-02', hours: 6, quality: 'fair' },
      { id: 3, date: '2025-03-08', hours: 7, quality: 'good' },
      { id: 4, date: '2025-04-01', hours: 8, quality: 'excellent' },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock('../../hooks/useDiet', () => ({
  useDiet: () => ({
    items: [
      { id: 1, date: '2025-03-01', calories: 2000, protein_g: 120, fat_g: 60, carbs_g: 220 },
      { id: 2, date: '2025-03-02', calories: 2100, protein_g: 130, fat_g: 55, carbs_g: 230 },
      { id: 3, date: '2025-03-08', calories: 1900, protein_g: 110, fat_g: 50, carbs_g: 210 },
      { id: 4, date: '2025-04-01', calories: 2200, protein_g: 140, fat_g: 65, carbs_g: 240 },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock('../../hooks/useExercise', () => ({
  useExercise: () => ({
    items: [
      { id: 1, date: '2025-03-01', duration_min: 30, calories_burned: 200, steps: 4000 },
      { id: 2, date: '2025-03-02', duration_min: 40, calories_burned: 250, steps: 5000 },
      { id: 3, date: '2025-03-08', duration_min: 35, calories_burned: 220, steps: 4500 },
      { id: 4, date: '2025-04-01', duration_min: 45, calories_burned: 280, steps: 5500 },
    ],
    loading: false,
    error: null,
  }),
}));

afterEach(() => cleanup());

const getAggregatedRows = (title: string) => {
  const heading = screen.getByText(title, { exact: false });
  const container =
    heading.closest('.card-body') ??
    heading.parentElement ??
    heading.parentElement?.parentElement;
  if (!container) throw new Error('No container found for aggregated table');
  const table = within(container as HTMLElement).getByRole('table');
  const rows = within(table).getAllByRole('row');
  return rows.slice(1); // skip header
};

describe('Aggregated summaries', () => {
  test('SleepPanel shows daily, weekly, monthly aggregation tables', async () => {
    const user = userEvent.setup();
    render(<SleepPanel />);

    // Daily (default) – one row per day
    expect(getAggregatedRows('Aggregated summaries')).toHaveLength(4);

    await user.click(screen.getByRole('button', { name: /weekly/i }));
    expect(getAggregatedRows('Aggregated summaries')).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: /monthly/i }));
    expect(getAggregatedRows('Aggregated summaries')).toHaveLength(2);
  });

  test('DietPanel shows daily, weekly, monthly aggregation tables', async () => {
    const user = userEvent.setup();
    render(<DietPanel />);

    expect(getAggregatedRows('Aggregated summaries')).toHaveLength(4);

    await user.click(screen.getByRole('button', { name: /weekly/i }));
    expect(getAggregatedRows('Aggregated summaries')).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: /monthly/i }));
    expect(getAggregatedRows('Aggregated summaries')).toHaveLength(2);
  });

  test('ExercisePanel shows daily, weekly, monthly aggregation tables', async () => {
    const user = userEvent.setup();
    render(<ExercisePanel />);

    expect(getAggregatedRows('Aggregated summaries')).toHaveLength(4);

    await user.click(screen.getByRole('button', { name: /weekly/i }));
    expect(getAggregatedRows('Aggregated summaries')).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: /monthly/i }));
    expect(getAggregatedRows('Aggregated summaries')).toHaveLength(2);
  });

  // Functional Requirement FR-006
  test('SummaryFilters updates table when date range and category toggles change', async () => {
    const user = userEvent.setup();
    render(<SummaryFilters />);

    // initial counts include all mocked items
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const dataRows = rows.slice(1);
    expect(dataRows).toHaveLength(3);
    const firstRowCells = within(dataRows[0]).getAllByRole('cell');
    const secondRowCells = within(dataRows[1]).getAllByRole('cell');
    const thirdRowCells = within(dataRows[2]).getAllByRole('cell');
    expect(firstRowCells[0].textContent?.toLowerCase()).toContain('nutrition');
    expect(secondRowCells[0].textContent?.toLowerCase()).toContain('sleep');
    expect(thirdRowCells[0].textContent?.toLowerCase()).toContain('steps');

    // apply date range to include only March 2025 (3 items per category mocked)
    const start = screen.getByLabelText(/start date/i);
    const end = screen.getByLabelText(/end date/i);
    await user.type(start, '2025-03-01');
    await user.type(end, '2025-03-31');
    expect(screen.getAllByText('3')).toHaveLength(3);

    // toggle off steps
    const stepsToggle = screen.getByLabelText(/steps toggle/i);
    await user.click(stepsToggle);
    const updatedCells = within(table).getAllByRole('cell');
    expect(updatedCells.some((cell) => cell.textContent === 'steps')).toBe(false);
  });

  // Functional Requirement FR-007
  test('SummaryFilters allows sorting and show/hide columns', async () => {
    const user = userEvent.setup();
    render(<SummaryFilters />);

    const table = screen.getByRole('table');
    const rowsAsc = within(table).getAllByRole('row').slice(1);
    const initialOrder = rowsAsc.map((r) => (r.textContent || '').toLowerCase());

    const tableCategoryButton = within(table).getByRole('button', { name: /category/i });
    // toggle to descending
    await user.click(tableCategoryButton);
    await waitFor(() => {
      const rowsDesc = within(table).getAllByRole('row').slice(1);
      expect(rowsDesc[0].textContent?.toLowerCase()).toContain('steps');
    });

    // hide count column
    const toggleCount = screen.getByLabelText(/toggle count column/i);
    await user.click(toggleCount);
    expect(within(table).queryByRole('columnheader', { name: /count/i })).toBeNull();
  });

  // Functional Requirement FR-008
  test('Panels show standard aggregations and indicate aggregation type', () => {
    render(
      <>
        <SleepPanel />
        <DietPanel />
        <ExercisePanel />
      </>,
    );

    expect(screen.getByTestId('sleep-aggregations')).toHaveTextContent(/sum 28\.0/i);
    expect(screen.getByTestId('sleep-aggregations')).toHaveTextContent(/avg 7\.0/i);
    expect(screen.getByTestId('sleep-aggregations')).toHaveTextContent(/min 6/i);
    expect(screen.getByTestId('sleep-aggregations')).toHaveTextContent(/max 8/i);

    expect(screen.getByTestId('diet-aggregations')).toHaveTextContent(/sum 8200/i);
    expect(screen.getByTestId('diet-aggregations')).toHaveTextContent(/avg 2050\.0/i);
    expect(screen.getByTestId('diet-aggregations')).toHaveTextContent(/min 1900/i);
    expect(screen.getByTestId('diet-aggregations')).toHaveTextContent(/max 2200/i);

    expect(screen.getByTestId('exercise-aggregations')).toHaveTextContent(/sum 150/i);
    expect(screen.getByTestId('exercise-aggregations')).toHaveTextContent(/avg 37\.5/i);
    expect(screen.getByTestId('exercise-aggregations')).toHaveTextContent(/min 30/i);
    expect(screen.getByTestId('exercise-aggregations')).toHaveTextContent(/max 45/i);
  });

  // Functional Requirement FR-013
  test('SummaryFilters allows deleting data for a category and date range', async () => {
    const user = userEvent.setup();
    render(<SummaryFilters />);

    const start = screen.getByLabelText(/start date/i);
    const end = screen.getByLabelText(/end date/i);
    await user.type(start, '2025-03-01');
    await user.type(end, '2025-03-31');

    const deleteSelect = screen.getByLabelText(/delete category/i);
    await user.selectOptions(deleteSelect, 'sleep');

    await user.click(screen.getByRole('button', { name: /delete filtered/i }));

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row').slice(1);
    const sleepRow = rows.find((r) => (r.textContent || '').toLowerCase().includes('sleep'));
    expect(sleepRow?.textContent || '').toContain('0');
    expect(await screen.findByRole('status')).toHaveTextContent(/deleted 3 sleep record/i);
  });
});
