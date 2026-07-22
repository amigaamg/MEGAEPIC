import type { ClinicalTask } from './types'

const tasks = new Map<string, ClinicalTask>()

export function createTask(workflowId: string, type: string, title: string, assignedTo?: string, dueAt?: number): ClinicalTask {
  const task: ClinicalTask = {
    id: `t_${crypto.randomUUID()}`,
    workflowId,
    type,
    title,
    assignedTo,
    status: 'pending',
    dueAt,
    dependsOn: [],
    escalationLevel: 0,
    createdAt: Date.now(),
  }
  tasks.set(task.id, task)
  return task
}

export function completeTask(taskId: string): boolean {
  const task = tasks.get(taskId)
  if (!task) return false
  task.status = 'completed'
  task.completedAt = Date.now()
  return true
}

export function assignTask(taskId: string, workerId: string): boolean {
  const task = tasks.get(taskId)
  if (!task) return false
  task.assignedTo = workerId
  return true
}

export function getTasksByWorker(workerId: string): ClinicalTask[] {
  return Array.from(tasks.values()).filter(t => t.assignedTo === workerId && t.status !== 'completed' && t.status !== 'cancelled')
}

export function getOverdueTasks(deptId: string): ClinicalTask[] {
  return Array.from(tasks.values()).filter(t => t.dueAt && t.dueAt < Date.now() && t.status !== 'completed' && t.status !== 'cancelled')
}

export function getTasksByWorkflow(workflowId: string): ClinicalTask[] {
  return Array.from(tasks.values()).filter(t => t.workflowId === workflowId)
}

export function addDependency(taskId: string, dependsOnTaskId: string): boolean {
  const task = tasks.get(taskId)
  if (!task) return false
  if (!task.dependsOn.includes(dependsOnTaskId)) task.dependsOn.push(dependsOnTaskId)
  return true
}
