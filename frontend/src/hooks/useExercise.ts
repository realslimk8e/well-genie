import { useEffect, useState } from 'react';

export type ExerciseItem = {
  id: number;
  date: string; // "YYYY-MM-DD"
  minutes?: number; // if your API uses a different key, we’ll map it below
  duration?: number;
  duration_min?: number;
};

type ExerciseResponse = { items: ExerciseItem[] };

export function useExercise() {
  const [items, setItems] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/exercise')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<ExerciseResponse>;
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
