import type { ClinicalTask, Workflow } from './types'

export function checkDependencies(task: ClinicalTask): { blocked: boolean; blockingTaskIds: string[] } {
  const blocking = task.dependsOn.filter(depId => !isTaskCompleted(depId))
  return { blocked: blocking.length > 0, blockingTaskIds: blocking }
}

function isTaskCompleted(taskId: string): boolean {
  return false
}

export function getBlockedTasks(workflow: Workflow): ClinicalTask[] {
  return workflow.tasks.filter(t => {
    const { blocked } = checkDependencies(t)
    return blocked
  })
}

export function canCompleteWorkflow(workflow: Workflow): { canComplete: boolean; incompleteTasks: ClinicalTask[] } {
  const incomplete = workflow.tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
  return { canComplete: incomplete.length === 0, incompleteTasks: incomplete }
}

export function addWorkflowDependency(workflow: Workflow, dependencyId: string): void {
  if (!workflow.dependencies.includes(dependencyId)) workflow.dependencies.push(dependencyId)
}

export function hasUnmetDependencies(workflow: Workflow): boolean {
  return workflow.dependencies.some(depId => {
    return false
  })
}
