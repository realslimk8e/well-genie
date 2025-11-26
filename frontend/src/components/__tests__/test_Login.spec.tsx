import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

import Login from '../../components/login';

vi.mock('../../hooks/useLogin', () => ({
  useLogin: () => ({
    login: vi.fn().mockResolvedValue({ message: 'ok' }),
    loading: false,
    error: null,
  }),
}));

afterEach(() => cleanup());

describe('Login', () => {
  beforeEach(() => {
    cleanup(); 
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test('submit is disabled until both username and password have values', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const username = screen.getByRole('textbox', { name: /username/i });
    const password = screen.getByLabelText(/password/i);
    const submit = screen.getByRole('button', { name: /^sign in$/i });
    expect(submit).toBeDisabled();

    await user.type(username, 'user123');
    expect(submit).toBeDisabled();

    await user.clear(username);
    await user.type(password, 'password123');
    expect(submit).toBeDisabled();

    await user.type(username, 'user123');
    expect(submit).toBeEnabled();
  });

  test('successful submit sets auth flag and calls onLogin', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();

    render(<Login onLogin={onLogin} />);

    await user.type(screen.getByRole('textbox', { name: /username/i }), 'user123');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    const submit = screen.getByRole('button', { name: /^sign in$/i });
    expect(submit).toBeEnabled();

    await user.click(submit);

    expect(onLogin).toHaveBeenCalledTimes(1);
  });
});
