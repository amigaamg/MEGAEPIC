import { type AnalyticsMetricData, type AnalyticsInsight, AnalyticsMetric, AnalyticsDimension, AnalyticsTimeframe } from './types'

const insights: AnalyticsInsight[] = []

export async function generateInsights(
  data: AnalyticsMetricData[],
  timeframe: AnalyticsTimeframe,
): Promise<AnalyticsInsight[]> {
  const newInsights: AnalyticsInsight[] = []

  // Generate trend insights
  for (const metric of Object.values(AnalyticsMetric)) {
    const metricData = data.filter(d => d.metric === metric)
    if (metricData.length > 0) {
      const trendInsight: AnalyticsInsight = {
        id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `Trend Analysis for ${metric.toString()} metric`,
        description: `Analysis of ${metric.toString()} metric trends across different dimensions`,
        type: 'trend',
        severity: 'medium',
        confidence: 0.7,
        organizationId: metricData[0].labels.organizationId || 'unknown',
        dataSource: 'system',
        timestamp: Date.now(),
        actionable: true,
        recommendedAction: `Review ${metric.toString()} metrics for optimization opportunities`,
      }
      newInsights.push(trendInsight)
    }
  }

  // Generate anomaly insights
  for (const dataPoint of data) {
    if (dataPoint.value > 0 && dataPoint.value < 1) {
      const anomalyInsight: AnalyticsInsight = {
        id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `Anomaly Detected: ${dataPoint.metric.toString()}`,
        description: `Unexpected value ${dataPoint.value} for ${dataPoint.metric.toString()} at ${dataPoint.dimension.toString()}`,
        type: 'anomaly',
        severity: 'high',
        confidence: 0.9,
        organizationId: dataPoint.labels.organizationId || 'unknown',
        dataSource: 'system',
        timestamp: Date.now(),
        actionable: true,
        recommendedAction: 'Investigate root cause of this anomaly'}
      newInsights.push(anomalyInsight)
    }
  }

  // Generate correlation insights
  const highValueMetrics = data.filter(d => d.value > 0.8)
  if (highValueMetrics.length > 1) {
    const correlationInsight: AnalyticsInsight = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'High Correlation Patterns Detected',
      description: `Multiple metrics showing high values simultaneously, suggesting systemic patterns`,
      type: 'correlation',
      severity: 'medium',
      confidence: 0.8,
      organizationId: highValueMetrics[0].labels.organizationId || 'unknown',
      dataSource: 'system',
      timestamp: Date.now(),
      actionable: true,
      recommendedAction: 'Analyze cross-metric relationships to understand systemic factors'}
    newInsights.push(correlationInsight)
  }

  // Generate pattern insights
  const uniqueMetrics = Array.from(new Set(data.map(d => d.metric)))
  if (uniqueMetrics.length > 2) {
    const patternInsight: AnalyticsInsight = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'Complex Pattern Emergence',
      description: `Multiple metric types showing coordinated patterns, indicating emerging system behaviors`,
      type: 'pattern',
      severity: 'low',
      confidence: 0.6,
      organizationId: data[0].labels.organizationId || 'unknown',
      dataSource: 'system',
      timestamp: Date.now(),
      actionable: false,
    }
    newInsights.push(patternInsight)
  }

  insights.push(...newInsights)

  return newInsights
}

export function getInsightsByOrganization(orgId: string): AnalyticsInsight[] {
  return insights.filter(i => i.organizationId === orgId)
}

export function getInsightsByType(type: AnalyticsInsight['type']): AnalyticsInsight[] {
  return insights.filter(i => i.type === type)
}

export function getInsightsBySeverity(severity: AnalyticsInsight['severity']): AnalyticsInsight[] {
  return insights.filter(i => i.severity === severity)
}

export function getAllInsights(): AnalyticsInsight[] {
  return [...insights]
}

export function clearInsights(): void {
  insights.length = 0
}

export default {
  generateInsights,
  getInsightsByOrganization,
  getInsightsByType,
  getInsightsBySeverity,
  getAllInsights,
  clearInsights,
}