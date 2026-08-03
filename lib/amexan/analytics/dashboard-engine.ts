import { type AnalyticsDashboard } from './types'

const dashboards: AnalyticsDashboard[] = []

export function createDashboard(dashboard: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt'>): AnalyticsDashboard {
  const newDashboard: AnalyticsDashboard = {
    ...dashboard,
    id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  dashboards.push(newDashboard)
  return newDashboard
}

export function getDashboard(id: string): AnalyticsDashboard | undefined {
  return dashboards.find(d => d.id === id)
}

export function getDashboardsByOrganization(orgId: string): AnalyticsDashboard[] {
  return dashboards.filter(d => d.organizationId === orgId)
}

export function getPublicDashboards(): AnalyticsDashboard[] {
  return dashboards.filter(d => d.isPublic)
}

export function updateDashboard(id: string, updates: Partial<AnalyticsDashboard>): AnalyticsDashboard | undefined {
  const dashboard = dashboards.find(d => d.id === id)
  if (dashboard) {
    Object.assign(dashboard, updates, { updatedAt: Date.now() })
    return dashboard
  }
  return undefined
}

export function deleteDashboard(id: string): boolean {
  const index = dashboards.findIndex(d => d.id === id)
  if (index >= 0) {
    dashboards.splice(index, 1)
    return true
  }
  return false
}

export function getAllDashboards(): AnalyticsDashboard[] {
  return [...dashboards]
}

export function clearDashboards(): void {
  dashboards.length = 0
}

export default {
  createDashboard,
  getDashboard,
  getDashboardsByOrganization,
  getPublicDashboards,
  updateDashboard,
  deleteDashboard,
  getAllDashboards,
  clearDashboards,
}