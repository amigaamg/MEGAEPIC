import { type AnalyticsMetricData, AnalyticsMetric, AnalyticsDimension } from './types'

const ingestionBuffer = new Map<string, AnalyticsMetricData[]>()

export async function ingestMetricData(metricData: AnalyticsMetricData): Promise<AnalyticsMetricData> {
  const enrichedData: AnalyticsMetricData = {
    ...metricData,
    id: `ingested_${metricData.id}_${Date.now()}`,
    timestamp: Date.now(),
    labels: {
      ...metricData.labels,
      ingestionSource: 'system',
      ingestionTimestamp: Date.now().toString(),
    },
  }

  const key = getDataKey(enrichedData)
  if (!ingestionBuffer.has(key)) {
    ingestionBuffer.set(key, [])
  }

  const existing = ingestionBuffer.get(key) || []
  ingestionBuffer.set(key, [...existing, enrichedData])

  return enrichedData
}

export async function ingestBatch(metricData: AnalyticsMetricData[]): Promise<AnalyticsMetricData[]> {
  const results: AnalyticsMetricData[] = []

  for (const data of metricData) {
    try {
      const result = await ingestMetricData(data)
      results.push(result)
    } catch (error) {
      console.error(`Failed to ingest metric data: ${error}`)
    }
  }

  return results
}

export function getBufferSize(key?: string): number {
  if (key) {
    return ingestionBuffer.get(key)?.length || 0
  }
  let total = 0
  for (const buffer of ingestionBuffer.values()) {
    total += buffer.length
  }
  return total
}

export function getBufferContents(key?: string): AnalyticsMetricData[] {
  if (key) {
    return [...(ingestionBuffer.get(key) || [])]
  }
  const all: AnalyticsMetricData[] = []
  for (const buffer of ingestionBuffer.values()) {
    all.push(...buffer)
  }
  return all
}

export function flushBuffer(key?: string): void {
  if (key) {
    ingestionBuffer.delete(key)
  } else {
    ingestionBuffer.clear()
  }
}

export function getBufferedKeys(): string[] {
  return Array.from(ingestionBuffer.keys())
}

export function getDataKey(data: AnalyticsMetricData): string {
  return `${data.metric}_${data.dimension}`
}

export default {
  ingestMetricData,
  ingestBatch,
  getBufferSize,
  getBufferContents,
  flushBuffer,
  getBufferedKeys,
  getDataKey,
}