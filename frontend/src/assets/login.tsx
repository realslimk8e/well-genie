import { useState } from "react";

export default function Login({
onLogin,
onShowSignUp,
}: {
onLogin?: () => void;
onShowSignUp?: () => void;
}) {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState<string | null>(null);
const [submitting, setSubmitting] = useState(false);

const canSubmit = email.trim() !== "" && password !== "";

const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();
if (!canSubmit) {
setError("Please enter email and password.");
return;
}
setError(null);
setSubmitting(true);
try {
localStorage.setItem("wellgenie:authed", "1");
onLogin?.();
} finally {
setSubmitting(false);
}
};

return (
<div className="fixed inset-0 bg-base-200 grid place-items-center p-4">
<div className="card bg-base-100 shadow-2xl w-full max-w-xl">
<div className="card-body p-8 md:p-10">
<h1 className="text-3xl md:text-4xl font-bold text-center">Welcome back</h1>
<p className="opacity-70 text-sm md:text-base mb-4 text-center">Sign in to WellGenie</p>

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

{error && <div className="text-error text-sm text-center">{error}</div>}

<button
className={`btn w-full mt-2 font-semibold transition-all duration-300 ${
canSubmit
? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
: "bg-gray-400 text-gray-200 cursor-not-allowed"
}`}
type="submit"
disabled={!canSubmit || submitting}
>
{submitting ? "Signing in..." : "Sign in"}
</button>
</form>

<div className="mt-6 text-center text-sm">
<span className="opacity-70">Don’t have an account?</span>{" "}
<button className="link link-primary" onClick={() => onShowSignUp?.()}>
Sign up
</button>
</div>
</div>
</div>
</div>
);
}
