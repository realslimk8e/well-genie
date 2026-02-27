type DateRangeFilterProps = {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClear: () => void;
  className?: string;
};

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  className,
}: DateRangeFilterProps) {
  return (
    <div className={className ?? 'flex flex-wrap items-end gap-2'}>
      <label className="form-control w-40">
        <span className="label-text text-xs">Start date</span>
        <input
          type="date"
          className="input input-bordered input-sm"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          max={endDate || undefined}
        />
      </label>
      <label className="form-control w-40">
        <span className="label-text text-xs">End date</span>
        <input
          type="date"
          className="input input-bordered input-sm"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={startDate || undefined}
        />
      </label>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={onClear}
        disabled={!startDate && !endDate}
      >
        Clear
      </button>
    </div>
  );
}
