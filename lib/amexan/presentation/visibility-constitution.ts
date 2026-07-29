import type { VisibilityState, VisibilityResult, DeviceInfo, CardPriority } from './types'

export const VISIBILITY_ORDER: VisibilityState[] = [
  'pinned',
  'expanded',
  'preview',
  'collapsed',
  'hidden',
  'readonly',
  'disabled',
  'loading',
  'unavailable',
  'conditional',
]

export function isVisible(state: VisibilityState): boolean {
  return !['hidden', 'unavailable', 'disabled'].includes(state)
}

export function isInteractive(state: VisibilityState): boolean {
  return ['expanded', 'pinned', 'preview'].includes(state)
}

export function isExpandable(state: VisibilityState): boolean {
  return ['collapsed', 'preview'].includes(state)
}

export interface VisibilityDecision {
  state: VisibilityState
  reason: string
}

export function resolveVisibility(params: {
  priority: CardPriority
  device: DeviceInfo
  role: string
  hasData: boolean
  isPinned: boolean
  isReadonly: boolean
  isDisabled: boolean
  isLoaded: boolean
  conditionMet: boolean
}): VisibilityDecision {
  if (!params.isLoaded) return { state: 'loading', reason: 'Data not yet loaded' }
  if (!params.conditionMet) return { state: 'conditional', reason: 'Condition not met for this role/context' }
  if (params.isDisabled) return { state: 'disabled', reason: 'Functionality disabled for this context' }
  if (!params.hasData) return { state: 'unavailable', reason: 'No data available to display' }
  if (params.isPinned) return { state: 'pinned', reason: 'User has pinned this card' }

  if (params.priority === 'critical') return { state: 'expanded', reason: 'Critical priority — always visible' }

  if (params.device.viewportClass === 'xs' || params.device.viewportClass === 'sm') {
    if (params.priority === 'high') return { state: 'expanded', reason: 'High priority on small screen' }
    if (params.priority === 'medium') return { state: 'preview', reason: 'Medium priority on small screen — collapsed by default' }
    return { state: 'collapsed', reason: 'Low priority on small screen' }
  }

  if (params.device.viewportClass === 'md') {
    if (params.priority === 'high' || params.priority === 'medium') return { state: 'expanded', reason: 'Medium+ priority on medium screen' }
    return { state: 'preview', reason: 'Low priority on medium screen' }
  }

  if (params.isReadonly) return { state: 'readonly', reason: 'Read-only mode active' }

  return { state: 'expanded', reason: 'Sufficient space for all content' }
}
