import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import ImportPage from '../../components/import';

declare global {
  interface File {
    _mockText?: string;
  }
}

afterEach(() => cleanup());

describe('ImportPage', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();

    Object.defineProperty(File.prototype, 'text', {
      configurable: true,
      writable: true,
      value: function (this: File) {
        return Promise.resolve(this._mockText || '');
      },
    });
  });

  test('invalid CSV headers → shows failure toast and does not call onImported', async () => {
    const user = userEvent.setup();
    const onImported = vi.fn();
    render(<ImportPage onImported={onImported} />);

    const invalidCsv = new File(['foo,bar,baz,qux\n1,2,3,4\n'], 'invalid.csv', {
      type: 'text/csv',
    });
    invalidCsv._mockText = 'foo,bar,baz,qux\n1,2,3,4\n';

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    await user.upload(input, invalidCsv);

    const errorToast = await screen.findByText(/import failed:/i, {}, { timeout: 3000 });
    expect(errorToast).toHaveTextContent(/missing required headers/i);
    expect(onImported).not.toHaveBeenCalled();
  });

  test('valid CSV → shows success toast and calls onImported(added, skipped)', async () => {
    const user = userEvent.setup();
    const onImported = vi.fn();
    render(<ImportPage onImported={onImported} />);

    const csvText =
      'date,category,metric,value\n' +
      '2025-10-01,wellness,steps,1234\n' +
      '2025-10-02,nutrition,calories,2100\n';

    const validCsv = new File([csvText], 'valid.csv', { type: 'text/csv' });
    validCsv._mockText = csvText;

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    await user.upload(input, validCsv);

    const successToast = await screen.findByText(/rows imported/i, {}, { timeout: 3000 });
    expect(successToast).toHaveTextContent('2 rows imported, 0 skipped.');
    expect(onImported).toHaveBeenCalledWith(2, 0);
  });

  // Functional Requirement FR-001
  test('shows a preview of the first five rows after upload', async () => {
    const user = userEvent.setup();
    render(<ImportPage />);

    const csvText = [
      'date,category,metric,value',
      '2025-01-01,sleep,hours,7',
      '2025-01-02,steps,total,9000',
      '2025-01-03,nutrition,calories,2100',
      '2025-01-04,steps,total,8500',
      '2025-01-05,sleep,hours,8',
      '2025-01-06,nutrition,protein,120',
    ].join('\n');

    const file = new File([csvText], 'multi.csv', { type: 'text/csv' });
    file._mockText = csvText;

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    const previewHeading = await screen.findByText(/preview - last/i);
    const previewCard = previewHeading.closest('div') as HTMLElement;
    const table = within(previewCard).getByRole('table');
    const rows = within(table).getAllByRole('row');
    // table header counts as one row; expect 5 data rows
    const dataRows = rows.slice(1);
    expect(dataRows).toHaveLength(5);
    expect(screen.getByText('2025-01-01')).toBeInTheDocument();
    expect(screen.getByText('2025-01-05')).toBeInTheDocument();
    expect(screen.queryByText('2025-01-06')).not.toBeInTheDocument();
  });

  // Functional Requirement FR-002
  test('flags invalid rows after import (bad date and non-numeric value)', async () => {
    const user = userEvent.setup();
    const onImported = vi.fn();
    render(<ImportPage onImported={onImported} />);

    const csvText = [
      'date,category,metric,value',
      '2025-01-01,sleep,hours,7',
      'bad-date,steps,total,9000',
      '2025-01-03,nutrition,calories,not-a-number',
    ].join('\n');

    const file = new File([csvText], 'invalid.csv', { type: 'text/csv' });
    file._mockText = csvText;

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    const toast = await screen.findByText(/rows imported, 2 skipped/i);
    expect(toast).toBeInTheDocument();
    expect(onImported).toHaveBeenCalledWith(1, 2);

    const errorTableTitle = await screen.findByText(/rows with errors/i);
    expect(errorTableTitle).toBeInTheDocument();
    expect(screen.getByText(/invalid date format/i)).toBeInTheDocument();
    expect(screen.getByText(/must be numeric/i)).toBeInTheDocument();
  });

  // Functional Requirement FR-003
  test('records each upload attempt in import history', async () => {
    const user = userEvent.setup();
    render(<ImportPage />);

    const validCsv = [
      'date,category,metric,value',
      '2025-02-01,sleep,hours,7',
      '2025-02-02,steps,total,8000',
    ].join('\n');

    const invalidCsv = ['date,category,metric', '2025-02-03,sleep,hours'].join('\n');

    const validFile = new File([validCsv], 'valid.csv', { type: 'text/csv' });
    validFile._mockText = validCsv;
    const invalidFile = new File([invalidCsv], 'invalid.csv', { type: 'text/csv' });
    invalidFile._mockText = invalidCsv;

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    // successful import
    await user.upload(input, validFile);
    await screen.findByText(/rows imported, 0 skipped/i);

    // failed import (missing header) – input key changes after upload, reselect
    const secondInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(secondInput, invalidFile);
    await screen.findByText(/import failed/i);

    const historyHeading = await screen.findByText(/import history/i);
    expect(historyHeading).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);
    expect(dataRows).toHaveLength(2);

    expect(dataRows[0].textContent).toContain('invalid.csv');
    expect(dataRows[0].textContent).toContain('0');

    expect(dataRows[1].textContent).toContain('valid.csv');
    expect(dataRows[1].textContent).toContain('2');
  });

  // Functional Requirement FR-004
  test('allows undoing the most recent import', async () => {
    const user = userEvent.setup();
    render(<ImportPage />);

    const csvText = [
      'date,category,metric,value',
      '2025-03-01,sleep,hours,7',
      '2025-03-02,steps,total,9000',
    ].join('\n');

    const file = new File([csvText], 'undo.csv', { type: 'text/csv' });
    file._mockText = csvText;

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    await screen.findByText(/rows imported, 0 skipped/i);

    const undoButton = screen.getByRole('button', { name: /undo last import/i });
    expect(undoButton).not.toBeDisabled();

    await user.click(undoButton);

    const toast = await screen.findByText(/last import undone/i);
    expect(toast).toBeInTheDocument();

    // preview should be cleared
    expect(screen.queryByText(/preview - last/i)).not.toBeInTheDocument();

    // history should include the undo entry first
    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);
    expect(dataRows[0].textContent).toContain('undo');
  });

  // Functional Requirement FR-011
  test('displays error messages for rejected import rows', async () => {
    const user = userEvent.setup();
    render(<ImportPage />);

    const csvText = [
      'date,category,metric,value',
      'bad-date,steps,total,abc',
      '2025-01-02,steps,total,5000',
    ].join('\n');

    const file = new File([csvText], 'errors.csv', { type: 'text/csv' });
    file._mockText = csvText;

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    const errorTableTitle = await screen.findByText(/rows with errors/i);
    expect(errorTableTitle).toBeInTheDocument();
    expect(screen.getByText(/invalid date format/i)).toBeInTheDocument();
    expect(screen.getByText(/must be numeric/i)).toBeInTheDocument();
  });

  // Functional Requirement FR-012
  test('shows clear, actionable validation errors to the user', async () => {
    const user = userEvent.setup();
    render(<ImportPage />);

    const badCsv = new File(['foo,bar\n1,2\n'], 'bad.csv', {
      type: 'text/csv',
    });
    badCsv._mockText = 'foo,bar\n1,2\n';

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, badCsv);

    const toast = await screen.findByText(/missing required headers/i);
    expect(toast).toHaveTextContent(/please use the csv formats shown above/i);
  });
});
