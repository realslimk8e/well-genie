import { useSleep } from "../../hooks/useSleep";

export default function SleepPanel() {
  const { items, loading, error } = useSleep();

  // Compute stats
  const last = items.at(-1);
  const avg =
    items.length > 0
      ? (items.reduce((s, i) => s + i.hours, 0) / items.length).toFixed(1)
      : "0.0";

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h2 className="card-title">Sleep</h2>

        {loading && (
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-sm" />
            <span className="text-sm text-base-content/70">Loading…</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error text-sm">
            Failed to load sleep data.
          </div>
        )}

        {!loading && !error && (
          <p className="text-sm text-base-content/70">
            Last night, {last ? `${last.hours} h` : "n/a"}, weekly avg, {avg} h.
          </p>
        )}
      </div>
    </div>
  );
}
