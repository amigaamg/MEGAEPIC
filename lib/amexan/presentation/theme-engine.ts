import type { DeviceInfo, ViewportClass, SemanticColor } from './types'
import { SEMANTIC_COLORS, DARK_MODE_OVERRIDES, getColor } from './color-constitution'
import { getAccessibilityRules } from './accessibility-constitution'
import { getSidebarConfig } from './layout-constitution'
import { getViewportRules } from './device-constitution'

export interface BrandConfig {
  facilityName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logoUrl?: string
  faviconUrl?: string
  fontFamily?: string
}

export interface ThemeOverride {
  mode?: 'light' | 'dark' | 'auto'
  fontScale?: number
  density?: 'comfortable' | 'compact' | 'spacious'
  borderRadius?: number
  customCss?: Record<string, string>
}

export interface RoleTheme {
  role: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  iconSet: string
  layout: 'sidebar' | 'topbar' | 'combined' | 'minimal'
  showPatientList: boolean
  showSearch: boolean
  showNotifications: boolean
}

export interface ThemeContext {
  role: string
  brand: BrandConfig
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    muted: string
    border: string
    info: string
    normal: string
    attention: string
    warning: string
    critical: string
    education: string
    inactive: string
  }
  layout: {
    sidebar: ReturnType<typeof getSidebarConfig>
    columns: number
    navigation: string
    density: string
    borderRadius: number
  }
  typography: {
    fontFamily: string
    fontSize: number
    fontScale: number
    lineHeight: number
    letterSpacing: number
  }
  accessibility: ReturnType<typeof getAccessibilityRules>
  mode: 'light' | 'dark'
}

const ROLE_THEMES: Record<string, Partial<RoleTheme>> = {
  doctor: { primaryColor: '#2563eb', secondaryColor: '#1d4ed8', layout: 'sidebar', showPatientList: true },
  nurse: { primaryColor: '#059669', secondaryColor: '#047857', layout: 'sidebar', showPatientList: true },
  student: { primaryColor: '#7c3aed', secondaryColor: '#6d28d9', layout: 'sidebar', showPatientList: false },
  patient: { primaryColor: '#0891b2', secondaryColor: '#0e7490', layout: 'topbar', showPatientList: false },
  pharmacist: { primaryColor: '#d97706', secondaryColor: '#b45309', layout: 'sidebar', showPatientList: false },
  administrator: { primaryColor: '#475569', secondaryColor: '#334155', layout: 'sidebar', showPatientList: false },
  community_health_worker: { primaryColor: '#16a34a', secondaryColor: '#15803d', layout: 'topbar', showPatientList: false },
  researcher: { primaryColor: '#6366f1', secondaryColor: '#4f46e5', layout: 'sidebar', showPatientList: false },
}

const FACILITY_PRESETS: Record<string, BrandConfig> = {
  default: { facilityName: 'Healthcare Facility', primaryColor: '#2563eb', secondaryColor: '#4f46e5', accentColor: '#06b6d4', fontFamily: 'Inter, system-ui, sans-serif' },
}

export function getBrand(facilityType?: string): BrandConfig {
  return FACILITY_PRESETS[facilityType || 'default'] || FACILITY_PRESETS.default
}

export function getRoleTheme(role: string): Partial<RoleTheme> {
  return ROLE_THEMES[role] || ROLE_THEMES.patient!
}

export function buildThemeContext(params: {
  role: string
  brand?: BrandConfig
  device: DeviceInfo
  overrides?: ThemeOverride
}): ThemeContext {
  const { role, device, overrides } = params
  const brand = params.brand || getBrand()
  const roleTheme = getRoleTheme(role)
  const vc = device.viewportClass
  const rules = getViewportRules(vc)
  const accessibility = getAccessibilityRules(device)
  const sidebar = getSidebarConfig(device)
  const mode = overrides?.mode === 'auto' ? device.colorScheme : overrides?.mode || device.colorScheme

  const density = overrides?.density || (vc === 'xs' || vc === 'sm' ? 'compact' : 'comfortable')
  const borderRadius = overrides?.borderRadius ?? (vc === 'xs' ? 6 : vc === 'sm' ? 8 : 12)
  const fontScale = overrides?.fontScale || (device.prefersHighContrast ? 1.125 : 1)

  return {
    role,
    brand,
    colors: {
      primary: roleTheme.primaryColor || brand.primaryColor,
      secondary: roleTheme.secondaryColor || brand.secondaryColor,
      accent: roleTheme.accentColor || brand.accentColor,
      background: mode === 'dark' ? '#0f172a' : '#ffffff',
      surface: mode === 'dark' ? '#1e293b' : '#f8fafc',
      text: mode === 'dark' ? '#f1f5f9' : '#0f172a',
      muted: mode === 'dark' ? '#64748b' : '#94a3b8',
      border: mode === 'dark' ? '#334155' : '#e2e8f0',
      info: getColor('info', device),
      normal: getColor('normal', device),
      attention: getColor('attention', device),
      warning: getColor('warning', device),
      critical: getColor('critical', device),
      education: getColor('education', device),
      inactive: getColor('inactive', device),
    },
    layout: {
      sidebar,
      columns: rules.columns,
      navigation: rules.navigation,
      density,
      borderRadius,
    },
    typography: {
      fontFamily: brand.fontFamily || 'Inter, system-ui, sans-serif',
      fontSize: accessibility.fontSize,
      fontScale,
      lineHeight: accessibility.lineHeight,
      letterSpacing: accessibility.letterSpacing,
    },
    accessibility,
    mode,
  }
}

export function generateCssVariables(ctx: ThemeContext): Record<string, string> {
  return {
    '--color-primary': ctx.colors.primary,
    '--color-secondary': ctx.colors.secondary,
    '--color-accent': ctx.colors.accent,
    '--color-background': ctx.colors.background,
    '--color-surface': ctx.colors.surface,
    '--color-text': ctx.colors.text,
    '--color-muted': ctx.colors.muted,
    '--color-border': ctx.colors.border,
    '--color-info': ctx.colors.info,
    '--color-normal': ctx.colors.normal,
    '--color-attention': ctx.colors.attention,
    '--color-warning': ctx.colors.warning,
    '--color-critical': ctx.colors.critical,
    '--color-education': ctx.colors.education,
    '--color-inactive': ctx.colors.inactive,
    '--font-family': ctx.typography.fontFamily,
    '--font-size': `${ctx.typography.fontSize}px`,
    '--font-scale': String(ctx.typography.fontScale),
    '--line-height': String(ctx.typography.lineHeight),
    '--letter-spacing': `${ctx.typography.letterSpacing}em`,
    '--border-radius': `${ctx.layout.borderRadius}px`,
    '--density': ctx.layout.density,
    '--sidebar-mode': ctx.layout.sidebar.mode,
    '--sidebar-width': `${ctx.layout.sidebar.width}px`,
    '--layout-columns': String(ctx.layout.columns),
    '--focus-ring-width': `${ctx.accessibility.focusRingWidth}px`,
    '--min-touch-target': `${ctx.accessibility.touchTarget}px`,
    '--anim-speed': ctx.accessibility.reducedMotion ? '0ms' : '150ms',
  }
}

export function getLayoutForRole(role: string): string {
  return getRoleTheme(role).layout || 'sidebar'
}
