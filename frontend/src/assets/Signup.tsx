import { useState } from 'react';

export default function SignUp({
  onSignup,
  onShowLogin,
}: {
  onSignup?: () => void;
  onShowLogin?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordsMatch = password && confirm && password === confirm;
  const canSubmit = email.trim() !== '' && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setError('Please fill in all fields and ensure passwords match.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      localStorage.setItem('wellgenie:authed', '1');
      onSignup?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-base-200 fixed inset-0 grid place-items-center p-4">
      <div className="card bg-base-100 w-full max-w-xl shadow-2xl">
        <div className="card-body p-8 md:p-10">
          <h1 className="text-center text-3xl font-bold md:text-4xl">
            Create your account
          </h1>
          <p className="mb-4 text-center text-sm opacity-70 md:text-base">
            Join WellGenie
          </p>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Email */}
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
              />
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label" htmlFor="password">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                id="password"
                data-testid="password"
                type="password"
                className={`input input-bordered w-full ${
                  passwordsMatch || !confirm ? '' : 'input-error'
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {/* Confirm Password */}
            <div className="form-control">
              <label className="label" htmlFor="confirm-password">
                <span className="label-text font-medium">Confirm password</span>
              </label>
              <input
                id="confirm-password"
                data-testid="confirm-password"
                type="password"
                className={`input input-bordered w-full ${
                  passwordsMatch || !confirm ? '' : 'input-error'
                }`}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {/* Validation Messages */}
            {!passwordsMatch && confirm && (
              <div className="text-error text-center text-sm">
                Passwords do not match.
              </div>
            )}

            {error && (
              <div className="text-error text-center text-sm">{error}</div>
            )}

            {/* Submit */}
            <button
              data-testid="signup-submit"
              className="btn btn-primary w-full"
              type="submit"
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Creating…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Login redirect */}
          <div className="mt-6 text-center text-sm">
            <span className="opacity-70">Already have an account?</span>{' '}
            <button
              type="button"
              className="link link-primary"
              onClick={() => onShowLogin?.()}
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
