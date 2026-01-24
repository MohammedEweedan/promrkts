'use client';

import { useEffect, useState } from 'react';

export default function useIsTablet(breakpoint = 1024) {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => setIsTablet(window.innerWidth <= breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isTablet;
}
