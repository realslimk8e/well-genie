type StatItem = { label: string; value: string | number; unit?: string };

export default function QuickStatsCard({
  title,
  items,
}: {
  title: string;
  items: StatItem[];
}) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4 md:p-5">
        <h3 className="card-title text-base md:text-lg">{title}</h3>

        {/* Wrapping layout: items flow nicely at any width */}
        <div className="mt-2 flex flex-wrap gap-x-8 gap-y-3">
          {items.map((it, i) => (
            <div key={i} data-testid="quick-stat-item" className="min-w-[9rem] max-w-full">
              <div className="text-xs md:text-sm text-base-content/70 overflow-hidden text-ellipsis whitespace-nowrap md:whitespace-normal">
                {it.label}
              </div>
              <div className="flex items-baseline gap-1">
                <div className="text-2xl md:text-3xl font-semibold leading-none tracking-tight">
                  {it.value}
                </div>
                {it.unit ? (
                  <span className="text-xs md:text-sm text-base-content/70 whitespace-nowrap">
                    {it.unit}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
