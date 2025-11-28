import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import ImportPage from '../../components/import';
import * as UploadHook from '../../hooks/useUpload';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

const mockUploadFile = vi.fn();

vi.spyOn(UploadHook, 'useUpload').mockImplementation(() => ({
  uploadFile: mockUploadFile,
  uploading: false,
  lastResult: null,
  error: null,
  clearError: vi.fn(),
  clearResult: vi.fn(),
}));

afterEach(() => cleanup());

describe('ImportPage', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    localStorage.clear();
    mockedAxios.get.mockResolvedValue({ data: { items: [] } });
  });

  test('invalid CSV headers → shows failure toast and does not call onImported', async () => {
    const user = userEvent.setup();
    const onImported = vi.fn();
    render(<ImportPage onImported={onImported} />);

    mockUploadFile.mockResolvedValue({
      filename: 'invalid.csv',
      inserted: 0,
      errors: ['Missing required headers: date, hours, quality'],
    });

    const invalidCsv = new File(['foo,bar\n1,2\n'], 'invalid.csv', {
      type: 'text/csv',
    });

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, invalidCsv);

    const errorToast = await screen.findByText(
      /import failed:/i,
      {},
      { timeout: 3000 },
    );
    expect(errorToast).toHaveTextContent(
      'Import Failed: Missing required headers: date, hours, quality',
    );
    expect(onImported).not.toHaveBeenCalled();
  });

  test('valid CSV → shows success toast and calls onImported(added, skipped)', async () => {
    const user = userEvent.setup();
    const onImported = vi.fn();
    render(<ImportPage onImported={onImported} />);

    mockUploadFile.mockResolvedValue({
      filename: 'valid.csv',
      category: 'sleep',
      inserted: 2,
      errors: [],
    });

    const validCsv = new File(['...'], 'valid.csv', { type: 'text/csv' });

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, validCsv);

    const successToast = await screen.findByText(
      /rows imported/i,
      {},
      { timeout: 3000 },
    );
    expect(successToast).toHaveTextContent('2 rows imported, 0 skipped.');
    expect(onImported).toHaveBeenCalledWith(2, 0);
  });

  // Functional Requirement FR-001
  test('shows a preview of the first five rows after upload', async () => {
    const user = userEvent.setup();
    render(<ImportPage />);

    mockUploadFile.mockResolvedValue({
      filename: 'multi.csv',
      category: 'sleep',
      inserted: 6,
      errors: [],
    });

    const previewRows = [
      { id: 2, date: '2025-01-02', hours: 8, quality: 'good' },
      { id: 3, date: '2025-01-03', hours: 6, quality: 'fair' },
      { id: 4, date: '2025-01-04', hours: 7.5, quality: 'good' },
      { id: 5, date: '2025-01-05', hours: 8, quality: 'excellent' },
      { id: 6, date: '2025-01-06', hours: 7, quality: 'good' },
    ];
    mockedAxios.get.mockResolvedValue({ data: { items: previewRows } });

    const file = new File(['...'], 'multi.csv', { type: 'text/csv' });

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, file);

    const previewHeading = await screen.findByText(/preview - last/i);
    const previewCard = previewHeading.closest('div') as HTMLElement;
    const table = within(previewCard).getByRole('table');
    const rows = within(table).getAllByRole('row');
    const dataRows = rows.slice(1);
    expect(dataRows).toHaveLength(5);
    expect(screen.getByText('2025-01-02')).toBeInTheDocument();
    expect(screen.getByText('2025-01-05')).toBeInTheDocument();
  });

  // Functional Requirement FR-002
  test('flags invalid rows after import (bad date and non-numeric value)', async () => {
    const user = userEvent.setup();
    const onImported = vi.fn();
    render(<ImportPage onImported={onImported} />);

    mockUploadFile.mockResolvedValue({
      filename: 'invalid.csv',
      category: 'sleep',
      inserted: 1,
      errors: [
        "Row 3: time data 'bad-date' does not match format '%Y-%m-%d'",
        "Row 4: could not convert string to float: 'not-a-number'",
      ],
    });

    const file = new File(['...'], 'invalid.csv', { type: 'text/csv' });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, file);

    const toast = await screen.findByText(/rows imported, 2 skipped/i);
    expect(toast).toBeInTheDocument();
    expect(onImported).toHaveBeenCalledWith(1, 2);

    const errorTableTitle = await screen.findByText(/rows with errors/i);
    expect(errorTableTitle).toBeInTheDocument();
    expect(
      screen.getByText(/time data 'bad-date' does not match/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/could not convert string to float/i),
    ).toBeInTheDocument();
  });

  // Functional Requirement FR-003
  test('records each upload attempt in import history', async () => {
    const user = userEvent.setup();
    render(<ImportPage />);

    const validFile = new File(['...'], 'valid.csv', { type: 'text/csv' });
    const invalidFile = new File(['...'], 'invalid.csv', { type: 'text/csv' });

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    mockUploadFile.mockResolvedValue({
      filename: 'valid.csv',
      inserted: 2,
      errors: [],
    });
    await user.upload(input, validFile);
    await screen.findByText(/rows imported, 0 skipped/i);

    mockUploadFile.mockResolvedValue({
      filename: 'invalid.csv',
      inserted: 0,
      errors: ['Missing required header: value'],
    });
    const secondInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(secondInput, invalidFile);
    await screen.findByText(/import failed/i);

    const historyHeading = await screen.findByText(/import history/i);
    const historyCard = historyHeading.closest('div.card-body') as HTMLElement;
    expect(historyCard).toBeInTheDocument();

    const rows = within(historyCard).getAllByRole('row');
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

    mockUploadFile.mockResolvedValue({
      filename: 'undo.csv',
      category: 'sleep',
      inserted: 2,
      errors: [],
    });

    const file = new File(['...'], 'undo.csv', { type: 'text/csv' });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, file);
    await screen.findByText(/rows imported, 0 skipped/i);

    const undoButton = screen.getByRole('button', {
      name: /undo last import/i,
    });
    expect(undoButton).not.toBeDisabled();

    await user.click(undoButton);

    const toast = await screen.findByText(/last import undone/i);
    expect(toast).toBeInTheDocument();

    expect(screen.queryByText(/preview - last/i)).not.toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);
    expect(dataRows[0].textContent).toContain('undo');
  });

  // Functional Requirement FR-011
  test('displays error messages for rejected import rows', async () => {
    const user = userEvent.setup();
    render(<ImportPage />);

    mockUploadFile.mockResolvedValue({
      filename: 'errors.csv',
      category: 'exercise',
      inserted: 1,
      errors: ["Row 2: time data 'bad-date' does not match format '%Y-%m-%d'"],
    });

    const file = new File(['...'], 'errors.csv', { type: 'text/csv' });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, file);

    const errorTableTitle = await screen.findByText(/rows with errors/i);
    expect(errorTableTitle).toBeInTheDocument();
    const errorRow = screen.getByText(/time data 'bad-date'/i);
    expect(errorRow).toBeInTheDocument();
    expect(within(errorRow.closest('tr')!).getByText('2')).toBeInTheDocument();
  });

  // Functional Requirement FR-012
  test('shows clear, actionable validation errors to the user', async () => {
    const user = userEvent.setup();
    render(<ImportPage />);

    mockUploadFile.mockResolvedValue({
      filename: 'bad.csv',
      inserted: 0,
      errors: [
        'Invalid file format. Please use one of the supported CSV formats.',
      ],
    });

    const badCsv = new File(['...'], 'bad.csv', { type: 'text/csv' });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, badCsv);

    const toast = await screen.findByText(/import failed/i);
    expect(toast).toHaveTextContent(
      'Import Failed: Invalid file format. Please use one of the supported CSV formats.',
    );
  });
});
