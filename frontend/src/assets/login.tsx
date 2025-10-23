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
                autoFocus
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

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
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="opacity-70">Don’t have an account?</span>{' '}
            <button
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
