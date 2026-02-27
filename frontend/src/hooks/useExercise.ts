import { useEffect, useState, useCallback } from 'react';
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

  const refetch = useCallback(() => {
    setLoading(true);
    apiClient
      .get<ExerciseResponse>('/api/exercise')
      .then((response) => {
        setItems(response.data.items ?? []);
        setError(null);
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, loading, error, refetch };
}
