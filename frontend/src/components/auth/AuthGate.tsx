import Login from '../Login';
import SignUp from '../Signup';

type AuthView = 'login' | 'signup';

type Props = {
  authView: AuthView;
  onSwitchToLogin: () => void;
  onSwitchToSignup: () => void;
  onLoginSuccess: () => void;
  onSignupSuccess: () => void;
};

export default function AuthGate({
  authView,
  onSwitchToLogin,
  onSwitchToSignup,
  onLoginSuccess,
  onSignupSuccess,
}: Props) {
  return (
    <div className="bg-base-200 flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {authView === 'login' ? (
          <Login onLogin={onLoginSuccess} onShowSignUp={onSwitchToSignup} />
        ) : (
          <SignUp onSignup={onSignupSuccess} onShowLogin={onSwitchToLogin} />
        )}
      </div>
    </div>
  );
}
