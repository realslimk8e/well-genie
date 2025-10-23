import { useDiet } from "../../hooks/useDiet";

type DietItem = {
  id: number;
  date: string;     // "YYYY-MM-DD"
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
};

const fmtWeekday = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const fmtDate = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

export default function DietPanel() {
  const { items, loading, error } = useDiet();

  const last7 = (items.slice(-7) as DietItem[]);

  const avg = <K extends keyof DietItem>(key: K) =>
    last7.length
      ? Math.round(
          last7.reduce((sum, it) => sum + Number((it as any)[key] ?? 0), 0) /
            last7.length
        )
      : 0;

  const avgProtein = avg("protein_g");
  const avgCalories = avg("calories");
  const avgFat = avg("fat_g");
  const avgCarbs = avg("carbs_g");

  if (loading) {
    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="card-title">Diet</h2>
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
          <h2 className="card-title">Diet</h2>
          <div className="alert alert-error text-sm">Failed to load diet data.</div>
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
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-base">Last 7 days</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
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
                      <td>{fmtWeekday.format(d)}, {fmtDate.format(d)}</td>
                      <td className="text-right">{row.protein_g}</td>
                      <td className="text-right">{row.fat_g}</td>
                      <td className="text-right">{row.carbs_g}</td>
                      <td className="text-right">{row.calories}</td>
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
