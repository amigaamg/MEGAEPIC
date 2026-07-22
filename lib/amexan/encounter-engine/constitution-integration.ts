import type { EncounterPhase, ManagementItem } from './types/ces'
import type {
  EncounterState, EncounterAction, ActionType, EncounterDecision,
  EncounterDecisionType, Encounter, ClinicalFact, ClinicalObservation,
  WorkflowInstance, WorkflowType, ClinicalTask,
  EncounterNote, PatientInput, Provenance, WorkflowPriority,
} from '../clinical-constitution/types'

export const PHASE_TO_CONSTITUTION_STATE: Record<EncounterPhase, EncounterState> = {
  registration: 'created',
  patient_context: 'checked_in',
  chief_complaint: 'checked_in',
  hpi: 'in_progress',
  past_medical: 'in_progress',
  past_surgical: 'in_progress',
  drug_history: 'in_progress',
  allergies: 'in_progress',
  family_history: 'in_progress',
  social_history: 'in_progress',
  review_of_systems: 'in_progress',
  functional_assessment: 'in_progress',
  general_exam: 'in_progress',
  systemic_exam: 'in_progress',
  examination: 'in_progress',
  clinical_reasoning: 'in_progress',
  differentials: 'in_progress',
  investigations: 'in_progress',
  diagnosis: 'decision_made',
  management: 'actions_running',
  disposition: 'completed',
  discharge_admission_referral: 'completed',
  follow_up: 'follow_up_pending',
  analytics: 'closed',
}

export function mapPhaseToState(phase: EncounterPhase): EncounterState {
  return PHASE_TO_CONSTITUTION_STATE[phase] || 'in_progress'
}

export function createConstitutionEncounter(
  patientId: string,
  orgId: string,
  orgName: string,
  deptId: string | undefined,
  deptName: string | undefined,
  triggerType: Encounter['trigger']['type'],
  triggerReason: string,
  urgency: Encounter['trigger']['urgency'],
  initiatedBy: string,
  encounterType: Encounter['encounterType'],
  encounterClass: Encounter['encounterClass'],
  locationType: Encounter['location']['type'],
  phase: EncounterPhase,
): Encounter {
  const now = Date.now()
  return {
    id: `enc-${now}-${Math.random().toString(36).slice(2, 8)}`,
    patientId,
    encounterClass,
    encounterType,
    organizationId: orgId,
    organizationName: orgName,
    departmentId: deptId,
    departmentName: deptName,
    location: { type: locationType },
    responsibleTeam: [],
    currentState: mapPhaseToState(phase),
    startTime: now,
    trigger: {
      type: triggerType,
      reason: triggerReason,
      urgency,
      initiatedBy,
      initiatedAt: now,
    },
    preparation: {
      patientSummary: {
        name: '',
        age: 0,
        sex: '',
        allergies: [],
        currentMedications: [],
        activeDiagnoses: [],
        recentEncounters: 0,
        chronicConditions: [],
        warnings: [],
      },
      contextAlerts: [],
      consentStatus: 'not_required',
      requiredDocuments: [],
      missingInformation: [],
      preparedAt: now,
    },
    interaction: {
      startedAt: now,
      participants: [],
      notes: [],
      contributions: [],
      patientContributions: [],
    },
    decision: null,
    actions: [],
    closure: null,
    followUp: null,
    linkedEncounterIds: [],
    createdBy: initiatedBy,
    createdAt: now,
    updatedAt: now,
    eventCount: 0,
  }
}

const MANAGEMENT_TO_ENCOUNTER_ACTION: Record<string, ActionType> = {
  investigation: 'lab_order',
  lab: 'lab_order',
  imaging: 'imaging_order',
  medication: 'prescription',
  prescription: 'prescription',
  procedure: 'procedure',
  referral: 'referral',
  consult: 'consult_request',
  admission: 'bed_assignment',
  discharge: 'discharge_process',
  education: 'education',
  counseling: 'counseling',
  nursing: 'other',
  monitoring: 'other',
  supportive: 'other',
  isolation: 'notification',
  infusion: 'other',
}

export function managementItemToAction(
  item: ManagementItem,
  encounterId: string,
): EncounterAction {
  const cat = item.category?.toLowerCase() || ''
  const type = MANAGEMENT_TO_ENCOUNTER_ACTION[cat] || 'other'
  const now = Date.now()
  return {
    id: `act-${encounterId}-${now}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    description: `${item.action || ''}${item.details ? ` — ${item.details}` : ''}`,
    status: 'pending',
    createdAt: now,
  }
}

export function convertManagementPlanToActions(
  items: ManagementItem[],
  encounterId: string,
): EncounterAction[] {
  return items.map(i => managementItemToAction(i, encounterId))
}

export function createDiagnosisDecision(
  diagnosisName: string,
  diagnosisId: string,
  rationale: string,
  madeBy: string,
  madeByName: string,
  decisionType: EncounterDecisionType,
): EncounterDecision {
  return {
    type: decisionType,
    rationale,
    diagnosisId,
    madeBy,
    madeByName,
    madeAt: Date.now(),
    requiresApproval: false,
    patientInformed: false,
    patientConsented: false,
  }
}

export function createClinicalFactsFromAnswers(
  answers: Record<string, { value: any; question?: string }>,
  patientId: string,
  encounterId: string | undefined,
  provenance: Provenance,
): ClinicalFact[] {
  const facts: ClinicalFact[] = []
  const now = Date.now()

  for (const [key, entry] of Object.entries(answers)) {
    if (!entry || entry.value === undefined || entry.value === null) continue
    const val = entry.value
    const displayName = entry.question || key

    const observations: ClinicalObservation[] = Array.isArray(val)
      ? val.map((v: any) => ({
          concept: `${key}_${String(v).toLowerCase().replace(/\s+/g, '_')}`,
          displayName: String(v),
          value: v,
          flags: [],
        }))
      : [{
          concept: key,
          displayName,
          value: val,
          flags: [],
        }]

    facts.push({
      id: `fact-${key}-${now}-${Math.random().toString(36).slice(2, 6)}`,
      patientId,
      encounterId,
      trustLayer: 1,
      category: 'self_reported_symptom',
      provenance: { ...provenance, recordedAt: now },
      timestamp: now,
      recordedAt: now,
      observations,
      documentIds: [],
      status: 'active',
    })
  }

  return facts
}

export function createEncounterNoteFromPhase(
  phase: EncounterPhase,
  content: string,
  authorId: string,
  authorName: string,
): EncounterNote {
  const typeMap: Record<string, EncounterNote['type']> = {
    hpi: 'admission_note',
    past_medical: 'admission_note',
    examination: 'consultation_note',
    clinical_reasoning: 'consultation_note',
    diagnosis: 'consultation_note',
    management: 'progress_note',
    disposition: 'discharge_summary',
    follow_up: 'discharge_summary',
  }
  return {
    id: `note-${phase}-${Date.now()}`,
    type: typeMap[phase] || 'progress_note',
    title: `Phase: ${phase.replace(/_/g, ' ')}`,
    content,
    authorId,
    authorName,
    authorRole: 'clinician',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isSigned: false,
  }
}

export function updateEncounterPreparation(
  encounter: Encounter,
  biodata: { patientName?: string; age?: number; sex?: string } | null,
  allergies: string[],
  activeDiagnoses: string[],
  chronicConditions: string[],
  missingInfo: string[],
  warnings: string[],
): Encounter {
  if (!encounter.preparation) return encounter
  return {
    ...encounter,
    preparation: {
      ...encounter.preparation,
      patientSummary: {
        ...encounter.preparation.patientSummary,
        name: biodata?.patientName || encounter.preparation.patientSummary.name,
        age: biodata?.age || encounter.preparation.patientSummary.age,
        sex: biodata?.sex || encounter.preparation.patientSummary.sex,
        allergies,
        activeDiagnoses,
        chronicConditions,
        warnings,
      },
      missingInformation: missingInfo,
    },
    updatedAt: Date.now(),
  }
}

export function addPatientInputToEncounter(
  encounter: Encounter,
  type: PatientInput['type'],
  content: any,
  source: string,
): Encounter {
  const input: PatientInput = {
    type,
    content,
    timestamp: Date.now(),
    source,
  }
  return {
    ...encounter,
    interaction: {
      ...encounter.interaction,
      patientContributions: [...(encounter.interaction?.patientContributions || []), input],
    },
    updatedAt: Date.now(),
  }
}

export function setEncounterDecision(
  encounter: Encounter,
  decision: EncounterDecision,
): Encounter {
  return {
    ...encounter,
    decision,
    currentState: 'decision_made',
    updatedAt: Date.now(),
  }
}

export function addActionsToEncounter(
  encounter: Encounter,
  actions: EncounterAction[],
): Encounter {
  return {
    ...encounter,
    actions: [...encounter.actions, ...actions],
    currentState: 'actions_running',
    updatedAt: Date.now(),
  }
}

export function createConstitutionWorkflow(
  encounter: Encounter,
  workflowType: WorkflowType,
): WorkflowInstance {
  const now = Date.now()
  return {
    id: `wf-${encounter.id}-${now}`,
    patientId: encounter.patientId,
    encounterId: encounter.id,
    type: workflowType,
    currentState: 'consultation',
    previousState: null,
    ownership: {
      patientOwner: { ownerId: encounter.createdBy, ownerName: '', ownerType: 'clinician', role: 'attending', assumedAt: now },
      workflowOwner: { ownerId: encounter.organizationId, ownerName: encounter.organizationName, ownerType: 'department', role: 'department', assumedAt: now },
      taskOwners: [],
      episodeOwner: null,
      lastTransferredAt: now,
      transferHistory: [],
    },
    priority: encounter.trigger.urgency === 'emergency' ? 1 : encounter.trigger.urgency === 'urgent' ? 2 : 3,
    tasks: [],
    dependencies: [],
    startedAt: now,
    status: 'active',
    escalationLevel: 0,
  }
}

export function createTaskFromAction(
  action: EncounterAction,
  workflowId: string,
  patientId: string,
  assignedBy: string,
  assignedByName: string,
  assignedTo?: string,
  assignedToName?: string,
): ClinicalTask {
  const now = Date.now()
  return {
    id: `task-${workflowId}-${now}-${Math.random().toString(36).slice(2, 6)}`,
    workflowId,
    patientId,
    title: action.description.slice(0, 80) || 'Clinical task',
    description: action.description,
    assignedTo,
    assignedToName,
    assignedBy,
    assignedByName,
    type: 'ordering',
    priority: 3 as WorkflowPriority,
    status: 'pending',
    createdAt: now,
    dependsOnTaskIds: [],
    escalationLevel: 0,
    escalationHistory: [],
  }
}
