import { type AnalyticsMetricDefinition, AnalyticsMetric, AnalyticsDimension } from './types'

const metricDefinitions: AnalyticsMetricDefinition[] = []

export function createMetricDefinition(
  definition: Omit<AnalyticsMetricDefinition, 'id' | 'createdAt' | 'updatedAt'>,
): AnalyticsMetricDefinition {
  const newDefinition: AnalyticsMetricDefinition = {
    ...definition,
    id: `metric_def_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  metricDefinitions.push(newDefinition)
  return newDefinition
}

export function getMetricDefinition(id: string): AnalyticsMetricDefinition | undefined {
  return metricDefinitions.find(d => d.id === id)
}

export function getMetricDefinitionsByMetric(metric: AnalyticsMetric): AnalyticsMetricDefinition[] {
  return metricDefinitions.filter(d => d.metric === metric)
}

export function getMetricDefinitionsByDimension(dimension: AnalyticsDimension): AnalyticsMetricDefinition[] {
  return metricDefinitions.filter(d => d.dimension === dimension)
}

export function getMetricDefinitionsByOrganization(orgId: string): AnalyticsMetricDefinition[] {
  return metricDefinitions.filter(d => d.createdBy === orgId)
}

export function updateMetricDefinition(
  id: string,
  updates: Partial<AnalyticsMetricDefinition>,
): AnalyticsMetricDefinition | undefined {
  const definition = metricDefinitions.find(d => d.id === id)
  if (definition) {
    Object.assign(definition, updates, { updatedAt: Date.now() })
    return definition
  }
  return undefined
}

export function deleteMetricDefinition(id: string): boolean {
  const index = metricDefinitions.findIndex(d => d.id === id)
  if (index >= 0) {
    metricDefinitions.splice(index, 1)
    return true
  }
  return false
}

export function getAllMetricDefinitions(): AnalyticsMetricDefinition[] {
  return [...metricDefinitions]
}

export function clearMetricDefinitions(): void {
  metricDefinitions.length = 0
}

export function getSystemMetricDefinitions(): AnalyticsMetricDefinition[] {
  return metricDefinitions.filter(d => d.isSystem)
}

export function getUserMetricDefinitions(userId: string): AnalyticsMetricDefinition[] {
  return metricDefinitions.filter(d => d.createdBy === userId)
}

export default {
  createMetricDefinition,
  getMetricDefinition,
  getMetricDefinitionsByMetric,
  getMetricDefinitionsByDimension,
  getMetricDefinitionsByOrganization,
  updateMetricDefinition,
  deleteMetricDefinition,
  getAllMetricDefinitions,
  clearMetricDefinitions,
  getSystemMetricDefinitions,
  getUserMetricDefinitions,
}