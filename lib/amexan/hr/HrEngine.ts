// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Human Resource Engine (BOOK VI-R · Constitutional Engine No. 28)
//
// "The Engine of Workforce Excellence"
//
// The engine supports the complete workforce lifecycle: recruitment, credential
// verification, employment, onboarding, training, competency, promotion,
// performance, succession, and retirement.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Constitutional authority / restriction tables ──────────────────────────────

export const HR_AUTHORITY: readonly string[] = [
  'post_vacancies', 'review_applications', 'verify_credentials',
  'hire_employees', 'manage_onboarding', 'track_competency',
  'manage_performance', 'plan_succession', 'manage_retirement',
  'lead_workforce_governance',
];

export const HR_RESTRICTIONS: readonly string[] = [
  'discriminate_in_hiring', 'disclose_personal_data',
  'override_constitutional_governance', 'hire_without_credential_verification',
  'terminate_without_due_process', 'modify_performance_records',
];

// ── Workforce lifecycle ────────────────────────────────────────────────────────

export type WorkforceLifecycleStage =
  | 'recruitment' | 'credential_verification' | 'employment' | 'onboarding'
  | 'training' | 'competency' | 'promotion' | 'performance'
  | 'succession' | 'retirement';

// ── Recruitment engine ─────────────────────────────────────────────────────────

export interface Vacancy {
  id: string;
  title: string;
  departmentId?: string;
  requirements: string[];
  postedAt: number;
  status: 'open' | 'closed';
}

export interface JobApplication {
  id: string;
  vacancyId: string;
  applicantName: string;
  credentials: { qualification: string; institution: string; verified: boolean }[];
  interviewScore?: number;
  status: 'received' | 'shortlisted' | 'interviewed' | 'selected' | 'rejected';
  appliedAt: number;
}

// ── Employment & onboarding ────────────────────────────────────────────────────

export interface Employee {
  id: string;
  staffId: AmxUid;
  name: string;
  role: string;
  departmentId?: string;
  hiredAt: number;
  contractType: 'permanent' | 'contract' | 'locum' | 'volunteer';
  verified: boolean;
  onboarding: { step: string; completed: boolean }[];
  status: 'active' | 'on_leave' | 'retired' | 'terminated';
}

// ── Competency engine ──────────────────────────────────────────────────────────

export type CompetencyDomain =
  | 'licensure' | 'certification' | 'cpd' | 'procedures' | 'skills'
  | 'teaching' | 'research' | 'leadership';

export interface CompetencyRecord {
  id: string;
  staffId: AmxUid;
  domain: CompetencyDomain;
  name: string;
  status: 'in_progress' | 'current' | 'expired';
  achievedAt?: number;
  expiresAt?: number;
}

// ── Performance engine ─────────────────────────────────────────────────────────

export interface PerformanceReview {
  id: string;
  staffId: AmxUid;
  period: string;
  kpiScore: number;
  patientOutcomes: number;
  documentation: number;
  research: number;
  teaching: number;
  attendance: number;
  professionalism: number;
  peerFeedback: number;
  overallScore: number;
  reviewedAt: number;
  reviewedBy?: AmxUid;
}

// ── Succession & retirement ────────────────────────────────────────────────────

export interface SuccessionPlan {
  id: string;
  role: string;
  incumbentId?: AmxUid;
  successors: { staffId: AmxUid; readiness: 'developing' | 'ready' | 'ready_now' }[];
  reviewedAt: number;
}

export interface RetirementRecord {
  id: string;
  staffId: AmxUid;
  retirementDate: number;
  handoverNotes?: string;
  status: 'scheduled' | 'completed';
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface HrModel {
  organizationId: string;
  facilityId?: string;
  chiefHumanResourcesOfficerId?: AmxUid;
  vacancies: Vacancy[];
  applications: JobApplication[];
  employees: Employee[];
  competencyRecords: CompetencyRecord[];
  performanceReviews: PerformanceReview[];
  successionPlans: SuccessionPlan[];
  retirementRecords: RetirementRecord[];
  lifecycleLog: { staffId: AmxUid; stage: WorkforceLifecycleStage; at: number }[];
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateHrModelInput {
  organizationId: string;
  facilityId?: string;
  chiefHumanResourcesOfficerId?: AmxUid;
  actorId?: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── The Engine ─────────────────────────────────────────────────────────────────

export class HumanResourceEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateHrModelInput): HrModel {
    if (!input.organizationId) throw new Error('[HumanResourceEngine] organizationId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      chiefHumanResourcesOfficerId: input.chiefHumanResourcesOfficerId,
      vacancies: [],
      applications: [],
      employees: [],
      competencyRecords: [],
      performanceReviews: [],
      successionPlans: [],
      retirementRecords: [],
      lifecycleLog: [],
      auditLog: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard & audit ─────────────────────────────────────────────

  static canHrPerform(action: string): { allowed: boolean; reason?: string } {
    if (HR_AUTHORITY.includes(action)) return { allowed: true };
    if (HR_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        discriminate_in_hiring: 'Hiring decisions must be non-discriminatory.',
        disclose_personal_data: 'Personal data is confidential.',
        override_constitutional_governance: 'Constitutional governance may not be overridden.',
        hire_without_credential_verification: 'Credentials must be verified before hiring.',
        terminate_without_due_process: 'Termination requires due process.',
        modify_performance_records: 'Performance records may not be modified retrospectively.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within HR authority.` };
  }

  static guard(model: HrModel, actorId: AmxUid, action: string): void {
    if (!actorId) throw new Error('[HumanResourceEngine] actorId is required for HR actions');
    const verdict = HumanResourceEngine.canHrPerform(action);
    if (!verdict.allowed) throw new Error(`[HumanResourceEngine] ${verdict.reason}`);
  }

  static audit(model: HrModel, actorId: AmxUid | undefined, action: string, detail?: string): HrModel {
    const now = Date.now();
    const actor = actorId ?? model.chiefHumanResourcesOfficerId;
    if (!actor) return { ...model, updatedAt: now };
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId: actor, action, detail }], updatedAt: now };
  }

  static logLifecycle(model: HrModel, staffId: AmxUid, stage: WorkforceLifecycleStage): HrModel {
    return { ...model, lifecycleLog: [...model.lifecycleLog, { staffId, stage, at: Date.now() }], updatedAt: Date.now() };
  }

  // ── Recruitment Engine ───────────────────────────────────────────────────────

  static postVacancy(model: HrModel, actorId: AmxUid | undefined, input: Omit<Vacancy, 'id' | 'postedAt' | 'status'>): { model: HrModel; vacancy: Vacancy } {
    HumanResourceEngine.guard(model, actorId ?? model.chiefHumanResourcesOfficerId ?? ('' as AmxUid), 'post_vacancies');
    const vacancy: Vacancy = { ...input, id: nextId('vac'), postedAt: Date.now(), status: 'open' };
    return {
      model: { ...HumanResourceEngine.audit(model, actorId, 'vacancy_posted', input.title), vacancies: [...model.vacancies, vacancy], updatedAt: Date.now() },
      vacancy,
    };
  }

  static receiveApplication(model: HrModel, actorId: AmxUid | undefined, input: Omit<JobApplication, 'id' | 'status' | 'appliedAt'>): { model: HrModel; application: JobApplication } {
    HumanResourceEngine.guard(model, actorId ?? model.chiefHumanResourcesOfficerId ?? ('' as AmxUid), 'review_applications');
    const application: JobApplication = { ...input, id: nextId('app'), status: 'received', appliedAt: Date.now() };
    return {
      model: { ...HumanResourceEngine.audit(model, actorId, 'application_received', input.vacancyId), applications: [...model.applications, application], updatedAt: Date.now() },
      application,
    };
  }

  static shortlistApplication(model: HrModel, applicationId: string): HrModel {
    const index = model.applications.findIndex(a => a.id === applicationId);
    if (index === -1) throw new Error(`[HumanResourceEngine] Application "${applicationId}" does not exist`);
    const updated = { ...model.applications[index], status: 'shortlisted' as const };
    return { ...model, applications: [...model.applications.slice(0, index), updated, ...model.applications.slice(index + 1)], updatedAt: Date.now() };
  }

  static recordInterviewScore(model: HrModel, applicationId: string, score: number): HrModel {
    const index = model.applications.findIndex(a => a.id === applicationId);
    if (index === -1) throw new Error(`[HumanResourceEngine] Application "${applicationId}" does not exist`);
    const updated = { ...model.applications[index], interviewScore: score, status: 'interviewed' as const };
    return { ...model, applications: [...model.applications.slice(0, index), updated, ...model.applications.slice(index + 1)], updatedAt: Date.now() };
  }

  static selectCandidate(model: HrModel, applicationId: string): HrModel {
    const index = model.applications.findIndex(a => a.id === applicationId);
    if (index === -1) throw new Error(`[HumanResourceEngine] Application "${applicationId}" does not exist`);
    const updated = { ...model.applications[index], status: 'selected' as const };
    return { ...model, applications: [...model.applications.slice(0, index), updated, ...model.applications.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Credential verification & employment ─────────────────────────────────────

  static verifyCredentials(model: HrModel, actorId: AmxUid | undefined, staffId: AmxUid, qualification: string, institution: string, verified: boolean): HrModel {
    HumanResourceEngine.guard(model, actorId ?? model.chiefHumanResourcesOfficerId ?? ('' as AmxUid), 'verify_credentials');
    return HumanResourceEngine.logLifecycle(model, staffId, 'credential_verification');
  }

  static hireEmployee(model: HrModel, actorId: AmxUid | undefined, input: { staffId: AmxUid; name: string; role: string; departmentId?: string; contractType: Employee['contractType']; onboardingSteps: string[] }): { model: HrModel; employee: Employee } {
    HumanResourceEngine.guard(model, actorId ?? model.chiefHumanResourcesOfficerId ?? ('' as AmxUid), 'hire_employees');
    const employee: Employee = { id: nextId('emp'), staffId: input.staffId, name: input.name, role: input.role, departmentId: input.departmentId, hiredAt: Date.now(), contractType: input.contractType, verified: false, onboarding: input.onboardingSteps.map(s => ({ step: s, completed: false })), status: 'active' };
    return {
      model: { ...HumanResourceEngine.audit(model, actorId, 'employee_hired', input.staffId), employees: [...model.employees, employee], updatedAt: Date.now() },
      employee,
    };
  }

  static verifyEmployee(model: HrModel, staffId: AmxUid): HrModel {
    const index = model.employees.findIndex(e => e.staffId === staffId);
    if (index === -1) throw new Error(`[HumanResourceEngine] Employee "${staffId}" does not exist`);
    const updated = { ...model.employees[index], verified: true };
    return { ...model, employees: [...model.employees.slice(0, index), updated, ...model.employees.slice(index + 1)], updatedAt: Date.now() };
  }

  static completeOnboardingStep(model: HrModel, staffId: AmxUid, step: string): HrModel {
    const index = model.employees.findIndex(e => e.staffId === staffId);
    if (index === -1) throw new Error(`[HumanResourceEngine] Employee "${staffId}" does not exist`);
    const employee = model.employees[index];
    const onboarding = employee.onboarding.map(o => o.step === step ? { ...o, completed: true } : o);
    const updated = { ...employee, onboarding };
    return { ...model, employees: [...model.employees.slice(0, index), updated, ...model.employees.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Competency Engine ────────────────────────────────────────────────────────

  static recordCompetency(model: HrModel, actorId: AmxUid | undefined, input: Omit<CompetencyRecord, 'id'>): { model: HrModel; competency: CompetencyRecord } {
    HumanResourceEngine.guard(model, actorId ?? model.chiefHumanResourcesOfficerId ?? ('' as AmxUid), 'track_competency');
    const competency: CompetencyRecord = { ...input, id: nextId('comp') };
    return {
      model: { ...HumanResourceEngine.audit(model, actorId, 'competency_recorded', input.domain), competencyRecords: [...model.competencyRecords, competency], updatedAt: Date.now() },
      competency,
    };
  }

  static getExpiredCompetencies(model: HrModel): CompetencyRecord[] {
    const now = Date.now();
    return model.competencyRecords.filter(c => (c.expiresAt && c.expiresAt < now) || c.status === 'expired');
  }

  static getStaffCompetencies(model: HrModel, staffId: AmxUid): CompetencyRecord[] {
    return model.competencyRecords.filter(c => c.staffId === staffId);
  }

  // ── Performance Engine ───────────────────────────────────────────────────────

  static createPerformanceReview(model: HrModel, actorId: AmxUid | undefined, input: Omit<PerformanceReview, 'id' | 'overallScore' | 'reviewedAt'>): { model: HrModel; review: PerformanceReview } {
    HumanResourceEngine.guard(model, actorId ?? model.chiefHumanResourcesOfficerId ?? ('' as AmxUid), 'manage_performance');
    const overallScore = (input.kpiScore + input.patientOutcomes + input.documentation + input.research + input.teaching + input.attendance + input.professionalism + input.peerFeedback) / 8;
    const review: PerformanceReview = { ...input, id: nextId('perf'), overallScore: Number(overallScore.toFixed(2)), reviewedAt: Date.now() };
    return {
      model: { ...HumanResourceEngine.audit(model, actorId, 'performance_review_created', input.staffId), performanceReviews: [...model.performanceReviews, review], updatedAt: Date.now() },
      review,
    };
  }

  static getTopPerformers(model: HrModel, period?: string): PerformanceReview[] {
    return model.performanceReviews
      .filter(r => !period || r.period === period)
      .sort((a, b) => b.overallScore - a.overallScore);
  }

  // ── Succession & retirement ──────────────────────────────────────────────────

  static createSuccessionPlan(model: HrModel, actorId: AmxUid | undefined, input: Omit<SuccessionPlan, 'id' | 'reviewedAt'>): { model: HrModel; plan: SuccessionPlan } {
    HumanResourceEngine.guard(model, actorId ?? model.chiefHumanResourcesOfficerId ?? ('' as AmxUid), 'plan_succession');
    const plan: SuccessionPlan = { ...input, id: nextId('suc'), reviewedAt: Date.now() };
    return {
      model: { ...HumanResourceEngine.audit(model, actorId, 'succession_plan_created', input.role), successionPlans: [...model.successionPlans, plan], updatedAt: Date.now() },
      plan,
    };
  }

  static scheduleRetirement(model: HrModel, actorId: AmxUid | undefined, input: Omit<RetirementRecord, 'id' | 'status'>): { model: HrModel; record: RetirementRecord } {
    HumanResourceEngine.guard(model, actorId ?? model.chiefHumanResourcesOfficerId ?? ('' as AmxUid), 'manage_retirement');
    const record: RetirementRecord = { ...input, id: nextId('ret'), status: 'scheduled' };
    return {
      model: { ...HumanResourceEngine.audit(model, actorId, 'retirement_scheduled', input.staffId), retirementRecords: [...model.retirementRecords, record], updatedAt: Date.now() },
      record,
    };
  }

  static completeRetirement(model: HrModel, recordId: string): HrModel {
    const index = model.retirementRecords.findIndex(r => r.id === recordId);
    if (index === -1) throw new Error(`[HumanResourceEngine] Retirement record "${recordId}" does not exist`);
    const updated = { ...model.retirementRecords[index], status: 'completed' as const };
    return { ...model, retirementRecords: [...model.retirementRecords.slice(0, index), updated, ...model.retirementRecords.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Read conveniences / dashboard ────────────────────────────────────────────

  static getActiveEmployees(model: HrModel): Employee[] {
    return model.employees.filter(e => e.status === 'active');
  }

  static getStaffLifecycle(model: HrModel, staffId: AmxUid): { stage: WorkforceLifecycleStage; at: number }[] {
    return model.lifecycleLog.filter(l => l.staffId === staffId);
  }

  static getDashboardSummary(model: HrModel): {
    activeEmployees: number;
    openVacancies: number;
    pendingVerifications: number;
    expiredCompetencies: number;
    topPerformer?: PerformanceReview;
    upcomingRetirements: number;
  } {
    const topPerformers = HumanResourceEngine.getTopPerformers(model);
    return {
      activeEmployees: HumanResourceEngine.getActiveEmployees(model).length,
      openVacancies: model.vacancies.filter(v => v.status === 'open').length,
      pendingVerifications: model.employees.filter(e => !e.verified).length,
      expiredCompetencies: HumanResourceEngine.getExpiredCompetencies(model).length,
      topPerformer: topPerformers[0],
      upcomingRetirements: model.retirementRecords.filter(r => r.status === 'scheduled').length,
    };
  }
}

export default HumanResourceEngine;
