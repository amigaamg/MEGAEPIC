import type { PointerType, InteractionMode, DeviceInfo } from './types'

export const MIN_TOUCH_SIZE = 48
export const MIN_MOUSE_SIZE = 24
export const MIN_PEN_SIZE = 32

export const HOVER_DELAY_MS = 300
export const LONG_PRESS_MS = 500
export const DOUBLE_TAP_MS = 300
export const SWIPE_THRESHOLD_PX = 50

export interface InteractionRules {
  pointerType: PointerType
  mode: InteractionMode
  minTargetSize: number
  hoverEnabled: boolean
  tooltipEnabled: boolean
  contextMenuEnabled: boolean
  dragEnabled: boolean
  inkEnabled: boolean
  swipeEnabled: boolean
  longPressEnabled: boolean
}

export const INTERACTION_RULES: Record<PointerType, Omit<InteractionRules, 'pointerType' | 'mode'>> = {
  coarse: {
    minTargetSize: MIN_TOUCH_SIZE,
    hoverEnabled: false,
    tooltipEnabled: false,
    contextMenuEnabled: false,
    dragEnabled: true,
    inkEnabled: false,
    swipeEnabled: true,
    longPressEnabled: true,
  },
  fine: {
    minTargetSize: MIN_MOUSE_SIZE,
    hoverEnabled: true,
    tooltipEnabled: true,
    contextMenuEnabled: true,
    dragEnabled: true,
    inkEnabled: false,
    swipeEnabled: false,
    longPressEnabled: false,
  },
  pen: {
    minTargetSize: MIN_PEN_SIZE,
    hoverEnabled: true,
    tooltipEnabled: true,
    contextMenuEnabled: false,
    dragEnabled: true,
    inkEnabled: true,
    swipeEnabled: true,
    longPressEnabled: true,
  },
}

export function getInteractionRules(device: DeviceInfo): InteractionRules {
  const base = INTERACTION_RULES[device.pointerType]
  return { pointerType: device.pointerType, mode: device.interactionMode, ...base }
}

export function getMinTouchTarget(device: DeviceInfo): number {
  return INTERACTION_RULES[device.pointerType].minTargetSize
}
