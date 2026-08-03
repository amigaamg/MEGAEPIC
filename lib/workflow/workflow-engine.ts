// AMEXAN Universal Workflow Engine
// Phase 4.2.5 - Foundation Implementation
// Constitutional: Workflows orchestrate care, they don't document it

import { create } from 'zustand'
import { doc, setDoc, getDoc, updateDoc, collection, query, where, onSnapshot, writeBatch, serverTimestamp, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Identity } from '../identity/identity-engine'
import { Organization } from '../organization/organization-engine'

export type WorkflowType = 
  | 'admission'
  | 'consultation'
  | 'examination'
  | 'investigation'
  | 'diagnosis'
  | 'management'
  | 'procedure'
  | 'admission'
  | 'recovery'
  | 'follow-up'
  | 'telemedicine'
  | 'research'
  | 'education'
  | 'referral'
  | 'transition';

export type WorkflowStep = {
  id: string
  type: 'action' | 'decision' | 'observation' | 'documentation'
  name: string
  description: string
  instructions?: string
  requiredData?: string[]
  expectedOutput?: string[]
  validates?: ValidationRule
  generates?: GeneratedOutput
  triggers?: TriggerCondition
  timeout?: number
  retryPolicy?: RetryPolicy
  audit?: AuditRequirement
}

export interface ValidationRule {
  type: 'required' | 'format' | 'range' | 'condition' | 'external'
  value?: string | number | boolean
  message: string
  severity: 'critical' | 'warning' | 'info'
}

export interface GeneratedOutput {
  type: 'document' | 'order' | 'task' | 'finding' | 'assessment' | 'plan'
  format: 'structured' | 'free-text' | 'template' | 'generated'
  schema?: Record<string, any>
  validation?: OutputValidation
}

export interface OutputValidation {
  rules: ValidationRule[]
  requiredFields: string[]
}

export interface TriggerCondition {
  type: 'event' | 'threshold' | 'time' | 'resource'
  value: string | number | Date
  operator: '==' | '!=' | '>=' | '<=' | '>=' | '<='
  resource?: string
}

export interface RetryPolicy {
  maxAttempts: number
  backoffMs: number
  jitter: number
}

export interface AuditRequirement {
  trackChanges: boolean
  requiresApproval: boolean
  approverRoles: string[]
}

export interface Workflow {
  // Constitutional: Workflows are instances, not definitions
  id: string
  name: string
  type: WorkflowType
  description: string
  organizationId: string
  departmentId?: string
  unitId?: string
  parentWorkflow?: string
  steps: WorkflowStep[]
  triggers: Trigger[]
  conditions: WorkflowCondition[]
  exceptions: ExceptionHandler[]
  escalation: EscalationRule
  configuration: WorkflowConfiguration
  lifecycle: WorkflowLifecycle
  quality: QualityAssurance
  audit: AuditTrail
  status: 'draft' | 'active' | 'deprecated'
  createdAt: Date
  lastModified: Date
  version: number
}

export interface WorkflowInstance {
  // Constitutional: Instances track execution, not design
  id: string
  workflowId: string
  encounterId: string
  patientId: string
  organizationId: string
  departmentId?: string
  unitId?: string
  status: 'pending' | 'in-progress' | 'completed' | 'abandoned' | 'error'
  currentStep: number
  inputs: WorkflowInput[]
  outputs: WorkflowOutput[]
  events: WorkflowEvent[]
  startedAt: Date
  completedAt?: Date
  startedBy: string
  assignedTo?: string
  priority?: 'low' | 'normal' | 'high' | 'critical'
  estimatedDuration?: number
  actualDuration?: number
  retryCount: number
  errors: WorkflowError[]
  approval?: ApprovalRecord
  metadata: Record<string, any>
}

export interface WorkflowInput {
  key: string
  value: any
  type: 'structured' | 'free-text'
  source: 'user' | 'system' | 'previous' | 'external'
  validated: boolean
  timestamp: Date
}

export interface WorkflowOutput {
  key: string
  value: any
  type: 'structured' | 'free-text'
  generatedAt: Date
  source: 'step' | 'workflow' | 'ai'
  validated: boolean
}

export interface WorkflowEvent {
  id: string
  type: 'started' | 'completed' | 'step-completed' | 'error' | 'abandoned' | 'escalated' | 'approved'
  timestamp: Date
  stepId?: string
  data: Record<string, any>
  actor: string
  approval?: ApprovalRecord
}

export interface WorkflowError {
  id: string
  stepId: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  recovered: boolean
  recoveryAction?: string
  timestamp: Date
}

export interface Trigger {
  id: string
  type: 'event' | 'schedule' | 'threshold' | 'resource'
  condition: TriggerCondition
  action: string
  delay?: number
  priority: 'low' | 'normal' | 'high' | 'critical'
}

export interface WorkflowCondition {
  id: string
  type: 'guard' | 'filter' | 'routing'
  expression: string
  logic: 'and' | 'or' | 'not'
  value?: any
}

export interface ExceptionHandler {
  id: string
  condition: string
  action: 'escalate' | 'bypass' | 'modify' | 'revert'
  target?: string
  reason: string
}

export interface EscalationRule {
  type: 'automatic' | 'manual' | 'threshold'
  conditions: EscalationCondition[]
  handlers: EscalationHandler[]
}

export interface EscalationCondition {
  threshold: number
  duration: 'seconds' | 'minutes' | 'hours'
  resource?: string
}

export interface EscalationHandler {
  type: 'escalate' | 'bypass' | 'modify'
  target: string
  reason: string
}

export interface WorkflowConfiguration {
  parallel: boolean
  timeout: number
  retry: number
  rollback: boolean
  compensation: boolean
  learning: boolean
}

export interface WorkflowLifecycle {
  phases: LifecyclePhase[]
  transitions: Transition[]
  checkpoints: Checkpoint[]
}

export interface LifecyclePhase {
  id: string
  name: string
  type: 'assessment' | 'intervention' | 'monitoring' | 'education'
  steps: number
  duration: number
  outputs: string[]
}

export interface Transition {
  from: string
  to: string
  condition: string
  action: 'advance' | 'rollback' | 'hold' | 'suspend'
}

export interface Checkpoint {
  id: string
  type: 'validation' | 'approval' | 'verification' | 'signature'
  required: boolean
  validator?: string
  approver?: string
}

export interface QualityAssurance {
  qualityMetrics: QualityMetric[]
  audits: WorkflowAudit[]
  feedback: WorkflowFeedback[]
}

export interface QualityMetric {
  name: string
  type: 'clinical' | 'process' | 'outcome'
  target: number
  current: number
  trend: 'improving' | 'stable' | 'declining'
}

export interface WorkflowAudit {
  id: string
  timestamp: Date
  auditor: string
  findings: AuditFinding[]
  score: number
  recommendations: string[]
}

export interface AuditFinding {
  aspect: string
  status: 'good' | 'needs-improvement' | 'critical-issue'
  description: string
  impact: 'low' | 'medium' | 'high'
}

export interface WorkflowFeedback {
  user: string
  rating: number
  comment: string
  category: string
  timestamp: Date
}

export interface AuditTrail {
  events: AuditEvent[]
  lastAudit?: AuditEvent
}

export interface AuditEvent {
  id: string
  timestamp: Date
  eventType: string
  actor: string
  action: string
  resource: string
  changes: Record<string, any>
  approval?: ApprovalRecord
}

export interface ApprovalRecord {
  id: string
  approver: string
  approvalTime: Date
  signature?: string
  comments?: string
  status: 'approved' | 'rejected' | 'pending'
}

// ─── Store ────────────────────────────────────────────────────────────────────

export interface WorkflowState {
  // Constitutional: Workflows orchestrate care, they don't document it
  currentInstance: WorkflowInstance | null
  activeInstances: WorkflowInstance[]
  completedInstances: WorkflowInstance[]
  templates: Workflow[]
  isLoading: boolean
  error: string | null
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  currentInstance: null,
  activeInstances: [],
  completedInstances: [],
  templates: [],
  isLoading: false,
  error: null,

  // Core workflow actions
  createWorkflow: async (data: CreateWorkflowData) => {
    set({ isLoading: true, error: null })
    try {
      const workflowId = generateId()
      
      const workflow: Workflow = {
        id: workflowId,
        name: data.name,
        type: data.type,
        description: data.description,
        organizationId: data.organizationId,
        departmentId: data.departmentId,
        unitId: data.unitId,
        parentWorkflow: data.parentWorkflow,
        steps: data.steps,
        triggers: [],
        conditions: [],
        exceptions: [],
        escalation: {
          type: 'automatic',
          conditions: [],
          handlers: [],
        },
        configuration: {
          parallel: false,
          timeout: 300000, // 5 minutes
          retry: 3,
          rollback: true,
          compensation: false,
          learning: true,
        },
        lifecycle: {
          phases: [],
          transitions: [],
          checkpoints: [],
        },
        quality: {
          qualityMetrics: [],
          audits: [],
          feedback: [],
        },
        audit: {
          events: [],
        },
        status: 'draft',
        createdAt: new Date(),
        lastModified: new Date(),
        version: 1,
      }
      
      await setDoc(doc(db, 'workflows', workflowId), workflow)
      
      set({
        templates: [...get().templates, workflow],
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  executeWorkflow: async (workflowId: string, data: WorkflowExecutionData) => {
    set({ isLoading: true, error: null })
    try {
      // Create workflow instance
      const instanceId = generateId()
      const instance: WorkflowInstance = {
        id: instanceId,
        workflowId,
        encounterId: data.encounterId,
        patientId: data.patientId,
        organizationId: data.organizationId,
        departmentId: data.departmentId,
        unitId: data.unitId,
        status: 'in-progress',
        currentStep: 0,
        inputs: data.inputs || [],
        outputs: [],
        events: [],
        startedAt: new Date(),
        startedBy: data.startedBy || 'system',
        assignedTo: data.assignedTo,
        priority: data.priority || 'normal',
        estimatedDuration: data.estimatedDuration,
        retryCount: 0,
        errors: [],
        approval: undefined,
        metadata: data.metadata || {},
      }
      
      await setDoc(doc(db, 'workflow_instances', instanceId), instance)
      
      // Start workflow execution
      const executionPromise = executeWorkflowSteps(instanceId, workflowId)
      
      set({
        currentInstance: instance,
        activeInstances: [...get().activeInstances, instance],
        isLoading: false,
      })
      
      // Wait for completion (simplified - in real implementation, this would be async)
      setTimeout(async () => {
        const completedInstance = { ...instance, status: 'completed', completedAt: new Date() } as WorkflowInstance
        
        set({
          activeInstances: get().activeInstances.filter(i => i.id !== instanceId),
          completedInstances: [...get().completedInstances, completedInstance],
          currentInstance: null,
        })
      }, 5000)
      
      return instanceId
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  completeStep: async (instanceId: string, stepId: string, data: StepCompletionData) => {
    try {
      const instance = get().activeInstances.find(i => i.id === instanceId)
      if (!instance) throw new Error('Workflow instance not found')
      
      const stepIndex = instance.currentStep
      const workflow = get().templates.find(w => w.id === instanceId)
      if (!workflow) throw new Error('Workflow not found')
      
      const step = workflow.steps[stepIndex]
      if (!step) throw new Error('Step not found')
      
      // Execute step logic
      const outputs = await executeStep(step, data)
      
      // Create workflow event
      const event: WorkflowEvent = {
        id: generateId(),
        type: 'step-completed',
        timestamp: new Date(),
        stepId,
        data: outputs,
        actor: data.actor || 'system',
        approval: data.approval,
      }
      
      const updatedInstance: WorkflowInstance = {
        ...instance,
        currentStep: stepIndex + 1,
        outputs: [...instance.outputs, ...outputs],
        events: [...instance.events, event],
        retryCount: instance.retryCount,
        errors: instance.errors,
        approval: instance.approval,
      }
      
      await updateDoc(doc(db, 'workflow_instances', instanceId), updatedInstance as any)
      
      set({
        activeInstances: get().activeInstances.map(i => i.id === instanceId ? updatedInstance : i),
        currentInstance: updatedInstance,
      })
    } catch (error) {
      console.error('Complete step error:', error)
      throw error
    }
  },

  escalateWorkflow: async (instanceId: string, escalationData: EscalationData) => {
    try {
      const instance = get().activeInstances.find(i => i.id === instanceId)
      if (!instance) throw new Error('Workflow instance not found')
      
      const event: WorkflowEvent = {
        id: generateId(),
        type: 'escalated',
        timestamp: new Date(),
        data: escalationData,
        actor: escalationData.actor || 'system',
      }
      
      const updatedInstance: WorkflowInstance = {
        ...instance,
        events: [...instance.events, event],
      }
      
      await updateDoc(doc(db, 'workflow_instances', instanceId), updatedInstance as any)
      
      set({
        activeInstances: get().activeInstances.map(i => i.id === instanceId ? updatedInstance : i),
      })
    } catch (error) {
      console.error('Escalate workflow error:', error)
      throw error
    }
  },

  // Query functions
  getWorkflowById: async (workflowId: string) => {
    try {
      const docSnap = await getDoc(doc(db, 'workflows', workflowId))
      if (docSnap.exists()) {
        return docSnap.data() as Workflow
      }
      return null
    } catch (error) {
      console.error('Get workflow error:', error)
      return null
    }
  },

  getWorkflowInstances: async (workflowId?: string, encounterId?: string) => {
    try {
      let q = query(collection(db, 'workflow_instances'))
      if (workflowId) {
        q = query(q, where('workflowId', '==', workflowId))
      }
      if (encounterId) {
        q = query(q, where('encounterId', '==', encounterId))
      }
      const snapshot = await getDocs(q)
      return snapshot.docs.map(d => d.data()) as WorkflowInstance[]
    } catch (error) {
      console.error('Get workflow instances error:', error)
      return []
    }
  },

  // Computed properties
  getActiveInstances: () => {
    return get().activeInstances
  },

  getCompletedInstances: () => {
    return get().completedInstances
  },

  isWorkflowRunning: (instanceId: string) => {
    return get().activeInstances.some(i => i.id === instanceId)
  },
}) as const)

// ─── Helper Functions ───────────────────────────────────────────────────────────\n
export interface CreateWorkflowData {
  name: string
  type: WorkflowType
  description: string
  organizationId: string
  departmentId?: string
  unitId?: string
  parentWorkflow?: string
  steps: WorkflowStep[]
}

export interface WorkflowExecutionData {
  encounterId: string
  patientId: string
  organizationId: string
  departmentId?: string
  unitId?: string
  inputs?: WorkflowInput[]
  startedBy?: string
  assignedTo?: string
  priority?: 'low' | 'normal' | 'high' | 'critical'
  estimatedDuration?: number
  metadata?: Record<string, any>
}

export interface StepCompletionData {
  stepId: string
  data: any
  actor?: string
  approval?: ApprovalRecord
}

export interface EscalationData {
  type: string
  target: string
  reason: string
  actor?: string
}

export const executeWorkflowSteps = async (
  instanceId: string,
  workflowId: string
): Promise<void> => {
  try {
    const workflow = await getWorkflowById(workflowId)
    if (!workflow) throw new Error('Workflow not found')
    
    const instance = useWorkflowStore.getState().activeInstances.find(i => i.id === instanceId)
    if (!instance) throw new Error('Workflow instance not found')
    
    // Execute workflow steps based on type and conditions
    await processWorkflowSteps(instance, workflow)
  } catch (error) {
    console.error('Execute workflow steps error:', error)
    throw error
  }
}

export const executeStep = async (
  step: WorkflowStep,
  data: StepCompletionData
): Promise<WorkflowOutput[]> => {
  // Simplified step execution - in real implementation, this would be much more sophisticated
  const outputs: WorkflowOutput[] = []
  
  switch (step.type) {
    case 'action':
      outputs.push({
        key: `output_${Date.now()}`,
        value: { result: 'Action completed successfully' },
        type: 'structured',
        generatedAt: new Date(),
        source: 'step',
        validated: true,
      })
      break
    
    case 'decision':
      outputs.push({
        key: `decision_${Date.now()}`,
        value: { result: data.data.decision || 'Decision made' },
        type: 'structured',
        generatedAt: new Date(),
        source: 'step',
        validated: true,
      })
      break
    
    case 'observation':
      outputs.push({
        key: `observation_${Date.now()}`,
        value: { result: 'Observation recorded' },
        type: 'structured',
        generatedAt: new Date(),
        source: 'step',
        validated: true,
      })
      break
    
    case 'documentation':
      outputs.push({
        key: `documentation_${Date.now()}`,
        value: { result: 'Documentation generated' },
        type: 'free-text',
        generatedAt: new Date(),
        source: 'step',
        validated: true,
      })
      break
  }
  
  return outputs
}

export const processWorkflowSteps = async (
  instance: WorkflowInstance,
  workflow: Workflow
): Promise<void> => {
  // Simplified workflow processing - in real implementation, this would be event-driven
  console.log(`Processing workflow ${workflow.name} for instance ${instance.id}`)
}

export const generateId = (): string => {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

// ─── Event Listeners ────────────────────────────────────────────────────────────
export const setupWorkflowListeners = () => {
  // Listen to workflow instance changes
  onSnapshot(query(collection(db, 'workflow_instances')), (snapshot) => {
    const instances = snapshot.docs.map(d => d.data()) as WorkflowInstance[]
    useWorkflowStore.setState({ activeInstances: instances })
  })
  
  // Listen to workflow changes
  onSnapshot(query(collection(db, 'workflows')), (snapshot) => {
    const workflows = snapshot.docs.map(d => d.data()) as Workflow[]
    useWorkflowStore.setState({ templates: workflows })
  })
}

export const getWorkflowById = async (workflowId: string): Promise<Workflow | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'workflows', workflowId))
    if (docSnap.exists()) {
      return docSnap.data() as Workflow
    }
    return null
  } catch (error) {
    console.error('Get workflow error:', error)
    return null
  }
}

export const getWorkflowInstances = async (
  workflowId?: string,
  encounterId?: string
): Promise<WorkflowInstance[]> => {
  try {
    let q = query(collection(db, 'workflow_instances'))
    if (workflowId) {
      q = query(q, where('workflowId', '==', workflowId))
    }
    if (encounterId) {
      q = query(q, where('encounterId', '==', encounterId))
    }
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => d.data()) as WorkflowInstance[]
  } catch (error) {
    console.error('Get workflow instances error:', error)
    return []
  }
}

export const initializeWorkflow = async () => {
  try {
    setupWorkflowListeners()
  } catch (error) {
    console.error('Initialize workflow error:', error)
  }
}
