import { useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';

export type ExerciseItem = {
  id: number;
  date: string; // "YYYY-MM-DD"
  minutes?: number; // if your API uses a different key, we’ll map it below
  duration?: number;
  duration_min?: number;
  steps?: number;
  calories_burned?: number;
};

type ExerciseResponse = { items: ExerciseItem[] };

export function useExercise() {
  const [items, setItems] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let alive = true;
    apiClient
      .get<ExerciseResponse>('/api/exercise')
      .then((response) => {
        if (alive) setItems(response.data.items ?? []);
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
