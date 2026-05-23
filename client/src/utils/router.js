import { useState, useEffect } from 'react';

// Global navigation triggers popstate event
export const navigate = (path) => {
  window.history.pushState({}, '', path);
  const navEvent = new PopStateEvent('popstate');
  window.dispatchEvent(navEvent);
};

export const usePath = () => {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  return path;
};
