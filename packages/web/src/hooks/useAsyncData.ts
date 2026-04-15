import { useEffect, useState } from 'react';

export function useAsyncData<T>(loader: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    void loader()
      .then((result) => {
        if (active) {
          setData(result);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Unexpected error');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, dependencies);

  return { data, loading, error };
}
