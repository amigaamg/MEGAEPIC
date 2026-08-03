export enum IntelligenceDomain {
  History = 'history',
  Examination = 'examination',
  Differential = 'differential',
  Guideline = 'guideline',
  Drug = 'drug',
  Laboratory = 'laboratory',
  Imaging = 'imaging',
  Monitoring = 'monitoring',
  Prediction = 'prediction',
  Explanation = 'explanation',
  KnowledgePack = 'knowledgePack',
  Recommendation = 'recommendation',
}

export enum ConfidenceLevel {
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
  Critical = 'critical',
}

export enum EvidenceLevel {
  LevelA = 'levelA',
  LevelB = 'levelB',
  LevelC = 'levelC',
  ExpertOpinion = 'expertOpinion',
  LocalProtocol = 'localProtocol',
}

export interface ClinicalContext {
  currentUser?: string
  currentDepartment?: string
  currentWorkflow?: string
  currentPatient?: string
  currentStage?: string
  currentDisease?: string
  currentGuidelines?: string[]
  currentCountry?: string
  organizationId?: string
  encounterId?: string
}

export interface Observation {
  id: string
  type: string
  value: unknown
  unit?: string
  timestamp: number
  source: string
  patientId: string
  encounterId?: string
  abnormal?: boolean
  critical?: boolean
}

export interface DifferentialEntry {
  diagnosis: string
  icd10?: string
  confidence: number
  supportingFindings: string[]
  contradictingFindings: string[]
  redFlags: string[]
  evidence: string
  guideline?: string
  alternativeDiagnoses?: string[]
}

export interface Recommendation {
  id: string
  type: string
  title: string
  description: string
  evidence: string
  evidenceLevel: EvidenceLevel
  guideline?: string
  confidence: number
  confidenceLevel: ConfidenceLevel
  reasoning: string
  alternatives?: Recommendation[]
  risks?: string[]
  benefits?: string[]
  patientSpecific?: boolean
  priority: 'critical' | 'high' | 'medium' | 'low'
  actionable: boolean
  source: string
  version: string
}

export interface Prediction {
  id: string
  type: string
  patientId: string
  prediction: string
  probability: number
  timeframe: string
  riskFactors: string[]
  protectiveFactors: string[]
  evidence: string
  confidence: number
  recommendations: Recommendation[]
}

export interface Explanation {
  recommendationId: string
  why: string
  evidence: string[]
  guidelines: string[]
  riskFactors: string[]
  confidence: number
  alternatives: string[]
  patientContext: ClinicalContext
}

export interface IntelligenceEvent {
  id: string
  type: string
  category: IntelligenceDomain
  source: string
  organizationId?: string
  patientId?: string
  encounterId?: string
  user?: string
  timestamp: number
  payload: unknown
  priority: 'critical' | 'high' | 'normal' | 'background'
  version: string
}

export interface KnowledgePack {
  id: string
  name: string
  version: string
  source: string
  country?: string
  organization?: string
  specialty?: string
  rules: KnowledgeRule[]
  effectiveDate: number
  expiryDate?: number
  status: 'draft' | 'review' | 'approved' | 'published' | 'retired'
}

export interface KnowledgeRule {
  id: string
  type: string
  condition: string
  action: string
  evidence: string
  guideline?: string
  priority: number
  effectiveDate: number
  expiryDate?: number
}

export interface ClinicalIntelligenceConfig {
  enableDifferential: boolean
  enablePrediction: boolean
  enableMonitoring: boolean
  enableRecommendations: boolean
  enableExplanation: boolean
  enableLearning: boolean
  confidenceThreshold: number
  maxDifferentials: number
  maxRecommendations: number
  patientSafetyOverride: boolean
}