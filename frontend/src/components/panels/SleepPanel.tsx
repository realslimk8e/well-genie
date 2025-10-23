import { useSleep } from '../../hooks/useSleep';

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

export default function SleepPanel() {
  const { items, loading, error } = useSleep();

  const last7 = items.slice(-7) as SleepItem[];
  const avgHours = last7.length
    ? (last7.reduce((s, r) => s + (r.hours ?? 0), 0) / last7.length).toFixed(1)
    : '0.0';

  const avgQualityScore = last7.length
    ? last7.reduce((s, r) => s + (qualityToScore[r.quality] ?? 0), 0) /
      last7.length
    : 0;
  const avgQuality = scoreToQuality(avgQualityScore);

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
    </div>
  );
}
