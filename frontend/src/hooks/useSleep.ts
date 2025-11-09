import { useEffect, useState } from 'react';

export type SleepItem = {
  id: number;
  date: string; // "YYYY-MM-DD"
  hours: number; // e.g., 6.5
  quality: 'excellent' | 'good' | 'fair' | 'poor';
};

type SleepResponse = { items: SleepItem[] };

export function useSleep() {
  const [items, setItems] = useState<SleepItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/sleep', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<SleepResponse>;
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
