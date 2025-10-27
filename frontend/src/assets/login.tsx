import { useState } from 'react';

export default function Login({
  onLogin,
  onShowSignUp,
}: {
  onLogin?: () => void;
  onShowSignUp?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim() !== '' && password !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setError('Please enter email and password.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      localStorage.setItem('wellgenie:authed', '1');
      onLogin?.();
    } finally {
      setSubmitting(false);
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
            {/* Email Field */}
            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                id="email"
                data-testid="email"
                type="email"
                className="input input-bordered w-full"
                placeholder="you@wellgenie.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
                className="input input-bordered w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="text-error text-center text-sm">{error}</div>
            )}

            {/* Submit Button */}
            <button
              data-testid="login-submit"
              className="btn btn-primary w-full"
              type="submit"
              disabled={!canSubmit || submitting}
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
            <span className="opacity-70">Don’t have an account?</span>{' '}
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
