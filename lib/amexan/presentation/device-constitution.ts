import type { ViewportClass, HeightClass, Orientation, ViewportBounds, DeviceInfo, BrowserEngine, PointerType } from './types'

export const VIEWPORT_CLASSES: Record<ViewportClass, ViewportBounds> = {
  xs: { min: 280, max: 359 },
  sm: { min: 360, max: 479 },
  md: { min: 480, max: 767 },
  lg: { min: 768, max: 1023 },
  xl: { min: 1024, max: 1439 },
  xxl: { min: 1440, max: 2559 },
  ultra: { min: 2560, max: Infinity },
}

export const VIEWPORT_ORDER: ViewportClass[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'ultra']

export const HEIGHT_BOUNDS: Record<HeightClass, ViewportBounds> = {
  short: { min: 0, max: 599 },
  normal: { min: 600, max: 899 },
  tall: { min: 900, max: Infinity },
}

export const VIEWPORT_EXAMPLES: Record<ViewportClass, string[]> = {
  xs: ['Older Android', 'iPhone SE', 'Small Nokia', 'Small feature-smartphones'],
  sm: ['Galaxy', 'Pixel', 'iPhone', 'Tecno', 'Infinix', 'Oppo', 'Huawei', 'Redmi'],
  md: ['Foldables folded', 'Landscape phones', 'Mini tablets'],
  lg: ['iPad', 'Galaxy Tab', 'Surface Go'],
  xl: ['Laptop', 'MacBook Air', 'ThinkPad'],
  xxl: ['Large desktop monitor', 'iMac', 'External display'],
  ultra: ['Medical workstation', 'Radiology display', 'Multi-monitor setup'],
}

export const VIEWPORT_RULES: Record<ViewportClass, {
  columns: 1 | 2 | 3 | 4
  sidebar: 'none' | 'permanent' | 'collapsible' | 'drawer'
  navigation: 'bottom_tabs' | 'top_bar' | 'sidebar' | 'drawer'
  cardWidth: 'full' | 'half' | 'third' | 'quarter'
  maxFabs: number
  hoverEnabled: boolean
  charts: 'simplified' | 'interactive' | 'full'
  tables: 'cards' | 'adaptive' | 'table'
  modals: 'fullscreen' | 'centered' | 'sidebar'
  formColumns: 1 | 2 | 3
}> = {
  xs: { columns: 1, sidebar: 'drawer', navigation: 'bottom_tabs', cardWidth: 'full', maxFabs: 1, hoverEnabled: false, charts: 'simplified', tables: 'cards', modals: 'fullscreen', formColumns: 1 },
  sm: { columns: 1, sidebar: 'drawer', navigation: 'bottom_tabs', cardWidth: 'full', maxFabs: 1, hoverEnabled: false, charts: 'simplified', tables: 'cards', modals: 'fullscreen', formColumns: 1 },
  md: { columns: 1, sidebar: 'drawer', navigation: 'bottom_tabs', cardWidth: 'full', maxFabs: 2, hoverEnabled: false, charts: 'simplified', tables: 'adaptive', modals: 'fullscreen', formColumns: 2 },
  lg: { columns: 2, sidebar: 'collapsible', navigation: 'sidebar', cardWidth: 'half', maxFabs: 2, hoverEnabled: true, charts: 'interactive', tables: 'adaptive', modals: 'centered', formColumns: 2 },
  xl: { columns: 2, sidebar: 'collapsible', navigation: 'sidebar', cardWidth: 'half', maxFabs: 3, hoverEnabled: true, charts: 'interactive', tables: 'table', modals: 'centered', formColumns: 2 },
  xxl: { columns: 3, sidebar: 'permanent', navigation: 'sidebar', cardWidth: 'third', maxFabs: 4, hoverEnabled: true, charts: 'full', tables: 'table', modals: 'centered', formColumns: 3 },
  ultra: { columns: 4, sidebar: 'permanent', navigation: 'sidebar', cardWidth: 'quarter', maxFabs: 5, hoverEnabled: true, charts: 'full', tables: 'table', modals: 'centered', formColumns: 3 },
}

export function detectViewportClass(width: number): ViewportClass {
  for (const vc of VIEWPORT_ORDER) {
    const bounds = VIEWPORT_CLASSES[vc]
    if (width >= bounds.min && width <= bounds.max) return vc
  }
  return 'xl'
}

export function detectHeightClass(height: number): HeightClass {
  for (const hc of ['short', 'normal', 'tall'] as HeightClass[]) {
    const bounds = HEIGHT_BOUNDS[hc]
    if (height >= bounds.min && height <= bounds.max) return hc
  }
  return 'normal'
}

export function detectOrientation(width: number, height: number): Orientation {
  return width >= height ? 'landscape' : 'portrait'
}

export function detectPointerType(touchSupported: boolean, hasFinePointer: boolean, penSupported: boolean): PointerType {
  if (penSupported) return 'pen'
  if (hasFinePointer) return 'fine'
  if (touchSupported) return 'coarse'
  return 'fine'
}

export function detectInteractionMode(pointerType: PointerType, touchSupported: boolean): 'touch' | 'hover' | 'ink' {
  if (pointerType === 'pen') return 'ink'
  if (pointerType === 'coarse' || touchSupported) return 'touch'
  return 'hover'
}

export function detectBrowserEngine(userAgent: string): BrowserEngine {
  const ua = userAgent.toLowerCase()
  if (ua.includes('chrome') || ua.includes('edge') || ua.includes('opera') || ua.includes('brave')) return 'chromium'
  if (ua.includes('safari') || ua.includes('applewebkit')) return 'webkit'
  if (ua.includes('firefox') || ua.includes('gecko')) return 'gecko'
  return 'unknown'
}

export function detectColorScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function detectPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function detectPrefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: more)').matches
}

export function detectScreenReader(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).speechSynthesis || !!(window as any).SpeechRecognition
}

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

export function detectTouchSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export function detectHasKeyboard(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).navigator?.keyboard
}

export function getDeviceInfo(): DeviceInfo {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024
  const height = typeof window !== 'undefined' ? window.innerHeight : 768
  const touchSupported = detectTouchSupported()
  const hasFinePointer = typeof window !== 'undefined' ? window.matchMedia('(pointer: fine)').matches : true

  return {
    width,
    height,
    viewportClass: detectViewportClass(width),
    heightClass: detectHeightClass(height),
    orientation: detectOrientation(width, height),
    pixelDensity: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    pointerType: detectPointerType(touchSupported, hasFinePointer, false),
    interactionMode: detectInteractionMode(detectPointerType(touchSupported, hasFinePointer, false), touchSupported),
    hasKeyboard: detectHasKeyboard(),
    hasScreenReader: detectScreenReader(),
    prefersReducedMotion: detectPrefersReducedMotion(),
    prefersHighContrast: detectPrefersHighContrast(),
    colorScheme: detectColorScheme(),
    online: isOnline(),
    browser: typeof navigator !== 'undefined' ? detectBrowserEngine(navigator.userAgent) : 'unknown',
    touchSupported,
  }
}

export function getViewportRules(vc: ViewportClass) {
  return VIEWPORT_RULES[vc]
}
