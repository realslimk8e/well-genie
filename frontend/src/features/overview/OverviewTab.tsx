import MetricTile from '../../components/tiles/MetricTile';
import GaugeTile from '../../components/tiles/GaugeTile';
import ListPercentTile from '../../components/tiles/ListPercentTile';
import BannerTile from '../../components/tiles/BannerTile';
import type { OverviewStats } from './selectors';
import type { UserPreferences } from '../../hooks/usePreferences';

type Props = {
  stats: OverviewStats;
  loading: {
    sleep: boolean;
    diet: boolean;
    exercise: boolean;
  };
  preferences: UserPreferences;
  onViewInsights: () => void;
};

export default function OverviewTab({
  stats,
  loading,
  preferences,
  onViewInsights,
}: Props) {
  const { sleepAvgHours, sleepAvgQScore, avgProtein, avgCarbs, avgFat, avgCals, exToday } =
    stats;
  const sleepHoursNum = Number(sleepAvgHours) || 0;
  const sleepValue =
    preferences.sleepUnit === 'minutes'
      ? Math.round(sleepHoursNum * 60)
      : sleepAvgHours;
  const sleepUnitLabel = preferences.sleepUnit === 'minutes' ? 'min' : 'h';

  const calorieDelta = avgCals - preferences.dailyCalorieTarget;
  const calorieDeltaLabel = `${calorieDelta >= 0 ? '+' : ''}${calorieDelta}`;
  const calorieDeltaTone = calorieDelta > 0 ? 'up' : 'down';

  return (
    <>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricTile
          title="Avg Sleep (7d)"
          value={loading.sleep ? '…' : sleepValue}
          unit={sleepUnitLabel}
          delta="+0.2%"
          deltaTone="up"
          bars={[60, 62, 58, 65, 70, 68, 64]}
        />
        <MetricTile
          title={`Avg Calories (7d) vs ${preferences.dailyCalorieTarget}`}
          value={loading.diet ? '…' : avgCals}
          unit="kcal"
          delta={calorieDeltaLabel}
          deltaTone={calorieDeltaTone}
          bars={[50, 55, 60, 58, 62, 64, 66]}
        />
        <MetricTile
          title="Exercise Today"
          value={loading.exercise ? '…' : exToday}
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
        <BannerTile onViewInsights={onViewInsights} />
      </section>
    </>
  );
}
