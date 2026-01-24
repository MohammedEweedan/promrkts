import React from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview } from '../analytics';

const RouteTracker: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    const path = location.pathname + location.search;
    trackPageview(path);
    // also track on visibility return
    const onVisibility = () => {
      if (document.visibilityState === 'visible') trackPageview(path);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [location.pathname, location.search]);

  return null;
};

export default RouteTracker;
