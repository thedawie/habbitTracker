import { useCallback } from 'react';

interface MetricsContext {
  trackEvent: (event: string, data: string) => void;
}

export function useMetrics(): MetricsContext {
  const trackEvent = useCallback((event: string, page: string) => {
    const endpoint = import.meta.env.VITE_TRACK_ENDPOINT;
    if (!endpoint) {
      console.error('Track endpoint is not defined in environment variables');
      return;
    }

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event, page }),
    }).catch((error) => {
      console.error('Failed to send metrics:', error);
    });
  }, []);

  return { trackEvent };
}