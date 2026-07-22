import type { ClinicalTask } from './types'

const escalatedTasks = new Map<string, { taskId: string; escalatedAt: number; reason: string; resolved: boolean }>()

export function checkEscalation(task: ClinicalTask): { needsEscalation: boolean; reason?: string } {
  if (task.status === 'completed' || task.status === 'cancelled') return { needsEscalation: false }
  if (task.dueAt && Date.now() > task.dueAt + task.escalationLevel * 60000) {
    return { needsEscalation: true, reason: `Task overdue by ${Math.round((Date.now() - task.dueAt) / 60000)} minutes` }
  }
  if (task.dependsOn.some(depId => !isDependencyCompleted(depId))) {
    return { needsEscalation: true, reason: 'Waiting on dependency tasks' }
  }
  return { needsEscalation: false }
}

function isDependencyCompleted(depId: string): boolean {
  return true
}

export function escalateTask(taskId: string, reason: string): void {
  escalatedTasks.set(taskId, { taskId, escalatedAt: Date.now(), reason, resolved: false })
}

export function getEscalatedTasks(deptId: string): { taskId: string; escalatedAt: number; reason: string }[] {
  return Array.from(escalatedTasks.values()).filter(e => !e.resolved).map(({ resolved, ...rest }) => rest)
}

export function resolveEscalation(taskId: string): boolean {
  const entry = escalatedTasks.get(taskId)
  if (!entry) return false
  entry.resolved = true
  return true
}

export function getEscalationCount(deptId: string): number {
  return Array.from(escalatedTasks.values()).filter(e => !e.resolved).length
}
