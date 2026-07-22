import { type Workflow, PatientState } from './types'

const parallelWorkflows = new Map<string, Workflow[]>()

export function createParallelWorkflow(patientId: string, states: PatientState[]): Workflow[] {
  const workflows: Workflow[] = states.map(state => ({
    id: `wf_${crypto.randomUUID()}`,
    patientId,
    currentState: state,
    previousStates: [],
    owner: '',
    priority: 0,
    dependencies: [],
    clock: 0,
    tasks: [],
    escalationLevel: 0,
    createdAt: Date.now(),
  }))
  parallelWorkflows.set(patientId, workflows)
  return workflows
}

export function getPatientWorkflows(patientId: string): Workflow[] {
  return parallelWorkflows.get(patientId) ?? []
}

export function completeParallelWorkflow(patientId: string, workflowId: string): boolean {
  const workflows = parallelWorkflows.get(patientId)
  if (!workflows) return false
  const idx = workflows.findIndex(w => w.id === workflowId)
  if (idx === -1) return false
  workflows.splice(idx, 1)
  if (workflows.length === 0) parallelWorkflows.delete(patientId)
  else parallelWorkflows.set(patientId, workflows)
  return true
}

export function allParallelComplete(patientId: string): boolean {
  return (parallelWorkflows.get(patientId)?.length ?? 0) === 0
}

export function getActiveStateCount(patientId: string): number {
  return parallelWorkflows.get(patientId)?.length ?? 0
}
