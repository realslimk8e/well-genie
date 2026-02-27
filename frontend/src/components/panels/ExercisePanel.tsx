import { useExercise } from '../../hooks/useExercise';
import { useMemo, useState } from 'react';
import DateRangeFilter from '../filters/DateRangeFilter';
import { filterByDateRange } from '../../utils/filterByDateRange';

type ExItem = {
  id: number;
  date: string; // "YYYY-MM-DD"
  duration_min?: number; // minutes
  minutes?: number; // fallback keys if backend changes
  duration?: number;
  calories_burned?: number;
  steps?: number;
};

const fmtWeekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const fmtDate = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
});

const getMin = (x: ExItem) =>
  Number(x.duration_min ?? x.minutes ?? x.duration ?? 0);

const getCals = (x: ExItem) => Number(x.calories_burned ?? 0);
const getSteps = (x: ExItem) => Number(x.steps ?? 0);

type ViewMode = 'daily' | 'weekly' | 'monthly';

const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day + 6) % 7;
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
  if (view === 'daily') return date.toLocaleDateString();
  if (view === 'weekly') return `Week of ${date.toLocaleDateString()}`;
  const month = date.toLocaleString(undefined, { month: 'short' });
  return `${month} ${date.getFullYear()}`;
};

const aggregateExercise = (items: ExItem[], view: ViewMode) => {
  const groups = new Map<
    string,
    { label: string; minutes: number; calories: number; steps: number }
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
    const entry = groups.get(key) ?? {
      label,
      minutes: 0,
      calories: 0,
      steps: 0,
    };
    entry.minutes += getMin(item);
    entry.calories += getCals(item);
    entry.steps += getSteps(item);
    groups.set(key, entry);
  });

  return Array.from(groups.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
};

export default function ExercisePanel() {
  const { items, loading, error } = useExercise();
  const [view, setView] = useState<ViewMode>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredItems = useMemo(() => {
    return filterByDateRange(items as ExItem[], startDate, endDate);
  }, [items, startDate, endDate]);

  const last7 = filteredItems.slice(-7);

  const avgMin = last7.length
    ? Math.round(last7.reduce((s, it) => s + getMin(it), 0) / last7.length)
    : 0;

  const avgCals = last7.length
    ? Math.round(last7.reduce((s, it) => s + getCals(it), 0) / last7.length)
    : 0;

  const avgSteps = last7.length
    ? Math.round(last7.reduce((s, it) => s + getSteps(it), 0) / last7.length)
    : 0;

  const aggregates = useMemo(
    () => aggregateExercise(filteredItems, view),
    [filteredItems, view],
  );

  const minuteValues = filteredItems.map((r) => getMin(r));
  const aggMetrics =
    minuteValues.length === 0
      ? null
      : {
          sum: minuteValues.reduce((s, n) => s + n, 0),
          avg:
            minuteValues.reduce((s, n) => s + n, 0) / minuteValues.length || 0,
          min: Math.min(...minuteValues),
          max: Math.max(...minuteValues),
        };

  if (loading) {
    return (
      <div className="card bg-base-100 border-base-300 border">
        <div className="card-body">
          <h2 className="card-title">Exercise</h2>
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
          <h2 className="card-title">Exercise</h2>
          <div className="alert alert-error text-sm">
            Failed to load exercise data.
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
      <div className="card bg-base-100 border-base-300 border">
        <div className="card-body">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h3 className="card-title text-base">Last 7 days</h3>
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onClear={() => {
                setStartDate('');
                setEndDate('');
              }}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="table-zebra table">
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
                      <td>
                        {fmtWeekday.format(d)}, {fmtDate.format(d)}
                      </td>
                      <td className="text-right">{getMin(row)}</td>
                      <td className="text-right">{getCals(row)}</td>
                      <td className="text-right">
                        {getSteps(row).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                {last7.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-base-content/70 text-center"
                    >
                      No exercise entries in the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="mt-2 text-xs opacity-70">
              Showing the most recent 7 entries within the selected range.
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
            <table className="table-compact table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th className="text-right">Minutes</th>
                  <th className="text-right">Calories</th>
                  <th className="text-right">Steps</th>
                </tr>
              </thead>
              <tbody>
                {aggregates.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.label}</td>
                    <td className="text-right">{row.minutes}</td>
                    <td className="text-right">{row.calories}</td>
                    <td className="text-right">{row.steps.toLocaleString()}</td>
                  </tr>
                ))}
                {aggregates.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-base-content/70 text-center"
                    >
                      No aggregated data in the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {aggMetrics && (
              <div className="mt-3 text-sm" data-testid="exercise-aggregations">
                Aggregations (minutes): sum {aggMetrics.sum}, avg{' '}
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
