export type WorkflowPhase =
  | "registration"
  | "complaint"
  | "hpi"
  | "pmh"
  | "examination"
  | "investigations"
  | "diagnosis"
  | "management"
  | "documentation"
  | "disposition"
  | "complete"

export interface PatientSummary {
  id: string
  hospitalNumber: string
  name: string
  age: number
  sex: string
  location: string
  department: string
  priority: "immediate" | "emergency" | "urgent" | "semi-urgent" | "routine"
  complaint: string
  waitingMinutes: number
  status: string
  assignedDoctor: string
  alerts: string[]
  isIsolation: boolean
  isCritical: boolean
  isPregnant: boolean
  isDNR: boolean
  allergies: string[]
  newsScore: number
  bed?: string
}

export interface EncounterState {
  id: string
  patient: PatientSummary | null
  type: EncounterType
  phase: WorkflowPhase
  status: "active" | "paused" | "completed" | "cancelled"
  startTime: Date
  department: string
  context: ClinicalContext
}

export type EncounterType =
  | "emergency"
  | "clinic"
  | "ward"
  | "telemedicine"
  | "icu"
  | "theatre"
  | "procedure"
  | "follow_up"

export interface ClinicalContext {
  ageGroup: string
  sex: string
  pregnancyStatus: string
  knownConditions: string[]
  activeAllergies: string[]
  activePathways: string[]
  activeRules: number
  riskLevel: "low" | "moderate" | "high" | "critical"
  currentStep: string
}

export interface ComplaintNode {
  id: string
  text: string
  onset: string
  duration: string
  severity: number
  concepts: string[]
  bodySystem: string
  timelinePosition: number
  children: ComplaintNode[]
}

export interface Observation {
  id: string
  conceptId: string
  value: any
  valueType: "boolean" | "text" | "numeric" | "select"
  unit?: string
  timestamp: Date
}

export interface DifferentialEntry {
  diseaseId: string
  diseaseName: string
  probability: number
  confidence: number
  rank: number
  supporting: string[]
  opposing: string[]
  isConfirmed: boolean
  isExcluded: boolean
}

export interface QuestionCard {
  id: string
  conceptId: string
  question: string
  answerType: "boolean" | "text" | "numeric" | "select"
  options?: string[]
  unit?: string
  priority: 1 | 2 | 3 | 4
  reason?: string
  dependsOn?: string
  answered: boolean
  answer?: any
  redFlag?: string
}

export interface QueueTab {
  id: string
  label: string
  count: number
  icon: string
}

export type PanelMode = "queue" | "encounter" | "assistant" | "all"

export interface WorkflowState {
  queue: PatientSummary[]
  activeTab: string
  selectedPatient: PatientSummary | null
  encounter: EncounterState | null
  phase: WorkflowPhase
  complaints: ComplaintNode[]
  observations: Observation[]
  differentials: DifferentialEntry[]
  questions: QuestionCard[]
  assistantCollapsed: boolean
  queueCollapsed: boolean
  panelMode: PanelMode
  encounterHistory: { phase: WorkflowPhase; completedAt: Date }[]
}
