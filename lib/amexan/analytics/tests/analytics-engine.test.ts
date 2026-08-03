import AnalyticsEngine from '../analytics-engine'
import { type AnalyticsMetricData, AnalyticsMetric, AnalyticsDimension, AnalyticsTimeframe } from '../types'

describe('AnalyticsEngine', () => {
  beforeEach(() => {
    AnalyticsEngine.clearAnalytics()
  })

  test('should process metric data', async () => {
    const metricData: AnalyticsMetricData = {
      id: 'metric-1',
      metric: AnalyticsMetric.Counter,
      dimension: AnalyticsDimension.User,
      value: 100,
      timestamp: Date.now(),
      labels: { organizationId: 'org-1', userId: 'user-1' },
    }

    const result = await AnalyticsEngine.processMetricData(metricData)

    expect(result.id).toBeDefined()
    expect(result.value).toBe(100)
  })

  test('should ingest data', async () => {
    const metricData: AnalyticsMetricData = {
      id: 'metric-1',
      metric: AnalyticsMetric.Counter,
      dimension: AnalyticsDimension.User,
      value: 50,
      timestamp: Date.now(),
      labels: { organizationId: 'org-1', userId: 'user-1' },
    }

    const results = await AnalyticsEngine.ingestData([metricData])

    expect(results.length).toBeGreaterThan(0)
    expect(results[0].value).toBe(50)
  })

  test('should get metric data', async () => {
    const metricData: AnalyticsMetricData = {
      id: 'metric-1',
      metric: AnalyticsMetric.Counter,
      dimension: AnalyticsDimension.User,
      value: 75,
      timestamp: Date.now(),
      labels: { organizationId: 'org-1', userId: 'user-1' },
    }

    await AnalyticsEngine.processMetricData(metricData)
    const results = AnalyticsEngine.getMetricData()

    expect(results.length).toBeGreaterThan(0)
  })

  test('should compute aggregations', async () => {
    const metricData: AnalyticsMetricData = {
      id: 'metric-1',
      metric: AnalyticsMetric.Counter,
      dimension: AnalyticsDimension.User,
      value: 100,
      timestamp: Date.now(),
      labels: { organizationId: 'org-1', userId: 'user-1' },
    }

    await AnalyticsEngine.processMetricData(metricData)
    const aggregations = await AnalyticsEngine.computeAggregations([metricData], AnalyticsTimeframe.Hour)

    expect(aggregations.length).toBeGreaterThan(0)
    expect(aggregations[0].value).toBeDefined()
  })

  test('should get analytics stats', async () => {
    const metricData: AnalyticsMetricData = {
      id: 'metric-1',
      metric: AnalyticsMetric.Counter,
      dimension: AnalyticsDimension.User,
      value: 200,
      timestamp: Date.now(),
      labels: { organizationId: 'org-1', userId: 'user-1' },
    }

    await AnalyticsEngine.processMetricData(metricData)
    const stats = AnalyticsEngine.getAnalyticsStats()

    expect(stats.totalMetrics).toBeGreaterThan(0)
  })
})