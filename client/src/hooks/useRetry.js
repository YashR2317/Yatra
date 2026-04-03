import { useCallback, useRef } from "react";

/**
 * useRetry — Custom hook for fetch-with-retry using exponential backoff.
 *
 * Usage:
 *   const { fetchWithRetry } = useRetry({ maxRetries: 3, backoffMs: 500 });
 *   const data = await fetchWithRetry(() => fetch('/api/health'));
 */
export function useRetry({ maxRetries = 3, backoffMs = 500, backoffFactor = 2 } = {}) {
  const attemptRef = useRef(0);

  const fetchWithRetry = useCallback(
    async (fetchFn, options = {}) => {
      const { onRetry, signal } = options;
      let lastError;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        try {
          const result = await fetchFn();
          attemptRef.current = 0;
          return result;
        } catch (error) {
          lastError = error;

          // Don't retry on abort
          if (error.name === "AbortError") throw error;

          // Don't retry on 4xx client errors
          if (error.status && error.status >= 400 && error.status < 500) throw error;

          if (attempt < maxRetries) {
            const delay = backoffMs * Math.pow(backoffFactor, attempt);
            const jitter = delay * 0.2 * Math.random();
            onRetry?.(attempt + 1, maxRetries, delay);
            await new Promise((resolve) => setTimeout(resolve, delay + jitter));
          }
        }
      }

      throw lastError;
    },
    [maxRetries, backoffMs, backoffFactor]
  );

  return { fetchWithRetry, attempt: attemptRef.current };
}

export default useRetry;
