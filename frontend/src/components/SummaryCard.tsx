type Props = {
  title: string;
  value: string;
  unit?: string;
  hint?: string;
  accent?: 'blue' | 'green' | 'purple' | 'pink';
};

const accents: Record<NonNullable<Props['accent']>, string> = {
  blue: 'from-blue-100 to-blue-50 text-blue-700',
  green: 'from-green-100 to-green-50 text-green-700',
  purple: 'from-purple-100 to-purple-50 text-purple-700',
  pink: 'from-pink-100 to-pink-50 text-pink-700',
};

export default function SummaryCard({
  title,
  value,
  unit,
  hint,
  accent = 'blue',
}: Props) {
  return (
    <div className="card card-compact bg-base-100 border-base-300 rounded-2xl border">
      <div className="card-body p-4">
        <div className="text-xs opacity-70">{title}</div>
        <div className="mt-1 text-2xl font-semibold">
          {value}
          {unit ? (
            <span className="ml-1 text-sm opacity-70">{unit}</span>
          ) : null}
        </div>
        {hint ? (
          <div className="mt-1 text-[11px] opacity-70">{hint}</div>
        ) : null}
      </div>
    </div>
  );
}
