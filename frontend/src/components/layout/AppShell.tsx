import type { ReactNode } from 'react';
import MobileTabBar from '../MobileTabBar';
import Sidebar from '../Sidebar';
import type { NavKey } from '../../features/navigation/nav';

type MobileNavKey = 'overview' | 'sleep' | 'diet' | 'exercise' | 'chatbot';

type Props = {
  tab: NavKey;
  onTabChange: (tab: NavKey) => void;
  onLogout: () => void;
  children: ReactNode;
};

const toMobileTab = (tab: NavKey): MobileNavKey =>
  tab === 'settings' || tab === 'import' ? 'overview' : tab;

export default function AppShell({
  tab,
  onTabChange,
  onLogout,
  children,
}: Props) {
  return (
    <div className="bg-base-200 min-h-screen">
      <Sidebar current={tab} onNavigate={onTabChange} onLogout={onLogout} />

      <main className="pb-[max(4rem,env(safe-area-inset-bottom))] pl-16 md:pb-0 md:pl-64">
        <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-primary text-3xl font-bold md:text-4xl">
              WellGenie Dashboard
            </h1>
          </div>
          {children}
        </div>
      </main>

      <MobileTabBar current={toMobileTab(tab)} onNavigate={onTabChange} />
    </div>
  );
}
