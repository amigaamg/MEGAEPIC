// AMEXAN Clinical Intelligence Engine
// Phase 4.2.6 - Foundation Implementation
// Constitutional: Intelligence understands clinical context, not just data

import { create } from 'zustand'
import { doc, setDoc, getDoc, updateDoc, collection, query, where, onSnapshot, writeBatch, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateId } from '@/lib/utils'

export type ClinicalIntelligenceType = 
  | 'history'
  | 'examination'
  | 'diagnosis'
  | 'investigation'
  | 'management'
  | 'procedure'
  | 'monitoring'
  | 'education'
  | 'research'
  | 'telemedicine'

export interface ClinicalContext {
  // Constitutional: Context changes intelligence, not vice versa
  patient: PatientContext
  encounter: EncounterContext
  workflow: WorkflowContext
  organization: OrganizationContext
  specialty: SpecialtyContext
}

export interface PatientContext {
  id: string
  demographics: {
    age: number
    sex: 'male' | 'female' | 'other' | 'unknown'
    comorbidities: string[]
    medications: string[]
    allergies: string[]
  }
  history: ClinicalHistory[]
  currentConditions: CurrentCondition[]
  socialHistory: SocialHistory
}

export interface ClinicalHistory {
  id: string
  date: Date
  type: 'history' | 'exam' | 'lab' | 'procedure' | 'note'
  title: string
  description: string
  findings: string[]
  significance: 'normal' | 'abnormal' | 'critical'
  source: 'patient' | 'clinician' | 'system'
}

export interface CurrentCondition {
  id: string
  name: string
  severity: 'mild' | 'moderate' | 'severe' | 'critical'
  onset: Date
  status: 'active' | 'resolved' | 'recurring'
  investigations: Investigation[]
}

export interface SocialHistory {
  smoking: 'never' | 'former' | 'current'
  alcohol: 'never' | 'low' | 'moderate' | 'high'
  drugUse: 'never' | 'recreational' | 'prescribed'
  occupation: string
  education: string
  insurance: string
}

export interface EncounterContext {
  id: string
  type: 'outpatient' | 'inpatient' | 'emergency' | 'telemedicine'
  admissionDate: Date
  dischargeDate?: Date
  location: string
  team: string[]
  ICU: boolean
}

export interface WorkflowContext {
  type: 'ward-round' | 'clinic' | 'procedure' | 'examination' | 'follow-up'
  phase: 'assessment' | 'intervention' | 'monitoring' | 'education'
  objective: string
  urgency: 'low' | 'normal' | 'high' | 'critical'
  resources: string[]
}

export interface OrganizationContext {
  id: string
  name: string
  type: 'hospital' | 'clinic' | 'health-center'
  tier: 'primary' | 'secondary' | 'tertiary'
  capacity: number
  staffing: string[]
  certifications: string[]
}

export interface SpecialtyContext {
  primary: string
  subSpecialties: string[]
  expertise: string[]
  boardCertified: boolean
}

export interface Investigation {
  id: string
  name: string
  type: 'laboratory' | 'imaging' | 'procedure'
  orderedAt: Date
  performedAt?: Date
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  critical?: boolean
  location: string
  findings?: InvestigationFinding[]
}

export interface InvestigationFinding {
  id: string
  value: any
  unit: string
  normalRange: {
    min: number
    max: number
  }
  significance: 'normal' | 'abnormal' | 'critical'
  timestamp: Date
  source: 'system' | 'clinician' | 'patient'
}

export interface ClinicalIntelligence {
  // Constitutional: Intelligence is contextual, not transactional
  id: string
  context: ClinicalContext
  evidenceGraph: EvidenceGraph
  reasoning: ClinicalReasoning
  recommendations: Recommendation[]
  confidence: number
  explainability: 'high' | 'medium' | 'low'
  generatedAt: Date
  source: 'rule-based' | 'ml-based' | 'hybrid'
  validUntil?: Date
}

export interface EvidenceGraph {
  nodes: EvidenceNode[]
  relationships: EvidenceRelationship[]
  patterns: EvidencePattern[]
}

export interface EvidenceNode {
  id: string
  type: 'symptom' | 'disease' | 'finding' | 'guideline' | 'reference' | 'medication'
  label: string
  value: any
  unit?: string
  metadata: Record<string, any>
  relationships: string[]
}

export interface EvidenceRelationship {
  id: string
  source: string
  target: string
  type: 'causes' | 'treats' | 'associated-with' | 'differs-from' | 'contradicts'
  weight: number
  confidence: number
}

export interface EvidencePattern {
  id: string
  name: string
  type: 'temporal' | 'causal' | 'correlational'
  evidence: string[]
  strength: 'weak' | 'moderate' | 'strong' | 'very-strong'
  clinicalSignificance: string
}

export interface ClinicalReasoning {
  id: string
  type: 'rule-based' | 'pattern-matching' | 'bayesian' | 'neural'
  confidence: number
  explanation: string
  steps: ReasoningStep[]
  confidenceFactors: ConfidenceFactor[]
}

export interface ReasoningStep {
  id: string
  type: 'data' | 'inference' | 'validation' | 'synthesis' | 'action'
  description: string
  evidence: string[]
  conclusion: string
  nextSteps?: string[]
}

export interface ConfidenceFactor {
  name: string
  value: number
  weight: number
  source: string
}

export interface Recommendation {
  id: string
  type: 'action' | 'investigation' | 'lifestyle' | 'education'
  priority: 'critical' | 'high' | 'medium' | 'low'
  description: string
  evidence: string[]
  expectedOutcome: string
  implementation: ImplementationPlan
  validation: RecommendationValidation
}

export interface ImplementationPlan {
  steps: string[]
  resources: string[]
  timeline: TimelineItem[]
  responsible: string[]
}

export interface TimelineItem {
  step: number
  description: string
  responsible: string
  dueDate?: Date
  completed: boolean
}

export interface RecommendationValidation {
  type: 'clinical' | 'financial' | 'operational'
  validated: boolean
  validator: string
  validationDate: Date
  notes?: string
}

// ─── Store ────────────────────────────────────────────────────────────────────\n
export interface ClinicalIntelligenceState {
  // Constitutional: Intelligence is contextual, not generic
  currentIntelligence: ClinicalIntelligence | null
  activeIntelligences: ClinicalIntelligence[]
  patientContext: ClinicalContext | null
  isLoading: boolean
  error: string | null
}

export const useClinicalIntelligenceStore = create<ClinicalIntelligenceState>((set, get) => ({
  currentIntelligence: null,
  activeIntelligences: [],
  patientContext: null,
  isLoading: false,
  error: null,

  // Core intelligence actions
  generateIntelligence: async (context: ClinicalContext) => {
    set({ isLoading: true, error: null })
    try {
      const intelligenceId = generateId()
      
      const intelligence: ClinicalIntelligence = {
        id: intelligenceId,
        context,
        evidenceGraph: await buildEvidenceGraph(context),
        reasoning: await generateClinicalReasoning(context),
        recommendations: await generateRecommendations(context),
        confidence: 0.85, // Example confidence
        explainability: 'high',
        generatedAt: new Date(),
        source: 'rule-based',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
      
      await setDoc(doc(db, 'clinical_intelligence', intelligenceId), intelligence)
      
      set({
        currentIntelligence: intelligence,
        activeIntelligences: [...get().activeIntelligences, intelligence],
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updatePatientContext: (context: ClinicalContext) => {
    set({ patientContext: context })
  },

  // Query functions
  getIntelligenceByPatient: async (patientId: string) => {
    try {
      const q = query(collection(db, 'clinical_intelligence'), where('patientId', '==', patientId))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(d => d.data()) as ClinicalIntelligence[]
    } catch (error) {
      console.error('Get intelligence by patient error:', error)
      return []
    }
  },

  getIntelligenceByEncounter: async (encounterId: string) => {
    try {
      const q = query(collection(db, 'clinical_intelligence'), where('encounterId', '==', encounterId))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(d => d.data()) as ClinicalIntelligence[]
    } catch (error) {
      console.error('Get intelligence by encounter error:', error)
      return []
    }
  },

  // Computed properties
  getCurrentRecommendations: () => {
    const intelligence = get().currentIntelligence
    return intelligence?.recommendations || []
  },

  getPatientContext: () => {
    return get().patientContext
  },
}) as const)

// ─── Helper Functions ───────────────────────────────────────────────────────────\n
export interface ClinicalContextInput {
  patientId: string
  encounterId?: string
  organizationId?: string
  departmentId?: string
  unitId?: string
}

export interface EvidenceBuildingOptions {
  includeTemporalPatterns: boolean
  includeCausalRelationships: boolean
  includeClinicalGuidelines: boolean
  confidenceThreshold: number
}

export interface ReasoningOptions {
  preferRuleBased: boolean
  minConfidence: number
  requireExplainability: boolean
}

export interface ClinicalIntelligenceOptions {
  encounterId?: string
  confidenceThreshold?: number
  maxResults?: number
}

export interface RecommendationOptions {
  priorityFilter: 'critical' | 'high' | 'medium' | 'low' | 'all'
  evidenceThreshold: number
}

// ─── API Functions ──────────────────────────────────────────────────────────────\n
export const getClinicalIntelligenceByPatient = async (
  patientId: string,
  options?: ClinicalIntelligenceOptions
): Promise<ClinicalIntelligence[]> => {
  try {
    let q = query(collection(db, 'clinical_intelligence'), where('patientId', '==', patientId))
    
    if (options?.encounterId) {
      q = query(q, where('encounterId', '==', options.encounterId))
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => d.data()) as ClinicalIntelligence[]
  } catch (error) {
    console.error('Get clinical intelligence by patient error:', error)
    return []
  }
}

export const buildEvidenceGraph = async (
  context: ClinicalContext,
  options?: EvidenceBuildingOptions
): Promise<EvidenceGraph> => {
  try {
    // Build evidence graph from context
    const nodes: EvidenceNode[] = []
    const relationships: EvidenceRelationship[] = []
    const patterns: EvidencePattern[] = []
    
    // Add patient context
    if (context.patient.currentConditions.length > 0) {
      for (const condition of context.patient.currentConditions) {
        const node: EvidenceNode = {
          id: generateId(),
          type: 'disease',
          label: condition.name,
          value: condition.severity,
          metadata: { onset: condition.onset.toISOString() },
          relationships: [],
        }
        nodes.push(node)
      }
    }
    
    // Add social history
    if (context.patient.socialHistory.smoking !== 'never') {
      nodes.push({
        id: generateId(),
        type: 'symptom',
        label: 'Smoking',
        value: context.patient.socialHistory.smoking,
        metadata: { category: 'risk-factor' },
        relationships: [],
      })
    }
    
    return { nodes, relationships, patterns }
  } catch (error) {
    console.error('Build evidence graph error:', error)
    return { nodes: [], relationships: [], patterns: [] }
  }
}

export const generateClinicalReasoning = async (
  context: ClinicalContext,
  options?: ReasoningOptions
): Promise<ClinicalReasoning> => {
  try {
    const reasoningId = generateId()
    const steps: ReasoningStep[] = []
    const confidenceFactors: ConfidenceFactor[] = []
    
    // Example reasoning based on diabetes
    if (context.patient.currentConditions.some(c => c.name.toLowerCase().includes('diabetes'))) {
      steps.push({
        id: generateId(),
        type: 'inference',
        description: 'Patient has diabetes based on current conditions',
        evidence: ['Current condition: Diabetes', 'Social history: Smoking'],
        conclusion: 'Initiate comprehensive diabetes management protocol',
      })
      
      steps.push({
        id: generateId(),
        type: 'action',
        description: 'Begin metformin titration protocol',
        evidence: ['HbA1c level elevated', 'Glucose intolerance'],
        conclusion: 'Start oral hypoglycemics with appropriate monitoring',
      })
    }
    
    confidenceFactors.push({ name: 'Clinical history', value: 0.8, weight: 0.6, source: 'patient-record' })
    confidenceFactors.push({ name: 'Current presentation', value: 0.7, weight: 0.4, source: 'examination' })
    
    return {
      id: reasoningId,
      type: 'rule-based',
      confidence: 0.85,
      explanation: 'Based on clinical presentation and patient history',
      steps,
      confidenceFactors,
    }
  } catch (error) {
    console.error('Generate clinical reasoning error:', error)
    return {
      id: generateId(),
      type: 'rule-based',
      confidence: 0.5,
      explanation: 'Unable to generate reasoning',
      steps: [],
      confidenceFactors: [],
    }
  }
}

export const generateRecommendations = async (
  context: ClinicalContext,
  options?: RecommendationOptions
): Promise<Recommendation[]> => {
  try {
    const recommendations: Recommendation[] = []
    
    // Generate recommendations based on patient conditions
    for (const condition of context.patient.currentConditions) {
      recommendations.push({
        id: generateId(),
        type: 'action',
        priority: 'high',
        description: `Manage ${condition.name} with appropriate clinical intervention`,
        evidence: [condition.name, 'Clinical guidelines'],
        expectedOutcome: `Improvement in ${condition.name} management`,
        implementation: {
          steps: [`Assess severity`, `Initiate treatment`, `Monitor response`],
          resources: [`Medication`, `Monitoring equipment`, `Follow-up appointments`],
          responsible: [`Primary care`, `Specialist`],
          timeline: [
            { step: 1, description: 'Initial assessment and workup', responsible: 'Primary care', completed: false },
            { step: 2, description: 'Begin appropriate therapy', responsible: 'Specialist', completed: false },
            { step: 3, description: 'Monitor and adjust treatment', responsible: 'Primary care', completed: false },
          ],
        },
        validation: {
          type: 'clinical',
          validated: true,
          validator: 'Clinical Intelligence',
          validationDate: new Date(),
        },
      })
    }
    
    return recommendations
  } catch (error) {
    console.error('Generate recommendations error:', error)
    return []
  }
}

// ─── Event Listeners ────────────────────────────────────────────────────────────
export const setupClinicalIntelligenceListeners = () => {
  // Listen to patient context changes
  onSnapshot(query(collection(db, 'clinical_intelligence')), (snapshot) => {
    const intelligence = snapshot.docs.map(d => d.data()) as ClinicalIntelligence[]
    useClinicalIntelligenceStore.setState({ activeIntelligences: intelligence })
  })
}

export const initializeClinicalIntelligence = async () => {
  try {
    setupClinicalIntelligenceListeners()
  } catch (error) {
    console.error('Initialize clinical intelligence error:', error)
  }
}

export const getClinicalIntelligenceByEncounter = async (
  encounterId: string
): Promise<ClinicalIntelligence | null> => {
  try {
    const q = query(collection(db, 'clinical_intelligence'), where('encounterId', '==', encounterId))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    return snapshot.docs[0].data() as ClinicalIntelligence
  } catch (error) {
    console.error('Get clinical intelligence by encounter error:', error)
    return null
  }
}
