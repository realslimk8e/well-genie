import { useEffect, useState } from 'react';

export type DietItem = {
  id: number;
  date: string; // "YYYY-MM-DD"
  score: number; // 0..100 (adjust if your API differs)
};

type DietResponse = { items: DietItem[] };

export function useDiet() {
  const [items, setItems] = useState<DietItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/diet')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<DietResponse>;
      })
      .then((json) => {
        if (alive) setItems(json.items ?? []);
      })
      .catch((e) => {
        if (alive) setError(e);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { items, loading, error };
}
