import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
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

    await act(async () => {
      await user.upload(input, invalidCsv);
    });

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

    await act(async () => {
      await user.upload(input, validCsv);
    });

    const successToast = await screen.findByText(/rows imported/i, {}, { timeout: 3000 });
    expect(successToast).toHaveTextContent('2 rows imported, 0 skipped.');
    expect(onImported).toHaveBeenCalledWith(2, 0);
  });
});
