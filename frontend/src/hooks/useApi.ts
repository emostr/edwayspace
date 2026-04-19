'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(path: string | null): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!path) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    api
      .get<T>(path)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Не удалось загрузить данные');
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [path, tick]);

  return { data, isLoading, error, refetch };
}
