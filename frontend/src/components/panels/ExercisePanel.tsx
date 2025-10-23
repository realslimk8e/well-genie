import { useExercise } from "../../hooks/useExercise";

type ExItem = {
  id: number;
  date: string;              // "YYYY-MM-DD"
  duration_min?: number;     // minutes
  minutes?: number;          // fallback keys if backend changes
  duration?: number;
  calories_burned?: number;
  steps?: number;
};

const fmtWeekday = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const fmtDate = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

const getMin = (x: ExItem) =>
  Number(x.duration_min ?? x.minutes ?? x.duration ?? 0);

const getCals = (x: ExItem) => Number(x.calories_burned ?? 0);
const getSteps = (x: ExItem) => Number(x.steps ?? 0);

export default function ExercisePanel() {
  const { items, loading, error } = useExercise();

  const last7 = (items.slice(-7) as ExItem[]);

  const avgMin = last7.length
    ? Math.round(last7.reduce((s, it) => s + getMin(it), 0) / last7.length)
    : 0;

  const avgCals = last7.length
    ? Math.round(last7.reduce((s, it) => s + getCals(it), 0) / last7.length)
    : 0;

  const avgSteps = last7.length
    ? Math.round(last7.reduce((s, it) => s + getSteps(it), 0) / last7.length)
    : 0;

  if (loading) {
    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="card-title">Exercise</h2>
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-sm" />
            <span className="text-sm text-base-content/70">Loading…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="card-title">Exercise</h2>
          <div className="alert alert-error text-sm">Failed to load exercise data.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top averages box */}
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Avg Minutes, 7 days</div>
          <div className="stat-value text-primary">{avgMin}</div>
          <div className="stat-desc">per day</div>
        </div>
        <div className="stat">
          <div className="stat-title">Avg Calories Burned, 7 days</div>
          <div className="stat-value">{avgCals}</div>
          <div className="stat-desc">per day</div>
        </div>
        <div className="stat">
          <div className="stat-title">Avg Steps, 7 days</div>
          <div className="stat-value">{avgSteps.toLocaleString()}</div>
          <div className="stat-desc">per day</div>
        </div>
      </div>

      {/* 7-day breakdown */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-base">Last 7 days</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th className="w-28">Day</th>
                  <th className="text-right">Minutes</th>
                  <th className="text-right">Calories</th>
                  <th className="text-right">Steps</th>
                </tr>
              </thead>
              <tbody>
                {last7.map((row) => {
                  const d = new Date(row.date);
                  return (
                    <tr key={row.id}>
                      <td>{fmtWeekday.format(d)}, {fmtDate.format(d)}</td>
                      <td className="text-right">{getMin(row)}</td>
                      <td className="text-right">{getCals(row)}</td>
                      <td className="text-right">{getSteps(row).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="text-xs opacity-70 mt-2">
              Showing the most recent 7 entries.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
