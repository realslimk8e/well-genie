import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DeleteData from '../../DeleteData';
import DataManagementPanel from '../../panels/DataManagementPanel';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../../hooks/useSleep', () => ({
  useSleep: () => ({ refetch: vi.fn() }),
}));
vi.mock('../../../hooks/useDiet', () => ({
  useDiet: () => ({ refetch: vi.fn() }),
}));
vi.mock('../../../hooks/useExercise', () => ({
  useExercise: () => ({ refetch: vi.fn() }),
}));

// ---------------------------------------------------------------------------
// DeleteData
// ---------------------------------------------------------------------------

describe('DeleteData', () => {
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders heading, date inputs, and delete button', () => {
    render(<DeleteData category="diet" onSuccess={onSuccess} />);

    expect(screen.getByText(/diet data/i)).toBeTruthy();
    expect(screen.getByLabelText(/start date/i)).toBeTruthy();
    expect(screen.getByLabelText(/end date/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /delete/i })).toBeTruthy();
  });

  it('delete button is disabled when both dates are empty', () => {
    render(<DeleteData category="diet" onSuccess={onSuccess} />);

    const button = screen.getByRole('button', {
      name: /delete/i,
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('delete button is disabled when only start date is filled', async () => {
    const user = userEvent.setup();
    render(<DeleteData category="diet" onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/start date/i), '2024-01-01');

    const button = screen.getByRole('button', {
      name: /delete/i,
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('delete button enables when both dates are filled', async () => {
    const user = userEvent.setup();
    render(<DeleteData category="diet" onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/start date/i), '2024-01-01');
    await user.type(screen.getByLabelText(/end date/i), '2024-01-31');

    const button = screen.getByRole('button', {
      name: /delete/i,
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it('does not call fetch when user cancels the confirm dialog', async () => {
    const user = userEvent.setup();
    vi.mocked(confirm).mockReturnValue(false);
    render(<DeleteData category="diet" onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/start date/i), '2024-01-01');
    await user.type(screen.getByLabelText(/end date/i), '2024-01-31');
    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(fetch).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls fetch with the correct URL and method on confirm', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: 'Deleted' }), { status: 200 }),
    );
    render(<DeleteData category="diet" onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/start date/i), '2024-01-01');
    await user.type(screen.getByLabelText(/end date/i), '2024-01-31');
    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/diet?start_date=2024-01-01&end_date=2024-01-31',
      { method: 'DELETE' },
    );
  });

  it('shows success message and calls onSuccess after delete', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ message: 'Successfully deleted 3 diet entries.' }),
        { status: 200 },
      ),
    );
    render(<DeleteData category="diet" onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/start date/i), '2024-01-01');
    await user.type(screen.getByLabelText(/end date/i), '2024-01-31');
    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/successfully deleted 3 diet entries/i),
      ).toBeTruthy();
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('clears date inputs after a successful delete', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: 'Deleted' }), { status: 200 }),
    );
    render(<DeleteData category="diet" onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/start date/i), '2024-01-01');
    await user.type(screen.getByLabelText(/end date/i), '2024-01-31');
    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      const start = screen.getByLabelText(/start date/i) as HTMLInputElement;
      const end = screen.getByLabelText(/end date/i) as HTMLInputElement;
      expect(start.value).toBe('');
      expect(end.value).toBe('');
    });
  });

  it('shows error message on a failed request', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Unauthorized' }), { status: 401 }),
    );
    render(<DeleteData category="diet" onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/start date/i), '2024-01-01');
    await user.type(screen.getByLabelText(/end date/i), '2024-01-31');
    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeTruthy();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  it('shows a generic error when detail is missing from the error response', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 500 }),
    );
    render(<DeleteData category="sleep" onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/start date/i), '2024-01-01');
    await user.type(screen.getByLabelText(/end date/i), '2024-01-31');
    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() =>
      expect(screen.getByText(/failed to delete sleep data/i)).toBeTruthy(),
    );
  });

  it('shows an error when fetch throws a network error', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    render(<DeleteData category="diet" onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/start date/i), '2024-01-01');
    await user.type(screen.getByLabelText(/end date/i), '2024-01-31');
    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() =>
      expect(screen.getByText(/network error/i)).toBeTruthy(),
    );
  });
});

// ---------------------------------------------------------------------------
// DataManagementPanel
// — uses category-scoped IDs (e.g. "sleep-start-date") because all three
//   DeleteData instances are rendered together and share the same label text
// ---------------------------------------------------------------------------

describe('DataManagementPanel', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the section heading and all three category sections', () => {
    render(<DataManagementPanel />);

    expect(screen.getByText(/delete health records/i)).toBeTruthy();
    expect(screen.getByText(/sleep data/i)).toBeTruthy();
    expect(screen.getByText(/diet data/i)).toBeTruthy();
    expect(screen.getByText(/exercise data/i)).toBeTruthy();
  });

  it('renders three delete buttons, all disabled by default', () => {
    render(<DataManagementPanel />);

    const buttons = screen.getAllByRole('button', {
      name: /delete/i,
    }) as HTMLButtonElement[];
    expect(buttons).toHaveLength(3);
    buttons.forEach((btn) => expect(btn.disabled).toBe(true));
  });

  it('filling dates in one section does not enable the others', async () => {
    const user = userEvent.setup();
    render(<DataManagementPanel />);

    // Use category-scoped IDs to target the right inputs unambiguously
    await user.type(document.getElementById('sleep-start-date')!, '2024-01-01');
    await user.type(document.getElementById('sleep-end-date')!, '2024-01-31');
    const buttons = screen.getAllByRole('button', {
      name: /delete/i,
    }) as HTMLButtonElement[];
    expect(buttons[0].disabled).toBe(false); // sleep
    expect(buttons[1].disabled).toBe(true); // diet
    expect(buttons[2].disabled).toBe(true); // exercise
  });

  it('calls the correct API endpoint for the diet category', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: 'Deleted' }), { status: 200 }),
    );
    render(<DataManagementPanel />);

    await user.type(document.getElementById('diet-start-date')!, '2024-01-01');
    await user.type(document.getElementById('diet-end-date')!, '2024-01-31');
    await user.click(screen.getAllByRole('button', { name: /delete/i })[1]);

    await waitFor(() =>
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/diet?start_date=2024-01-01&end_date=2024-01-31',
        { method: 'DELETE' },
      ),
    );
  });

  it('calls the correct API endpoint for the exercise category', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: 'Deleted' }), { status: 200 }),
    );
    render(<DataManagementPanel />);

    await user.type(
      document.getElementById('exercise-start-date')!,
      '2024-03-01',
    );
    await user.type(
      document.getElementById('exercise-end-date')!,
      '2024-03-31',
    );
    await user.click(screen.getAllByRole('button', { name: /delete/i })[2]);

    await waitFor(() =>
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/exercise?start_date=2024-03-01&end_date=2024-03-31',
        { method: 'DELETE' },
      ),
    );
  });
});
