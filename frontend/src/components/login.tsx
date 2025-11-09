import { useState } from 'react';
import { useLogin } from '../hooks/useLogin';

export default function Login({
  onLogin,
  onShowSignUp,
}: {
  onLogin?: (username: string, password: string) => void;
  onShowSignUp?: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login, loading, error: loginError } = useLogin();

  const canSubmit = username.trim() !== '' && password !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setError('Please enter username and password.');
      return;
    }

    setError(null);
    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);

    if (result) {
      console.log('Login successful:', result);
      onLogin?.(username, password);
    } else {
      // Set a user-friendly error message
      setError('Incorrect username or password. Please try again.');
    }
  };

  return (
    <div className="bg-base-200 fixed inset-0 grid place-items-center p-4">
      <div className="card bg-base-100 w-full max-w-xl shadow-2xl">
        <div className="card-body p-8 md:p-10">
          <h1 className="text-center text-3xl font-bold md:text-4xl">
            Welcome back
          </h1>
          <p className="mb-4 text-center text-sm opacity-70 md:text-base">
            Sign in to WellGenie
          </p>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Username Field */}
            <div className="form-control">
              <label className="label" htmlFor="username">
                <span className="label-text font-medium">Username</span>
              </label>
              <input
                id="username"
                data-testid="username"
                type="text"
                className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null); // Clear error on input change
                }}
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="label" htmlFor="password">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                id="password"
                data-testid="password"
                type="password"
                className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null); // Clear error on input change
                }}
                autoComplete="current-password"
              />
            </div>

            {/* Error Alert with DaisyUI */}
            {(error || loginError) && (
              <div className="alert alert-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error || 'Login failed. Please check your credentials.'}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              data-testid="login-submit"
              className="btn btn-primary w-full"
              type="submit"
              disabled={!canSubmit || submitting || loading}
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            <span className="opacity-70">Don't have an account?</span>{' '}
            <button
              type="button"
              className="link link-primary"
              onClick={() => onShowSignUp?.()}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}