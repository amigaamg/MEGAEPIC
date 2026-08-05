// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN ENCOUNTER ENGINE (BOOK VIII — Center 3)
//
// This is where hospitals operate. Everything clinical belongs to the Encounter.
// The encounter is the HMIS; the EMR lives inside the encounter.
//
// Lifecycle:
//   Registration → Triage → History → Examination → Investigations → Diagnosis →
//   Management → Monitoring → Discharge → Follow-up
//
// Every department — Emergency, Medicine, Surgery, Pediatrics, OBG, ICU — runs
// the SAME constitutional engine with different workflows.
//
// Stored in PostgreSQL (encounter, encounter_events, orders, results, notes,
// procedures, billing, medications, vitals, appointments, discharge) and Neo4j
// (Encounter → Symptoms → Signs → Diagnoses → Investigations → Treatments →
// Outcomes) which becomes the AI reasoning graph.
//
// Pure and deterministic. Persistence is orchestrated by the conductor.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type {
  DiagnosisRecord, DischargeRecord, EncounterEvent, EncounterModel,
  ExaminationRecord, HistoryRecord, InvestigationOrder, ManagementRecord,
  MonitoringRecord, TriageRecord,
} from './types';

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface CreateEncounterInput {
  patientId: string;
  organizationId: string;
  type: EncounterModel['type'];
  registeredBy: AmxUid;
}

function stageOf(type: EncounterModel['type']): EncounterModel['stage'] {
  if (type === 'emergency') return 'triage';
  return 'registration';
}

function pushEvent(model: EncounterModel, type: string, actorId: AmxUid, payload: string): EncounterModel {
  const event: EncounterEvent = { id: nextId('evt'), type, at: Date.now(), actorId, payload };
  return { ...model, events: [...model.events, event] };
}

export class EncounterEngine {
  static create(input: CreateEncounterInput): EncounterModel {
    if (!input.patientId || !input.organizationId || !input.registeredBy) {
      throw new Error('[EncounterEngine] patientId, organizationId, and registeredBy are required');
    }
    const now = Date.now();
    const base: EncounterModel = {
      id: nextId('enc'),
      patientId: input.patientId,
      organizationId: input.organizationId,
      type: input.type,
      stage: stageOf(input.type),
      registeredAt: now,
      registeredBy: input.registeredBy,
      investigations: [],
      diagnoses: [],
      management: [],
      monitoring: [],
      events: [],
      status: 'open',
    };
    return pushEvent(base, 'encounter_registered', input.registeredBy, `Encounter opened (${input.type})`);
  }

  static setStage(model: EncounterModel, stage: EncounterModel['stage'], actorId: AmxUid): EncounterModel {
    return pushEvent({ ...model, stage }, 'stage_changed', actorId, `Stage → ${stage}`);
  }

  // ── Triage ───────────────────────────────────────────────────────────────────

  static triage(model: EncounterModel, input: Omit<TriageRecord, 'id' | 'triagedAt'>): EncounterModel {
    const record: TriageRecord = { ...input, id: nextId('tri'), triagedAt: Date.now() };
    const next: EncounterModel = { ...model, triage: record, stage: 'triage' };
    return pushEvent(next, 'triage_completed', input.triagedBy, `Acuity ${input.acuity}`);
  }

  static computePriority(acuity: TriageRecord['acuity']): number {
    switch (acuity) {
      case 'red': return 100;
      case 'orange': return 75;
      case 'yellow': return 50;
      case 'green': return 25;
      default: return 10;
    }
  }

  // ── History (structured intelligence, becomes graph nodes) ──────────────────

  static recordHistory(model: EncounterModel, input: Omit<HistoryRecord, 'id' | 'takenAt'>): EncounterModel {
    const record: HistoryRecord = { ...input, id: nextId('hist'), takenAt: Date.now() };
    const next: EncounterModel = { ...model, history: record, stage: 'history' };
    return pushEvent(next, 'history_recorded', input.takenBy, input.chiefComplaint);
  }

  // ── Examination ──────────────────────────────────────────────────────────────

  static recordExamination(model: EncounterModel, input: Omit<ExaminationRecord, 'id' | 'examinedAt'>): EncounterModel {
    const record: ExaminationRecord = { ...input, id: nextId('exam'), examinedAt: Date.now() };
    const next: EncounterModel = { ...model, examination: record, stage: 'examination' };
    return pushEvent(next, 'examination_recorded', input.examinedBy, `${input.positiveFindings.length} positive findings`);
  }

  // ── Investigations ───────────────────────────────────────────────────────────

  static orderInvestigation(model: EncounterModel, input: Omit<InvestigationOrder, 'id' | 'orderedAt' | 'status'>): EncounterModel {
    const order: InvestigationOrder = { ...input, id: nextId('ord'), orderedAt: Date.now(), status: 'ordered' };
    const next: EncounterModel = { ...model, investigations: [...model.investigations, order], stage: 'investigation' };
    return pushEvent(next, 'investigation_ordered', input.orderedBy, `${input.type}: ${input.tests.join(', ')}`);
  }

  static resultInvestigation(model: EncounterModel, orderId: string, resultId: string, resultSummary: string): EncounterModel {
    const investigations = model.investigations.map(o => (o.id === orderId ? { ...o, status: 'resulted' as const, resultId, resultSummary } : o));
    return pushEvent({ ...model, investigations }, 'investigation_resulted', model.registeredBy, resultSummary);
  }

  static getPendingInvestigations(model: EncounterModel): InvestigationOrder[] {
    return model.investigations.filter(i => i.status !== 'resulted' && i.status !== 'cancelled');
  }

  // ── Diagnosis ────────────────────────────────────────────────────────────────

  static addDiagnosis(model: EncounterModel, input: Omit<DiagnosisRecord, 'id' | 'notedAt'>): EncounterModel {
    const record: DiagnosisRecord = { ...input, id: nextId('dx'), notedAt: Date.now() };
    const next: EncounterModel = { ...model, diagnoses: [...model.diagnoses, record], stage: 'diagnosis' };
    return pushEvent(next, 'diagnosis_added', input.notedBy, `${input.name} (${input.status})`);
  }

  static updateDiagnosisStatus(model: EncounterModel, diagnosisId: string, status: DiagnosisRecord['status']): EncounterModel {
    const diagnoses = model.diagnoses.map(d => (d.id === diagnosisId ? { ...d, status } : d));
    return pushEvent({ ...model, diagnoses }, 'diagnosis_updated', model.registeredBy, status);
  }

  static getConfirmedDiagnoses(model: EncounterModel): DiagnosisRecord[] {
    return model.diagnoses.filter(d => d.status === 'confirmed');
  }

  static getPrimaryDiagnosis(model: EncounterModel): DiagnosisRecord | undefined {
    return model.diagnoses
      .filter(d => d.status === 'confirmed' || d.status === 'working')
      .sort((a, b) => b.certainty - a.certainty)[0];
  }

  // ── Management ───────────────────────────────────────────────────────────────

  static addManagement(model: EncounterModel, input: Omit<ManagementRecord, 'id' | 'orderedAt' | 'status'>): EncounterModel {
    const record: ManagementRecord = { ...input, id: nextId('mgmt'), orderedAt: Date.now(), status: 'ordered' };
    const next: EncounterModel = { ...model, management: [...model.management, record], stage: 'management' };
    return pushEvent(next, 'management_ordered', input.orderedBy, `${input.type}: ${input.title}`);
  }

  static completeManagement(model: EncounterModel, managementId: string): EncounterModel {
    const management = model.management.map(m => (m.id === managementId ? { ...m, status: 'completed' as const } : m));
    return pushEvent({ ...model, management }, 'management_completed', model.registeredBy, managementId);
  }

  // ── Monitoring ───────────────────────────────────────────────────────────────

  static recordMonitoring(model: EncounterModel, input: Omit<MonitoringRecord, 'id' | 'recordedAt'>): EncounterModel {
    const record: MonitoringRecord = { ...input, id: nextId('mon'), recordedAt: Date.now() };
    const next: EncounterModel = { ...model, monitoring: [...model.monitoring, record], stage: 'monitoring' };
    return pushEvent(next, 'monitoring_recorded', input.recordedBy, `${input.type}: ${input.value}`);
  }

  // ── Discharge ────────────────────────────────────────────────────────────────

  static discharge(model: EncounterModel, input: Omit<DischargeRecord, 'id' | 'completedAt'>): { model: EncounterModel; discharge: DischargeRecord } {
    const record: DischargeRecord = { ...input, id: nextId('dc'), completedAt: Date.now() };
    const closed: EncounterModel = {
      ...model,
      discharge: record,
      stage: 'discharge',
      status: 'closed',
      closedAt: Date.now(),
    };
    return { model: pushEvent(closed, 'encounter_discharged', input.completedBy, input.dischargeDisposition), discharge: record };
  }

  static reopen(model: EncounterModel, actorId: AmxUid): EncounterModel {
    return pushEvent({ ...model, status: 'open', closedAt: undefined }, 'encounter_reopened', actorId, 'Follow-up reopened');
  }

  // ── Convenience / summary ────────────────────────────────────────────────────

  static getPatientSummary(model: EncounterModel): {
    type: EncounterModel['type'];
    stage: EncounterModel['stage'];
    triageAcuity?: TriageRecord['acuity'];
    chiefComplaint?: string;
    primaryDiagnosis?: string;
    confirmedDiagnoses: string[];
    pendingInvestigations: number;
    managementActive: number;
    status: EncounterModel['status'];
  } {
    const primary = EncounterEngine.getPrimaryDiagnosis(model);
    return {
      type: model.type,
      stage: model.stage,
      triageAcuity: model.triage?.acuity,
      chiefComplaint: model.history?.chiefComplaint,
      primaryDiagnosis: primary?.name,
      confirmedDiagnoses: EncounterEngine.getConfirmedDiagnoses(model).map(d => d.name),
      pendingInvestigations: EncounterEngine.getPendingInvestigations(model).length,
      managementActive: model.management.filter(m => m.status !== 'completed').length,
      status: model.status,
    };
  }

  static getTimeline(model: EncounterModel): EncounterEvent[] {
    return [...model.events].sort((a, b) => b.at - a.at);
  }
}

export default EncounterEngine;
