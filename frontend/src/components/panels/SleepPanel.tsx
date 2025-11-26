import { useSleep } from '../../hooks/useSleep';
import { useMemo, useState } from 'react';

type SleepItem = {
  id: number;
  date: string; // "YYYY-MM-DD"
  hours: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
};

const qualityToScore: Record<SleepItem['quality'], number> = {
  excellent: 4,
  good: 3,
  fair: 2,
  poor: 1,
};
const scoreToQuality = (n: number): SleepItem['quality'] =>
  n >= 3.5 ? 'excellent' : n >= 2.5 ? 'good' : n >= 1.5 ? 'fair' : 'poor';

const fmtWeekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const fmtDate = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
});

const badge = (q: SleepItem['quality']) => {
  const map: Record<SleepItem['quality'], string> = {
    excellent: 'badge-success',
    good: 'badge-primary',
    fair: 'badge-warning',
    poor: 'badge-error',
  };
  return map[q];
};

type ViewMode = 'daily' | 'weekly' | 'monthly';

const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day + 6) % 7; // Monday as start
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfMonth = (d: Date) => {
  const date = new Date(d);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatLabel = (date: Date, view: ViewMode) => {
  if (view === 'daily') {
    return date.toLocaleDateString();
  }
  if (view === 'weekly') {
    return `Week of ${date.toLocaleDateString()}`;
  }
  const month = date.toLocaleString(undefined, { month: 'short' });
  return `${month} ${date.getFullYear()}`;
};

const aggregateSleep = (items: SleepItem[], view: ViewMode) => {
  const groups = new Map<
    string,
    { label: string; hours: number; qualityScores: number[] }
  >();

  items.forEach((item) => {
    const d = new Date(item.date);
    const bucket =
      view === 'daily'
        ? new Date(d.getFullYear(), d.getMonth(), d.getDate())
        : view === 'weekly'
          ? startOfWeek(d)
          : startOfMonth(d);
    const key = bucket.toISOString();
    const label = formatLabel(bucket, view);
    const entry =
      groups.get(key) ??
      {
        label,
        hours: 0,
        qualityScores: [],
      };
    entry.hours += item.hours ?? 0;
    entry.qualityScores.push(qualityToScore[item.quality]);
    groups.set(key, entry);
  });

  return Array.from(groups.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
};

export default function SleepPanel() {
  const { items, loading, error } = useSleep();
  const [view, setView] = useState<ViewMode>('daily');

  const last7 = items.slice(-7) as SleepItem[];
  const avgHours = last7.length
    ? (last7.reduce((s, r) => s + (r.hours ?? 0), 0) / last7.length).toFixed(1)
    : '0.0';

  const avgQualityScore = last7.length
    ? last7.reduce((s, r) => s + (qualityToScore[r.quality] ?? 0), 0) /
      last7.length
    : 0;
  const avgQuality = scoreToQuality(avgQualityScore);

  const aggregates = useMemo(
    () => aggregateSleep(items as SleepItem[], view),
    [items, view],
  );

  const hourValues = (items as SleepItem[]).map((r) => r.hours ?? 0);
  const aggMetrics =
    hourValues.length === 0
      ? null
      : {
          sum: hourValues.reduce((s, n) => s + n, 0),
          avg:
            hourValues.reduce((s, n) => s + n, 0) / hourValues.length || 0,
          min: Math.min(...hourValues),
          max: Math.max(...hourValues),
        };

  if (loading) {
    return (
      <div className="card bg-base-100 border-base-300 border">
        <div className="card-body">
          <h2 className="card-title">Sleep</h2>
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-sm" />
            <span className="text-base-content/70 text-sm">Loading…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-100 border-base-300 border">
        <div className="card-body">
          <h2 className="card-title">Sleep</h2>
          <div className="alert alert-error text-sm">
            Failed to load sleep data.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top averages box */}
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Avg Hours, 7 days</div>
          <div className="stat-value text-primary">{avgHours} h</div>
        </div>
        <div className="stat">
          <div className="stat-title">Avg Quality, 7 days</div>
          <div className="stat-value capitalize">
            <span className={`badge ${badge(avgQuality)}`}>{avgQuality}</span>
          </div>
          <div className="stat-desc text-xs">
            score {avgQualityScore.toFixed(2)} / 4
          </div>
        </div>
      </div>

      {/* 7-day breakdown */}
      <div className="card bg-base-100 border-base-300 border">
        <div className="card-body">
          <h3 className="card-title text-base">Last 7 days</h3>
          <div className="overflow-x-auto">
            <table className="table-zebra table">
              <thead>
                <tr>
                  <th className="w-28">Day</th>
                  <th>Quality</th>
                  <th className="text-right">Hours</th>
                </tr>
              </thead>
              <tbody>
                {last7.map((row) => {
                  const d = new Date(row.date);
                  return (
                    <tr key={row.id}>
                      <td>
                        {fmtWeekday.format(d)}, {fmtDate.format(d)}
                      </td>
                      <td>
                        <span
                          className={`badge ${badge(row.quality)} capitalize`}
                        >
                          {row.quality}
                        </span>
                      </td>
                      <td className="text-right">{row.hours}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-2 text-xs opacity-70">
              Showing the most recent 7 entries.
            </div>
          </div>
        </div>
      </div>

      {/* Aggregated views */}
      <div className="card bg-base-100 border-base-300 border">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h3 className="card-title text-base">Aggregated summaries</h3>
            <div className="join">
              {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  className={`btn btn-xs join-item ${view === mode ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setView(mode)}
                >
                  {mode[0].toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-compact">
              <thead>
                <tr>
                  <th>Period</th>
                  <th className="text-right">Hours (sum)</th>
                  <th className="text-right">Avg Quality</th>
                </tr>
              </thead>
              <tbody>
                {aggregates.map((row, idx) => {
                  const avgQ =
                    row.qualityScores.length > 0
                      ? scoreToQuality(
                          row.qualityScores.reduce((s, q) => s + q, 0) /
                            row.qualityScores.length,
                        )
                      : 'poor';
                  return (
                    <tr key={idx}>
                      <td>{row.label}</td>
                      <td className="text-right">{row.hours.toFixed(1)}</td>
                      <td className="text-right capitalize">
                        <span className={`badge ${badge(avgQ)}`}>{avgQ}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {aggMetrics && (
              <div className="mt-3 text-sm" data-testid="sleep-aggregations">
                Aggregations (hours): sum {aggMetrics.sum.toFixed(1)}, avg{' '}
                {aggMetrics.avg.toFixed(1)}, min {aggMetrics.min}, max{' '}
                {aggMetrics.max}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
