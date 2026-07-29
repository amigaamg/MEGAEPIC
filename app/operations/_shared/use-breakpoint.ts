'use client';
import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

const BREAKPOINTS = { mobile: 640, tablet: 1024, desktop: 1440 };

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>('desktop');
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < BREAKPOINTS.mobile) setBp('mobile');
      else if (w < BREAKPOINTS.tablet) setBp('tablet');
      else if (w < BREAKPOINTS.desktop) setBp('desktop');
      else setBp('wide');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return bp;
}

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.mobile;
}