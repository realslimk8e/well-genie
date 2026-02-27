import { useState, useMemo } from 'react';
import { useSleep } from '../../hooks/useSleep';
import type { SleepItem } from '../../hooks/useSleep';
import { useExercise } from '../../hooks/useExercise';
import type { ExerciseItem } from '../../hooks/useExercise';
import { useDiet } from '../../hooks/useDiet';
import type { DietItem } from '../../hooks/useDiet';

type Category = 'sleep' | 'steps' | 'nutrition';

type UnifiedRow = {
  category: Category;
  id: string;
  date: string;
};

const toDate = (d: string) => new Date(d).getTime();

export default function SummaryFilters() {
  const { items: sleep } = useSleep();
  const { items: exercise } = useExercise();
  const { items: diet } = useDiet();

  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [enabled, setEnabled] = useState<Record<Category, boolean>>({
    sleep: true,
    steps: true,
    nutrition: true,
  });
  const [visibleCols, setVisibleCols] = useState<{ category: boolean; count: boolean }>({
    category: true,
    count: true,
  });
  const [sort, setSort] = useState<{ key: 'category' | 'count'; dir: 'asc' | 'desc' }>({
    key: 'category',
    dir: 'asc',
  });
  const [deleteCategory, setDeleteCategory] = useState<Category>('sleep');
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const unified: UnifiedRow[] = useMemo(() => {
    const rows: UnifiedRow[] = [];
    (sleep as SleepItem[]).forEach((r, idx) =>
      rows.push({ category: 'sleep', date: r.date, id: String(r.id ?? `sleep-${idx}`) }),
    );
    (exercise as ExerciseItem[]).forEach((r, idx) =>
      rows.push({ category: 'steps', date: r.date, id: String(r.id ?? `steps-${idx}`) }),
    );
    (diet as DietItem[]).forEach((r, idx) =>
      rows.push({ category: 'nutrition', date: r.date, id: String(r.id ?? `nutrition-${idx}`) }),
    );
    return rows;
  }, [sleep, exercise, diet]);

  const filtered = useMemo(() => {
    return unified.filter((row) => {
      if (!enabled[row.category]) return false;
      const t = toDate(row.date);
      if (start && t < toDate(start)) return false;
      if (end && t > toDate(end)) return false;
      if (deletedIds.has(row.id)) return false;
      return true;
    });
  }, [unified, start, end, enabled, deletedIds]);

  const counts = filtered.reduce<Record<Category, number>>(
    (acc, row) => {
      acc[row.category] += 1;
      return acc;
    },
    { sleep: 0, steps: 0, nutrition: 0 },
  );

  const toggle = (cat: Category) =>
    setEnabled((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const visibleCats = (['sleep', 'steps', 'nutrition'] as Category[]).filter(
    (c) => enabled[c],
  );
  const rows = visibleCats
    .map((cat) => ({ category: cat, count: counts[cat] }))
    .sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      if (sort.key === 'category') {
        return a.category.localeCompare(b.category) * dir;
      }
      return (a.count - b.count) * dir;
    });

  const toggleSort = (key: 'category' | 'count') => {
    setSort((prev) => {
      if (prev.key === key) {
        return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      }
      return { key, dir: 'asc' };
    });
  };

  const deleteFiltered = () => {
    const toDelete = filtered.filter(
      (row) => row.category === deleteCategory,
    );
    if (toDelete.length === 0) {
      setStatusMessage('No records matched the delete criteria. Try adjusting the date range.');
      return;
    }
    setDeletedIds((prev) => {
      const next = new Set(prev);
      toDelete.forEach((row) => next.add(row.id));
      return next;
    });
    setStatusMessage(
      `Deleted ${toDelete.length} ${deleteCategory} record(s) for the selected range.`,
    );
  };

  return (
    <div className="card bg-base-100 border-base-300 border">
      <div className="card-body space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Start date</span>
            </label>
            <input
              aria-label="start date"
              type="date"
              className="input input-bordered input-sm"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">End date</span>
            </label>
            <input
              aria-label="end date"
              type="date"
              className="input input-bordered input-sm"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            {(['sleep', 'steps', 'nutrition'] as Category[]).map((cat) => (
              <label key={cat} className="label cursor-pointer gap-2">
                <span className="label-text capitalize">{cat}</span>
                <input
                  aria-label={`${cat} toggle`}
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm"
                  checked={enabled[cat]}
                  onChange={() => toggle(cat)}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="label cursor-pointer gap-2">
              <span className="label-text text-sm">Show category</span>
              <input
                aria-label="toggle category column"
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={visibleCols.category}
                onChange={() =>
                  setVisibleCols((v) => ({ ...v, category: !v.category }))
                }
              />
            </label>
            <label className="label cursor-pointer gap-2">
              <span className="label-text text-sm">Show count</span>
              <input
                aria-label="toggle count column"
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={visibleCols.count}
                onChange={() =>
                  setVisibleCols((v) => ({ ...v, count: !v.count }))
                }
              />
            </label>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Sort by:</span>
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => toggleSort('category')}
            >
              Category {sort.key === 'category' ? (sort.dir === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => toggleSort('count')}
            >
              Count {sort.key === 'count' ? (sort.dir === 'asc' ? '↑' : '↓') : ''}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              aria-label="delete category"
              className="select select-bordered select-xs"
              value={deleteCategory}
              onChange={(e) => setDeleteCategory(e.target.value as Category)}
            >
              <option value="sleep">Sleep</option>
              <option value="steps">Steps</option>
              <option value="nutrition">Nutrition</option>
            </select>
            <button className="btn btn-xs btn-error" type="button" onClick={deleteFiltered}>
              Delete filtered
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-compact">
            <thead>
              <tr>
                {visibleCols.category && (
                  <th>
                    <button
                      type="button"
                      className="btn btn-link btn-xs px-0"
                      onClick={() => toggleSort('category')}
                    >
                      Category
                    </button>
                  </th>
                )}
                {visibleCols.count && (
                  <th className="text-right">
                    <button
                      type="button"
                      className="btn btn-link btn-xs px-0"
                      onClick={() => toggleSort('count')}
                    >
                      Count
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.category}>
                  {visibleCols.category && (
                    <td className="capitalize">{row.category}</td>
                  )}
                  {visibleCols.count && (
                    <td className="text-right">{row.count}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {statusMessage && (
          <div className="alert alert-info text-sm" role="status">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}
