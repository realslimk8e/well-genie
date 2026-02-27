import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';

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

  const refetch = useCallback(() => {
    setLoading(true);
    apiClient
      .get<SleepResponse>('/api/sleep')
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
