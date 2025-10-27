import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

import Login from '../../assets/login';

afterEach(() => cleanup());

describe('Login', () => {
  beforeEach(() => {
    cleanup(); 
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test('submit is disabled until both email and password have values', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const email = screen.getByRole('textbox', { name: /email/i });
    const password = screen.getByLabelText(/password/i);
    const submit = screen.getByRole('button', { name: /^sign in$/i });
    expect(submit).toBeDisabled();

    await user.type(email, 'user@wellgenie.dev');
    expect(submit).toBeDisabled();

    await user.clear(email);
    await user.type(password, 'password123');
    expect(submit).toBeDisabled();

    await user.type(email, 'user@wellgenie.dev');
    expect(submit).toBeEnabled();
  });

  test('successful submit sets auth flag and calls onLogin', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();

    render(<Login onLogin={onLogin} />);

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'user@wellgenie.dev');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    const submit = screen.getByRole('button', { name: /^sign in$/i });
    expect(submit).toBeEnabled();

    await user.click(submit);

    expect(localStorage.getItem('wellgenie:authed')).toBe('1');
    expect(onLogin).toHaveBeenCalledTimes(1);
  });
});
