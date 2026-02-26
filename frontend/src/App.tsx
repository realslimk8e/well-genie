import React from 'react';
import AuthGate from './components/auth/AuthGate';
import AppShell from './components/layout/AppShell';
import { useSleep } from './hooks/useSleep';
import { useDiet } from './hooks/useDiet';
import { useExercise } from './hooks/useExercise';
import { getOverviewStats } from './features/overview/selectors';
import { useHashTab } from './hooks/useHashTab';
import { useAuthSession } from './hooks/useAuthSession';
import TabContent from './features/navigation/TabContent';
import { usePreferences } from './hooks/usePreferences';

const App: React.FC = () => {
  const { tab, setTab } = useHashTab();
  const {
    authed,
    authView,
    setAuthView,
    logout,
    loginSucceeded,
    signupSucceeded,
  } = useAuthSession();
  const { preferences, savePreferences, resetPreferences } = usePreferences();

  const { items: sleepItems, loading: sleepLoading } = useSleep();
  const { items: dietItems, loading: dietLoading } = useDiet();
  const { items: exItems, loading: exLoading } = useExercise();

  const {
    sleepAvgHours,
    sleepAvgQScore,
    avgProtein,
    avgCarbs,
    avgFat,
    avgCals,
    exToday,
  } = getOverviewStats(sleepItems, dietItems, exItems);

  if (!authed) {
    return (
      <AuthGate
        authView={authView}
        onSwitchToLogin={() => setAuthView('login')}
        onSwitchToSignup={() => setAuthView('signup')}
        onLoginSuccess={loginSucceeded}
        onSignupSuccess={signupSucceeded}
      />
    );
  }

  return (
    <AppShell tab={tab} onTabChange={setTab} onLogout={logout}>
      <TabContent
        tab={tab}
        onViewInsights={() => setTab('chatbot')}
        preferences={preferences}
        onSavePreferences={savePreferences}
        onResetPreferences={resetPreferences}
        overviewStats={{
          sleepAvgHours,
          sleepAvgQScore,
          avgProtein,
          avgCarbs,
          avgFat,
          avgCals,
          exToday,
        }}
        loading={{
          sleep: sleepLoading,
          diet: dietLoading,
          exercise: exLoading,
        }}
      />
    </AppShell>
  );
};

export default App;
