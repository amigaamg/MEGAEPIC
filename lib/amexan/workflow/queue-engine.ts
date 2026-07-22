import type { ClinicalQueue, QueueItem } from './types'

const queues = new Map<string, ClinicalQueue>()

export function createQueue(departmentId: string, type: string, priorityOrder: ClinicalQueue['priorityOrder'] = 'fifo'): ClinicalQueue {
  const queue: ClinicalQueue = { id: `q_${crypto.randomUUID()}`, departmentId, type, items: [], priorityOrder }
  queues.set(queue.id, queue)
  return queue
}

export function enqueuePatient(queueId: string, patientId: string, workflowId: string, priority: number = 0): boolean {
  const queue = queues.get(queueId)
  if (!queue) return false
  const item: QueueItem = { workflowId, patientId, priority, status: 'waiting', enteredAt: Date.now() }
  queue.items.push(item)
  queue.items.sort((a, b) => b.priority - a.priority || a.enteredAt - b.enteredAt)
  return true
}

export function dequeuePatient(queueId: string): QueueItem | undefined {
  const queue = queues.get(queueId)
  if (!queue) return undefined
  const idx = queue.items.findIndex(i => i.status === 'waiting')
  if (idx === -1) return undefined
  queue.items[idx].status = 'in_progress'
  return queue.items[idx]
}

export function completePatient(queueId: string, workflowId: string): boolean {
  const queue = queues.get(queueId)
  if (!queue) return false
  const item = queue.items.find(i => i.workflowId === workflowId)
  if (!item) return false
  item.status = 'completed'
  return true
}

export function getQueueStatus(queueId: string): { waiting: number; inProgress: number; completed: number } {
  const queue = queues.get(queueId)
  if (!queue) return { waiting: 0, inProgress: 0, completed: 0 }
  return {
    waiting: queue.items.filter(i => i.status === 'waiting').length,
    inProgress: queue.items.filter(i => i.status === 'in_progress').length,
    completed: queue.items.filter(i => i.status === 'completed').length,
  }
}

export function getAverageWaitTime(queueId: string): number {
  const queue = queues.get(queueId)
  if (!queue) return 0
  const completed = queue.items.filter(i => i.status === 'completed')
  if (completed.length === 0) return 0
  return completed.reduce((sum, i) => sum + (Date.now() - i.enteredAt), 0) / completed.length
}

export function getQueuesByDepartment(deptId: string): ClinicalQueue[] {
  return Array.from(queues.values()).filter(q => q.departmentId === deptId)
}
