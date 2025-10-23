import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, vi } from 'vitest';

import SignUp from '../../assets/Signup';
describe('SignUp', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test('shows inline mismatch message and keeps submit disabled when passwords differ', async () => {
    const user = userEvent.setup();
    render(<SignUp />);

    const email = screen.getByRole('textbox', { name: /email/i });
    const password = screen.getByLabelText(/^password$/i);
    const confirm = screen.getByLabelText(/confirm password/i);
    const submit = screen.getByRole('button', { name: /create account/i });

    await user.type(email, 'new@wellgenie.dev');
    await user.type(password, 'abc12345');
    await user.type(confirm, 'different123');

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(submit).toBeDisabled();
  });

  test('matching passwords enables submit, sets auth flag, and calls onSignup', async () => {
    const user = userEvent.setup();
    const onSignup = vi.fn();
    render(<SignUp onSignup={onSignup} />);

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'new@wellgenie.dev');
    await user.type(screen.getByLabelText(/^password$/i), 'abc12345');
    await user.type(screen.getByLabelText(/confirm password/i), 'abc12345');

    const submit = screen.getByRole('button', { name: /create account/i });
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(localStorage.getItem('wellgenie:authed')).toBe('1');
    expect(onSignup).toHaveBeenCalledTimes(1);
  });
});
