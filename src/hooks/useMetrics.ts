import { useCallback } from 'react';

interface MetricsContext {
  trackEvent: (event: string, data: string) => void;
}

export function useMetrics(): MetricsContext {
  const trackEvent = useCallback((event: string, page: string) => {
    fetch('http://localhost:5001/track', {
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