import { type AnalyticsMetricData, type AnalyticsAggregation, AnalyticsMetric, AnalyticsDimension, AnalyticsAggregationType as Aggregation, AnalyticsTimeframe, AnalyticsConfig } from './types'
import { ingestMetricData } from './ingestion-engine'
import { computeAggregation } from './aggregation-engine'
import { evaluateAlerts } from './alert-engine'
import { generateInsights } from './insight-engine'
import { createDashboard } from './dashboard-engine'
import { createReport } from './report-engine'
import { clearMetricDefinitions } from './metric-definition-engine'

let config: AnalyticsConfig = {
  enableRealTimeAnalytics: true,
  analyticsRetentionDays: 90,
  enableAlerts: true,
  enableDashboards: true,
  enableReports: true,
  enableMetricDefinitions: true,
  enableDataSources: false,
  metricDefinition: {
    autoDiscover: true,
    discoveryIntervalMinutes: 60,
  },
  alerting: {
    enableEmailAlerts: true,
    enableInAppAlerts: true,
    enableWebhookAlerts: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  },
  dashboard: {
    refreshInterval: 30000,
    autoRefresh: true,
  },
  report: {
    enableScheduledReports: true,
    reportGenerationTimeoutMs: 300000,
  },
}

const metricStore: AnalyticsMetricData[] = []
const aggregationStore: AnalyticsAggregation[] = []

export function getConfig(): AnalyticsConfig {
  return { ...config }
}

export function updateConfig(newConfig: Partial<AnalyticsConfig>): void {
  config = { ...config, ...newConfig }
}

export async function processMetricData(metricData: Omit<AnalyticsMetricData, 'id' | 'timestamp'>): Promise<AnalyticsMetricData> {
  const processedData: AnalyticsMetricData = {
    ...metricData,
    id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  }

  metricStore.push(processedData)

  const aggregations = await computeAggregations([processedData], AnalyticsTimeframe.Day)
  aggregationStore.push(...aggregations)

  const alerts = await evaluateAlerts([processedData], [])
  if (alerts.length > 0) {
    console.log(`Alerts generated: ${alerts.length}`)
  }

  const insights = await generateInsights([processedData], AnalyticsTimeframe.Day)
  if (insights.length > 0) {
    console.log(`Insights generated: ${insights.length}`)
  }

  return processedData
}

export async function ingestData(metricData: Omit<AnalyticsMetricData, 'id' | 'timestamp'>[]): Promise<AnalyticsMetricData[]> {
  const results: AnalyticsMetricData[] = []

  for (const data of metricData) {
    try {
      const result = await processMetricData(data)
      results.push(result)
    } catch (error) {
      console.error(`Failed to process metric data: ${error}`)
    }
  }

  return results
}

export function getMetricData(filters?: Partial<AnalyticsMetricData>): AnalyticsMetricData[] {
  let filtered = metricStore

  if (filters) {
    filtered = filtered.filter(data => {
      if (filters.metric && data.metric !== filters.metric) return false
      if (filters.dimension && data.dimension !== filters.dimension) return false
      if (filters.value && data.value !== filters.value) return false
      if (filters.labels) {
      const labels = filters.labels
      if (Object.keys(labels).some(k => data.labels[k] !== labels[k])) return false
    }
      return true
    })
  }

  return filtered
}

export function getAggregations(filters?: Partial<AnalyticsAggregation>): AnalyticsAggregation[] {
  let filtered = aggregationStore

  if (filters) {
    filtered = filtered.filter(data => {
      if (filters.metric !== undefined && data.metric !== filters.metric) return false
      if (filters.dimension !== undefined && data.dimension !== filters.dimension) return false
      if (filters.aggregation !== undefined && data.aggregation !== filters.aggregation) return false
      return true
    })
  }

  return filtered
}

export async function computeAggregations(metricData: AnalyticsMetricData[], timeframe: AnalyticsTimeframe, granularity?: number): Promise<AnalyticsAggregation[]> {
  const metricsByDimension = new Map<AnalyticsDimension, AnalyticsMetricData[]>()

  for (const data of metricData) {
    if (!metricsByDimension.has(data.dimension)) {
      metricsByDimension.set(data.dimension, [])
    }
    metricsByDimension.get(data.dimension)!.push(data)
  }

  const aggregations: AnalyticsAggregation[] = []

  for (const [dimension, data] of metricsByDimension) {
    const sum = data.reduce((acc, d) => acc + d.value, 0)
    const count = data.length
    const average = sum / count
    const min = Math.min(...data.map(d => d.value))
    const max = Math.max(...data.map(d => d.value))
    const median = data.sort((a, b) => a.value - b.value)[Math.floor(count / 2)].value

    aggregations.push({
      id: `agg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metric: data[0].metric,
      dimension,
      aggregation: Aggregation.Average,
      value: average,
      timeframe,
      granularity: granularity || 1,
      groupBy: Object.keys(data[0].labels),
      timestamp: Date.now(),
    })
  }

  return aggregations
}

export function getMetricsByMetric(metric: AnalyticsMetric): AnalyticsMetricData[] {
  return metricStore.filter(d => d.metric === metric)
}

export function getMetricsByDimension(dimension: AnalyticsDimension): AnalyticsMetricData[] {
  return metricStore.filter(d => d.dimension === dimension)
}

export async function getMetricStats(metric: AnalyticsMetric, dimension?: AnalyticsDimension): Promise<{
  totalCount: number
  average: number
  min: number
  max: number
  sum: number
  median: number
}> {
  let filtered = metricStore.filter(d => d.metric === metric)

  if (dimension) {
    filtered = filtered.filter(d => d.dimension === dimension)
  }

  const values = filtered.map(d => d.value)

  return {
    totalCount: values.length,
    average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
    min: values.length > 0 ? Math.min(...values) : 0,
    max: values.length > 0 ? Math.max(...values) : 0,
    sum: values.reduce((a, b) => a + b, 0),
    median: values.length > 0 ? values.sort((a, b) => a - b)[Math.floor(values.length / 2)] : 0,
  }
}

export function clearAnalytics(): void {
  metricStore.length = 0
  aggregationStore.length = 0
}

export function getAnalyticsStats(): {
  totalMetrics: number
  totalAggregations: number
  metricsByMetric: Record<AnalyticsMetric, number>
  metricsByDimension: Record<AnalyticsDimension, number>
} {
  const metricsByMetric: Record<AnalyticsMetric, number> = {} as Record<AnalyticsMetric, number>
  const metricsByDimension: Record<AnalyticsDimension, number> = {} as Record<AnalyticsDimension, number>

  for (const metric of Object.values(AnalyticsMetric)) {
    metricsByMetric[metric] = 0
  }
  for (const dimension of Object.values(AnalyticsDimension)) {
    metricsByDimension[dimension] = 0
  }

  for (const data of metricStore) {
    metricsByMetric[data.metric]++
    metricsByDimension[data.dimension]++
  }

  return {
    totalMetrics: metricStore.length,
    totalAggregations: aggregationStore.length,
    metricsByMetric,
    metricsByDimension,
  }
}

export default {
  getConfig,
  updateConfig,
  processMetricData,
  ingestData,
  getMetricData,
  getAggregations,
  computeAggregations,
  getMetricsByMetric,
  getMetricsByDimension,
  getMetricStats,
  clearAnalytics,
  getAnalyticsStats,
}