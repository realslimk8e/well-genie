import { useDiet } from '../../hooks/useDiet';
import { useMemo, useState } from 'react';
import DateRangeFilter from '../filters/DateRangeFilter';
import { filterByDateRange } from '../../utils/filterByDateRange';

type DietItem = {
  id: number;
  date: string; // "YYYY-MM-DD"
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
};

const fmtWeekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const fmtDate = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
});

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

const aggregateDiet = (items: DietItem[], view: ViewMode) => {
  const groups = new Map<
    string,
    {
      label: string;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    }
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
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    };
    entry.calories += Number(item.calories ?? 0);
    entry.protein += Number(item.protein_g ?? 0);
    entry.fat += Number(item.fat_g ?? 0);
    entry.carbs += Number(item.carbs_g ?? 0);
    groups.set(key, entry);
  });

  return Array.from(groups.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
};

export default function DietPanel() {
  const { items, loading, error } = useDiet();
  const [view, setView] = useState<ViewMode>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredItems = useMemo(() => {
    return filterByDateRange(items as DietItem[], startDate, endDate);
  }, [items, startDate, endDate]);

  const last7 = filteredItems.slice(-7);

  const avg = <K extends keyof DietItem>(key: K) =>
    last7.length
      ? Math.round(
          last7.reduce(
            (sum, it) => sum + Number((it as DietItem)[key] ?? 0),
            0,
          ) / last7.length,
        )
      : 0;

  const avgProtein = avg('protein_g');
  const avgCalories = avg('calories');
  const avgFat = avg('fat_g');
  const avgCarbs = avg('carbs_g');

  const aggregates = useMemo(
    () => aggregateDiet(filteredItems, view),
    [filteredItems, view],
  );

  const calorieValues = filteredItems.map((r) => Number(r.calories ?? 0));
  const aggMetrics =
    calorieValues.length === 0
      ? null
      : {
          sum: calorieValues.reduce((s, n) => s + n, 0),
          avg:
            calorieValues.reduce((s, n) => s + n, 0) / calorieValues.length ||
            0,
          min: Math.min(...calorieValues),
          max: Math.max(...calorieValues),
        };

  if (loading) {
    return (
      <div className="card bg-base-100 border-base-300 border">
        <div className="card-body">
          <h2 className="card-title">Diet</h2>
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
          <h2 className="card-title">Diet</h2>
          <div className="alert alert-error text-sm">
            Failed to load diet data.
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
          <div className="stat-title">Avg Protein (7d)</div>
          <div className="stat-value text-primary">{avgProtein}</div>
          <div className="stat-desc">grams / day</div>
        </div>
        <div className="stat">
          <div className="stat-title">Avg Calories (7d)</div>
          <div className="stat-value">{avgCalories}</div>
          <div className="stat-desc">kcal / day</div>
        </div>
        <div className="stat">
          <div className="stat-title">Avg Fat (7d)</div>
          <div className="stat-value">{avgFat}</div>
          <div className="stat-desc">grams / day</div>
        </div>
        <div className="stat">
          <div className="stat-title">Avg Carbs (7d)</div>
          <div className="stat-value">{avgCarbs}</div>
          <div className="stat-desc">grams / day</div>
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
                  <th className="text-right">Protein (g)</th>
                  <th className="text-right">Fat (g)</th>
                  <th className="text-right">Carbs (g)</th>
                  <th className="text-right">Calories</th>
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
                      <td className="text-right">{row.protein_g}</td>
                      <td className="text-right">{row.fat_g}</td>
                      <td className="text-right">{row.carbs_g}</td>
                      <td className="text-right">{row.calories}</td>
                    </tr>
                  );
                })}
                {last7.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-base-content/70 text-center"
                    >
                      No diet entries in the selected date range.
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
                  <th className="text-right">Calories</th>
                  <th className="text-right">Protein (g)</th>
                  <th className="text-right">Carbs (g)</th>
                  <th className="text-right">Fat (g)</th>
                </tr>
              </thead>
              <tbody>
                {aggregates.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.label}</td>
                    <td className="text-right">{row.calories}</td>
                    <td className="text-right">{row.protein}</td>
                    <td className="text-right">{row.carbs}</td>
                    <td className="text-right">{row.fat}</td>
                  </tr>
                ))}
                {aggregates.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-base-content/70 text-center"
                    >
                      No aggregated data in the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {aggMetrics && (
              <div className="mt-3 text-sm" data-testid="diet-aggregations">
                Aggregations (calories): sum {aggMetrics.sum}, avg{' '}
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
