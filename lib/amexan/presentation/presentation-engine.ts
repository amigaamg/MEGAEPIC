import type { DeviceInfo, PresentationContext, PresentationObject, PerformanceBudget, CardPriority, VisibilityState } from './types'
import { getDeviceInfo, getViewportRules } from './device-constitution'
import { getInteractionRules } from './interaction-constitution'
import { getAccessibilityRules, getAnimDuration } from './accessibility-constitution'
import { getPerformanceBudget } from './performance-constitution'
import { getSidebarConfig, getCardConfig, getButtonConfig, getFormConfig, getTableConfig, getModalConfig, getChartConfig, getColumnCount, getCardWidth, getScrollConfig, getNavigationStyle } from './layout-constitution'
import { resolveVisibility } from './visibility-constitution'
import { getColor } from './color-constitution'
import { getSupportedFeatures, getProgressiveEnhancement } from './browser-constitution'

export interface EngineOutput {
  cards: EngineCard[]
  sections: EngineSection[]
  actions: EngineAction[]
}

export interface EngineCard {
  id: string
  type: string
  title?: string
  priority: CardPriority
  importance: number
  data: unknown
  metadata?: Record<string, unknown>
}

export interface EngineSection {
  id: string
  title: string
  cards: string[]
  priority: CardPriority
}

export interface EngineAction {
  id: string
  label: string
  type: string
  primary: boolean
  icon?: string
}

export interface PresentationOutput {
  device: DeviceInfo
  layout: {
    columns: number
    sidebar: ReturnType<typeof getSidebarConfig>
    navigation: ReturnType<typeof getNavigationStyle>
    scroll: ReturnType<typeof getScrollConfig>
  }
  cards: PresentationObject[]
  sections: {
    id: string
    title: string
    cards: PresentationObject[]
    priority: CardPriority
  }[]
  actions: {
    visible: PresentationObject[]
    collapsed: PresentationObject[]
    config: ReturnType<typeof getButtonConfig>
  }
  theme: {
    colors: Record<string, string>
    accessibility: ReturnType<typeof getAccessibilityRules>
  }
  performance: {
    budget: PerformanceBudget
    strategy: 'lazy' | 'eager' | 'progressive'
  }
  browser: ReturnType<typeof getProgressiveEnhancement>
}

export function createPresentationContext(overrides?: Partial<PresentationContext>): PresentationContext {
  return {
    device: getDeviceInfo(),
    role: 'patient',
    journey: 'default',
    phase: 'overview',
    content: null,
    preferences: {},
    ...overrides,
  }
}

export function renderPresentation(engineOutput: EngineOutput, context: PresentationContext): PresentationOutput {
  const device = context.device
  const rules = getViewportRules(device.viewportClass)
  const interaction = getInteractionRules(device)
  const accessibility = getAccessibilityRules(device)
  const performance = getPerformanceBudget(device)
  const animDuration = getAnimDuration(device, 200)

  const resolvedCards: PresentationObject[] = engineOutput.cards.map(card => {
    const visibility = resolveVisibility({
      priority: card.priority,
      device,
      role: context.role,
      hasData: card.data !== null && card.data !== undefined,
      isPinned: false,
      isReadonly: false,
      isDisabled: false,
      isLoaded: true,
      conditionMet: true,
    })

    const cardLayout = getCardConfig({
      priority: card.priority,
      importance: card.importance,
      role: context.role,
      visibility: visibility.state,
      expandable: true,
      lazyLoad: card.priority !== 'critical',
      realtime: false,
      editable: false,
      readOnly: false,
      pinned: false,
    }, device)

    const semanticColor = card.priority === 'critical' ? 'critical'
      : card.priority === 'high' ? 'attention'
      : card.priority === 'medium' ? 'info'
      : 'inactive'

    return {
      id: card.id,
      type: 'card',
      priority: card.priority,
      visibility: visibility.state,
      layout: {
        columns: rules.columns,
        sidebar: rules.sidebar,
        cardWidth: rules.cardWidth,
        maxActions: rules.maxFabs,
        formColumns: rules.formColumns,
      },
      content: {
        title: card.title,
        data: card.data,
        metadata: card.metadata,
        cardConfig: cardLayout,
        animDuration,
      },
      theme: {
        color: semanticColor,
      },
      interaction: {
        touch: interaction.mode === 'touch' || interaction.mode === 'ink',
        hover: interaction.mode === 'hover',
        pen: interaction.mode === 'ink',
        minTouchSize: interaction.minTargetSize,
      },
      performance: {
        lazyLoad: cardLayout.lazyLoad,
        realtime: false,
        preload: card.priority === 'critical',
      },
      accessibility: {
        label: card.title || card.id,
        role: 'region',
        keyboardNav: accessibility.keyboardNav,
      },
    }
  })

  const resolvedSections = engineOutput.sections.map(section => ({
    id: section.id,
    title: section.title,
    priority: section.priority,
    cards: resolvedCards.filter(c => section.cards.includes(c.id)),
  }))

  const visibleActions: PresentationObject[] = []
  const collapsedActions: PresentationObject[] = []

  engineOutput.actions.forEach((action, index) => {
    const isPrimary = action.primary
    const maxVisible = rules.maxFabs
    const shouldCollapse = index >= maxVisible

    const actionObj: PresentationObject = {
      id: action.id,
      type: 'button',
      priority: isPrimary ? 'critical' : 'medium',
      visibility: shouldCollapse ? 'collapsed' : 'expanded',
      layout: {
        columns: rules.columns,
        sidebar: rules.sidebar,
        cardWidth: rules.cardWidth,
        maxActions: rules.maxFabs,
        formColumns: rules.formColumns,
      },
      content: {
        label: action.label,
        actionType: action.type,
        primary: action.primary,
        icon: action.icon,
        buttonType: isPrimary ? 'primary' : 'ghost',
        minTouchSize: interaction.minTargetSize,
      },
      theme: { color: isPrimary ? 'info' : 'inactive' },
      interaction: {
        touch: true,
        hover: interaction.mode === 'hover',
        pen: interaction.mode === 'ink',
        minTouchSize: interaction.minTargetSize,
      },
      performance: { lazyLoad: false, realtime: false, preload: isPrimary },
      accessibility: {
        label: action.label,
        role: 'button',
        keyboardNav: accessibility.keyboardNav,
      },
    }

    if (shouldCollapse) collapsedActions.push(actionObj)
    else visibleActions.push(actionObj)
  })

  const scrollConfig = getScrollConfig(device)

  return {
    device,
    layout: {
      columns: getColumnCount(device),
      sidebar: getSidebarConfig(device),
      navigation: getNavigationStyle(device),
      scroll: scrollConfig,
    },
    cards: resolvedCards,
    sections: resolvedSections,
    actions: {
      visible: visibleActions,
      collapsed: collapsedActions,
      config: getButtonConfig(device, engineOutput.actions.length),
    },
    theme: {
      colors: {
        primary: getColor('info', device),
        normal: getColor('normal', device),
        warning: getColor('warning', device),
        critical: getColor('critical', device),
        education: getColor('education', device),
        inactive: getColor('inactive', device),
        background: device.colorScheme === 'dark' ? '#0f172a' : '#ffffff',
        surface: device.colorScheme === 'dark' ? '#1e293b' : '#f8fafc',
        text: device.colorScheme === 'dark' ? '#f1f5f9' : '#0f172a',
      },
      accessibility,
    },
    performance: {
      budget: performance,
      strategy: device.viewportClass === 'xs' || device.viewportClass === 'sm' ? 'lazy' : 'progressive',
    },
    browser: getProgressiveEnhancement(device),
  }
}

export function withPresentation(engineOutput: EngineOutput, context?: Partial<PresentationContext>): PresentationOutput {
  const fullContext = createPresentationContext(context)
  return renderPresentation(engineOutput, fullContext)
}
