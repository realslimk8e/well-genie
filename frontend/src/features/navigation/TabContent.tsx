import type { ReactNode } from 'react';
import SleepPanel from '../../components/panels/SleepPanel';
import DietPanel from '../../components/panels/DietPanel';
import ExercisePanel from '../../components/panels/ExercisePanel';
import ChatbotPanel from '../../components/panels/ChatbotPanel';
import SettingsPanel from '../../components/panels/SettingsPanel';
import ImportPage from '../../components/ImportPage';
import type { NavKey } from './nav';
import OverviewTab from '../overview/OverviewTab';
import type { OverviewStats } from '../overview/selectors';
import type { UserPreferences } from '../../hooks/usePreferences';

type Props = {
  tab: NavKey;
  overviewStats: OverviewStats;
  loading: {
    sleep: boolean;
    diet: boolean;
    exercise: boolean;
  };
  preferences: UserPreferences;
  onSavePreferences: (next: UserPreferences) => void;
  onResetPreferences: () => void;
  onViewInsights: () => void;
};

const panelByTab: Partial<Record<NavKey, ReactNode>> = {
  sleep: <SleepPanel />,
  diet: <DietPanel />,
  exercise: <ExercisePanel />,
  chatbot: <ChatbotPanel />,
  import: <ImportPage onImported={() => {}} />,
};

export default function TabContent({
  tab,
  overviewStats,
  loading,
  preferences,
  onSavePreferences,
  onResetPreferences,
  onViewInsights,
}: Props) {
  if (tab === 'overview') {
    return (
      <OverviewTab
        stats={overviewStats}
        loading={loading}
        preferences={preferences}
        onViewInsights={onViewInsights}
      />
    );
  }

  if (tab === 'settings') {
    return (
      <div className="card border-base-300 bg-base-100 border">
        <div className="card-body">
          <h2 className="card-title capitalize">{tab}</h2>
          <SettingsPanel
            preferences={preferences}
            onSavePreferences={onSavePreferences}
            onResetPreferences={onResetPreferences}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card border-base-300 bg-base-100 border">
      <div className="card-body">
        <h2 className="card-title capitalize">{tab}</h2>
        {panelByTab[tab]}
      </div>
    </div>
  );
}
