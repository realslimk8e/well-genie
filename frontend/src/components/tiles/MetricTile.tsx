type Props = {
  title: string;
  value: string | number;
  unit?: string;
  delta?: string;            // e.g. "↑2.3%" or "↓1.4%"
  deltaTone?: "up" | "down";
  bars?: number[];           // tiny inline bar chart [0..100]
};

export default function MetricTile({ title, value, unit, delta, deltaTone = "up", bars = [] }: Props) {
  return (
    <div className="card bg-base-100/80 border border-base-300 backdrop-blur-md">
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">{title}</h3>
          {delta && (
            <span className={`badge badge-sm ${deltaTone === "up" ? "badge-success" : "badge-error"} badge-outline`}>
              {delta}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-baseline gap-1">
          <div className="text-3xl font-semibold">{value}</div>
          {unit ? <div className="text-base-content/70">{unit}</div> : null}
        </div>

        {bars.length > 0 && (
          <div className="mt-3 flex items-end gap-1 h-8">
            {bars.map((b, i) => (
              <div
                key={i}
                data-testid="metric-bar"
                className="w-2 rounded-t bg-primary/70"
                style={{ height: `${Math.max(8, Math.min(100, b))}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
