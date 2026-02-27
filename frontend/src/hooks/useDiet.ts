import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';

export type DietItem = {
  id: number;
  date: string; // "YYYY-MM-DD"
  score: number; // 0..100 (adjust if your API differs)
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  calories: number;
};

type DietResponse = { items: DietItem[] };

export function useDiet() {
  const [items, setItems] = useState<DietItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    apiClient
      .get<DietResponse>('/api/diet')
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
