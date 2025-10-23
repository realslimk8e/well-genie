import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, vi } from 'vitest';


import ImportPage from '../../assets/import';

describe('ImportPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test('invalid CSV headers → shows failure toast and does not call onImported', async () => {
    const user = userEvent.setup();
    const onImported = vi.fn();
    render(<ImportPage onImported={onImported} />);

    const invalidCsv = new File(
      ['foo,bar,baz,qux\n1,2,3,4\n'],
      'invalid.csv',
      { type: 'text/csv' }
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    await user.upload(input, invalidCsv);

    const err = await screen.findByText(
      /import failed:\s*csv missing required headers:\s*date,\s*category,\s*metric,\s*value/i
    );
    expect(err).toBeInTheDocument();

    expect(onImported).not.toHaveBeenCalled();
  });

  test('valid CSV → shows success toast and calls onImported(added, skipped)', async () => {
    const user = userEvent.setup();
    const onImported = vi.fn();
    render(<ImportPage onImported={onImported} />);

    const validCsv = new File(
      [
        'date,category,metric,value\n',
        '2025-10-01,wellness,steps,1234\n',
        '2025-10-02,nutrition,calories,2100\n',
      ],
      'valid.csv',
      { type: 'text/csv' }
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    await user.upload(input, validCsv);

    const success = await screen.findByText(/2\s*rows imported,\s*0\s*skipped\./i);
    expect(success).toBeInTheDocument();

    expect(onImported).toHaveBeenCalledWith(2, 0);
  });
});
