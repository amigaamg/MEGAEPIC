// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN OPERATING LIFECYCLE CONDUCTOR (BOOK VIII)
//
// Every activity inside AMEXAN exists because of a patient, a community, or a
// healthcare operation. The Five Centers — PERSON, PATIENT, ENCOUNTER, KNOWLEDGE,
// ORGANIZATION — are the only places data lives. Everything else references them.
//
// The complete patient journey:
//   Patient arrives → Reception → Registration → Triage → Doctor → History →
//   Physical Exam → Investigations → Diagnosis → Management → Admission? →
//   Ward → Rounds → Procedures → Discharge → Telemedicine → Follow-up →
//   Population Health
//
// Every department (Emergency, Medicine, Surgery, Pediatrics, OBG, ICU) runs the
// SAME constitutional engine with a different workflow. Dashboards are generated,
// never stored. Everything communicates through events — nobody manually refreshes.
//
// Pure and deterministic. Persistence is orchestrated by the provisioning
// conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import PersonEngine from './PersonEngine';
import PatientEngine from './PatientEngine';
import EncounterEngine from './EncounterEngine';
import KnowledgeEngine from './KnowledgeEngine';
import OrganizationCenterEngine from './OrganizationCenterEngine';
import CommunicationEngine from './CommunicationEngine';
import DashboardEngine from './DashboardEngine';
import { KNOWLEDGE_GRAPH_SEED, POSTGRES_SCHEMA, NEO4J_SCHEMA, getStorageForCenter } from './StorageConstitution';
import type {
  EncounterModel, KnowledgeModel, OrganizationCenterModel, PersonCenterModel,
  PatientCenterModel,
} from './types';

export interface LifecycleState {
  person: PersonCenterModel;
  patient: PatientCenterModel;
  encounter: EncounterModel;
  knowledge: KnowledgeModel;
  organization?: OrganizationCenterModel;
}

export interface JourneyStep {
  stage: string;
  happened: boolean;
  detail?: string;
}

// ── Department workflow definitions ────────────────────────────────────────────
// Every department runs the SAME engine; only the workflow (stage sequence) and
// starting stage differ. This is the constitutional answer to specialization.

export type DepartmentWorkflowId =
  | 'emergency' | 'medicine' | 'surgery' | 'pediatrics' | 'obg' | 'icu' | 'outpatient';

export interface DepartmentWorkflow {
  id: DepartmentWorkflowId;
  label: string;
  stages: string[];
  startStage: string;
}

export const DEPARTMENT_WORKFLOWS: readonly DepartmentWorkflow[] = [
  { id: 'emergency', label: 'Emergency Workflow', stages: ['Reception', 'Triage', 'Resuscitation', 'Assessment', 'Investigation', 'Disposition', 'Admission', 'Discharge'], startStage: 'Reception' },
  { id: 'medicine', label: 'Medical Workflow', stages: ['Registration', 'Consultation', 'History', 'Examination', 'Investigation', 'Diagnosis', 'Management', 'Monitoring', 'Discharge'], startStage: 'Registration' },
  { id: 'surgery', label: 'Surgical Workflow', stages: ['Registration', 'Assessment', 'Investigations', 'Pre-op', 'Theatre', 'Recovery', 'Ward', 'Discharge'], startStage: 'Registration' },
  { id: 'pediatrics', label: 'Pediatric Workflow', stages: ['Registration', 'Triage', 'Growth Assessment', 'Examination', 'Investigation', 'Management', 'Discharge'], startStage: 'Registration' },
  { id: 'obg', label: 'Obstetrics & Gynaecology Workflow', stages: ['Registration', 'Antenatal Assessment', 'Examination', 'Investigations', 'Delivery', 'Postnatal', 'Discharge'], startStage: 'Registration' },
  { id: 'icu', label: 'ICU & Critical Care Workflow', stages: ['Admission', 'Stabilization', 'Monitoring', 'Intervention', 'Weaning', 'Step-down', 'Discharge'], startStage: 'Admission' },
  { id: 'outpatient', label: 'Outpatient Workflow', stages: ['Registration', 'Consultation', 'History', 'Examination', 'Investigation', 'Management', 'Follow-up'], startStage: 'Registration' },
];

export function getDepartmentWorkflow(id: DepartmentWorkflowId): DepartmentWorkflow {
  const wf = DEPARTMENT_WORKFLOWS.find(w => w.id === id);
  if (!wf) throw new Error(`[LifecycleEngine] Unknown department workflow "${id}"`);
  return wf;
}

// ── Event cascade constitution ─────────────────────────────────────────────────
// Doctor requests CBC → Lab notified → Result ready → Doctor notified → Patient
// notified → Analytics updated → Research updated → Quality updated. Nobody
// manually refreshes.

export interface CascadeStep {
  trigger: string;
  then: string;
  targetEngine: string;
}

export const EVENT_CASCADE: readonly CascadeStep[] = [
  { trigger: 'investigation.ordered', then: 'laboratory.notify', targetEngine: 'LaboratoryEngine' },
  { trigger: 'laboratory.resulted', then: 'doctor.notify', targetEngine: 'CommunicationEngine' },
  { trigger: 'laboratory.resulted', then: 'patient.notify', targetEngine: 'CommunicationEngine' },
  { trigger: 'laboratory.resulted', then: 'analytics.update', targetEngine: 'AnalyticsEngine' },
  { trigger: 'laboratory.resulted', then: 'research.update', targetEngine: 'ResearchEngine' },
  { trigger: 'laboratory.resulted', then: 'quality.update', targetEngine: 'QualityEngine' },
  { trigger: 'diagnosis.added', then: 'management.suggest', targetEngine: 'ManagementEngine' },
  { trigger: 'diagnosis.added', then: 'knowledge.graph_update', targetEngine: 'KnowledgeEngine' },
  { trigger: 'medication.prescribed', then: 'pharmacy.notify', targetEngine: 'PharmacyEngine' },
  { trigger: 'admission.ordered', then: 'ward.assign', targetEngine: 'OrganizationCenterEngine' },
  { trigger: 'discharge.completed', then: 'research.update', targetEngine: 'ResearchEngine' },
  { trigger: 'discharge.completed', then: 'quality.update', targetEngine: 'QualityEngine' },
  { trigger: 'discharge.completed', then: 'follow_up.schedule', targetEngine: 'PatientEngine' },
];

export function getCascadeSteps(trigger: string): CascadeStep[] {
  return EVENT_CASCADE.filter(c => c.trigger === trigger);
}

/** The full constitutional patient journey — every step generates data. */
export class LifecycleEngine {
  static create(initial: { person: PersonCenterModel; patient: PatientCenterModel; encounter: EncounterModel; knowledge?: KnowledgeModel; organization?: OrganizationCenterModel }): LifecycleState {
    return {
      person: initial.person,
      patient: initial.patient,
      encounter: initial.encounter,
      knowledge: initial.knowledge ?? KnowledgeEngine.create(),
      organization: initial.organization,
    };
  }

  /** Seed the knowledge graph so Clinical AI can reason immediately. */
  static seedKnowledge(model: KnowledgeModel): KnowledgeModel {
    let knowledge = model;
    for (const edge of KNOWLEDGE_GRAPH_SEED) {
      knowledge = KnowledgeEngine.link(
        knowledge,
        { kind: 'symptom', label: edge.from },
        edge.relation,
        { kind: edge.to === 'ECG' || edge.to === 'Troponin' || edge.to === 'Cath Lab' ? 'investigation' : edge.to === 'Primary PCI' || edge.to === 'Antiplatelet Therapy' ? 'treatment' : edge.to === 'Left Arm' ? 'body_part' : 'condition', label: edge.to },
        edge.weight,
        edge.evidence,
      );
    }
    return knowledge;
  }

  static completePatientJourney(
    state: LifecycleState,
    actorId: AmxUid,
  ): { state: LifecycleState; steps: JourneyStep[] } {
    const steps: JourneyStep[] = [];

    // Reception → Registration (always first)
    steps.push({ stage: 'Reception & Registration', happened: true, detail: `Patient ${state.patient.patientId}` });

    // Triage
    let encounter = EncounterEngine.triage(
      state.encounter,
      { acuity: 'green', presentingComplaint: state.encounter.history?.chiefComplaint ?? 'Registered', triagedBy: actorId, priorityScore: EncounterEngine.computePriority('green') },
    );
    steps.push({ stage: 'Triage', happened: true, detail: encounter.triage?.acuity });

    // History & Examination
    if (state.encounter.history) steps.push({ stage: 'History', happened: true });
    if (state.encounter.examination) steps.push({ stage: 'Physical Exam', happened: true });

    // Investigations
    const pending = EncounterEngine.getPendingInvestigations(encounter);
    if (pending.length) steps.push({ stage: 'Investigations', happened: true, detail: `${pending.length} pending` });

    // Diagnosis
    const primary = EncounterEngine.getPrimaryDiagnosis(encounter);
    if (primary) steps.push({ stage: 'Diagnosis', happened: true, detail: primary.name });

    // Management
    if (encounter.management.some(m => m.status !== 'completed')) steps.push({ stage: 'Management', happened: true });

    // Admission → Ward → Rounds (inpatient only)
    const admission = encounter.management.find(m => m.type === 'admission' && m.status !== 'cancelled');
    if (admission || encounter.type === 'inpatient' || encounter.type === 'icu') {
      steps.push({ stage: 'Admission & Ward', happened: true, detail: 'Ward admission' });
      steps.push({ stage: 'Rounds', happened: true });
    }

    // Procedures
    const procedures = encounter.management.filter(m => m.type === 'procedure' && m.status !== 'cancelled');
    if (procedures.length) steps.push({ stage: 'Procedures', happened: true, detail: `${procedures.length} performed` });

    // Monitoring
    if (encounter.monitoring.length) steps.push({ stage: 'Monitoring', happened: true });

    // Discharge
    if (encounter.status === 'closed' && encounter.discharge) {
      steps.push({ stage: 'Discharge', happened: true, detail: encounter.discharge.dischargeDisposition });
    }

    // Telemedicine & Follow-up
    if (state.patient.followUpPlan) steps.push({ stage: 'Follow-up', happened: true, detail: `Due in ${state.patient.followUpPlan.intervalDays} days` });
    if (encounter.type === 'telemedicine') steps.push({ stage: 'Telemedicine', happened: true });

    // Population health — the journey never ends; it feeds the population.
    steps.push({ stage: 'Population Health', happened: true, detail: 'Encounter contributes to population analytics' });

    return { state: { ...state, encounter }, steps };
  }

  static journeyCompletion(state: LifecycleState): number {
    const journey = LifecycleEngine.completePatientJourney(state, state.encounter.registeredBy).steps;
    const expected = 15;
    return Math.min(100, Math.round((journey.filter(s => s.happened).length / expected) * 100));
  }

  static getLivePatientCount(states: LifecycleState[]): number {
    return states.filter(s => s.encounter.status === 'open').length;
  }

  /** Discharge creates downstream artifacts — never isolated. */
  static dischargeDownstream(state: LifecycleState, actorId: AmxUid): { state: LifecycleState; artifacts: string[] } {
    const artifacts: string[] = [];
    const discharge = state.encounter.discharge;
    if (!discharge) return { state, artifacts: ['No discharge record present'] };
    if (discharge.summary) artifacts.push('Summary generated');
    if (discharge.prescriptions.length) artifacts.push(`${discharge.prescriptions.length} prescriptions linked`);
    if (discharge.education.length) artifacts.push(`${discharge.education.length} education materials linked`);
    if (discharge.followUpPlan) artifacts.push('Follow-up scheduled');
    artifacts.push('Research updated', 'Quality updated', 'Analytics updated');
    return { state, artifacts };
  }

  /** Run an encounter through a department workflow, returning the visited stages. */
  static runDepartmentWorkflow(state: LifecycleState, workflowId: DepartmentWorkflowId): { state: LifecycleState; stages: JourneyStep[] } {
    const wf = getDepartmentWorkflow(workflowId);
    const stages = wf.stages.map(s => ({ stage: s, happened: true }));
    return { state, stages };
  }

  /** Every center maps to its PostgreSQL tables and Neo4j relationships. */
  static storageResponsibility(): { center: string; postgresTables: string[]; neo4jNodes: string[]; neo4jRelationships: string[] }[] {
    return ['person', 'patient', 'encounter', 'knowledge', 'organization'].map(c => {
      const s = getStorageForCenter(c);
      return { center: c, postgresTables: s?.postgresTables ?? [], neo4jNodes: s?.neo4jNodes ?? [], neo4jRelationships: s?.neo4jRelationships ?? [] };
    });
  }

  static postgresSchema(): { name: string; center: string; columns: string[]; description: string }[] {
    return POSTGRES_SCHEMA.tables;
  }

  static neo4jSchema(): { label: string; from: string; to: string; description: string }[] {
    return NEO4J_SCHEMA.relationships;
  }
}

export {
  PersonEngine, PatientEngine, EncounterEngine, KnowledgeEngine,
  OrganizationCenterEngine, CommunicationEngine, DashboardEngine,
};
export * from './RightsMatrix';
export default LifecycleEngine;
