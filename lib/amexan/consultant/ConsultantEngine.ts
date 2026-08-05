// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN CONSULTANT ENGINE (BOOK VI-D) — Engine No. 14
//
// "Master Clinical Decision Maker & Knowledge Leader"
//
// The Consultant is the highest clinical authority within their specialty.
// They are not administrators first — they are expert clinicians, educators,
// mentors, researchers, innovators, and custodians of evidence-based medicine.
// AMEXAN is designed to amplify the consultant's reasoning, not replace it.
//
// Position in the Constitutional Hierarchy:
//   Medical Director → Department Head → Consultant → Senior Registrar →
//   Registrar → Medical Officer → Intern → Student
//
// AI Collaboration: consultants are partners with the Clinical Intelligence
// Engine. They may accept suggestions, reject suggestions, annotate evidence,
// teach the engine, flag errors, create specialty knowledge, and build
// institution-specific reasoning. Every correction strengthens the
// constitutional knowledge base while preserving auditability.
//
// Constitutional Restrictions (enforced, never commented away):
//   A Consultant cannot manage hospital finances, create organizations, modify
//   constitutional engines, change enterprise security, access unrelated
//   departments without authorization, delete audit logs, override legal
//   consent requirements, or alter identity records.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type { MedicalSpecialty } from '@/lib/amexan/constitution/types';

// ── Clinical workload (Consultant Command Centre) ──────────────────────────────

export interface ConsultantWorkload {
  wardRoundsToday: number;
  newAdmissionsAwaitingReview: number;
  icuConsultations: number;
  emergencyConsults: number;
  theatreCases: number;
  clinicAppointments: number;
  telemedicineConsultations: number;
  multidisciplinaryMeetings: number;
  referralsAwaitingOpinion: number;
}

// ── Patient intelligence (AI ranks every patient by urgency) ──────────────────

export type UrgencyCategory =
  | 'critically_unstable' | 'new_deterioration' | 'diagnostic_uncertainty'
  | 'escalating_news' | 'high_mortality_risk' | 'pending_investigations'
  | 'delayed_procedures' | 'prolonged_admission' | 'high_litigation_risk'
  | 'complex_multidisciplinary';

export const URGENCY_CATEGORIES: readonly UrgencyCategory[] = [
  'critically_unstable', 'new_deterioration', 'diagnostic_uncertainty',
  'escalating_news', 'high_mortality_risk', 'pending_investigations',
  'delayed_procedures', 'prolonged_admission', 'high_litigation_risk',
  'complex_multidisciplinary',
];

export interface RankedPatient {
  patientId: string;
  name?: string;
  urgencyScore: number;
  categories: UrgencyCategory[];
  aiSummary: string;
  lastRankedAt: number;
}

// ── AI Case Interpretation Wall ────────────────────────────────────────────────

export interface CaseInterpretation {
  patientId: string;
  chiefComplaint: string;
  historyTimeline: string[];
  positiveFindings: string[];
  negativeFindings: string[];
  problemList: string[];
  differentialDiagnosis: { diagnosis: string; evidencePercent: number }[];
  workingDiagnosis: string;
  evidence: string[];
  investigations: string[];
  interpretation: string;
  treatment: string[];
  expectedOutcomes: string[];
  complications: string[];
  learningPoints: string[];
  generatedAt: number;
}

// ── Clinical workspace ─────────────────────────────────────────────────────────

export interface PatientTimelineEvent {
  id: string;
  stage: 'arrival' | 'triage' | 'emergency' | 'admission' | 'ward' | 'icu' | 'surgery' | 'recovery' | 'discharge' | 'follow_up';
  at: number;
  detail?: string;
}

export interface ProblemListEntry {
  id: string;
  problem: string;
  status: 'active' | 'resolved' | 'chronic' | 'monitoring';
  owner: AmxUid;
  priority: 'low' | 'medium' | 'high' | 'critical';
  linkedInvestigations: string[];
  linkedMedications: string[];
  linkedProtocols: string[];
}

export interface DiagnosticReasoningPanel {
  history: string[];
  physicalFindings: string[];
  laboratoryAbnormalities: string[];
  radiology: string[];
  aiInterpretation: string;
  evidence: string[];
  differentialRanking: { diagnosis: string; rank: number; likelihoodPercent: number }[];
  recommendedInvestigations: string[];
  recommendedTreatment: string[];
}

export interface PatientWorkspace {
  patientId: string;
  timeline: PatientTimelineEvent[];
  problemList: ProblemListEntry[];
  diagnosticPanel: DiagnosticReasoningPanel;
}

// ── Decision support (not "AI says...") ────────────────────────────────────────

export interface DecisionSupportRecord {
  patientId: string;
  diagnosis: string;
  evidencePercent: number;
  supportingFindings: string[];
  contradictingFindings: string[];
  missingInformation: string[];
  alternativeDiagnoses: { diagnosis: string; evidencePercent: number }[];
  guidelineReferences: string[];
  confidenceInterval: { low: number; high: number };
  generatedAt: number;
}

// ── Ward round engine ──────────────────────────────────────────────────────────

export type WardRoundTaskType = 'consultant_note' | 'junior_task' | 'nursing_task' | 'pharmacy_task' | 'laboratory_request';

export interface WardRound {
  id: string;
  date: number;
  patientId: string;
  consultantReview: string;
  problemUpdates: string[];
  newOrders: string[];
  medicationReview: string[];
  dischargePlanning: string[];
  teachingNotes: string[];
  researchTags: string[];
  followUpTasks: string[];
  generatedTasks: { type: WardRoundTaskType; assigneeRole: string; instruction: string; status: 'open' | 'done' }[];
}

// ── Theatre responsibilities ──────────────────────────────────────────────────

export interface TheatreCase {
  id: string;
  patientId: string;
  procedure: string;
  priority: 'elective' | 'urgent' | 'emergency';
  implants: string[];
  equipment: string[];
  anaesthesiaPlan: string;
  postOperativePlan: string;
  complications: string[];
  outcomeDocumented: boolean;
  listId?: string;
}

export interface TheatreList {
  id: string;
  date: number;
  cases: TheatreCase[];
  waitingListOptimization: string[];
}

// ── Outpatient clinics ─────────────────────────────────────────────────────────

export interface OutpatientClinic {
  id: string;
  name: string;
  patientsWaiting: number;
  followUps: number;
  newReferrals: number;
  missedAppointments: number;
  diagnosticBacklog: number;
  pendingProcedures: number;
  referralLetters: number;
  aiSummaries: number;
  autoClinicLetters: number;
}

// ── Telemedicine ───────────────────────────────────────────────────────────────

export interface Teleconsultation {
  id: string;
  patientId: string;
  kind: 'remote_consultation' | 'second_opinion' | 'international_referral' | 'virtual_mdt' | 'image_review' | 'video_consultation' | 'digital_prescription' | 'home_monitoring';
  scheduledAt: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

// ── Multidisciplinary team engine ──────────────────────────────────────────────

export type MdtMemberSpecialty =
  | 'radiology' | 'laboratory' | 'pharmacy' | 'nutrition' | 'physiotherapy'
  | 'psychology' | 'nursing' | 'social_work' | 'palliative_care'
  | 'oncology' | 'cardiology' | 'neurology';

export interface MdtMeeting {
  id: string;
  patientId: string;
  date: number;
  leadConsultantId: AmxUid;
  members: MdtMemberSpecialty[];
  discussion: string[];
  decisions: string[];
  outcomes: string[];
  searchable: boolean;
  auditable: boolean;
}

// ── Teaching responsibilities ─────────────────────────────────────────────────

export type TeachingAssessmentKind = 'mini_cex' | 'dops' | 'cbd' | 'epa' | 'case_discussion';

export interface TeachingRecord {
  id: string;
  learnerId: AmxUid;
  learnerTier: 'medical_student' | 'intern' | 'resident' | 'fellow' | 'clinical_officer' | 'nurse';
  kind: TeachingAssessmentKind;
  competency: string;
  score: number;
  feedback: string;
  assessedAt: number;
  procedureObserved?: string;
}

export interface TeachingDashboard {
  proceduresObserved: number;
  competenciesAssessed: number;
  caseDiscussions: number;
  assessments: TeachingRecord[];
  sessions: number;
  attendanceTotal: number;
}

// ── Research dashboard ─────────────────────────────────────────────────────────

export interface ResearchStudy {
  id: string;
  title: string;
  status: 'planning' | 'recruiting' | 'active' | 'closed';
  recruitment: number;
  targetRecruitment: number;
  registries: string[];
  trials: number;
  publications: number;
  collaborators: string[];
  researchAssistants: number;
  aiLiteratureUpdates: number;
  potentialPublicationTopics: string[];
}

// ── Consultant knowledge engine ────────────────────────────────────────────────

export type KnowledgeAssetKind =
  | 'protocol' | 'teaching_file' | 'annotated_case' | 'operative_video'
  | 'image_library' | 'specialty_collection' | 'departmental_publication';

export interface KnowledgeAsset {
  id: string;
  kind: KnowledgeAssetKind;
  title: string;
  content: string;
  tags: string[];
  createdBy: AmxUid;
  createdAt: number;
  searchable: boolean;
}

// ── Clinical intelligence alerts ───────────────────────────────────────────────

export type IntelligenceAlertKind =
  | 'missed_diagnosis' | 'diagnostic_delay' | 'high_risk_medication'
  | 'unexpected_deterioration' | 'mortality_predictor' | 'rare_disease_suggestion'
  | 'guideline_deviation' | 'drug_interaction' | 'duplicated_investigation';

export interface ClinicalIntelligenceAlert {
  id: string;
  patientId: string;
  kind: IntelligenceAlertKind;
  message: string;
  explanation: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: number;
  status: 'open' | 'acknowledged' | 'actioned' | 'dismissed';
}

// ── Personal analytics (with benchmarks) ───────────────────────────────────────

export interface BenchmarkValue { self: number; department: number; hospital: number; national: number; international: number }

export interface ConsultantAnalytics {
  admissionsManaged: BenchmarkValue;
  mortality: BenchmarkValue;
  complications: BenchmarkValue;
  readmissions: BenchmarkValue;
  diagnosticAccuracy: BenchmarkValue;
  documentationQuality: BenchmarkValue;
  teachingHours: BenchmarkValue;
  researchOutput: BenchmarkValue;
  patientSatisfaction: BenchmarkValue;
  clinicWaitingTime: BenchmarkValue;
  procedureOutcomes: BenchmarkValue;
}

// ── Communication centre ───────────────────────────────────────────────────────

export type ConsultantAudience =
  | 'residents' | 'medical_officers' | 'students' | 'ward_nurses' | 'pharmacy'
  | 'radiology' | 'laboratory' | 'other_consultants' | 'hospital_administration'
  | 'patients_secure' | 'telemedicine_network';

export interface ConsultantCommunication {
  id: string;
  audience: ConsultantAudience;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  publishedBy: AmxUid;
  publishedAt: number;
}

// ── Protocol management ────────────────────────────────────────────────────────

export type ConsultantProtocolKind =
  | 'protocol' | 'pathway' | 'order_set' | 'diagnostic_algorithm' | 'procedure_checklist';

export interface ConsultantProtocol {
  id: string;
  code: string;
  title: string;
  kind: ConsultantProtocolKind;
  version: number;
  content: string;
  status: 'draft' | 'under_review' | 'approved' | 'active' | 'superseded';
  authoredBy: AmxUid;
  authoredAt: number;
  reviewedBy?: AmxUid;
  recommendedConstitutionalChange?: string;
}

// ── Quality responsibilities ──────────────────────────────────────────────────

export type QualityReviewKind =
  | 'mortality_review' | 'morbidity_review' | 'root_cause_analysis'
  | 'clinical_audit' | 'guideline_compliance' | 'documentation_review'
  | 'patient_safety' | 'incident_review' | 'never_event';

export interface QualityReview {
  id: string;
  patientId?: string;
  kind: QualityReviewKind;
  title: string;
  findings: string[];
  actions: string[];
  status: 'open' | 'in_progress' | 'completed';
  completedAt?: number;
}

// ── AI collaboration ───────────────────────────────────────────────────────────

export interface AiCollaborationRecord {
  id: string;
  patientId?: string;
  action: 'accept_suggestion' | 'reject_suggestion' | 'annotate_evidence' | 'teach_engine' | 'flag_error' | 'create_specialty_knowledge';
  suggestionRef?: string;
  note: string;
  at: number;
}

// ── International collaboration ───────────────────────────────────────────────

export interface InternationalEngagement {
  id: string;
  kind: 'international_mdt' | 'cross_hospital_referral' | 'teleconsultation' | 'expert_panel' | 'guideline_development' | 'research_network' | 'teaching_webinar' | 'global_case_discussion';
  title: string;
  partner?: string;
  status: 'active' | 'completed' | 'scheduled';
  at: number;
}

// ── HMIS / EMR duties ──────────────────────────────────────────────────────────

export interface HmisDuties {
  clinicScheduling: boolean;
  theatrePlanning: boolean;
  waitingListPrioritization: boolean;
  resourceRequests: boolean;
  equipmentUtilization: boolean;
  departmentalPerformance: boolean;
  servicePlanning: boolean;
}

export interface EmrDuties {
  consultantNotes: number;
  clinicalReviews: number;
  diagnosisConfirmations: number;
  procedureDocumentation: number;
  dischargeApprovals: number;
  medicationReviews: number;
  longitudinalPlans: number;
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface ConsultantModel {
  organizationId: string;
  facilityId?: string;
  medicalDirectorId?: AmxUid;
  departmentHeadId?: AmxUid;
  departmentId: string;
  specialty: MedicalSpecialty;
  consultantId: AmxUid;
  workload: ConsultantWorkload;
  patientIntelligence: RankedPatient[];
  caseInterpretations: CaseInterpretation[];
  workspaces: Record<string, PatientWorkspace>;
  decisionSupport: DecisionSupportRecord[];
  wardRounds: WardRound[];
  theatreLists: TheatreList[];
  theatreCases: TheatreCase[];
  clinics: OutpatientClinic[];
  telemedicine: Teleconsultation[];
  mdts: MdtMeeting[];
  teaching: TeachingRecord[];
  research: ResearchStudy[];
  knowledge: KnowledgeAsset[];
  intelligenceAlerts: ClinicalIntelligenceAlert[];
  analytics: ConsultantAnalytics;
  communications: ConsultantCommunication[];
  protocols: ConsultantProtocol[];
  qualityReviews: QualityReview[];
  aiCollaboration: AiCollaborationRecord[];
  international: InternationalEngagement[];
  hmis: HmisDuties;
  emr: EmrDuties;
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateConsultantModelInput {
  organizationId: string;
  facilityId?: string;
  medicalDirectorId?: AmxUid;
  departmentHeadId?: AmxUid;
  departmentId: string;
  specialty: MedicalSpecialty;
  consultantId: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const ZERO_BENCHMARK: BenchmarkValue = { self: 0, department: 0, hospital: 0, national: 0, international: 0 };

// ── Constitutional authority / restriction tables ──────────────────────────────

export const CONSULTANT_AUTHORITY: readonly string[] = [
  'approve_diagnosis', 'approve_surgery', 'approve_discharge', 'escalate_icu',
  'request_mdt', 'approve_referral', 'approve_research_participation',
  'approve_specialty_protocol', 'create_teaching_material', 'supervise_residents',
  'approve_competency_progression', 'lead_clinical_care',
];

export const CONSULTANT_RESTRICTIONS: readonly string[] = [
  'manage_hospital_finance', 'create_organization', 'modify_constitutional_engines',
  'change_enterprise_security', 'access_unrelated_departments', 'delete_audit_logs',
  'override_legal_consent', 'alter_identity_records',
];

// ── The Engine ─────────────────────────────────────────────────────────────────

export class ConsultantEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateConsultantModelInput): ConsultantModel {
    if (!input.organizationId) throw new Error('[CE] organizationId is required');
    if (!input.consultantId) throw new Error('[CE] consultantId is required');
    if (!input.departmentId) throw new Error('[CE] departmentId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      medicalDirectorId: input.medicalDirectorId,
      departmentHeadId: input.departmentHeadId,
      departmentId: input.departmentId,
      specialty: input.specialty,
      consultantId: input.consultantId,
      workload: {
        wardRoundsToday: 0, newAdmissionsAwaitingReview: 0, icuConsultations: 0,
        emergencyConsults: 0, theatreCases: 0, clinicAppointments: 0,
        telemedicineConsultations: 0, multidisciplinaryMeetings: 0, referralsAwaitingOpinion: 0,
      },
      patientIntelligence: [],
      caseInterpretations: [],
      workspaces: {},
      decisionSupport: [],
      wardRounds: [],
      theatreLists: [],
      theatreCases: [],
      clinics: [],
      telemedicine: [],
      mdts: [],
      teaching: [],
      research: [],
      knowledge: [],
      intelligenceAlerts: [],
      analytics: {
        admissionsManaged: { ...ZERO_BENCHMARK },
        mortality: { ...ZERO_BENCHMARK },
        complications: { ...ZERO_BENCHMARK },
        readmissions: { ...ZERO_BENCHMARK },
        diagnosticAccuracy: { ...ZERO_BENCHMARK },
        documentationQuality: { ...ZERO_BENCHMARK },
        teachingHours: { ...ZERO_BENCHMARK },
        researchOutput: { ...ZERO_BENCHMARK },
        patientSatisfaction: { ...ZERO_BENCHMARK },
        clinicWaitingTime: { ...ZERO_BENCHMARK },
        procedureOutcomes: { ...ZERO_BENCHMARK },
      },
      communications: [],
      protocols: [],
      qualityReviews: [],
      aiCollaboration: [],
      international: [],
      hmis: {
        clinicScheduling: false, theatrePlanning: false, waitingListPrioritization: false,
        resourceRequests: false, equipmentUtilization: false, departmentalPerformance: false, servicePlanning: false,
      },
      emr: {
        consultantNotes: 0, clinicalReviews: 0, diagnosisConfirmations: 0,
        procedureDocumentation: 0, dischargeApprovals: 0, medicationReviews: 0, longitudinalPlans: 0,
      },
      auditLog: [{ at: now, actorId: input.consultantId, action: 'consultant_appointed' }],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard ─────────────────────────────────────────────────────

  static assertConsultant(model: ConsultantModel, actorId: AmxUid): void {
    if (actorId !== model.consultantId) throw new Error('[CE] Only the Consultant may perform this action');
  }

  static canConsultantPerform(action: string): { allowed: boolean; reason?: string } {
    if (CONSULTANT_AUTHORITY.includes(action)) return { allowed: true };
    if (CONSULTANT_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        manage_hospital_finance: 'Hospital finances are enterprise authority.',
        create_organization: 'Creating organizations is a Facility Administrator authority.',
        modify_constitutional_engines: 'Constitutional engines may not be modified.',
        change_enterprise_security: 'Enterprise security is governed by the Security Center.',
        access_unrelated_departments: 'Unrelated departments require authorization.',
        delete_audit_logs: 'Audit logs are append-only and may never be deleted.',
        override_legal_consent: 'Legal consent requirements may not be overridden.',
        alter_identity_records: 'Identity records are immutable.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Consultant authority.` };
  }

  static guard(model: ConsultantModel, actorId: AmxUid, action: string): void {
    ConsultantEngine.assertConsultant(model, actorId);
    const verdict = ConsultantEngine.canConsultantPerform(action);
    if (!verdict.allowed) throw new Error(`[CE] ${verdict.reason}`);
  }

  static audit(model: ConsultantModel, actorId: AmxUid, action: string, detail?: string): ConsultantModel {
    const now = Date.now();
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId, action, detail }], updatedAt: now };
  }

  // ── Clinical workload ────────────────────────────────────────────────────────

  static updateWorkload(model: ConsultantModel, actorId: AmxUid, patch: Partial<ConsultantWorkload>): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const workload = { ...model.workload, ...patch };
    return { ...ConsultantEngine.audit(model, actorId, 'workload_updated'), workload, updatedAt: Date.now() };
  }

  static getClinicalWorkload(model: ConsultantModel): ConsultantWorkload {
    return { ...model.workload };
  }

  // ── Patient intelligence ─────────────────────────────────────────────────────

  static rankPatient(model: ConsultantModel, input: Omit<RankedPatient, 'lastRankedAt'>): ConsultantModel {
    const patientIntelligence = [...model.patientIntelligence.filter(p => p.patientId !== input.patientId), { ...input, lastRankedAt: Date.now() }];
    return { ...model, patientIntelligence, updatedAt: Date.now() };
  }

  /** AI ranks every patient by urgency — highest first. */
  static getPatientIntelligence(model: ConsultantModel, category?: UrgencyCategory): RankedPatient[] {
    const list = [...model.patientIntelligence].sort((a, b) => b.urgencyScore - a.urgencyScore);
    return category ? list.filter(p => p.categories.includes(category)) : list;
  }

  static getCriticallyUnstable(model: ConsultantModel): RankedPatient[] {
    return model.patientIntelligence.filter(p => p.categories.includes('critically_unstable')).sort((a, b) => b.urgencyScore - a.urgencyScore);
  }

  // ── AI case interpretation wall ──────────────────────────────────────────────

  static generateCaseInterpretation(model: ConsultantModel, input: Omit<CaseInterpretation, 'generatedAt'>): { model: ConsultantModel; interpretation: CaseInterpretation } {
    const interpretation: CaseInterpretation = { ...input, generatedAt: Date.now() };
    const caseInterpretations = [...model.caseInterpretations.filter(c => c.patientId !== input.patientId), interpretation];
    return { model: { ...model, caseInterpretations, updatedAt: Date.now() }, interpretation };
  }

  static getCaseInterpretation(model: ConsultantModel, patientId: string): CaseInterpretation | undefined {
    return model.caseInterpretations.find(c => c.patientId === patientId);
  }

  // ── Clinical workspace ───────────────────────────────────────────────────────

  static ensureWorkspace(model: ConsultantModel, patientId: string): { model: ConsultantModel; workspace: PatientWorkspace } {
    if (model.workspaces[patientId]) return { model, workspace: model.workspaces[patientId] };
    const workspace: PatientWorkspace = {
      patientId,
      timeline: [],
      problemList: [],
      diagnosticPanel: { history: [], physicalFindings: [], laboratoryAbnormalities: [], radiology: [], aiInterpretation: '', evidence: [], differentialRanking: [], recommendedInvestigations: [], recommendedTreatment: [] },
    };
    return { model: { ...model, workspaces: { ...model.workspaces, [patientId]: workspace }, updatedAt: Date.now() }, workspace };
  }

  static addTimelineEvent(model: ConsultantModel, patientId: string, event: Omit<PatientTimelineEvent, 'id'>): ConsultantModel {
    const workspace = model.workspaces[patientId];
    if (!workspace) throw new Error('[CE] Patient workspace not found');
    const updated = { ...workspace, timeline: [...workspace.timeline, { ...event, id: nextId('tl') }] };
    return { ...model, workspaces: { ...model.workspaces, [patientId]: updated }, updatedAt: Date.now() };
  }

  static addProblem(model: ConsultantModel, patientId: string, input: Omit<ProblemListEntry, 'id'>): ConsultantModel {
    const workspace = model.workspaces[patientId];
    if (!workspace) throw new Error('[CE] Patient workspace not found');
    const problem: ProblemListEntry = { ...input, id: nextId('prb') };
    const updated = { ...workspace, problemList: [...workspace.problemList, problem] };
    return { ...model, workspaces: { ...model.workspaces, [patientId]: updated }, updatedAt: Date.now() };
  }

  static updateProblemStatus(model: ConsultantModel, patientId: string, problemId: string, status: ProblemListEntry['status']): ConsultantModel {
    const workspace = model.workspaces[patientId];
    if (!workspace) throw new Error('[CE] Patient workspace not found');
    const problemList = workspace.problemList.map(p => p.id === problemId ? { ...p, status } : p);
    const updated = { ...workspace, problemList };
    return { ...model, workspaces: { ...model.workspaces, [patientId]: updated }, updatedAt: Date.now() };
  }

  static getPatientWorkspace(model: ConsultantModel, patientId: string): PatientWorkspace | undefined {
    return model.workspaces[patientId];
  }

  // ── Decision support ─────────────────────────────────────────────────────────

  static addDecisionSupport(model: ConsultantModel, record: DecisionSupportRecord): { model: ConsultantModel; record: DecisionSupportRecord } {
    const decisionSupport = [...model.decisionSupport.filter(d => d.patientId !== record.patientId), record];
    return { model: { ...model, decisionSupport, updatedAt: Date.now() }, record };
  }

  static getDecisionSupport(model: ConsultantModel, patientId: string): DecisionSupportRecord | undefined {
    return model.decisionSupport.find(d => d.patientId === patientId);
  }

  // ── Ward round engine ────────────────────────────────────────────────────────

  static conductWardRound(model: ConsultantModel, actorId: AmxUid, input: Omit<WardRound, 'id' | 'generatedTasks' | 'date'>): { model: ConsultantModel; wardRound: WardRound } {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const now = Date.now();
    const generatedTasks: WardRound['generatedTasks'] = [];
    if (input.consultantReview) generatedTasks.push({ type: 'consultant_note', assigneeRole: 'consultant', instruction: 'Finalize consultant review note', status: 'open' });
    if (input.newOrders.length) generatedTasks.push({ type: 'junior_task', assigneeRole: 'senior_registrar', instruction: `Execute ${input.newOrders.length} new orders`, status: 'open' });
    if (input.followUpTasks.length) generatedTasks.push({ type: 'nursing_task', assigneeRole: 'ward_nurse', instruction: 'Monitor follow-up tasks', status: 'open' });
    if (input.medicationReview.length) generatedTasks.push({ type: 'pharmacy_task', assigneeRole: 'pharmacist', instruction: 'Review medication changes', status: 'open' });
    if (input.problemUpdates.some(u => u.toLowerCase().includes('investigat'))) {
      generatedTasks.push({ type: 'laboratory_request', assigneeRole: 'laboratory', instruction: 'Process pending laboratory requests', status: 'open' });
    }
    const wardRound: WardRound = { ...input, id: nextId('wr'), date: now, generatedTasks };
    return { model: { ...ConsultantEngine.audit(model, actorId, 'ward_round_conducted', input.patientId), wardRounds: [...model.wardRounds, wardRound], updatedAt: now }, wardRound };
  }

  static completeRoundTask(model: ConsultantModel, actorId: AmxUid, wardRoundId: string, taskIndex: number): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const wardRounds = model.wardRounds.map(r => {
      if (r.id !== wardRoundId) return r;
      const generatedTasks = r.generatedTasks.map((t, i) => i === taskIndex ? { ...t, status: 'done' as const } : t);
      return { ...r, generatedTasks };
    });
    return { ...ConsultantEngine.audit(model, actorId, 'round_task_completed', wardRoundId), wardRounds, updatedAt: Date.now() };
  }

  static getOpenRoundTasks(model: ConsultantModel, role: WardRoundTaskType): { patientId: string; instruction: string }[] {
    return model.wardRounds.flatMap(r =>
      r.generatedTasks.filter(t => t.type === role && t.status === 'open').map(t => ({ patientId: r.patientId, instruction: t.instruction })),
    );
  }

  // ── Theatre responsibilities ─────────────────────────────────────────────────

  static createTheatreList(model: ConsultantModel, actorId: AmxUid, date: number): { model: ConsultantModel; list: TheatreList } {
    ConsultantEngine.guard(model, actorId, 'approve_surgery');
    const list: TheatreList = { id: nextId('tl'), date, cases: [], waitingListOptimization: [] };
    return { model: { ...ConsultantEngine.audit(model, actorId, 'theatre_list_created'), theatreLists: [...model.theatreLists, list], updatedAt: Date.now() }, list };
  }

  static addTheatreCase(model: ConsultantModel, actorId: AmxUid, input: Omit<TheatreCase, 'id' | 'outcomeDocumented'>): { model: ConsultantModel; theatreCase: TheatreCase } {
    ConsultantEngine.guard(model, actorId, 'approve_surgery');
    const theatreCase: TheatreCase = { ...input, id: nextId('tc'), outcomeDocumented: false };
    return { model: { ...ConsultantEngine.audit(model, actorId, 'theatre_case_added', input.procedure), theatreCases: [...model.theatreCases, theatreCase], updatedAt: Date.now() }, theatreCase };
  }

  static documentTheatreOutcome(model: ConsultantModel, actorId: AmxUid, caseId: string, outcome: string, complications: string[]): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'approve_surgery');
    const theatreCases = model.theatreCases.map(c =>
      c.id === caseId ? { ...c, outcomeDocumented: true, complications } : c,
    );
    return { ...ConsultantEngine.audit(model, actorId, 'theatre_outcome_documented', `${caseId}: ${outcome}`), theatreCases, updatedAt: Date.now() };
  }

  static getTheatreCases(model: ConsultantModel, priority?: TheatreCase['priority']): TheatreCase[] {
    const list = [...model.theatreCases];
    if (priority) list.sort((a, b) => (a.priority === priority ? -1 : 1) - (b.priority === priority ? -1 : 1));
    return list;
  }

  // ── Outpatient clinics ───────────────────────────────────────────────────────

  static upsertClinic(model: ConsultantModel, actorId: AmxUid, input: OutpatientClinic): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const clinics = [...model.clinics.filter(c => c.id !== input.id), input];
    return { ...ConsultantEngine.audit(model, actorId, 'clinic_updated', input.name), clinics, updatedAt: Date.now() };
  }

  static generateClinicLetter(model: ConsultantModel, actorId: AmxUid, clinicId: string): { model: ConsultantModel; letterId: string } {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const clinics = model.clinics.map(c => c.id === clinicId ? { ...c, autoClinicLetters: c.autoClinicLetters + 1, referralLetters: Math.max(0, c.referralLetters - 1) } : c);
    return { model: { ...ConsultantEngine.audit(model, actorId, 'clinic_letter_generated', clinicId), clinics, updatedAt: Date.now() }, letterId: nextId('cl') };
  }

  static getOutpatientBacklog(model: ConsultantModel): number {
    return model.clinics.reduce((a, c) => a + c.patientsWaiting + c.diagnosticBacklog + c.pendingProcedures, 0);
  }

  // ── Telemedicine ─────────────────────────────────────────────────────────────

  static scheduleTeleconsultation(model: ConsultantModel, actorId: AmxUid, input: Omit<Teleconsultation, 'id' | 'status'>): { model: ConsultantModel; teleconsultation: Teleconsultation } {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const teleconsultation: Teleconsultation = { ...input, id: nextId('tel'), status: 'scheduled' };
    return { model: { ...ConsultantEngine.audit(model, actorId, 'teleconsultation_scheduled', input.kind), telemedicine: [...model.telemedicine, teleconsultation], updatedAt: Date.now() }, teleconsultation };
  }

  static completeTeleconsultation(model: ConsultantModel, actorId: AmxUid, teleconsultationId: string, notes: string): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const telemedicine = model.telemedicine.map(t => t.id === teleconsultationId ? { ...t, status: 'completed' as const, notes } : t);
    return { ...ConsultantEngine.audit(model, actorId, 'teleconsultation_completed', teleconsultationId), telemedicine, updatedAt: Date.now() };
  }

  static requestSecondOpinion(model: ConsultantModel, actorId: AmxUid, patientId: string, remoteConsultantId: string): { model: ConsultantModel; requestId: string } {
    ConsultantEngine.guard(model, actorId, 'approve_referral');
    return {
      model: ConsultantEngine.audit(model, actorId, 'second_opinion_requested', `${patientId} → ${remoteConsultantId}`),
      requestId: nextId('so'),
    };
  }

  // ── Multidisciplinary team engine ────────────────────────────────────────────

  static conductMdt(model: ConsultantModel, actorId: AmxUid, input: Omit<MdtMeeting, 'id' | 'date' | 'leadConsultantId' | 'searchable' | 'auditable'>): { model: ConsultantModel; mdt: MdtMeeting } {
    ConsultantEngine.guard(model, actorId, 'request_mdt');
    const mdt: MdtMeeting = { ...input, id: nextId('mdt'), date: Date.now(), leadConsultantId: actorId, searchable: true, auditable: true };
    return { model: { ...ConsultantEngine.audit(model, actorId, 'mdt_conducted', input.patientId), mdts: [...model.mdts, mdt], updatedAt: Date.now() }, mdt };
  }

  static getMdtHistory(model: ConsultantModel, patientId: string): MdtMeeting[] {
    return model.mdts.filter(m => m.patientId === patientId);
  }

  // ── Teaching responsibilities ────────────────────────────────────────────────

  static recordTeaching(model: ConsultantModel, actorId: AmxUid, input: Omit<TeachingRecord, 'id' | 'assessedAt'>): { model: ConsultantModel; record: TeachingRecord } {
    ConsultantEngine.guard(model, actorId, 'supervise_residents');
    const record: TeachingRecord = { ...input, id: nextId('tea'), assessedAt: Date.now() };
    return { model: { ...ConsultantEngine.audit(model, actorId, 'teaching_recorded', `${input.learnerId}: ${input.kind}`), teaching: [...model.teaching, record], updatedAt: Date.now() }, record };
  }

  static getTeachingDashboard(model: ConsultantModel): TeachingDashboard {
    return {
      proceduresObserved: model.teaching.filter(t => t.procedureObserved).length,
      competenciesAssessed: model.teaching.length,
      caseDiscussions: model.teaching.filter(t => t.kind === 'case_discussion').length,
      assessments: [...model.teaching],
      sessions: model.teaching.length,
      attendanceTotal: model.teaching.length,
    };
  }

  static approveCompetencyProgression(model: ConsultantModel, actorId: AmxUid, learnerId: AmxUid, competency: string): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'approve_competency_progression');
    return ConsultantEngine.audit(model, actorId, 'competency_progression_approved', `${learnerId}: ${competency}`);
  }

  // ── Research dashboard ───────────────────────────────────────────────────────

  static registerStudy(model: ConsultantModel, actorId: AmxUid, input: Omit<ResearchStudy, 'id'>): { model: ConsultantModel; study: ResearchStudy } {
    ConsultantEngine.guard(model, actorId, 'approve_research_participation');
    const study: ResearchStudy = { ...input, id: nextId('rsc') };
    return { model: { ...ConsultantEngine.audit(model, actorId, 'study_registered', input.title), research: [...model.research, study], updatedAt: Date.now() }, study };
  }

  static updateRecruitment(model: ConsultantModel, actorId: AmxUid, studyId: string, recruitment: number): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'approve_research_participation');
    const research = model.research.map(s => s.id === studyId ? { ...s, recruitment } : s);
    return { ...ConsultantEngine.audit(model, actorId, 'recruitment_updated', studyId), research, updatedAt: Date.now() };
  }

  static getResearchDashboard(model: ConsultantModel): ResearchStudy[] {
    return [...model.research];
  }

  // ── Consultant knowledge engine ──────────────────────────────────────────────

  static createKnowledgeAsset(model: ConsultantModel, actorId: AmxUid, input: Omit<KnowledgeAsset, 'id' | 'createdBy' | 'createdAt' | 'searchable'>): { model: ConsultantModel; asset: KnowledgeAsset } {
    ConsultantEngine.guard(model, actorId, 'create_teaching_material');
    const asset: KnowledgeAsset = { ...input, id: nextId('kno'), createdBy: actorId, createdAt: Date.now(), searchable: true };
    return { model: { ...ConsultantEngine.audit(model, actorId, 'knowledge_asset_created', input.title), knowledge: [...model.knowledge, asset], updatedAt: Date.now() }, asset };
  }

  static searchKnowledge(model: ConsultantModel, query: string): KnowledgeAsset[] {
    const q = query.toLowerCase();
    return model.knowledge.filter(k => k.title.toLowerCase().includes(q) || k.tags.some(t => t.toLowerCase().includes(q)) || k.content.toLowerCase().includes(q));
  }

  static getKnowledgeByKind(model: ConsultantModel, kind: KnowledgeAssetKind): KnowledgeAsset[] {
    return model.knowledge.filter(k => k.kind === kind);
  }

  // ── Clinical intelligence alerts ─────────────────────────────────────────────

  static raiseIntelligenceAlert(model: ConsultantModel, input: Omit<ClinicalIntelligenceAlert, 'id' | 'createdAt' | 'status'>): { model: ConsultantModel; alert: ClinicalIntelligenceAlert } {
    const alert: ClinicalIntelligenceAlert = { ...input, id: nextId('ai'), createdAt: Date.now(), status: 'open' };
    return { model: { ...model, intelligenceAlerts: [...model.intelligenceAlerts, alert], updatedAt: Date.now() }, alert };
  }

  static respondToAlert(model: ConsultantModel, actorId: AmxUid, alertId: string, status: ClinicalIntelligenceAlert['status']): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const intelligenceAlerts = model.intelligenceAlerts.map(a => a.id === alertId ? { ...a, status } : a);
    return { ...ConsultantEngine.audit(model, actorId, 'intelligence_alert_responded', alertId), intelligenceAlerts, updatedAt: Date.now() };
  }

  static getOpenIntelligenceAlerts(model: ConsultantModel): ClinicalIntelligenceAlert[] {
    return model.intelligenceAlerts.filter(a => a.status === 'open');
  }

  // ── Personal analytics ───────────────────────────────────────────────────────

  static updateAnalytics(model: ConsultantModel, actorId: AmxUid, patch: Partial<ConsultantAnalytics>): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const analytics = { ...model.analytics, ...patch };
    return { ...ConsultantEngine.audit(model, actorId, 'analytics_updated'), analytics, updatedAt: Date.now() };
  }

  static getAnalytics(model: ConsultantModel): ConsultantAnalytics {
    return { ...model.analytics };
  }

  // ── Communication centre ─────────────────────────────────────────────────────

  static sendCommunication(model: ConsultantModel, actorId: AmxUid, input: Omit<ConsultantCommunication, 'id' | 'publishedBy' | 'publishedAt'>): { model: ConsultantModel; communication: ConsultantCommunication } {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const communication: ConsultantCommunication = { ...input, id: nextId('com'), publishedBy: actorId, publishedAt: Date.now() };
    return { model: { ...ConsultantEngine.audit(model, actorId, 'communication_published', input.title), communications: [...model.communications, communication], updatedAt: Date.now() }, communication };
  }

  /** Patients receive only secure, non-clinical-direct messaging through the constitutional channel. */
  static sendSecurePatientMessage(model: ConsultantModel, actorId: AmxUid, patientId: string, message: string): { model: ConsultantModel; messageId: string } {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    return {
      model: ConsultantEngine.audit(model, actorId, 'secure_patient_message_sent', patientId),
      messageId: nextId('msg'),
    };
  }

  // ── Protocol management ──────────────────────────────────────────────────────

  static draftProtocol(model: ConsultantModel, actorId: AmxUid, input: Omit<ConsultantProtocol, 'id' | 'version' | 'status' | 'authoredBy' | 'authoredAt'>): { model: ConsultantModel; protocol: ConsultantProtocol } {
    ConsultantEngine.guard(model, actorId, 'approve_specialty_protocol');
    const protocol: ConsultantProtocol = { ...input, id: nextId('prt'), version: 1, status: 'draft', authoredBy: actorId, authoredAt: Date.now() };
    return { model: { ...ConsultantEngine.audit(model, actorId, 'protocol_drafted', input.title), protocols: [...model.protocols, protocol], updatedAt: Date.now() }, protocol };
  }

  static submitProtocolForReview(model: ConsultantModel, actorId: AmxUid, protocolId: string): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'approve_specialty_protocol');
    const protocols = model.protocols.map(p => p.id === protocolId ? { ...p, status: 'under_review' as const } : p);
    return { ...ConsultantEngine.audit(model, actorId, 'protocol_submitted_for_review', protocolId), protocols, updatedAt: Date.now() };
  }

  static versionProtocol(model: ConsultantModel, actorId: AmxUid, protocolId: string, content: string): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'approve_specialty_protocol');
    const protocols = model.protocols.map(p => {
      if (p.id !== protocolId) return p;
      const superseded = p.status === 'active' ? 'superseded' as const : p.status;
      return { ...p, content, version: p.version + 1, status: superseded === 'superseded' ? 'draft' : p.status, authoredBy: actorId, authoredAt: Date.now() };
    });
    return { ...ConsultantEngine.audit(model, actorId, 'protocol_versioned', protocolId), protocols, updatedAt: Date.now() };
  }

  static recommendConstitutionalChange(model: ConsultantModel, actorId: AmxUid, protocolId: string, change: string): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'approve_specialty_protocol');
    const protocols = model.protocols.map(p => p.id === protocolId ? { ...p, recommendedConstitutionalChange: change } : p);
    return { ...ConsultantEngine.audit(model, actorId, 'constitutional_change_recommended', protocolId), protocols, updatedAt: Date.now() };
  }

  static getActiveProtocols(model: ConsultantModel): ConsultantProtocol[] {
    return model.protocols.filter(p => p.status === 'active');
  }

  // ── Quality responsibilities ─────────────────────────────────────────────────

  static openQualityReview(model: ConsultantModel, actorId: AmxUid, input: Omit<QualityReview, 'id' | 'status'>): { model: ConsultantModel; review: QualityReview } {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const review: QualityReview = { ...input, id: nextId('qr'), status: 'open' };
    return { model: { ...ConsultantEngine.audit(model, actorId, 'quality_review_opened', input.title), qualityReviews: [...model.qualityReviews, review], updatedAt: Date.now() }, review };
  }

  static completeQualityReview(model: ConsultantModel, actorId: AmxUid, reviewId: string, findings: string[], actions: string[]): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const now = Date.now();
    const qualityReviews = model.qualityReviews.map(r =>
      r.id === reviewId ? { ...r, findings, actions, status: 'completed' as const, completedAt: now } : r,
    );
    return { ...ConsultantEngine.audit(model, actorId, 'quality_review_completed', reviewId), qualityReviews, updatedAt: now };
  }

  static getOpenQualityReviews(model: ConsultantModel): QualityReview[] {
    return model.qualityReviews.filter(r => r.status !== 'completed');
  }

  // ── AI collaboration ─────────────────────────────────────────────────────────

  static collaborateWithAi(model: ConsultantModel, actorId: AmxUid, input: Omit<AiCollaborationRecord, 'id' | 'at'>): { model: ConsultantModel; record: AiCollaborationRecord } {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const record: AiCollaborationRecord = { ...input, id: nextId('aic'), at: Date.now() };
    return { model: { ...ConsultantEngine.audit(model, actorId, `ai_${input.action}`, input.suggestionRef), aiCollaboration: [...model.aiCollaboration, record], updatedAt: Date.now() }, record };
  }

  /** Every correction strengthens the constitutional knowledge base while preserving auditability. */
  static teachEngine(model: ConsultantModel, actorId: AmxUid, patientId: string, note: string): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const record: AiCollaborationRecord = { id: nextId('aic'), patientId, action: 'teach_engine', note, at: Date.now() };
    return { ...ConsultantEngine.audit(model, actorId, 'engine_taught', note), aiCollaboration: [...model.aiCollaboration, record], updatedAt: Date.now() };
  }

  static flagAiError(model: ConsultantModel, actorId: AmxUid, suggestionRef: string, note: string): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const record: AiCollaborationRecord = { id: nextId('aic'), action: 'flag_error', suggestionRef, note, at: Date.now() };
    return { ...ConsultantEngine.audit(model, actorId, 'ai_error_flagged', suggestionRef), aiCollaboration: [...model.aiCollaboration, record], updatedAt: Date.now() };
  }

  // ── International collaboration ──────────────────────────────────────────────

  static registerInternationalEngagement(model: ConsultantModel, actorId: AmxUid, input: Omit<InternationalEngagement, 'id' | 'at'>): { model: ConsultantModel; engagement: InternationalEngagement } {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const engagement: InternationalEngagement = { ...input, id: nextId('int'), at: Date.now() };
    return { model: { ...ConsultantEngine.audit(model, actorId, 'international_engagement_registered', input.title), international: [...model.international, engagement], updatedAt: Date.now() }, engagement };
  }

  static getInternationalEngagements(model: ConsultantModel): InternationalEngagement[] {
    return [...model.international];
  }

  // ── HMIS / EMR responsibilities ──────────────────────────────────────────────

  static updateHmisDuties(model: ConsultantModel, actorId: AmxUid, patch: Partial<HmisDuties>): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const hmis = { ...model.hmis, ...patch };
    return { ...ConsultantEngine.audit(model, actorId, 'hmis_duties_updated'), hmis, updatedAt: Date.now() };
  }

  static updateEmrDuties(model: ConsultantModel, actorId: AmxUid, patch: Partial<EmrDuties>): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'lead_clinical_care');
    const emr = { ...model.emr, ...patch };
    return { ...ConsultantEngine.audit(model, actorId, 'emr_duties_updated'), emr, updatedAt: Date.now() };
  }

  static getEmrDuties(model: ConsultantModel): EmrDuties {
    return { ...model.emr };
  }

  // ── Authority actions ────────────────────────────────────────────────────────

  static approveDiagnosis(model: ConsultantModel, actorId: AmxUid, patientId: string, diagnosis: string): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'approve_diagnosis');
    return ConsultantEngine.audit(model, actorId, 'diagnosis_approved', `${patientId}: ${diagnosis}`);
  }

  static approveSurgery(model: ConsultantModel, actorId: AmxUid, patientId: string, procedure: string): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'approve_surgery');
    return ConsultantEngine.audit(model, actorId, 'surgery_approved', `${patientId}: ${procedure}`);
  }

  static approveDischarge(model: ConsultantModel, actorId: AmxUid, patientId: string): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'approve_discharge');
    return ConsultantEngine.audit(model, actorId, 'discharge_approved', patientId);
  }

  static escalateToIcu(model: ConsultantModel, actorId: AmxUid, patientId: string, reason: string): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'escalate_icu');
    return ConsultantEngine.audit(model, actorId, 'icu_escalated', `${patientId}: ${reason}`);
  }

  static approveReferral(model: ConsultantModel, actorId: AmxUid, patientId: string, toSpecialty: string): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'approve_referral');
    return ConsultantEngine.audit(model, actorId, 'referral_approved', `${patientId} → ${toSpecialty}`);
  }

  static approveResearchParticipation(model: ConsultantModel, actorId: AmxUid, patientId: string, studyId: string): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'approve_research_participation');
    return ConsultantEngine.audit(model, actorId, 'research_participation_approved', `${patientId}: ${studyId}`);
  }

  // ── Constitutional restrictions (enforced) ───────────────────────────────────

  static manageHospitalFinance(model: ConsultantModel, actorId: AmxUid): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'manage_hospital_finance');
    return model;
  }

  static createOrganization(model: ConsultantModel, actorId: AmxUid): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'create_organization');
    return model;
  }

  static modifyConstitutionalEngines(model: ConsultantModel, actorId: AmxUid): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'modify_constitutional_engines');
    return model;
  }

  static changeEnterpriseSecurity(model: ConsultantModel, actorId: AmxUid): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'change_enterprise_security');
    return model;
  }

  static accessUnrelatedDepartment(model: ConsultantModel, actorId: AmxUid): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'access_unrelated_departments');
    return model;
  }

  static deleteAuditLog(model: ConsultantModel, actorId: AmxUid): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'delete_audit_logs');
    return model;
  }

  static overrideLegalConsent(model: ConsultantModel, actorId: AmxUid): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'override_legal_consent');
    return model;
  }

  static alterIdentityRecord(model: ConsultantModel, actorId: AmxUid): ConsultantModel {
    ConsultantEngine.guard(model, actorId, 'alter_identity_records');
    return model;
  }
}
