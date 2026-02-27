import { useState } from 'react';
import { isAxiosError } from 'axios';
import { apiClient } from '../lib/apiClient';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const creds = `${username.trim()}:${password}`;
      const response = await apiClient.post('/api/login', undefined, {
        headers: {
          Authorization: 'Basic ' + btoa(creds),
          Accept: 'application/json',
        },
      });
      return response.data;
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const data = err.response?.data;
        if (typeof data === 'string' && data.trim() !== '') {
          setError(new Error(data));
        } else {
          setError(new Error(err.message || 'Login failed'));
        }
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
