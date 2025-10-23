type Row = { label: string; value: number; };
export default function ListPercentTile({
  title,
  rows
}: { title: string; rows: Row[]; }) {
  return (
    <div className="card bg-base-100/80 border border-base-300">
      <div className="card-body p-4">
        <h3 className="card-title text-base">{title}</h3>
        <ul className="mt-3 space-y-3">
          {rows.map((r, i) => (
            <li key={i}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="badge badge-xs badge-primary" />
                  {r.label}
                </span>
                <span className="font-medium">{r.value}%</span>
              </div>
              <progress className="progress progress-primary h-2 mt-1" value={r.value} max={100} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
