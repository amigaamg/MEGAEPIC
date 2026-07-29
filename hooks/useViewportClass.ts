'use client'
import { useState, useEffect } from 'react'

export type ViewportClass = 'XS' | 'SM' | 'MD' | 'LG' | 'XL' | 'XXL'

const BREAKPOINTS: { class: ViewportClass; min: number; max?: number }[] = [
  { class: 'XS', min: 280, max: 359 },
  { class: 'SM', min: 360, max: 479 },
  { class: 'MD', min: 480, max: 767 },
  { class: 'LG', min: 768, max: 1023 },
  { class: 'XL', min: 1024, max: 1439 },
  { class: 'XXL', min: 1440 },
]

export function useViewportClass(): ViewportClass {
  const [vc, setVc] = useState<ViewportClass>('XL')
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      for (const bp of BREAKPOINTS) {
        if (w >= bp.min && (!bp.max || w <= bp.max)) {
          setVc(bp.class)
          return
        }
      }
      setVc('XXL')
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return vc
}

export const IS_MOBILE_CLASS = /XS|SM|MD/

export function isMobileViewport(vc: ViewportClass): boolean {
  return IS_MOBILE_CLASS.test(vc)
}
