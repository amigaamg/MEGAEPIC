export type ViewportClass = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'ultra'

export type HeightClass = 'short' | 'normal' | 'tall'

export type Orientation = 'portrait' | 'landscape'

export type PointerType = 'fine' | 'coarse' | 'pen'

export type InteractionMode = 'touch' | 'hover' | 'ink'

export type BrowserEngine = 'chromium' | 'webkit' | 'gecko' | 'unknown'

export type SidebarMode = 'none' | 'permanent' | 'collapsible' | 'drawer'

export type CardPriority = 'critical' | 'high' | 'medium' | 'low'

export type ButtonType = 'primary' | 'secondary' | 'danger' | 'ghost'

export type VisibilityState = 'hidden' | 'collapsed' | 'preview' | 'expanded' | 'pinned' | 'readonly' | 'disabled' | 'loading' | 'unavailable' | 'conditional'

export type SemanticColor = 'info' | 'normal' | 'attention' | 'warning' | 'critical' | 'education' | 'inactive'

export type TableDisplay = 'table' | 'cards' | 'adaptive'

export type ModalDisplay = 'fullscreen' | 'centered' | 'sidebar'

export interface ViewportBounds {
  min: number
  max: number
}

export interface DeviceInfo {
  viewportClass: ViewportClass
  width: number
  height: number
  heightClass: HeightClass
  orientation: Orientation
  pixelDensity: number
  pointerType: PointerType
  interactionMode: InteractionMode
  hasKeyboard: boolean
  hasScreenReader: boolean
  prefersReducedMotion: boolean
  prefersHighContrast: boolean
  colorScheme: 'light' | 'dark'
  online: boolean
  browser: BrowserEngine
  touchSupported: boolean
}

export interface CardConfig {
  priority: CardPriority
  importance: number
  role: string
  visibility: VisibilityState
  expandable: boolean
  lazyLoad: boolean
  realtime: boolean
  editable: boolean
  readOnly: boolean
  pinned: boolean
}

export interface PerformanceBudget {
  interaction: number
  questionDisplay: number
  cardExpansion: number
  navigation: number
  initialPage: number
  realtimeUpdate: number
}

export interface LayoutRules {
  columns: 1 | 2 | 3 | 4
  sidebar: SidebarMode
  cardWidth: 'full' | 'half' | 'third' | 'quarter'
  maxActions: number
  formColumns: 1 | 2 | 3
}

export interface PresentationObject {
  id: string
  type: 'card' | 'section' | 'panel' | 'modal' | 'form' | 'table' | 'chart' | 'button' | 'navigation' | 'summary'
  priority: CardPriority
  visibility: VisibilityState
  layout: LayoutRules
  content: unknown
  theme: { color: SemanticColor; variant?: string }
  interaction: { touch: boolean; hover: boolean; pen: boolean; minTouchSize?: number }
  performance: { lazyLoad: boolean; realtime: boolean; preload: boolean }
  accessibility: { label: string; role: string; keyboardNav: boolean }
}

export interface PresentationContext {
  device: DeviceInfo
  role: string
  journey: string
  phase: string
  content: unknown
  preferences: Record<string, unknown>
}

export interface VisibilityResult {
  state: VisibilityState
  reason: string
}
