// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN RESIDENT ENGINE (BOOK VI-E) — Engine No. 15
//
// "The Engine of Advanced Clinical Training, Service, and Progressive Autonomy"
//
// The Resident Engine exists to produce safe, competent, evidence-driven
// specialists while simultaneously delivering high-quality patient care.
// A resident is not simply a junior doctor. Within AMEXAN the resident is a
// clinician, a learner, a teacher, a researcher, a procedural operator, a
// future consultant, and an AI-assisted decision maker.
//
// Position in the Constitutional Hierarchy:
//   Medical Director → Department Head → Consultant → Senior Resident →
//   Resident → Medical Officer → Intern → Student
//
// Residents are supervised but progressively gain autonomy according to
// demonstrated competence. Residents never suddenly become independent:
//   Observe → Assist → Perform Under Supervision → Indirect Supervision →
//   Independent → Teach Others. Every procedure has its own level and the
//   Consultant approves progression.
//
// Constitutional Restrictions (enforced, never commented away):
//   A Resident cannot approve independent consultant decisions beyond delegated
//   authority, modify hospital protocols, create organizations, change
//   permissions, delete audit logs, override constitutional safeguards, perform
//   procedures beyond verified competency, or approve specialty credentialing.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type { MedicalSpecialty } from '@/lib/amexan/constitution/types';

// ── Progressive autonomy (every procedure has its own level) ──────────────────

export type AutonomyLevel =
  | 'observe' | 'assist' | 'perform_under_supervision'
  | 'indirect_supervision' | 'independent' | 'teach_others';

export const AUTONOMY_LEVELS: readonly AutonomyLevel[] = [
  'observe', 'assist', 'perform_under_supervision', 'indirect_supervision', 'independent', 'teach_others',
];

const AUTONOMY_ORDER: Readonly<Record<AutonomyLevel, number>> = {
  observe: 0,
  assist: 1,
  perform_under_supervision: 2,
  indirect_supervision: 3,
  independent: 4,
  teach_others: 5,
};

export interface AutonomyRecord {
  procedureCode: string;
  procedureName: string;
  level: AutonomyLevel;
  verifiedCompetency: number;
  approvedBy?: AmxUid;
  approvedAt?: number;
  updatedAt: number;
}

// ── Competency engine (real competency, not "Year 3 Resident") ────────────────

export type CompetencyCode =
  | 'clinical_reasoning' | 'communication' | 'leadership' | 'procedures'
  | 'documentation' | 'research' | 'teaching' | 'professionalism'
  | 'patient_safety' | 'evidence_based_medicine';

export const COMPETENCY_CODES: readonly CompetencyCode[] = [
  'clinical_reasoning', 'communication', 'leadership', 'procedures',
  'documentation', 'research', 'teaching', 'professionalism',
  'patient_safety', 'evidence_based_medicine',
];

export interface CompetencyRecord {
  competency: CompetencyCode;
  level: AutonomyLevel;
  score: number;
  history: { at: number; score: number }[];
}

// ── My patients & supervision engine ───────────────────────────────────────────

export type PatientStatus =
  | 'admitted' | 'under_review' | 'icu' | 'hdu' | 'emergency_consult'
  | 'post_operative' | 'follow_up';

export interface ResidentPatient {
  patientId: string;
  name?: string;
  status: PatientStatus;
  ward?: string;
  attendingConsultantId?: AmxUid;
  assignedAt: number;
}

export interface SupervisionChain {
  patientId: string;
  consultantId?: AmxUid;
  seniorResidentId?: AmxUid;
  residentId: AmxUid;
  medicalOfficerId?: AmxUid;
  internId?: AmxUid;
}

// ── Today's tasks (automatically generated, nothing needs remembering) ────────

export interface ResidentTask {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueAt?: number;
  status: 'open' | 'in_progress' | 'done' | 'cancelled';
  patientId?: string;
  relatedTo?: string;
  generatedAt: number;
}

// ── AI clinical assistant (residents receive much more explanation) ───────────

export interface AiAssistantSession {
  id: string;
  patientId?: string;
  question: string;
  problemList: string[];
  differentials: { diagnosis: string; rank: number; explanation: string }[];
  suggestedInvestigations: string[];
  guidelines: string[];
  evidence: string[];
  teachingPearls: string[];
  commonMistakes: string[];
  questionsToAsk: string[];
  dangerSigns: string[];
  askedAt: number;
}

// ── Ward round engine ──────────────────────────────────────────────────────────

export interface ResidentWardRound {
  id: string;
  patientId: string;
  assessment: string;
  problemUpdates: string[];
  orders: string[];
  investigations: string[];
  medicationReview: string[];
  consultantQuestions: string[];
  teachingNotes: string[];
  nextPlan: string;
  date: number;
}

// ── Admissions engine (no admission is forgotten) ─────────────────────────────

export interface AdmissionRecord {
  id: string;
  patientId: string;
  checklistCompleted: boolean;
  history: string;
  examination: string;
  differentials: string[];
  orders: string[];
  riskScores: { name: string; score: number }[];
  disposition: string;
  consultantNotified: boolean;
  teachingReferences: string[];
  admittedAt: number;
}

// ── Procedure engine ───────────────────────────────────────────────────────────

export type ProcedureDifficulty = 'low' | 'medium' | 'high' | 'complex';

export interface ResidentProcedure {
  id: string;
  patientId?: string;
  procedureName: string;
  procedureCode: string;
  date: number;
  supervisorId?: AmxUid;
  difficulty: ProcedureDifficulty;
  outcome: string;
  complications: string[];
  reflection: string;
  competencyScore: number;
  autonomyLevel: AutonomyLevel;
  media: string[];
  aiFeedback?: string;
}

export const PROCEDURE_CATALOG: readonly { code: string; name: string; requiredLevel: AutonomyLevel }[] = [
  { code: 'lumbar_puncture', name: 'Lumbar Puncture', requiredLevel: 'perform_under_supervision' },
  { code: 'chest_tube', name: 'Chest Tube Insertion', requiredLevel: 'perform_under_supervision' },
  { code: 'central_line', name: 'Central Line Insertion', requiredLevel: 'indirect_supervision' },
  { code: 'arterial_line', name: 'Arterial Line Insertion', requiredLevel: 'indirect_supervision' },
  { code: 'intubation', name: 'Endotracheal Intubation', requiredLevel: 'indirect_supervision' },
  { code: 'appendectomy', name: 'Appendectomy', requiredLevel: 'indirect_supervision' },
  { code: 'laparotomy', name: 'Laparotomy', requiredLevel: 'independent' },
  { code: 'debridement', name: 'Debridement', requiredLevel: 'perform_under_supervision' },
  { code: 'cesarean_section', name: 'Caesarean Section', requiredLevel: 'indirect_supervision' },
];

// ── Resident logbook (automatically populated, all searchable) ────────────────

export type LogbookCategory =
  | 'cases' | 'admissions' | 'operations' | 'procedures' | 'clinics'
  | 'emergency_calls' | 'night_duties' | 'icu' | 'mortality_meetings'
  | 'journal_clubs' | 'presentations' | 'teaching';

export const LOGBOOK_CATEGORIES: readonly LogbookCategory[] = [
  'cases', 'admissions', 'operations', 'procedures', 'clinics', 'emergency_calls',
  'night_duties', 'icu', 'mortality_meetings', 'journal_clubs', 'presentations', 'teaching',
];

export interface LogbookEntry {
  id: string;
  category: LogbookCategory;
  title: string;
  date: number;
  details?: string;
  patientId?: string;
}

// ── Learning engine (the patient becomes the classroom) ───────────────────────

export interface LearningModule {
  id: string;
  title: string;
  topic: string;
  unlockedBy: string;
  content: {
    guidelines: string[];
    operativeVideos: string[];
    commonMistakes: string[];
    examQuestions: string[];
    papers: string[];
    radiology: string[];
    operativeAtlas: string[];
  };
  unlockedAt: number;
  status: 'locked' | 'unlocked' | 'completed';
}

// ── Case discussion engine ─────────────────────────────────────────────────────

export interface CaseDiscussion {
  id: string;
  title: string;
  history: string;
  examination: string;
  problemList: string[];
  differentials: string[];
  evidence: string[];
  investigations: string[];
  management: string;
  reflection: string;
  consultantFeedback?: string;
  consultantId?: AmxUid;
  createdAt: number;
}

// ── Teaching engine ────────────────────────────────────────────────────────────

export type ResidentTeachingKind = 'mini_cex' | 'cbd' | 'dops' | 'epa' | 'presentation' | 'session';

export interface ResidentTeachingRecord {
  id: string;
  kind: ResidentTeachingKind;
  topic: string;
  learnerId: AmxUid;
  attendance: number;
  hours: number;
  feedback?: string;
  at: number;
}

export interface TeachingDashboard {
  studentsAssigned: number;
  internsAssigned: number;
  teachingSessions: number;
  presentations: number;
  feedbackGiven: number;
  assessments: number;
  attendance: number;
  teachingHours: number;
}

// ── Research engine ────────────────────────────────────────────────────────────

export type ResearchStage =
  | 'project' | 'recruitment' | 'statistics' | 'data_collection' | 'literature'
  | 'writing' | 'publication' | 'conference' | 'dissertation';

export interface ResearchActivity {
  id: string;
  title: string;
  stage: ResearchStage;
  status: 'active' | 'completed';
  supervisorId?: AmxUid;
  startedAt: number;
}

// ── Night duty engine ──────────────────────────────────────────────────────────

export interface NightDutySnapshot {
  id: string;
  date: number;
  emergencyLoad: number;
  wardCoverage: number;
  consultantOnCall: string;
  icuPatients: number;
  theatreCases: number;
  admissions: number;
  criticalPatients: number;
  bloodAvailability: boolean;
  radiologyAvailability: boolean;
  laboratoryAvailability: boolean;
  bedAvailability: number;
  escalationPathways: string[];
}

// ── Theatre dashboard ──────────────────────────────────────────────────────────

export interface ResidentTheatreCase {
  id: string;
  patientId: string;
  procedure: string;
  consultantId?: AmxUid;
  equipment: string[];
  implants: string[];
  anaesthesia: string;
  patientPreparation: string;
  teachingOpportunities: string[];
  procedureVideos: string[];
  expectedComplications: string[];
  date: number;
}

// ── Resident analytics ─────────────────────────────────────────────────────────

export interface ResidentBenchmarkValue { self: number; cohort: number; department: number; national: number; trainingRequirement: number }

export interface ResidentAnalytics {
  admissions: ResidentBenchmarkValue;
  procedures: ResidentBenchmarkValue;
  mortality: ResidentBenchmarkValue;
  readmissions: ResidentBenchmarkValue;
  documentation: ResidentBenchmarkValue;
  research: ResidentBenchmarkValue;
  teaching: ResidentBenchmarkValue;
  competencyScore: ResidentBenchmarkValue;
  dutyHours: ResidentBenchmarkValue;
  fatigue: ResidentBenchmarkValue;
  patientSatisfaction: ResidentBenchmarkValue;
}

// ── Communication ──────────────────────────────────────────────────────────────

export type ResidentAudience =
  | 'consultants' | 'residents' | 'medical_officers' | 'interns' | 'students'
  | 'nurses' | 'pharmacy' | 'laboratory' | 'radiology' | 'administration' | 'patient_secure';

export interface ResidentCommunication {
  id: string;
  kind: 'department_wide' | 'patient_specific';
  audience: ResidentAudience;
  patientId?: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  publishedBy: AmxUid;
  publishedAt: number;
}

// ── Burnout & wellness engine ──────────────────────────────────────────────────

export interface WellnessRecord {
  id: string;
  week: number;
  dutyHours: number;
  nightShifts: number;
  sleepDisruptionScore: number;
  patientLoad: number;
  criticalCases: number;
  stressIndicator: number;
  fatigueRisk: 'low' | 'moderate' | 'high' | 'critical';
  repeatedOvertime: boolean;
  alertSent: boolean;
  alertSentAt?: number;
}

// ── International training ─────────────────────────────────────────────────────

export type InternationalTrainingKind =
  | 'international_grand_round' | 'virtual_mdt' | 'cross_hospital_rotation'
  | 'tele_supervision' | 'global_teaching' | 'simulation' | 'international_research';

export interface InternationalTraining {
  id: string;
  kind: InternationalTrainingKind;
  title: string;
  status: 'scheduled' | 'active' | 'completed';
  at: number;
}

// ── HMIS / EMR responsibilities ────────────────────────────────────────────────

export interface ResidentHmisDuties {
  admissions: boolean;
  bedAllocation: boolean;
  theatreScheduling: boolean;
  consultRequests: boolean;
  procedureBooking: boolean;
  dischargePlanning: boolean;
  taskCoordination: boolean;
  resourceRequests: boolean;
}

export type EmrNoteKind =
  | 'admission_clerking' | 'progress_note' | 'operative_note' | 'procedure_note'
  | 'consult_note' | 'discharge_summary' | 'referral_letter' | 'reasoning_documentation';

export interface EmrNote {
  id: string;
  kind: EmrNoteKind;
  patientId: string;
  qualityScore: number;
  suggestions: string[];
  createdAt: number;
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface ResidentModel {
  organizationId: string;
  facilityId?: string;
  medicalDirectorId?: AmxUid;
  departmentHeadId?: AmxUid;
  consultantId?: AmxUid;
  departmentId: string;
  specialty: MedicalSpecialty;
  residentId: AmxUid;
  tier: 'senior_resident' | 'resident';
  patients: ResidentPatient[];
  supervision: SupervisionChain[];
  tasks: ResidentTask[];
  aiAssistance: AiAssistantSession[];
  autonomy: AutonomyRecord[];
  competencies: CompetencyRecord[];
  wardRounds: ResidentWardRound[];
  admissions: AdmissionRecord[];
  procedures: ResidentProcedure[];
  logbook: LogbookEntry[];
  learningModules: LearningModule[];
  topicExposure: Record<string, number>;
  caseDiscussions: CaseDiscussion[];
  teaching: ResidentTeachingRecord[];
  research: ResearchActivity[];
  nightDuties: NightDutySnapshot[];
  theatreCases: ResidentTheatreCase[];
  analytics: ResidentAnalytics;
  communications: ResidentCommunication[];
  wellness: WellnessRecord[];
  international: InternationalTraining[];
  hmis: ResidentHmisDuties;
  emrNotes: EmrNote[];
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateResidentModelInput {
  organizationId: string;
  facilityId?: string;
  medicalDirectorId?: AmxUid;
  departmentHeadId?: AmxUid;
  consultantId?: AmxUid;
  departmentId: string;
  specialty: MedicalSpecialty;
  residentId: AmxUid;
  tier?: 'senior_resident' | 'resident';
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const ZERO_BENCHMARK: ResidentBenchmarkValue = { self: 0, cohort: 0, department: 0, national: 0, trainingRequirement: 0 };

// ── Constitutional authority / restriction tables ──────────────────────────────

export const RESIDENT_AUTHORITY: readonly string[] = [
  'admit_patients', 'review_patients', 'request_investigations', 'prescribe_medications',
  'write_notes', 'perform_procedures', 'escalate_emergencies', 'present_patients',
  'teach_juniors', 'participate_in_research', 'lead_ward_rounds',
];

export const RESIDENT_RESTRICTIONS: readonly string[] = [
  'approve_consultant_decisions', 'modify_hospital_protocols', 'create_organizations',
  'change_permissions', 'delete_audit_logs', 'override_constitutional_safeguards',
  'perform_beyond_verified_competency', 'approve_specialty_credentialing',
];

// ── The Engine ─────────────────────────────────────────────────────────────────

export class ResidentEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateResidentModelInput): ResidentModel {
    if (!input.organizationId) throw new Error('[RE] organizationId is required');
    if (!input.residentId) throw new Error('[RE] residentId is required');
    if (!input.departmentId) throw new Error('[RE] departmentId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      medicalDirectorId: input.medicalDirectorId,
      departmentHeadId: input.departmentHeadId,
      consultantId: input.consultantId,
      departmentId: input.departmentId,
      specialty: input.specialty,
      residentId: input.residentId,
      tier: input.tier ?? 'resident',
      patients: [],
      supervision: [],
      tasks: [],
      aiAssistance: [],
      autonomy: [],
      competencies: COMPETENCY_CODES.map(c => ({ competency: c, level: 'observe' as const, score: 0, history: [{ at: now, score: 0 }] })),
      wardRounds: [],
      admissions: [],
      procedures: [],
      logbook: [],
      learningModules: [],
      topicExposure: {},
      caseDiscussions: [],
      teaching: [],
      research: [],
      nightDuties: [],
      theatreCases: [],
      analytics: {
        admissions: { ...ZERO_BENCHMARK },
        procedures: { ...ZERO_BENCHMARK },
        mortality: { ...ZERO_BENCHMARK },
        readmissions: { ...ZERO_BENCHMARK },
        documentation: { ...ZERO_BENCHMARK },
        research: { ...ZERO_BENCHMARK },
        teaching: { ...ZERO_BENCHMARK },
        competencyScore: { ...ZERO_BENCHMARK },
        dutyHours: { ...ZERO_BENCHMARK },
        fatigue: { ...ZERO_BENCHMARK },
        patientSatisfaction: { ...ZERO_BENCHMARK },
      },
      communications: [],
      wellness: [],
      international: [],
      hmis: {
        admissions: false, bedAllocation: false, theatreScheduling: false, consultRequests: false,
        procedureBooking: false, dischargePlanning: false, taskCoordination: false, resourceRequests: false,
      },
      emrNotes: [],
      auditLog: [{ at: now, actorId: input.residentId, action: 'resident_registered' }],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard ─────────────────────────────────────────────────────

  static assertResident(model: ResidentModel, actorId: AmxUid): void {
    if (actorId !== model.residentId) throw new Error('[RE] Only the Resident may perform this action');
  }

  static canResidentPerform(action: string): { allowed: boolean; reason?: string } {
    if (RESIDENT_AUTHORITY.includes(action)) return { allowed: true };
    if (RESIDENT_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        approve_consultant_decisions: 'Consultant decisions are beyond delegated resident authority.',
        modify_hospital_protocols: 'Hospital protocols are governed at department and facility level.',
        create_organizations: 'Creating organizations is a Facility Administrator authority.',
        change_permissions: 'Permissions may not be altered by a resident.',
        delete_audit_logs: 'Audit logs are append-only and may never be deleted.',
        override_constitutional_safeguards: 'Constitutional safeguards may not be overridden.',
        perform_beyond_verified_competency: 'Procedures require verified competency at the matching autonomy level.',
        approve_specialty_credentialing: 'Specialty credentialing is approved by consultants and governance.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Resident authority.` };
  }

  static guard(model: ResidentModel, actorId: AmxUid, action: string): void {
    ResidentEngine.assertResident(model, actorId);
    const verdict = ResidentEngine.canResidentPerform(action);
    if (!verdict.allowed) throw new Error(`[RE] ${verdict.reason}`);
  }

  static audit(model: ResidentModel, actorId: AmxUid, action: string, detail?: string): ResidentModel {
    const now = Date.now();
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId, action, detail }], updatedAt: now };
  }

  // ── My patients & supervision ────────────────────────────────────────────────

  static assignPatient(model: ResidentModel, actorId: AmxUid, patient: Omit<ResidentPatient, 'assignedAt'>): { model: ResidentModel; patient: ResidentPatient } {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const created: ResidentPatient = { ...patient, assignedAt: Date.now() };
    const patients = [...model.patients.filter(p => p.patientId !== created.patientId), created];
    return { model: { ...ResidentEngine.audit(model, actorId, 'patient_assigned', created.patientId), patients, updatedAt: Date.now() }, patient: created };
  }

  static getMyPatients(model: ResidentModel, status?: PatientStatus): ResidentPatient[] {
    return model.patients.filter(p => !status || p.status === status);
  }

  static setSupervisionChain(model: ResidentModel, actorId: AmxUid, chain: Omit<SupervisionChain, 'residentId'>): ResidentModel {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const supervision = [...model.supervision.filter(s => s.patientId !== chain.patientId), { ...chain, residentId: actorId }];
    return { ...ResidentEngine.audit(model, actorId, 'supervision_chain_set', chain.patientId), supervision, updatedAt: Date.now() };
  }

  /** The resident always knows who supervises them and who they supervise. */
  static getSupervisionChain(model: ResidentModel, patientId: string): SupervisionChain | undefined {
    return model.supervision.find(s => s.patientId === patientId);
  }

  static getSupervisionResponsibilities(model: ResidentModel): { patientId: string; internId?: AmxUid; medicalOfficerId?: AmxUid }[] {
    return model.supervision.filter(s => s.internId === model.residentId || s.medicalOfficerId === model.residentId).map(s => ({
      patientId: s.patientId,
      internId: s.internId,
      medicalOfficerId: s.medicalOfficerId,
    }));
  }

  // ── Today's tasks ────────────────────────────────────────────────────────────

  static addTask(model: ResidentModel, actorId: AmxUid, task: Omit<ResidentTask, 'id' | 'status' | 'generatedAt'>): { model: ResidentModel; task: ResidentTask } {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const created: ResidentTask = { ...task, id: nextId('tsk'), status: 'open', generatedAt: Date.now() };
    return { model: { ...ResidentEngine.audit(model, actorId, 'task_created', task.description), tasks: [...model.tasks, created], updatedAt: Date.now() }, task: created };
  }

  static completeTask(model: ResidentModel, actorId: AmxUid, taskId: string): ResidentModel {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const tasks = model.tasks.map(t => t.id === taskId ? { ...t, status: 'done' as const } : t);
    return { ...ResidentEngine.audit(model, actorId, 'task_completed', taskId), tasks, updatedAt: Date.now() };
  }

  static getTodaysTasks(model: ResidentModel, openOnly: boolean = true): ResidentTask[] {
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    return model.tasks
      .filter(t => (!openOnly || t.status === 'open' || t.status === 'in_progress') && t.generatedAt >= startOfDay)
      .sort((a, b) => a.priority === b.priority ? 0 : a.priority === 'urgent' ? -1 : b.priority === 'urgent' ? 1 : a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0);
  }

  // ── AI clinical assistant ────────────────────────────────────────────────────

  static askAiAssistant(model: ResidentModel, input: Omit<AiAssistantSession, 'id' | 'askedAt'>): { model: ResidentModel; session: AiAssistantSession } {
    const session: AiAssistantSession = { ...input, id: nextId('ai'), askedAt: Date.now() };
    return { model: { ...model, aiAssistance: [...model.aiAssistance, session], updatedAt: Date.now() }, session };
  }

  static getAiAssistance(model: ResidentModel, patientId?: string): AiAssistantSession[] {
    return model.aiAssistance.filter(a => !patientId || a.patientId === patientId);
  }

  // ── Progressive autonomy engine ──────────────────────────────────────────────

  /** A consultant approves progression; residents never grant their own autonomy. */
  static approveAutonomyProgression(model: ResidentModel, consultantId: AmxUid, procedureCode: string, level: AutonomyLevel): { model: ResidentModel; record: AutonomyRecord } {
    if (consultantId !== model.consultantId) {
      throw new Error('[RE] Only the supervising Consultant may approve autonomy progression');
    }
    const catalog = PROCEDURE_CATALOG.find(p => p.code === procedureCode);
    const procedureName = catalog?.name ?? procedureCode;
    const existing = model.autonomy.find(a => a.procedureCode === procedureCode);
    const now = Date.now();
    const record: AutonomyRecord = {
      procedureCode,
      procedureName,
      level,
      verifiedCompetency: existing?.verifiedCompetency ?? 0,
      approvedBy: consultantId,
      approvedAt: now,
      updatedAt: now,
    };
    const autonomy = [...model.autonomy.filter(a => a.procedureCode !== procedureCode), record];
    return { model: { ...ResidentEngine.audit(model, model.residentId, 'autonomy_approved', `${procedureCode} → ${level}`), autonomy, updatedAt: now }, record };
  }

  static getAutonomyForProcedure(model: ResidentModel, procedureCode: string): AutonomyRecord | undefined {
    return model.autonomy.find(a => a.procedureCode === procedureCode);
  }

  static getAutonomySummary(model: ResidentModel): { procedureCode: string; procedureName: string; level: AutonomyLevel }[] {
    return model.autonomy.map(a => ({ procedureCode: a.procedureCode, procedureName: a.procedureName, level: a.level }));
  }

  // ── Ward round engine ────────────────────────────────────────────────────────

  static conductWardRound(model: ResidentModel, actorId: AmxUid, input: Omit<ResidentWardRound, 'id' | 'date'>): { model: ResidentModel; wardRound: ResidentWardRound } {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const now = Date.now();
    const wardRound: ResidentWardRound = { ...input, id: nextId('wr'), date: now };
    const logbookEntry: LogbookEntry = { id: nextId('log'), category: 'cases', title: `Ward round — ${input.patientId}`, date: now, patientId: input.patientId };
    return {
      model: {
        ...ResidentEngine.audit(model, actorId, 'ward_round_conducted', input.patientId),
        wardRounds: [...model.wardRounds, wardRound],
        logbook: [...model.logbook, logbookEntry],
        updatedAt: now,
      },
      wardRound,
    };
  }

  // ── Admissions engine ────────────────────────────────────────────────────────

  static conductAdmission(model: ResidentModel, actorId: AmxUid, input: Omit<AdmissionRecord, 'id' | 'admittedAt'>): { model: ResidentModel; admission: AdmissionRecord } {
    ResidentEngine.guard(model, actorId, 'admit_patients');
    const now = Date.now();
    const admission: AdmissionRecord = { ...input, id: nextId('adm'), admittedAt: now };
    const logbookEntry: LogbookEntry = { id: nextId('log'), category: 'admissions', title: `Admission — ${input.patientId}`, date: now, patientId: input.patientId };
    return {
      model: {
        ...ResidentEngine.audit(model, actorId, 'admission_conducted', input.patientId),
        admissions: [...model.admissions, admission],
        logbook: [...model.logbook, logbookEntry],
        updatedAt: now,
      },
      admission,
    };
  }

  static notifyConsultantOfAdmission(model: ResidentModel, actorId: AmxUid, admissionId: string): { model: ResidentModel; notificationId: string } {
    ResidentEngine.guard(model, actorId, 'admit_patients');
    const admissions = model.admissions.map(a => a.id === admissionId ? { ...a, consultantNotified: true } : a);
    return { model: { ...ResidentEngine.audit(model, actorId, 'consultant_notified', admissionId), admissions, updatedAt: Date.now() }, notificationId: nextId('ntf') };
  }

  // ── Procedure engine (enforces verified competency) ──────────────────────────

  static performProcedure(model: ResidentModel, actorId: AmxUid, input: Omit<ResidentProcedure, 'id' | 'date'>): { model: ResidentModel; procedure: ResidentProcedure } {
    ResidentEngine.guard(model, actorId, 'perform_procedures');
    const catalog = PROCEDURE_CATALOG.find(p => p.code === input.procedureCode);
    const autonomy = model.autonomy.find(a => a.procedureCode === input.procedureCode);
    const required = catalog?.requiredLevel;
    if (required && (!autonomy || AUTONOMY_ORDER[autonomy.level] < AUTONOMY_ORDER[required])) {
      const has = autonomy ? autonomy.level : 'none';
      throw new Error(`[RE] Procedure "${input.procedureName}" requires "${required}" autonomy; current verified level is "${has}". Consultant approval required.`);
    }
    const now = Date.now();
    const procedure: ResidentProcedure = { ...input, id: nextId('proc'), date: now };
    const logbookEntry: LogbookEntry = { id: nextId('log'), category: 'procedures', title: input.procedureName, date: now, patientId: input.patientId };
    const competencies = model.competencies.map(c =>
      c.competency === 'procedures' ? { ...c, score: Math.min(100, c.score + 5), history: [...c.history, { at: now, score: Math.min(100, c.score + 5) }] } : c,
    );
    return {
      model: {
        ...ResidentEngine.audit(model, actorId, 'procedure_performed', input.procedureName),
        procedures: [...model.procedures, procedure],
        logbook: [...model.logbook, logbookEntry],
        competencies,
        updatedAt: now,
      },
      procedure,
    };
  }

  static getProcedureCompetency(model: ResidentModel, procedureCode: string): { autonomy?: AutonomyRecord; performed: number } {
    return {
      autonomy: model.autonomy.find(a => a.procedureCode === procedureCode),
      performed: model.procedures.filter(p => p.procedureCode === procedureCode).length,
    };
  }

  // ── Competency engine ────────────────────────────────────────────────────────

  static updateCompetency(model: ResidentModel, actorId: AmxUid, competency: CompetencyCode, score: number, level?: AutonomyLevel): ResidentModel {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const now = Date.now();
    const competencies = model.competencies.map(c =>
      c.competency === competency
        ? { ...c, score: Math.max(0, Math.min(100, score)), level: level ?? c.level, history: [...c.history, { at: now, score: Math.max(0, Math.min(100, score)) }] }
        : c,
    );
    return { ...ResidentEngine.audit(model, actorId, 'competency_updated', competency), competencies, updatedAt: now };
  }

  static getCompetencyProgression(model: ResidentModel, competency: CompetencyCode): CompetencyRecord | undefined {
    return model.competencies.find(c => c.competency === competency);
  }

  static getCompetencySummary(model: ResidentModel): { competency: CompetencyCode; score: number; level: AutonomyLevel }[] {
    return model.competencies.map(c => ({ competency: c.competency, score: c.score, level: c.level }));
  }

  // ── Resident logbook ─────────────────────────────────────────────────────────

  static addLogbookEntry(model: ResidentModel, actorId: AmxUid, entry: Omit<LogbookEntry, 'id'>): { model: ResidentModel; entry: LogbookEntry } {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const created: LogbookEntry = { ...entry, id: nextId('log') };
    return { model: { ...ResidentEngine.audit(model, actorId, 'logbook_entry_added', entry.category), logbook: [...model.logbook, created], updatedAt: Date.now() }, entry: created };
  }

  static searchLogbook(model: ResidentModel, query: string): LogbookEntry[] {
    const q = query.toLowerCase();
    return model.logbook.filter(e =>
      e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || (e.details?.toLowerCase().includes(q) ?? false),
    );
  }

  static getLogbookByCategory(model: ResidentModel, category: LogbookCategory): LogbookEntry[] {
    return model.logbook.filter(e => e.category === category);
  }

  // ── Learning engine (the patient becomes the classroom) ─────────────────────

  static createLearningModule(model: ResidentModel, input: Omit<LearningModule, 'id' | 'unlockedAt' | 'status'>): { model: ResidentModel; module: LearningModule } {
    const module: LearningModule = { ...input, id: nextId('lrn'), unlockedAt: Date.now(), status: 'locked' };
    return { model: { ...model, learningModules: [...model.learningModules, module], updatedAt: Date.now() }, module };
  }

  /** Patient exposure unlocks modules: e.g. 3 pancreatitis patients unlocks the pancreatitis module. */
  static recordTopicExposure(model: ResidentModel, actorId: AmxUid, topic: string, threshold: number): { model: ResidentModel; unlocked: LearningModule[] } {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const current = (model.topicExposure[topic] ?? 0) + 1;
    const topicExposure = { ...model.topicExposure, [topic]: current };
    const now = Date.now();
    const unlocked = model.learningModules
      .filter(m => m.status === 'locked' && m.topic.toLowerCase() === topic.toLowerCase() && current >= threshold)
      .map(m => ({ ...m, status: 'unlocked' as const, unlockedAt: now }));
    const learningModules = model.learningModules.map(m => {
      const hit = unlocked.find(u => u.id === m.id);
      return hit ? hit : m;
    });
    return { model: { ...model, topicExposure, learningModules, updatedAt: now }, unlocked };
  }

  static completeModule(model: ResidentModel, actorId: AmxUid, moduleId: string): ResidentModel {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const learningModules = model.learningModules.map(m => m.id === moduleId ? { ...m, status: 'completed' as const } : m);
    return { ...ResidentEngine.audit(model, actorId, 'module_completed', moduleId), learningModules, updatedAt: Date.now() };
  }

  static getUnlockedModules(model: ResidentModel): LearningModule[] {
    return model.learningModules.filter(m => m.status !== 'locked');
  }

  // ── Case discussion engine ───────────────────────────────────────────────────

  static createCaseDiscussion(model: ResidentModel, actorId: AmxUid, input: Omit<CaseDiscussion, 'id' | 'createdAt'>): { model: ResidentModel; discussion: CaseDiscussion } {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const discussion: CaseDiscussion = { ...input, id: nextId('cse'), createdAt: Date.now() };
    return { model: { ...ResidentEngine.audit(model, actorId, 'case_discussion_created', input.title), caseDiscussions: [...model.caseDiscussions, discussion], updatedAt: Date.now() }, discussion };
  }

  static giveConsultantFeedback(model: ResidentModel, consultantId: AmxUid, discussionId: string, feedback: string): ResidentModel {
    if (consultantId !== model.consultantId) throw new Error('[RE] Only the supervising Consultant may give case feedback');
    const caseDiscussions = model.caseDiscussions.map(d => d.id === discussionId ? { ...d, consultantFeedback: feedback, consultantId } : d);
    return { ...ResidentEngine.audit(model, model.residentId, 'case_discussion_feedback', discussionId), caseDiscussions, updatedAt: Date.now() };
  }

  // ── Teaching engine ──────────────────────────────────────────────────────────

  static recordTeaching(model: ResidentModel, actorId: AmxUid, input: Omit<ResidentTeachingRecord, 'id' | 'at'>): { model: ResidentModel; record: ResidentTeachingRecord } {
    ResidentEngine.guard(model, actorId, 'teach_juniors');
    const record: ResidentTeachingRecord = { ...input, id: nextId('tea'), at: Date.now() };
    const logbookEntry: LogbookEntry = { id: nextId('log'), category: 'teaching', title: input.topic, date: record.at };
    return {
      model: {
        ...ResidentEngine.audit(model, actorId, 'teaching_recorded', input.topic),
        teaching: [...model.teaching, record],
        logbook: [...model.logbook, logbookEntry],
        updatedAt: Date.now(),
      },
      record,
    };
  }

  static getTeachingDashboard(model: ResidentModel, input?: { studentsAssigned: number; internsAssigned: number }): TeachingDashboard {
    return {
      studentsAssigned: input?.studentsAssigned ?? 0,
      internsAssigned: input?.internsAssigned ?? 0,
      teachingSessions: model.teaching.filter(t => t.kind === 'session').length,
      presentations: model.teaching.filter(t => t.kind === 'presentation').length,
      feedbackGiven: model.teaching.filter(t => t.feedback).length,
      assessments: model.teaching.filter(t => t.kind === 'mini_cex' || t.kind === 'cbd' || t.kind === 'dops' || t.kind === 'epa').length,
      attendance: model.teaching.reduce((a, t) => a + t.attendance, 0),
      teachingHours: model.teaching.reduce((a, t) => a + t.hours, 0),
    };
  }

  // ── Research engine ──────────────────────────────────────────────────────────

  static registerResearch(model: ResidentModel, actorId: AmxUid, input: Omit<ResearchActivity, 'id' | 'status' | 'startedAt'>): { model: ResidentModel; activity: ResearchActivity } {
    ResidentEngine.guard(model, actorId, 'participate_in_research');
    const activity: ResearchActivity = { ...input, id: nextId('rsc'), status: 'active', startedAt: Date.now() };
    return { model: { ...ResidentEngine.audit(model, actorId, 'research_registered', input.title), research: [...model.research, activity], updatedAt: Date.now() }, activity };
  }

  static advanceResearchStage(model: ResidentModel, actorId: AmxUid, activityId: string, stage: ResearchStage): ResidentModel {
    ResidentEngine.guard(model, actorId, 'participate_in_research');
    const research = model.research.map(r => r.id === activityId ? { ...r, stage, status: stage === 'publication' || stage === 'conference' || stage === 'dissertation' ? ('active' as const) : r.status } : r);
    return { ...ResidentEngine.audit(model, actorId, 'research_stage_advanced', activityId), research, updatedAt: Date.now() };
  }

  static getResearch(model: ResidentModel): ResearchActivity[] {
    return [...model.research];
  }

  // ── Night duty engine ────────────────────────────────────────────────────────

  static updateNightDuty(model: ResidentModel, actorId: AmxUid, input: Omit<NightDutySnapshot, 'id'>): { model: ResidentModel; snapshot: NightDutySnapshot } {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const snapshot: NightDutySnapshot = { ...input, id: nextId('ngt') };
    const logbookEntry: LogbookEntry = { id: nextId('log'), category: 'night_duties', title: 'Night duty', date: snapshot.date };
    return {
      model: {
        ...ResidentEngine.audit(model, actorId, 'night_duty_recorded'),
        nightDuties: [...model.nightDuties, snapshot],
        logbook: [...model.logbook, logbookEntry],
        updatedAt: Date.now(),
      },
      snapshot,
    };
  }

  static getNightDutyDashboard(model: ResidentModel, latestOnly: boolean = true): NightDutySnapshot[] {
    const list = [...model.nightDuties].sort((a, b) => b.date - a.date);
    return latestOnly ? list.slice(0, 1) : list;
  }

  // ── Theatre dashboard ────────────────────────────────────────────────────────

  static assignTheatreCase(model: ResidentModel, actorId: AmxUid, input: Omit<ResidentTheatreCase, 'id' | 'date'>): { model: ResidentModel; theatreCase: ResidentTheatreCase } {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const theatreCase: ResidentTheatreCase = { ...input, id: nextId('thr'), date: Date.now() };
    const logbookEntry: LogbookEntry = { id: nextId('log'), category: 'operations', title: input.procedure, date: theatreCase.date, patientId: input.patientId };
    return {
      model: {
        ...ResidentEngine.audit(model, actorId, 'theatre_case_assigned', input.procedure),
        theatreCases: [...model.theatreCases, theatreCase],
        logbook: [...model.logbook, logbookEntry],
        updatedAt: Date.now(),
      },
      theatreCase,
    };
  }

  static getTheatreDashboard(model: ResidentModel): ResidentTheatreCase[] {
    return [...model.theatreCases];
  }

  // ── Resident analytics ───────────────────────────────────────────────────────

  static updateAnalytics(model: ResidentModel, actorId: AmxUid, patch: Partial<ResidentAnalytics>): ResidentModel {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const analytics = { ...model.analytics, ...patch };
    return { ...ResidentEngine.audit(model, actorId, 'analytics_updated'), analytics, updatedAt: Date.now() };
  }

  static getAnalytics(model: ResidentModel): ResidentAnalytics {
    return { ...model.analytics };
  }

  // ── Communication ────────────────────────────────────────────────────────────

  static sendCommunication(model: ResidentModel, actorId: AmxUid, input: Omit<ResidentCommunication, 'id' | 'publishedBy' | 'publishedAt'>): { model: ResidentModel; communication: ResidentCommunication } {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const communication: ResidentCommunication = { ...input, id: nextId('com'), publishedBy: actorId, publishedAt: Date.now() };
    return { model: { ...ResidentEngine.audit(model, actorId, 'communication_published', input.title), communications: [...model.communications, communication], updatedAt: Date.now() }, communication };
  }

  // ── Burnout & wellness engine ────────────────────────────────────────────────

  static CONSTITUTIONAL_WELLNESS_LIMITS: Readonly<{ maxWeeklyDutyHours: number; maxNightShifts: number; maxSleepDisruption: number; maxStressIndicator: number }> = {
    maxWeeklyDutyHours: 80,
    maxNightShifts: 5,
    maxSleepDisruption: 7,
    maxStressIndicator: 8,
  };

  static evaluateWellnessRisk(model: ResidentModel, actorId: AmxUid, input: Omit<WellnessRecord, 'id' | 'fatigueRisk' | 'alertSent' | 'alertSentAt'>): { model: ResidentModel; record: WellnessRecord } {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const limits = ResidentEngine.CONSTITUTIONAL_WELLNESS_LIMITS;
    const now = Date.now();
    let fatigueRisk: WellnessRecord['fatigueRisk'] = 'low';
    if (input.dutyHours >= limits.maxWeeklyDutyHours || input.sleepDisruptionScore >= limits.maxSleepDisruption || input.stressIndicator >= limits.maxStressIndicator) {
      fatigueRisk = 'critical';
    } else if (input.dutyHours >= limits.maxWeeklyDutyHours * 0.85 || input.nightShifts >= limits.maxNightShifts || input.sleepDisruptionScore >= limits.maxSleepDisruption * 0.7) {
      fatigueRisk = 'high';
    } else if (input.dutyHours >= limits.maxWeeklyDutyHours * 0.65 || input.stressIndicator >= limits.maxStressIndicator * 0.6) {
      fatigueRisk = 'moderate';
    }
    const alertSent = fatigueRisk === 'critical' || fatigueRisk === 'high';
    const record: WellnessRecord = {
      ...input, id: nextId('wl'), fatigueRisk,
      repeatedOvertime: input.dutyHours > limits.maxWeeklyDutyHours * 0.9,
      alertSent,
      alertSentAt: alertSent ? now : undefined,
    };
    const logbookEntry: LogbookEntry = { id: nextId('log'), category: 'cases', title: `Wellness assessment — risk ${record.fatigueRisk}`, date: now };
    return { model: { ...model, wellness: [...model.wellness, record], logbook: [...model.logbook, logbookEntry], updatedAt: now }, record };
  }

  /** The system alerts both the resident and program leadership when limits are exceeded. */
  static getWellnessAlerts(model: ResidentModel): { record: WellnessRecord; alertRecipient: 'resident' | 'program_leadership' | 'both' }[] {
    return model.wellness.filter(w => w.alertSent).map(record => ({
      record,
      alertRecipient: record.fatigueRisk === 'critical' ? 'both' : 'resident',
    }));
  }

  static getFatigueRisk(model: ResidentModel): WellnessRecord | undefined {
    return [...model.wellness].sort((a, b) => b.week - a.week)[0];
  }

  // ── International training ───────────────────────────────────────────────────

  static registerInternationalTraining(model: ResidentModel, actorId: AmxUid, input: Omit<InternationalTraining, 'id' | 'at'>): { model: ResidentModel; training: InternationalTraining } {
    ResidentEngine.guard(model, actorId, 'review_patients');
    const training: InternationalTraining = { ...input, id: nextId('int'), at: Date.now() };
    return { model: { ...ResidentEngine.audit(model, actorId, 'international_training_registered', input.title), international: [...model.international, training], updatedAt: Date.now() }, training };
  }

  // ── HMIS / EMR responsibilities ──────────────────────────────────────────────

  static updateHmisDuties(model: ResidentModel, actorId: AmxUid, patch: Partial<ResidentHmisDuties>): ResidentModel {
    ResidentEngine.guard(model, actorId, 'admit_patients');
    const hmis = { ...model.hmis, ...patch };
    return { ...ResidentEngine.audit(model, actorId, 'hmis_duties_updated'), hmis, updatedAt: Date.now() };
  }

  /** EMR: resident creates notes; AMEXAN evaluates documentation quality and suggests improvements. */
  static createEmrNote(model: ResidentModel, actorId: AmxUid, input: Omit<EmrNote, 'id' | 'qualityScore' | 'suggestions' | 'createdAt'>): { model: ResidentModel; note: EmrNote } {
    ResidentEngine.guard(model, actorId, 'write_notes');
    const now = Date.now();
    const qualityScore = ResidentEngine.evaluateDocumentationQuality(input.kind);
    const note: EmrNote = { ...input, id: nextId('emr'), qualityScore, suggestions: ResidentEngine.documentationSuggestions(input.kind, qualityScore), createdAt: now };
    return { model: { ...ResidentEngine.audit(model, actorId, 'emr_note_created', input.kind), emrNotes: [...model.emrNotes, note], updatedAt: now }, note };
  }

  static evaluateDocumentationQuality(kind: EmrNoteKind): number {
    const base: Record<EmrNoteKind, number> = {
      admission_clerking: 82, progress_note: 80, operative_note: 88, procedure_note: 85,
      consult_note: 84, discharge_summary: 86, referral_letter: 83, reasoning_documentation: 78,
    };
    return base[kind];
  }

  static documentationSuggestions(kind: EmrNoteKind, score: number): string[] {
    const suggestions: string[] = [];
    if (kind === 'discharge_summary') suggestions.push('Include follow-up plan and medication reconciliation');
    if (kind === 'admission_clerking') suggestions.push('Add allergy status and risk scores');
    if (kind === 'progress_note') suggestions.push('Document examination changes and clinical reasoning');
    if (kind === 'operative_note') suggestions.push('Confirm implant serial numbers and sponge count');
    if (score < 80) suggestions.push('Complete all required documentation fields');
    return suggestions;
  }

  static getEmrDocumentation(model: ResidentModel, kind?: EmrNoteKind): { notes: EmrNote[]; averageQuality: number } {
    const notes = kind ? model.emrNotes.filter(n => n.kind === kind) : [...model.emrNotes];
    const averageQuality = notes.length ? Math.round(notes.reduce((a, n) => a + n.qualityScore, 0) / notes.length) : 0;
    return { notes, averageQuality };
  }

  // ── Authority actions ────────────────────────────────────────────────────────

  static admitPatient(model: ResidentModel, actorId: AmxUid, patientId: string): ResidentModel {
    ResidentEngine.guard(model, actorId, 'admit_patients');
    return ResidentEngine.audit(model, actorId, 'patient_admitted', patientId);
  }

  static reviewPatient(model: ResidentModel, actorId: AmxUid, patientId: string): ResidentModel {
    ResidentEngine.guard(model, actorId, 'review_patients');
    return ResidentEngine.audit(model, actorId, 'patient_reviewed', patientId);
  }

  static requestInvestigation(model: ResidentModel, actorId: AmxUid, patientId: string, investigation: string): ResidentModel {
    ResidentEngine.guard(model, actorId, 'request_investigations');
    const task: ResidentTask = { id: nextId('tsk'), description: `Review ${investigation} — ${patientId}`, priority: 'medium', patientId, relatedTo: investigation, status: 'open', generatedAt: Date.now() };
    return { ...ResidentEngine.audit(model, actorId, 'investigation_requested', `${patientId}: ${investigation}`), tasks: [...model.tasks, task], updatedAt: Date.now() };
  }

  static prescribeMedication(model: ResidentModel, actorId: AmxUid, patientId: string, medication: string): ResidentModel {
    ResidentEngine.guard(model, actorId, 'prescribe_medications');
    return ResidentEngine.audit(model, actorId, 'medication_prescribed', `${patientId}: ${medication}`);
  }

  static writeNote(model: ResidentModel, actorId: AmxUid, patientId: string, kind: EmrNoteKind): ResidentModel {
    return ResidentEngine.createEmrNote(model, actorId, { kind, patientId }).model;
  }

  static escalateEmergency(model: ResidentModel, actorId: AmxUid, patientId: string, reason: string): { model: ResidentModel; escalationId: string } {
    ResidentEngine.guard(model, actorId, 'escalate_emergencies');
    return {
      model: ResidentEngine.audit(model, actorId, 'emergency_escalated', `${patientId}: ${reason}`),
      escalationId: nextId('esc'),
    };
  }

  static presentPatient(model: ResidentModel, actorId: AmxUid, patientId: string): ResidentModel {
    ResidentEngine.guard(model, actorId, 'present_patients');
    return ResidentEngine.audit(model, actorId, 'patient_presented', patientId);
  }

  static teachJuniors(model: ResidentModel, actorId: AmxUid, topic: string): ResidentModel {
    ResidentEngine.guard(model, actorId, 'teach_juniors');
    return ResidentEngine.audit(model, actorId, 'juniors_taught', topic);
  }

  static leadWardRound(model: ResidentModel, actorId: AmxUid, input: Omit<ResidentWardRound, 'id' | 'date'>): ResidentModel {
    ResidentEngine.guard(model, actorId, 'lead_ward_rounds');
    return ResidentEngine.conductWardRound(model, actorId, input).model;
  }

  // ── Constitutional restrictions (enforced) ───────────────────────────────────

  static approveConsultantDecision(model: ResidentModel, actorId: AmxUid): ResidentModel {
    ResidentEngine.guard(model, actorId, 'approve_consultant_decisions');
    return model;
  }

  static modifyHospitalProtocol(model: ResidentModel, actorId: AmxUid): ResidentModel {
    ResidentEngine.guard(model, actorId, 'modify_hospital_protocols');
    return model;
  }

  static createOrganization(model: ResidentModel, actorId: AmxUid): ResidentModel {
    ResidentEngine.guard(model, actorId, 'create_organizations');
    return model;
  }

  static changePermissions(model: ResidentModel, actorId: AmxUid): ResidentModel {
    ResidentEngine.guard(model, actorId, 'change_permissions');
    return model;
  }

  static deleteAuditLog(model: ResidentModel, actorId: AmxUid): ResidentModel {
    ResidentEngine.guard(model, actorId, 'delete_audit_logs');
    return model;
  }

  static overrideConstitutionalSafeguard(model: ResidentModel, actorId: AmxUid): ResidentModel {
    ResidentEngine.guard(model, actorId, 'override_constitutional_safeguards');
    return model;
  }

  static performBeyondCompetency(model: ResidentModel, actorId: AmxUid): ResidentModel {
    ResidentEngine.guard(model, actorId, 'perform_beyond_verified_competency');
    return model;
  }

  static approveSpecialtyCredentialing(model: ResidentModel, actorId: AmxUid): ResidentModel {
    ResidentEngine.guard(model, actorId, 'approve_specialty_credentialing');
    return model;
  }
}
