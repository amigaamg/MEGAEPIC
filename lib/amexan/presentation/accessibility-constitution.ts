import type { DeviceInfo } from './types'
import { meetsWCAGAA, contrastRatio } from './color-constitution'

export const MIN_FONT_SIZE = 16
export const MIN_LINE_HEIGHT = 1.5
export const MIN_TOUCH_TARGET = 48
export const FOCUS_RING_WIDTH = 3
export const FOCUS_RING_OFFSET = 2

export interface AccessibilityRules {
  fontSize: number
  lineHeight: number
  touchTarget: number
  focusRing: boolean
  focusRingWidth: number
  reducedMotion: boolean
  highContrast: boolean
  screenReader: boolean
  keyboardNav: boolean
  colorBlindMode: boolean
  letterSpacing: number
  wordSpacing: number
  paragraphSpacing: number
}

export function getAccessibilityRules(device: DeviceInfo): AccessibilityRules {
  return {
    fontSize: device.prefersHighContrast ? 18 : MIN_FONT_SIZE,
    lineHeight: MIN_LINE_HEIGHT,
    touchTarget: MIN_TOUCH_TARGET,
    focusRing: true,
    focusRingWidth: FOCUS_RING_WIDTH,
    reducedMotion: device.prefersReducedMotion,
    highContrast: device.prefersHighContrast,
    screenReader: device.hasScreenReader,
    keyboardNav: device.hasKeyboard,
    colorBlindMode: false,
    letterSpacing: device.prefersHighContrast ? 0.05 : 0,
    wordSpacing: device.prefersHighContrast ? 0.1 : 0,
    paragraphSpacing: device.prefersHighContrast ? 1.5 : 1,
  }
}

export function validateContrast(foreground: string, background: string, isLargeText: boolean): { passes: boolean; ratio: number; minimum: number } {
  const ratio = contrastRatio(foreground, background)
  const minimum = isLargeText ? 3 : 4.5
  return { passes: ratio >= minimum, ratio: Math.round(ratio * 100) / 100, minimum }
}

export function getFontSize(device: DeviceInfo, scale: 'base' | 'small' | 'large' | 'display'): number {
  const base = device.prefersHighContrast ? 18 : MIN_FONT_SIZE
  const sizes = { base, small: Math.round(base * 0.875), large: Math.round(base * 1.25), display: Math.round(base * 1.75) }
  return sizes[scale]
}

export function shouldReduceMotion(device: DeviceInfo): boolean {
  return device.prefersReducedMotion
}

export function getAnimDuration(device: DeviceInfo, baseMs: number): number {
  if (device.prefersReducedMotion) return 0
  if (device.pointerType === 'coarse') return Math.min(baseMs, 200)
  return Math.min(baseMs, 300)
}
