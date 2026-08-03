import { type AnalyticsMetricData, type AnalyticsAlert, AnalyticsMetric, AnalyticsDimension, AnalyticsAlertCondition, AnalyticsTimeframe } from './types'

const alerts: AnalyticsAlert[] = []

export function evaluateAlerts(
  data: AnalyticsMetricData[],
  alerts: AnalyticsAlert[],
): AnalyticsAlert[] {
  const triggeredAlerts: AnalyticsAlert[] = []

  for (const alert of alerts) {
    if (!alert.isActive) continue

    const matchingData = data.filter(d => {
      if (alert.condition.metric && d.metric !== alert.condition.metric) return false
      if (alert.condition.dimension && d.dimension !== alert.condition.dimension) return false
      return true
    })

    if (matchingData.length === 0) continue

    let alertTriggered = false
    const metricValues = matchingData.map(d => d.value)

    switch (alert.condition.operator) {
      case AnalyticsAlertCondition.GreaterThan:
        alertTriggered = metricValues.some(v => v > alert.condition.threshold)
        break
      case AnalyticsAlertCondition.LessThan:
        alertTriggered = metricValues.some(v => v < alert.condition.threshold)
        break
      case AnalyticsAlertCondition.EqualTo:
        alertTriggered = metricValues.some(v => v === alert.condition.threshold)
        break
      case AnalyticsAlertCondition.NotEqualTo:
        alertTriggered = metricValues.some(v => v !== alert.condition.threshold)
        break
      case AnalyticsAlertCondition.GreaterThanOrEqualTo:
        alertTriggered = metricValues.some(v => v >= alert.condition.threshold)
        break
      case AnalyticsAlertCondition.LessThanOrEqualTo:
        alertTriggered = metricValues.some(v => v <= alert.condition.threshold)
        break
      case AnalyticsAlertCondition.Contains:
        alertTriggered = metricValues.some(v => String(v).includes(String(alert.condition.threshold)))
        break
      case AnalyticsAlertCondition.NotContains:
        alertTriggered = metricValues.some(v => !String(v).includes(String(alert.condition.threshold)))
        break
      case AnalyticsAlertCondition.Between:
        alertTriggered = metricValues.some(v => v >= alert.condition.threshold && v <= alert.condition.threshold)
        break
      case AnalyticsAlertCondition.NotBetween:
        alertTriggered = metricValues.some(v => v < alert.condition.threshold || v > alert.condition.threshold)
        break
      case AnalyticsAlertCondition.IsNull:
        alertTriggered = metricValues.some(v => v === null || v === undefined)
        break
      case AnalyticsAlertCondition.IsNotNull:
        alertTriggered = metricValues.some(v => v !== null && v !== undefined)
        break
      case AnalyticsAlertCondition.IsTrue:
        alertTriggered = metricValues.some(v => v !== 0)
        break
      case AnalyticsAlertCondition.IsFalse:
        alertTriggered = metricValues.some(v => v === 0)
        break
    }

    if (alertTriggered) {
      alert.lastTriggeredAt = Date.now()
      alert.triggeredCount++
      triggeredAlerts.push({ ...alert })
    }
  }

  return triggeredAlerts
}

export function createAlert(alert: Omit<AnalyticsAlert, 'id' | 'createdAt' | 'triggeredCount'>): AnalyticsAlert {
  const newAlert: AnalyticsAlert = {
    ...alert,
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    triggeredCount: 0,
  }

  alerts.push(newAlert)
  return newAlert
}

export function getAlert(id: string): AnalyticsAlert | undefined {
  return alerts.find(a => a.id === id)
}

export function getAlertsByOrganization(orgId: string): AnalyticsAlert[] {
  return alerts.filter(a => a.organizationId === orgId)
}

export function getActiveAlerts(orgId: string): AnalyticsAlert[] {
  return alerts.filter(a => a.organizationId === orgId && a.isActive)
}

export function updateAlert(id: string, updates: Partial<AnalyticsAlert>): AnalyticsAlert | undefined {
  const alert = alerts.find(a => a.id === id)
  if (alert) {
    Object.assign(alert, updates)
    return alert
  }
  return undefined
}

export function deleteAlert(id: string): boolean {
  const index = alerts.findIndex(a => a.id === id)
  if (index >= 0) {
    alerts.splice(index, 1)
    return true
  }
  return false
}

export function enableAlert(id: string): AnalyticsAlert | undefined {
  const alert = alerts.find(a => a.id === id)
  if (alert) {
    alert.isActive = true
    return alert
  }
  return undefined
}

export function disableAlert(id: string): AnalyticsAlert | undefined {
  const alert = alerts.find(a => a.id === id)
  if (alert) {
    alert.isActive = false
    return alert
  }
  return undefined
}

export function getAlertStats(): {
  totalAlerts: number
  activeAlerts: number
  totalTriggers: number
  alertsBySeverity: Record<'critical' | 'high' | 'medium' | 'low', number>
} {
  const alertsBySeverity: Record<'critical' | 'high' | 'medium' | 'low', number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  }

  for (const alert of alerts) {
    alertsBySeverity[alert.severity]++
  }

  return {
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter(a => a.isActive).length,
    totalTriggers: alerts.reduce((sum, a) => sum + a.triggeredCount, 0),
    alertsBySeverity,
  }
}

export default {
  evaluateAlerts,
  createAlert,
  getAlert,
  getAlertsByOrganization,
  getActiveAlerts,
  updateAlert,
  deleteAlert,
  enableAlert,
  disableAlert,
  getAlertStats,
}