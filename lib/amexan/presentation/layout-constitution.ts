import type { DeviceInfo, SidebarMode, CardPriority, ButtonType, TableDisplay, ModalDisplay, CardConfig } from './types'
import { VIEWPORT_RULES } from './device-constitution'
import { resolveVisibility } from './visibility-constitution'

export interface SidebarConfig {
  mode: SidebarMode
  width: number
  collapsible: boolean
  persistentWhenOpen: boolean
  showIcons: boolean
  showLabels: boolean
}

export interface CardDisplayConfig {
  priority: CardPriority
  fullWidth: boolean
  expandable: boolean
  showTitle: boolean
  showActions: boolean
  lazyLoad: boolean
  maxHeight?: number
}

export interface ButtonLayoutConfig {
  primaryFirst: boolean
  primaryStyle: ButtonType
  maxVisible: number
  collapseAfter: number
  showIcons: boolean
  showLabels: boolean
  dangerFirst: boolean
}

export interface FormLayoutConfig {
  columns: 1 | 2 | 3
  labelPosition: 'top' | 'side' | 'floating'
  showRequired: boolean
  compact: boolean
  questionPerCard: number
}

export interface TableLayoutConfig {
  display: TableDisplay
  stickyHeader: boolean
  stickyFirstColumn: boolean
  maxRowsBeforePagination: number
  showSearch: boolean
  showFilters: boolean
}

export interface ModalLayoutConfig {
  display: ModalDisplay
  width: string
  showClose: boolean
  closeOnOverlay: boolean
  closeOnEscape: boolean
  preventScroll: boolean
}

export function getSidebarConfig(device: DeviceInfo): SidebarConfig {
  const rules = VIEWPORT_RULES[device.viewportClass]
  return {
    mode: rules.sidebar,
    width: device.viewportClass === 'xl' ? 240 : device.viewportClass === 'xxl' ? 280 : device.viewportClass === 'ultra' ? 320 : 200,
    collapsible: rules.sidebar === 'collapsible',
    persistentWhenOpen: rules.sidebar === 'permanent',
    showIcons: true,
    showLabels: device.viewportClass !== 'xs',
  }
}

export function getNavigationStyle(device: DeviceInfo): 'bottom_tabs' | 'top_bar' | 'sidebar' | 'drawer' {
  return VIEWPORT_RULES[device.viewportClass].navigation
}

export function getCardConfig(card: Partial<CardConfig>, device: DeviceInfo): CardDisplayConfig {
  const priority = card.priority || 'medium'
  const vc = device.viewportClass

  return {
    priority,
    fullWidth: vc === 'xs' || vc === 'sm' || vc === 'md',
    expandable: card.expandable !== false,
    showTitle: true,
    showActions: vc !== 'xs',
    lazyLoad: card.lazyLoad !== false && priority !== 'critical',
    maxHeight: vc === 'xs' ? 300 : vc === 'sm' ? 400 : undefined,
  }
}

export function getButtonConfig(device: DeviceInfo, actionCount: number): ButtonLayoutConfig {
  const maxVisible = VIEWPORT_RULES[device.viewportClass].maxFabs
  return {
    primaryFirst: true,
    primaryStyle: 'primary',
    maxVisible,
    collapseAfter: maxVisible,
    showIcons: true,
    showLabels: device.viewportClass !== 'xs',
    dangerFirst: false,
  }
}

export function getFormConfig(device: DeviceInfo): FormLayoutConfig {
  return {
    columns: VIEWPORT_RULES[device.viewportClass].formColumns,
    labelPosition: device.viewportClass === 'xs' || device.viewportClass === 'sm' ? 'top' : 'side',
    showRequired: true,
    compact: device.viewportClass === 'xs' || device.viewportClass === 'sm',
    questionPerCard: 1,
  }
}

export function getTableConfig(device: DeviceInfo): TableLayoutConfig {
  return {
    display: VIEWPORT_RULES[device.viewportClass].tables,
    stickyHeader: true,
    stickyFirstColumn: device.viewportClass === 'lg' || device.viewportClass === 'xl',
    maxRowsBeforePagination: device.viewportClass === 'xs' ? 5 : device.viewportClass === 'sm' ? 8 : 15,
    showSearch: device.viewportClass !== 'xs',
    showFilters: device.viewportClass === 'xl' || device.viewportClass === 'xxl' || device.viewportClass === 'ultra',
  }
}

export function getModalConfig(device: DeviceInfo): ModalLayoutConfig {
  return {
    display: VIEWPORT_RULES[device.viewportClass].modals,
    width: device.viewportClass === 'xs' || device.viewportClass === 'sm' ? '100%' : device.viewportClass === 'md' ? '90%' : '60%',
    showClose: true,
    closeOnOverlay: true,
    closeOnEscape: true,
    preventScroll: device.viewportClass === 'xs' || device.viewportClass === 'sm' || device.viewportClass === 'md',
  }
}

export function getChartConfig(device: DeviceInfo): 'simplified' | 'interactive' | 'full' {
  return VIEWPORT_RULES[device.viewportClass].charts
}

export function shouldUseDrawerMenu(device: DeviceInfo): boolean {
  return device.viewportClass === 'xs' || device.viewportClass === 'sm' || device.viewportClass === 'md'
}

export function getCardWidth(device: DeviceInfo): 'full' | 'half' | 'third' | 'quarter' {
  return VIEWPORT_RULES[device.viewportClass].cardWidth
}

export function getColumnCount(device: DeviceInfo): 1 | 2 | 3 | 4 {
  return VIEWPORT_RULES[device.viewportClass].columns
}

export function getMaxActions(device: DeviceInfo): number {
  return VIEWPORT_RULES[device.viewportClass].maxFabs
}

export function getScrollConfig(device: DeviceInfo): {
  vertical: boolean
  horizontal: boolean
  nested: boolean
  stickyTop: boolean
  stickyBottom: boolean
  stickyActions: boolean
} {
  return {
    vertical: true,
    horizontal: device.viewportClass === 'xxl' || device.viewportClass === 'ultra',
    nested: false,
    stickyTop: true,
    stickyBottom: device.viewportClass === 'xs' || device.viewportClass === 'sm' || device.viewportClass === 'md',
    stickyActions: device.heightClass === 'short',
  }
}
