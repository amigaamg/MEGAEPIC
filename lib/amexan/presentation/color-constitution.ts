import type { SemanticColor, DeviceInfo } from './types'

export interface ColorDefinition {
  base: string
  light: string
  dark: string
  contrast: string
  bg: string
  border: string
  hover: string
}

export const SEMANTIC_COLORS: Record<SemanticColor, ColorDefinition> = {
  info: {
    base: '#2563eb',
    light: '#3b82f6',
    dark: '#1d4ed8',
    contrast: '#ffffff',
    bg: '#eff6ff',
    border: '#93c5fd',
    hover: '#1d4ed8',
  },
  normal: {
    base: '#16a34a',
    light: '#22c55e',
    dark: '#15803d',
    contrast: '#ffffff',
    bg: '#f0fdf4',
    border: '#86efac',
    hover: '#15803d',
  },
  attention: {
    base: '#ca8a04',
    light: '#eab308',
    dark: '#a16207',
    contrast: '#ffffff',
    bg: '#fefce8',
    border: '#fde047',
    hover: '#a16207',
  },
  warning: {
    base: '#ea580c',
    light: '#f97316',
    dark: '#c2410c',
    contrast: '#ffffff',
    bg: '#fff7ed',
    border: '#fdba74',
    hover: '#c2410c',
  },
  critical: {
    base: '#dc2626',
    light: '#ef4444',
    dark: '#b91c1c',
    contrast: '#ffffff',
    bg: '#fef2f2',
    border: '#fca5a5',
    hover: '#b91c1c',
  },
  education: {
    base: '#7c3aed',
    light: '#8b5cf6',
    dark: '#6d28d9',
    contrast: '#ffffff',
    bg: '#f5f3ff',
    border: '#c4b5fd',
    hover: '#6d28d9',
  },
  inactive: {
    base: '#6b7280',
    light: '#9ca3af',
    dark: '#4b5563',
    contrast: '#ffffff',
    bg: '#f9fafb',
    border: '#d1d5db',
    hover: '#4b5563',
  },
}

export const DARK_MODE_OVERRIDES: Partial<Record<SemanticColor, Partial<ColorDefinition>>> = {
  info: { bg: '#1e3a5f', border: '#3b82f6' },
  normal: { bg: '#14532d', border: '#22c55e' },
  attention: { bg: '#422006', border: '#eab308' },
  warning: { bg: '#431407', border: '#f97316' },
  critical: { bg: '#450a0a', border: '#ef4444' },
  education: { bg: '#2e1065', border: '#8b5cf6' },
  inactive: { bg: '#1f2937', border: '#6b7280' },
}

export const WCAG_AA_MIN_CONTRAST = 4.5
export const WCAG_AA_LARGE_TEXT = 3.0
export const WCAG_AAA_MIN_CONTRAST = 7.0

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)]
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rl, gl, bl] = [r, g, b].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

export function contrastRatio(foreground: string, background: string): number {
  const [fr, fg, fb] = hexToRgb(foreground)
  const [br, bg, bb] = hexToRgb(background)
  const l1 = relativeLuminance(fr, fg, fb)
  const l2 = relativeLuminance(br, bg, bb)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function meetsWCAGAA(foreground: string, background: string, isLargeText = false): boolean {
  return contrastRatio(foreground, background) >= (isLargeText ? WCAG_AA_LARGE_TEXT : WCAG_AA_MIN_CONTRAST)
}

export function getColor(color: SemanticColor, device: DeviceInfo, variant?: 'base' | 'light' | 'dark' | 'contrast' | 'bg' | 'border' | 'hover'): string {
  const def = SEMANTIC_COLORS[color]
  const v = variant || 'base'
  let value = def[v]

  if (device.colorScheme === 'dark' && DARK_MODE_OVERRIDES[color]?.[v]) {
    value = DARK_MODE_OVERRIDES[color]![v] as string
  }

  return value
}
