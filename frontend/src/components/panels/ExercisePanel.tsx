import { useExercise } from "../../hooks/useExercise";

const getMinutes = (x: any) =>
  Number.isFinite(x?.minutes) ? x.minutes
  : Number.isFinite(x?.duration_min) ? x.duration_min
  : Number.isFinite(x?.duration) ? x.duration
  : null;

const getSteps = (x: any) =>
  Number.isFinite(x?.steps) ? x.steps : null;

export default function ExercisePanel() {
  const { items, loading, error } = useExercise();

  const last = items.at(-1);
  const todayMin = last ? getMinutes(last) : null;
  const todaySteps = last ? getSteps(last) : null;

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h2 className="card-title">Exercise</h2>

        {loading && (
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-sm" />
            <span className="text-sm text-base-content/70">Loading…</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error text-sm">
            Failed to load exercise data.
          </div>
        )}

        {!loading && !error && (
          <p className="text-sm text-base-content/70">
            Today, {todayMin ?? "n/a"} active minutes
            {todaySteps != null ? `, ${todaySteps.toLocaleString()} steps` : ""}.
          </p>
        )}
      </div>
    </div>
  );
}
