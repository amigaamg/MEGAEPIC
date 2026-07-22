import type { Workflow } from './types'

const clinicalClocks = new Map<string, { workflowId: string; targetMinutes: number; startedAt: number; completed: boolean }>()

export function startClock(workflow: Workflow, targetMinutes: number): string {
  const id = `clk_${crypto.randomUUID()}`
  clinicalClocks.set(id, { workflowId: workflow.id, targetMinutes, startedAt: Date.now(), completed: false })
  return id
}

export function getClockStatus(clockId: string): { elapsed: number; remaining: number; overdue: boolean; completed: boolean } {
  const clock = clinicalClocks.get(clockId)
  if (!clock) return { elapsed: 0, remaining: 0, overdue: false, completed: true }
  const elapsed = (Date.now() - clock.startedAt) / 60000
  return { elapsed: Math.round(elapsed), remaining: Math.max(0, clock.targetMinutes - Math.round(elapsed)), overdue: elapsed > clock.targetMinutes, completed: clock.completed }
}

export function getOverdueWorkflows(): string[] {
  const overdue: string[] = []
  for (const [, clock] of clinicalClocks) {
    if (!clock.completed) {
      const elapsed = (Date.now() - clock.startedAt) / 60000
      if (elapsed > clock.targetMinutes) overdue.push(clock.workflowId)
    }
  }
  return overdue
}

export function completeClock(clockId: string): boolean {
  const clock = clinicalClocks.get(clockId)
  if (!clock) return false
  clock.completed = true
  return true
}

export function formatClockTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}
