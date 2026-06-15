import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 720;

export default function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}

export function useDevice(breakpoint = MOBILE_BREAKPOINT) {
  const isMobile = useIsMobile(breakpoint);
  return { isMobile, isDesktop: !isMobile };
}
