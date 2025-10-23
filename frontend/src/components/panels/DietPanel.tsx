import { useDiet } from "../../hooks/useDiet";

type DietItem = {
  id: number;
  date: string;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
};

// simple macro-balance score, targets 30% protein, 30% fat, 40% carbs
function scoreDay(x: DietItem): number {
  const kcal = Math.max(1, x.calories); // avoid div-by-zero
  const targetP = (kcal * 0.30) / 4;  // grams
  const targetF = (kcal * 0.30) / 9;  // grams
  const targetC = (kcal * 0.40) / 4;  // grams

  const closeness = (actual: number, target: number) =>
    Math.max(0, 1 - Math.abs(actual - target) / target); // 1.0 = perfect, 0 = far

  const p = closeness(x.protein_g ?? 0, targetP);
  const f = closeness(x.fat_g ?? 0, targetF);
  const c = closeness(x.carbs_g ?? 0, targetC);

  return Math.round(((p + f + c) / 3) * 100);
}

export default function DietPanel() {
  const { items, loading, error } = useDiet();

  const last = items.at(-1) as DietItem | undefined;
  const lastScore = last ? scoreDay(last) : null;

  const last7 = items.slice(-7) as DietItem[];
  const avg =
    last7.length
      ? Math.round(last7.reduce((s, d) => s + scoreDay(d), 0) / last7.length)
      : 0;

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h2 className="card-title">Diet</h2>

        {loading && (
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-sm" />
            <span className="text-sm text-base-content/70">Loading…</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error text-sm">
            Failed to load diet data.
          </div>
        )}

        {!loading && !error && (
          <p className="text-sm text-base-content/70">
            Score, {avg} out of 100, last, {lastScore ?? "n/a"}.
          </p>
        )}
      </div>
    </div>
  );
}
