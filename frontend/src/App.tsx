import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import MobileTabBar from './components/MobileTabBar';
import SleepPanel from './components/panels/SleepPanel';
import DietPanel from './components/panels/DietPanel';
import ExercisePanel from './components/panels/ExercisePanel';
import ChatbotPanel from './components/panels/ChatbotPanel';
import SettingsPanel from './components/panels/SettingsPanel';
import Login from './components/login';
import SignUp from './components/Signup';
import ImportPage from './components/import';
import { useSleep } from './hooks/useSleep';
import { useDiet, type DietItem } from './hooks/useDiet';
import { useExercise, type ExerciseItem } from './hooks/useExercise';
import MetricTile from './components/tiles/MetricTile';
import GaugeTile from './components/tiles/GaugeTile';
import ListPercentTile from './components/tiles/ListPercentTile';
import BannerTile from './components/tiles/BannerTile';

type NavKey =
  | 'overview'
  | 'sleep'
  | 'diet'
  | 'exercise'
  | 'chatbot'
  | 'settings'
  | 'import';

const allowedTabs: NavKey[] = [
  'overview',
  'sleep',
  'diet',
  'exercise',
  'chatbot',
  'settings',
  'import',
];

const initialTabFromHash = (): NavKey => {
  if (typeof window === 'undefined') return 'overview';
  const raw = (window.location.hash || '').replace(/^#\/?/, '');
  return allowedTabs.includes(raw as NavKey) ? (raw as NavKey) : 'overview';
};

const App: React.FC = () => {
  const [tab, setTab] = useState<NavKey>(initialTabFromHash);
  const [authed, setAuthed] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  const { items: sleepItems, loading: sleepLoading } = useSleep();
  const { items: dietItems, loading: dietLoading } = useDiet();
  const { items: exItems, loading: exLoading } = useExercise();

  type SleepItem = {
    hours: number;
    quality: SleepQuality;
  };

  const sleepLast7 = (sleepItems as SleepItem[]).slice(-7);
  const sleepAvgHours = sleepLast7.length
    ? (
        sleepLast7.reduce((s, r) => s + (r?.hours ?? 0), 0) / sleepLast7.length
      ).toFixed(1)
    : '0.0';

  type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor';
  const q2s: Record<SleepQuality, number> = {
    excellent: 4,
    good: 3,
    fair: 2,
    poor: 1,
  };

  const sleepAvgQScore = sleepLast7.length
    ? sleepLast7.reduce(
        (s, r) => s + (q2s[(r?.quality as SleepQuality) ?? 'poor'] ?? 0),
        0,
      ) / sleepLast7.length
    : 0;

  const dietLast7 = (dietItems as DietItem[]).slice(-7);
  const avgNum = <T,>(arr: T[], pick: (x: T) => number) =>
    arr.length
      ? Math.round(arr.reduce((s, x) => s + pick(x), 0) / arr.length)
      : 0;

  const avgProtein = avgNum(dietLast7, (d) => d?.protein_g ?? 0);
  const avgCarbs = avgNum(dietLast7, (d) => d?.carbs_g ?? 0);
  const avgFat = avgNum(dietLast7, (d) => d?.fat_g ?? 0);
  const avgCals = avgNum(dietLast7, (d) => d?.calories ?? 0);

  const getMin = (x: ExerciseItem) =>
    x?.minutes ?? x?.duration_min ?? x?.duration ?? 0;
  const exToday = exItems.length ? getMin(exItems.at(-1) as ExerciseItem) : 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const desired = `#${tab}`;
    if (window.location.hash !== desired) {
      window.history.replaceState(null, '', desired);
    }
  }, [tab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHashChange = () => {
      const raw = (window.location.hash || '').replace(/^#\/?/, '');
      if (allowedTabs.includes(raw as NavKey)) setTab(raw as NavKey);
      else setTab('overview');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    // Verify authentication state on app load
    axios
      .get('api/me', { withCredentials: true })
      .then((response) => {
        if (response.status === 200 && response.data.username) {
          setAuthed(true);
        } else {
          setAuthed(false);
        }
      })
      .catch(() => {
        setAuthed(false);
      });
  }, []);

  const handleLogout = () => {
    axios
      .post('api/logout', {}, { withCredentials: true })
      .then(() => {
        setAuthed(false);
        setAuthView('login');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  const handleLoginSuccess = () => {
    // Reload the page to ensure all components re-render with the new auth state
    window.location.reload();
  };

  const handleSignupSuccess = () => {
    setAuthed(true);
  };

  if (!authed) {
    return (
      <div className="bg-base-200 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {authView === 'login' ? (
            <Login
              onLogin={handleLoginSuccess} // This gets called AFTER login succeeds
              onShowSignUp={() => setAuthView('signup')}
            />
          ) : (
            <SignUp
              onSignup={handleSignupSuccess}
              onShowLogin={() => setAuthView('login')}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 min-h-screen">
      <Sidebar current={tab} onNavigate={setTab} onLogout={handleLogout} />

      <main className="pb-[max(4rem,env(safe-area-inset-bottom))] pl-16 md:pb-0 md:pl-64">
        <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
          {/* Header Section */}
          <div className="space-y-2 text-center">
            <h1 className="text-primary text-3xl font-bold md:text-4xl">
              WellGenie Dashboard
            </h1>
          </div>

          {/* Overview Tab */}
          {tab === 'overview' && (
            <>
              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <MetricTile
                  title="Avg Sleep (7d)"
                  value={sleepLoading ? '…' : sleepAvgHours}
                  unit="h"
                  delta="+0.2%"
                  deltaTone="up"
                  bars={[60, 62, 58, 65, 70, 68, 64]}
                />
                <MetricTile
                  title="Avg Calories (7d)"
                  value={dietLoading ? '…' : avgCals}
                  unit="kcal"
                  delta="+110"
                  deltaTone="up"
                  bars={[50, 55, 60, 58, 62, 64, 66]}
                />
                <MetricTile
                  title="Exercise Today"
                  value={exLoading ? '…' : exToday}
                  unit="min"
                  delta="+12m"
                  deltaTone="up"
                  bars={[20, 35, 40, 60, 70, 55, 80]}
                />
              </section>

              <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <GaugeTile
                  title="Sleep Quality"
                  percent={Math.round((sleepAvgQScore / 4) * 100)}
                  subtitle="7-day average"
                  tone="success"
                />
                <ListPercentTile
                  title="Macros split (7d avg)"
                  rows={[
                    {
                      label: 'Protein',
                      value: Math.min(
                        100,
                        Math.round(((avgProtein * 4) / (avgCals || 1)) * 100),
                      ),
                    },
                    {
                      label: 'Fat',
                      value: Math.min(
                        100,
                        Math.round(((avgFat * 9) / (avgCals || 1)) * 100),
                      ),
                    },
                    {
                      label: 'Carbs',
                      value: Math.min(
                        100,
                        Math.round(((avgCarbs * 4) / (avgCals || 1)) * 100),
                      ),
                    },
                  ]}
                />
                <BannerTile />
              </section>
            </>
          )}

          {/* Other Tabs */}
          {tab !== 'overview' && (
            <div className="card border-base-300 bg-base-100 border">
              <div className="card-body">
                <h2 className="card-title capitalize">{tab}</h2>
                {tab === 'sleep' && <SleepPanel />}
                {tab === 'diet' && <DietPanel />}
                {tab === 'exercise' && <ExercisePanel />}
                {tab === 'chatbot' && <ChatbotPanel />}
                {tab === 'settings' && <SettingsPanel />}
                {tab === 'import' && (
                  <ImportPage
                    onImported={(added, skipped) => {
                      console.log(`Imported ${added}, skipped ${skipped}`);
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileTabBar
        current={
          tab === 'settings' || tab === 'chatbot'
            ? 'overview'
            : (tab as 'overview' | 'sleep' | 'diet' | 'exercise')
        }
        onNavigate={(k) => setTab(k)}
      />
    </div>
  );
};

export default App;
