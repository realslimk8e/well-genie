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
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder="you@wellgenie.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
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

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Confirm password</span>
              </label>
              <input
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

            {!passwordsMatch && confirm && (
              <div className="text-error text-center text-sm">
                Passwords do not match.
              </div>
            )}

            {error && (
              <div className="text-error text-center text-sm">{error}</div>
            )}

            <button
              className={`btn mt-2 w-full font-semibold transition-all duration-300 ${
                canSubmit
                  ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg hover:scale-[1.02] hover:shadow-xl'
                  : 'cursor-not-allowed bg-gray-400 text-gray-200'
              }`}
              type="submit"
              disabled={!canSubmit || submitting}
            >
              {submitting ? 'Creating...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="opacity-70">Already have an account?</span>{' '}
            <button
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
