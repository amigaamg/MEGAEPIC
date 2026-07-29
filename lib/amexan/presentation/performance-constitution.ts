import type { PerformanceBudget, DeviceInfo, ViewportClass } from './types'

export const PERFORMANCE_BUDGETS: Record<string, PerformanceBudget> = {
  touch_device: {
    interaction: 50,
    questionDisplay: 100,
    cardExpansion: 150,
    navigation: 300,
    initialPage: 2000,
    realtimeUpdate: 500,
  },
  desktop: {
    interaction: 50,
    questionDisplay: 100,
    cardExpansion: 150,
    navigation: 200,
    initialPage: 1500,
    realtimeUpdate: 300,
  },
  slow_network: {
    interaction: 100,
    questionDisplay: 300,
    cardExpansion: 500,
    navigation: 1000,
    initialPage: 5000,
    realtimeUpdate: 2000,
  },
}

export const PERFORMANCE_TARGETS: Record<ViewportClass, PerformanceBudget> = {
  xs: { interaction: 80, questionDisplay: 200, cardExpansion: 300, navigation: 500, initialPage: 3000, realtimeUpdate: 1000 },
  sm: { interaction: 60, questionDisplay: 150, cardExpansion: 200, navigation: 400, initialPage: 2500, realtimeUpdate: 800 },
  md: { interaction: 50, questionDisplay: 100, cardExpansion: 150, navigation: 300, initialPage: 2000, realtimeUpdate: 500 },
  lg: { interaction: 40, questionDisplay: 80, cardExpansion: 120, navigation: 250, initialPage: 1800, realtimeUpdate: 400 },
  xl: { interaction: 30, questionDisplay: 60, cardExpansion: 100, navigation: 200, initialPage: 1500, realtimeUpdate: 300 },
  xxl: { interaction: 30, questionDisplay: 60, cardExpansion: 100, navigation: 200, initialPage: 1500, realtimeUpdate: 300 },
  ultra: { interaction: 30, questionDisplay: 60, cardExpansion: 100, navigation: 200, initialPage: 1500, realtimeUpdate: 300 },
}

export interface PerformanceReport {
  budget: PerformanceBudget
  actual: Partial<PerformanceBudget>
  violations: string[]
  score: number
}

export function getPerformanceBudget(device: DeviceInfo, networkSpeed?: 'fast' | 'slow'): PerformanceBudget {
  const vcBudget = PERFORMANCE_TARGETS[device.viewportClass]
  if (networkSpeed === 'slow') {
    return {
      interaction: Math.max(vcBudget.interaction, PERFORMANCE_BUDGETS.slow_network.interaction),
      questionDisplay: Math.max(vcBudget.questionDisplay, PERFORMANCE_BUDGETS.slow_network.questionDisplay),
      cardExpansion: Math.max(vcBudget.cardExpansion, PERFORMANCE_BUDGETS.slow_network.cardExpansion),
      navigation: Math.max(vcBudget.navigation, PERFORMANCE_BUDGETS.slow_network.navigation),
      initialPage: Math.max(vcBudget.initialPage, PERFORMANCE_BUDGETS.slow_network.initialPage),
      realtimeUpdate: Math.max(vcBudget.realtimeUpdate, PERFORMANCE_BUDGETS.slow_network.realtimeUpdate),
    }
  }
  return vcBudget
}

export function checkPerformance(actual: Partial<PerformanceBudget>, budget: PerformanceBudget): PerformanceReport {
  const violations: string[] = []
  const keys: (keyof PerformanceBudget)[] = ['interaction', 'questionDisplay', 'cardExpansion', 'navigation', 'initialPage', 'realtimeUpdate']

  for (const key of keys) {
    if (actual[key] !== undefined && actual[key]! > budget[key]) {
      violations.push(`${key}: ${actual[key]}ms exceeds budget of ${budget[key]}ms`)
    }
  }

  const score = Math.max(0, 100 - violations.length * 15)
  return { budget, actual, violations, score }
}
