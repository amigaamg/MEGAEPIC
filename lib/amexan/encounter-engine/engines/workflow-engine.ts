// ═══════════════════════════════════════════════════════════════════════════════
// Workflow Engine
// Creates and manages clinical workflow tasks based on encounter type
// and departmental context.
// ═══════════════════════════════════════════════════════════════════════════════

export type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'deferred'
export type WorkflowPriority = 'low' | 'medium' | 'high'

export interface WorkflowTask {
  id: string
  task: string
  assignedTo: string
  status: WorkflowStatus
  priority: WorkflowPriority
  dueBy?: number
  dependsOn?: string[]
}

export interface WorkflowContext {
  department: string
  age: number
  triageCategory?: string
}

const DEPARTMENT_WORKFLOWS: Record<string, Array<{
  task: string
  assignedTo: string
  priority: WorkflowPriority
  dependsOn?: string[]
  onlyIf?: (ctx: WorkflowContext) => boolean
}>> = {
  emergency: [
    { task: 'Triage assessment and vital signs', assignedTo: 'nurse', priority: 'high' },
    { task: 'Primary survey (ABCDE)', assignedTo: 'clinician', priority: 'high', dependsOn: ['wf_triage'] },
    { task: 'Order initial investigations', assignedTo: 'clinician', priority: 'high', dependsOn: ['wf_primary_survey'] },
    { task: 'Administer emergency medications', assignedTo: 'nurse', priority: 'high', dependsOn: ['wf_primary_survey'] },
    { task: 'Consult relevant specialty', assignedTo: 'clinician', priority: 'medium', dependsOn: ['wf_investigations'] },
    { task: 'Document clinical notes', assignedTo: 'clinician', priority: 'medium' },
    { task: 'Disposition decision (admit/discharge)', assignedTo: 'clinician', priority: 'medium', dependsOn: ['wf_consult'] },
  ],
  inpatient: [
    { task: 'Admission nursing assessment', assignedTo: 'nurse', priority: 'high' },
    { task: 'Admission history and physical', assignedTo: 'clinician', priority: 'high', dependsOn: ['wf_admission_nursing'] },
    { task: 'Review medication chart', assignedTo: 'pharmacist', priority: 'high', dependsOn: ['wf_admission_hp'] },
    { task: 'Order daily investigations', assignedTo: 'clinician', priority: 'medium' },
    { task: 'Multidisciplinary team review', assignedTo: 'team', priority: 'medium', dependsOn: ['wf_medication_review'] },
    { task: 'Discharge planning', assignedTo: 'social_worker', priority: 'medium', dependsOn: ['wf_mdt_review'] },
  ],
  outpatient: [
    { task: 'Patient check-in and registration', assignedTo: 'reception', priority: 'high' },
    { task: 'Clinical consultation', assignedTo: 'clinician', priority: 'high', dependsOn: ['wf_registration'] },
    { task: 'Document consultation notes', assignedTo: 'clinician', priority: 'medium' },
    { task: 'Prescribe medications if needed', assignedTo: 'clinician', priority: 'medium', dependsOn: ['wf_consultation'] },
    { task: 'Schedule follow-up appointment', assignedTo: 'reception', priority: 'low', dependsOn: ['wf_prescription'] },
  ],
  pediatric: [
    { task: 'Pediatric triage and growth assessment', assignedTo: 'nurse', priority: 'high' },
    { task: 'Weight-based medication review', assignedTo: 'pharmacist', priority: 'high', dependsOn: ['wf_ped_triage'] },
    { task: 'Pediatric clinical assessment', assignedTo: 'pediatrician', priority: 'high', dependsOn: ['wf_weight_review'] },
    { task: 'Immunization status check', assignedTo: 'nurse', priority: 'medium' },
    { task: 'Parental counseling and discharge instructions', assignedTo: 'clinician', priority: 'medium', dependsOn: ['wf_ped_assessment'] },
  ],
  maternity: [
    { task: 'Maternal and fetal assessment', assignedTo: 'midwife', priority: 'high' },
    { task: 'Fetal monitoring (CTG)', assignedTo: 'midwife', priority: 'high', dependsOn: ['wf_maternal_assessment'] },
    { task: 'Obstetric review', assignedTo: 'obstetrician', priority: 'high', dependsOn: ['wf_fetal_monitoring'] },
    { task: 'Birth plan discussion', assignedTo: 'midwife', priority: 'medium' },
    { task: 'Postnatal care planning', assignedTo: 'midwife', priority: 'medium', dependsOn: ['wf_obstetric_review'] },
  ],
}

export function createWorkflowFromEncounter(
  encounterType: string,
  context: WorkflowContext,
): WorkflowTask[] {
  const tasks: WorkflowTask[] = []
  let taskCounter = 1

  const template = DEPARTMENT_WORKFLOWS[context.department] || DEPARTMENT_WORKFLOWS['outpatient']
  const now = Date.now()

  for (const t of template) {
    if (t.onlyIf && !t.onlyIf(context)) continue

    const taskId = `wf_${context.department}_${taskCounter}`
    const priority = context.triageCategory === 'resuscitation' ? 'high' as const : t.priority

    tasks.push({
      id: taskId,
      task: t.task,
      assignedTo: t.assignedTo,
      status: 'pending',
      priority: priority,
      dueBy: t.priority === 'high' ? now + 3600_000 : undefined,
      dependsOn: t.dependsOn,
    })

    taskCounter++
  }

  return tasks
}

export function canCompleteTask(task: WorkflowTask, allTasks: WorkflowTask[]): boolean {
  if (!task.dependsOn || task.dependsOn.length === 0) return true

  return task.dependsOn.every(depId => {
    const depTask = allTasks.find(t => t.id === depId)
    return depTask && depTask.status === 'completed'
  })
}

export function getPendingTasks(tasks: WorkflowTask[]): WorkflowTask[] {
  return tasks.filter(t => t.status === 'pending')
}
