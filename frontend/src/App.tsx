import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import MobileTabBar from './components/MobileTabBar';
import SummaryCard from './components/SummaryCard';
import SleepPanel from './components/panels/SleepPanel';
import DietPanel from './components/panels/DietPanel';
import ExercisePanel from './components/panels/ExercisePanel';
import ChatbotPanel from './components/panels/ChatbotPanel';
import SettingsPanel from './components/panels/SettingsPanel';
import Login from './assets/login';
import SignUp from './assets/Signup';
import ImportPage from './assets/import';
import { useSleep } from './hooks/useSleep';
import { useDiet } from './hooks/useDiet';
import { useExercise } from './hooks/useExercise';

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
  const [message, setMessage] = useState<string>('');
  const [tab, setTab] = useState<NavKey>(initialTabFromHash);
  const [authed, setAuthed] = useState<boolean>(
    !!localStorage.getItem('wellgenie:authed'),
  );
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  // real sleep data
  const {
    items: sleepItems,
    loading: sleepLoading,
    error: sleepError,
  } = useSleep();
  const last7 = sleepItems.slice(-7);
  const sleepAvg = last7.length
    ? (last7.reduce((s, i) => s + i.hours, 0) / last7.length).toFixed(1)
    : '0.0';

  // real diet data
  const {
    items: dietItems,
    loading: dietLoading,
    error: dietError,
  } = useDiet();

  type DietItem = {
    id: number;
    date: string;
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
  };

  function scoreDay(x: DietItem): number {
    const kcal = Math.max(1, x.calories);
    const targetP = (kcal * 0.3) / 4;
    const targetF = (kcal * 0.3) / 9;
    const targetC = (kcal * 0.4) / 4;

    const closeness = (actual: number, target: number) =>
      Math.max(0, 1 - Math.abs(actual - target) / target);

    const p = closeness(x.protein_g ?? 0, targetP);
    const f = closeness(x.fat_g ?? 0, targetF);
    const c = closeness(x.carbs_g ?? 0, targetC);

    return Math.round(((p + f + c) / 3) * 100);
  }

  const dietLast7 = (dietItems as DietItem[]).slice(-7);
  const dietAvg = dietLast7.length
    ? Math.round(
        dietLast7.reduce((s, d) => s + scoreDay(d), 0) / dietLast7.length,
      ).toString()
    : '0';
  // real exercise data
  const { items: exItems, loading: exLoading, error: exError } = useExercise();
  const exToday = exItems.length
    ? Number(
        exItems.at(-1)?.minutes ??
          exItems.at(-1)?.duration_min ??
          exItems.at(-1)?.duration ??
          0,
      )
    : 0;

  useEffect(() => {
    axios
      .get('/api/')
      .then((r) => setMessage(r.data.message))
      .catch(() => {});
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('wellgenie:authed');
    setAuthed(false);
    setAuthView('login');
  };

  const handleLoginSuccess = () => {
    localStorage.setItem('wellgenie:authed', '1');
    setAuthed(true);
  };

  const handleSignupSuccess = () => {
    localStorage.setItem('wellgenie:authed', '1');
    setAuthed(true);
  };

  if (!authed) {
    return (
      <div className="bg-base-200 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {authView === 'login' ? (
            <Login
              onLogin={handleLoginSuccess}
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
      <Sidebar current={tab} onNavigate={setTab} />

      <main className="pb-[max(4rem,env(safe-area-inset-bottom))] pl-16 md:pb-0 md:pl-64">
        <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-blue-600 md:text-4xl">
              WellGenie Dashboard
            </h1>
            <div className="mt-2">
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </div>

          {tab === 'overview' && (
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard
                  title="Sleep"
                  value={sleepLoading ? '…' : sleepAvg}
                  unit="h"
                  hint={sleepError ? 'error loading' : 'avg last 7d'}
                  accent="purple"
                />
                <SummaryCard
                  title="Diet"
                  value={dietLoading ? '…' : dietAvg}
                  unit="/100"
                  hint={dietError ? 'error loading' : 'quality score'}
                  accent="green"
                />

                <SummaryCard
                  title="Exercise"
                  value={exLoading ? '…' : String(exToday)}
                  unit="min"
                  hint={exError ? 'error loading' : 'today'}
                  accent="pink"
                />
              </section>
            </>
          )}

          {tab !== 'overview' && (
            <div className="card bg-base-100 border-base-300 border">
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
