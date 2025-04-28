import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMetrics } from './useMetrics.ts';

export function usePageViewMetrics(): void {
  const location = useLocation();
  const { trackEvent } = useMetrics();

  useEffect(() => {
    if (location?.pathname) {
      trackEvent('page_view', location.pathname);
    }
  }, [location, trackEvent]);
}