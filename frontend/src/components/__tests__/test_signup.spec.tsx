import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import SignUp from '../../assets/Signup';

afterEach(() => cleanup());

describe('SignUp', () => {
  beforeEach(() => {
    cleanup(); 
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test('shows inline mismatch message and keeps submit disabled when passwords differ', async () => {
    const user = userEvent.setup();
    render(<SignUp />);

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const confirmInput = screen.getByTestId('confirm-password');
    const submitButton = screen.getByTestId('signup-submit');

    await user.type(emailInput, 'new@wellgenie.dev');
    await user.type(passwordInput, 'abc12345');
    await user.type(confirmInput, 'different123');

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('matching passwords enables submit, sets auth flag, and calls onSignup', async () => {
    const user = userEvent.setup();
    const onSignup = vi.fn();

    render(<SignUp onSignup={onSignup} />);

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const confirmInput = screen.getByTestId('confirm-password');
    const submitButton = screen.getByTestId('signup-submit');

    await user.type(emailInput, 'new@wellgenie.dev');
    await user.type(passwordInput, 'abc12345');
    await user.type(confirmInput, 'abc12345');

    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    expect(localStorage.getItem('wellgenie:authed')).toBe('1');
    expect(onSignup).toHaveBeenCalledTimes(1);
  });
});
