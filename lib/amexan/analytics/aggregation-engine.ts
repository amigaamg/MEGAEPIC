import { type AnalyticsMetricData, type AnalyticsAggregation, AnalyticsMetric, AnalyticsDimension, AnalyticsAggregationType, AnalyticsTimeframe } from './types'

const aggregationStore: AnalyticsAggregation[] = []

export async function computeAggregation(
  data: AnalyticsMetricData[],
  metric: AnalyticsMetric,
  dimension: AnalyticsDimension,
  aggregation: AnalyticsAggregationType,
  timeframe: AnalyticsTimeframe,
  granularity?: number,
): Promise<AnalyticsAggregation> {
  const filteredData = data.filter(d => d.metric === metric && d.dimension === dimension)

  if (filteredData.length === 0) {
    throw new Error(`No data found for metric ${metric} and dimension ${dimension}`)
  }

  let value: number
  let sorted: number[] = []

  switch (aggregation) {
    case 'sum':
      value = filteredData.reduce((acc, d) => acc + d.value, 0)
      break
    case 'average':
      value = filteredData.reduce((acc, d) => acc + d.value, 0) / filteredData.length
      break
    case 'min':
      value = Math.min(...filteredData.map(d => d.value))
      break
    case 'max':
      value = Math.max(...filteredData.map(d => d.value))
      break
    case 'count':
      value = filteredData.length
      break
    case 'median':
      sorted = filteredData.map(d => d.value).sort((a, b) => a - b)
      value = sorted[Math.floor(sorted.length / 2)]
      break
    case 'percentile':
      sorted = filteredData.map(d => d.value).sort((a, b) => a - b)
      const percentile = 95
      const index = (percentile / 100) * (sorted.length - 1)
      const lower = Math.floor(index)
      const upper = Math.ceil(index)
      const weight = index - lower
      value = sorted[lower] * (1 - weight) + sorted[upper] * weight
      break
    case 'stddev':
      const avg = filteredData.reduce((acc, d) => acc + d.value, 0) / filteredData.length
      value = Math.sqrt(
        filteredData.reduce((acc, d) => acc + Math.pow(d.value - avg, 2), 0) / filteredData.length
      )
      break
    case 'variance':
      const avg2 = filteredData.reduce((acc, d) => acc + d.value, 0) / filteredData.length
      value = filteredData.reduce((acc, d) => acc + Math.pow(d.value - avg2, 2), 0) / filteredData.length
      break
    case 'rate':
      value = filteredData.length / filteredData[0].timestamp
      break
    case 'percentage':
      value = (filteredData.filter(d => d.value > 0).length / filteredData.length) * 100
      break
    default:
      value = filteredData.reduce((acc, d) => acc + d.value, 0) / filteredData.length
  }

  const result: AnalyticsAggregation = {
    id: `agg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    metric,
    dimension,
    aggregation,
    value,
    timeframe,
    granularity: granularity || 1,
    groupBy: Object.keys(filteredData[0].labels),
    filters: {},
    timestamp: Date.now(),
  }

  aggregationStore.push(result)

  return result
}

export async function computeMultipleAggregations(
  data: AnalyticsMetricData[],
  timeframe: AnalyticsTimeframe,
  granularity?: number,
): Promise<AnalyticsAggregation[]> {
  const result: AnalyticsAggregation[] = []

  const metrics = Array.from(new Set(data.map(d => d.metric)))
  const dimensions = Array.from(new Set(data.map(d => d.dimension)))

  for (const metric of metrics) {
    for (const dimension of dimensions) {
      for (const aggregation of ['sum', 'average', 'min', 'max', 'count', 'median', 'percentile', 'stddev', 'variance', 'rate', 'percentage'] as const) {
        try {
          const aggregationResult = await computeAggregation(
            data,
            metric,
            dimension,
            aggregation as AnalyticsAggregationType,
            timeframe,
            granularity,
          )
          result.push(aggregationResult)
        } catch {
          // Skip aggregations that can't be computed
        }
      }
    }
  }

  return result
}

export function getAggregationsByMetric(data: AnalyticsMetricData[], metric: AnalyticsMetric): AnalyticsAggregation[] {
  return aggregationStore.filter(agg => agg.metric === metric)
}

export function getAllAggregations(): AnalyticsAggregation[] {
  return [...aggregationStore]
}

export default {
  computeAggregation,
  computeMultipleAggregations,
  getAggregationsByMetric,
  getAllAggregations,
}