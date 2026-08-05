// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN INTERN ENGINE (BOOK VI-G) — Engine No. 17
//
// "The Engine of Supervised Professional Transition"
//
// The Intern Engine exists to transform a newly graduated doctor into a safe,
// confident, competent independent practitioner through structured supervision,
// continuous learning, constitutional guidance, and real clinical
// responsibility. Internship is not merely service delivery. It is the
// constitutional bridge between medical school and independent clinical
// practice. AMEXAN ensures that no intern is ever left unsupported,
// unsupervised, or unable to learn from every patient.
//
// Position in the Constitutional Hierarchy:
//   Medical Director → Department Head → Consultant → Resident →
//   Medical Officer → Intern → Medical Student
//
// The Intern always functions under supervision, but with increasing
// responsibility. The AI acts as a clinical tutor, never a replacement
// clinician — every recommendation is linked to evidence and institutional
// protocols.
//
// Constitutional Restrictions (enforced, never commented away):
//   An Intern cannot practice independently, discharge patients independently,
//   approve operations, approve consultant decisions, modify protocols,
//   override constitutional safeguards, perform procedures beyond competency,
//   or approve referrals independently.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type { MedicalSpecialty } from '@/lib/amexan/constitution/types';

// ── Today's assignment ─────────────────────────────────────────────────────────

export interface TodayAssignment {
  ward: string;
  consultantId?: AmxUid;
  residentId?: AmxUid;
  medicalOfficerId?: AmxUid;
  assignedPatientIds: string[];
  todayObjectives: string[];
  date: number;
}

// ── Patient list (interns receive their patients, never all) ──────────────────

export type InternPatientGroup =
  | 'new_admission' | 'ward_patient' | 'follow_up' | 'discharge_candidate'
  | 'procedure_patient' | 'teaching_case';

export interface InternPatient {
  patientId: string;
  name?: string;
  group: InternPatientGroup;
  ward?: string;
  status: 'active' | 'discharged' | 'transferred';
  assignedAt: number;
}

// ── Constitutional clerking engine (completeness checked) ─────────────────────

export type ClerkingSection =
  | 'chief_complaint' | 'history' | 'review_of_systems' | 'past_medical_history'
  | 'drug_history' | 'family_history' | 'social_history' | 'physical_examination'
  | 'problem_list' | 'differentials' | 'initial_plan';

export const CLERKING_SECTIONS: readonly ClerkingSection[] = [
  'chief_complaint', 'history', 'review_of_systems', 'past_medical_history',
  'drug_history', 'family_history', 'social_history', 'physical_examination',
  'problem_list', 'differentials', 'initial_plan',
];

export interface ClerkingRecord {
  id: string;
  patientId: string;
  sections: Partial<Record<ClerkingSection, string>>;
  completenessPercent: number;
  missingSections: ClerkingSection[];
  clerkedBy: AmxUid;
  clerkedAt: number;
}

// ── Intelligent history assistant (intern learns while documenting) ───────────

export interface HistoryAssistantPrompt {
  complaint: string;
  questionsToAsk: { question: string; reason: string }[];
}

// ── Examination assistant (nothing is forgotten) ──────────────────────────────

export interface ExaminationChecklist {
  system: string;
  steps: string[];
  importantNegatives: string[];
  redFlags: string[];
}

// ── Problem list builder (medicine becomes reasoning) ─────────────────────────

export interface InternProblem {
  id: string;
  patientId: string;
  problem: string;
  evidence: string[];
  differentials: string[];
  investigations: string[];
  management: string[];
}

// ── Differential generator (ranked, explained, linked to evidence) ────────────

export interface GeneratedDifferential {
  diagnosis: string;
  rank: number;
  explanation: string;
  evidenceLinks: string[];
}

export interface DifferentialGeneration {
  patientId: string;
  symptoms: string[];
  signs: string[];
  laboratory: string[];
  imaging: string[];
  differentials: GeneratedDifferential[];
  generatedAt: number;
}

// ── Constitutional teaching mode (the patient becomes the textbook) ───────────

export interface TeachingModeLesson {
  patientId: string;
  condition: string;
  anatomy: string;
  physiology: string;
  pathophysiology: string;
  radiology: string;
  laboratory: string;
  management: string[];
  complications: string[];
  guidelines: string[];
  examPearls: string[];
  recentPapers: string[];
}

// ── Presentation builder ───────────────────────────────────────────────────────

export interface PresentationBuilder {
  patientId: string;
  identification: string;
  chiefComplaint: string;
  history: string;
  examination: string;
  summary: string;
  problemList: string[];
  differentials: string[];
  plan: string[];
}

// ── Ward round engine ─────────────────────────────────────────────────────────

export interface InternWardRound {
  id: string;
  patientId: string;
  vitalSigns: string[];
  laboratoryReview: string[];
  medicationReview: string[];
  documentation: string;
  consultRequests: string[];
  dailySummary: string;
  learningPoints: string[];
  consultantFeedback?: string;
  date: number;
}

// ── Procedure engine (each requires supervisor, competency, attempts, approval) ─

export type InternProcedureName =
  | 'cannulation' | 'venepuncture' | 'ng_tube' | 'urinary_catheter'
  | 'abg' | 'ecg' | 'basic_suturing' | 'basic_wound_care' | 'basic_airway';

export const APPROVED_INTERN_PROCEDURES: readonly InternProcedureName[] = [
  'cannulation', 'venepuncture', 'ng_tube', 'urinary_catheter',
  'abg', 'ecg', 'basic_suturing', 'basic_wound_care', 'basic_airway',
];

export interface InternProcedure {
  id: string;
  patientId?: string;
  procedureName: InternProcedureName;
  supervisorId: AmxUid;
  competencyLevel: 'observe' | 'assist' | 'perform' | 'perform_confidently';
  attempts: number;
  feedback: string;
  reflection: string;
  approved: boolean;
  date: number;
}

// ── Competency engine (consultant approves progression) ───────────────────────

export type InternCompetencyLevel = 'observe' | 'assist' | 'perform' | 'perform_confidently' | 'teach';

export const INTERN_COMPETENCY_LEVELS: readonly InternCompetencyLevel[] = ['observe', 'assist', 'perform', 'perform_confidently', 'teach'];

const INTERN_LEVEL_ORDER: Readonly<Record<InternCompetencyLevel, number>> = {
  observe: 0, assist: 1, perform: 2, perform_confidently: 3, teach: 4,
};

export interface InternCompetency {
  skill: string;
  level: InternCompetencyLevel;
  approvedBy?: AmxUid;
  approvedAt?: number;
  history: { at: number; level: InternCompetencyLevel }[];
}

// ── Logbook engine (automatic, no paperwork) ──────────────────────────────────

export type InternLogbookCategory =
  | 'admissions' | 'patients' | 'procedures' | 'clinics' | 'ward_rounds'
  | 'teaching' | 'research' | 'skills' | 'competencies';

export interface InternLogbookEntry {
  id: string;
  category: InternLogbookCategory;
  title: string;
  date: number;
  details?: string;
  patientId?: string;
}

// ── Learning dashboard & quiz engine ──────────────────────────────────────────

export interface LearningItem {
  id: string;
  kind: 'reading' | 'video' | 'protocol' | 'quiz' | 'flashcard' | 'guideline';
  title: string;
  topic: string;
  relatedPatientIds: string[];
  createdAt: number;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  topic: string;
  questions: { questionId: string; chosenIndex: number; correct: boolean }[];
  scorePercent: number;
  weaknesses: string[];
  takenAt: number;
}

// ── Reflection engine (portfolio grows automatically) ─────────────────────────

export interface ReflectionEntry {
  id: string;
  day: number;
  learned: string;
  mistakes: string[];
  improve: string[];
  supervisorComments?: string;
  createdAt: number;
}

// ── Feedback engine (scores build competency graphs) ──────────────────────────

export type FeedbackDimension =
  | 'history' | 'examination' | 'reasoning' | 'communication' | 'professionalism'
  | 'documentation' | 'procedures' | 'leadership' | 'empathy';

export const FEEDBACK_DIMENSIONS: readonly FeedbackDimension[] = [
  'history', 'examination', 'reasoning', 'communication', 'professionalism',
  'documentation', 'procedures', 'leadership', 'empathy',
];

export interface FeedbackScore {
  id: string;
  internId: AmxUid;
  givenBy: AmxUid;
  role: 'consultant' | 'resident' | 'medical_officer';
  scores: Partial<Record<FeedbackDimension, number>>;
  comments?: string;
  at: number;
}

// ── Clinical intelligence (extra explanation) ─────────────────────────────────

export interface IntelligenceExplanation {
  id: string;
  topic: string;
  mechanism: string;
  ecgChanges?: string[];
  emergencyManagement: string[];
  drugDoses: string[];
  pitfalls: string[];
  commonOscQuestions: string[];
  generatedAt: number;
}

// ── Documentation assistant ───────────────────────────────────────────────────

export interface DocumentationReview {
  noteId: string;
  missingHistory: string[];
  missingExamination: string[];
  contradictions: string[];
  drugInteractions: string[];
  incorrectTerminology: string[];
  incompletePlans: string[];
  qualityScore: number;
}

// ── Communication ─────────────────────────────────────────────────────────────

export type InternAudience =
  | 'resident' | 'medical_officer' | 'consultant' | 'nurses'
  | 'laboratory' | 'radiology' | 'students' | 'patient_education';

export interface InternCommunication {
  id: string;
  audience: InternAudience;
  patientId?: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  publishedBy: AmxUid;
  publishedAt: number;
}

// ── Patient education assistant ───────────────────────────────────────────────

export interface PatientEducationMaterial {
  id: string;
  patientId: string;
  condition: string;
  simpleExplanation: string;
  visuals: string[];
  localLanguage: string;
  leaflet: string;
  medicationInstructions: string[];
  lifestyleAdvice: string[];
  teachBackQuestions: string[];
  createdAt: number;
}

// ── Research ──────────────────────────────────────────────────────────────────

export type InternResearchStage = 'join_project' | 'collect_data' | 'case_report' | 'audit' | 'quality_improvement' | 'presentation' | 'publication';

export interface InternResearch {
  id: string;
  title: string;
  stage: InternResearchStage;
  status: 'active' | 'completed';
  supervisorId?: AmxUid;
}

// ── Wellness engine ───────────────────────────────────────────────────────────

export interface InternWellness {
  id: string;
  week: number;
  dutyHours: number;
  sleepHours: number;
  stressScore: number;
  fatigueScore: number;
  clinicalExposure: number;
  learningBalance: number;
  burnoutRisk: 'low' | 'moderate' | 'high';
  recordedAt: number;
}

// ── Personal analytics ────────────────────────────────────────────────────────

export interface InternAnalytics {
  patientsClerked: number;
  procedures: number;
  competencies: number;
  teachingAttended: number;
  researchActivities: number;
  documentationQuality: number;
  averageQuizScore: number;
  averageFeedbackScore: number;
  completionProgressPercent: number;
}

// ── HMIS / EMR responsibilities ───────────────────────────────────────────────

export interface InternHmisDuties {
  admissions: boolean;
  bedsideDocumentation: boolean;
  taskCompletion: boolean;
  investigationRequests: boolean;
  procedureScheduling: boolean;
  wardRoundPreparation: boolean;
  dischargeDrafts: boolean;
}

export type InternEmrKind =
  | 'admission_clerking' | 'progress_note' | 'procedure_documentation'
  | 'discharge_draft' | 'patient_education_record' | 'referral_draft';

export interface InternEmrNote {
  id: string;
  kind: InternEmrKind;
  patientId: string;
  reviewed: boolean;
  reviewerId?: AmxUid;
  qualityScore: number;
  suggestions: string[];
  createdAt: number;
}

// ── AI intern companion (clinical tutor) ──────────────────────────────────────

export interface AiTutorAdvice {
  id: string;
  patientId?: string;
  topic: string;
  historyGuidance: string[];
  examinationChecklist: string[];
  differentialTeaching: string[];
  investigationExplanations: string[];
  drugDoseCalculator?: string;
  guidelineSummary: string[];
  anatomyPhysiologyRefresher: string[];
  oscPreparation: string[];
  commonMistakes: string[];
  reflectionPrompts: string[];
  generatedAt: number;
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface InternModel {
  organizationId: string;
  facilityId?: string;
  medicalDirectorId?: AmxUid;
  departmentHeadId?: AmxUid;
  consultantId?: AmxUid;
  residentId?: AmxUid;
  medicalOfficerId?: AmxUid;
  departmentId: string;
  specialty: MedicalSpecialty;
  internId: AmxUid;
  todayAssignment?: TodayAssignment;
  patients: InternPatient[];
  clerking: ClerkingRecord[];
  problems: InternProblem[];
  differentials: DifferentialGeneration[];
  lessons: TeachingModeLesson[];
  presentations: PresentationBuilder[];
  wardRounds: InternWardRound[];
  procedures: InternProcedure[];
  competencies: InternCompetency[];
  logbook: InternLogbookEntry[];
  learningItems: LearningItem[];
  quizzes: QuizAttempt[];
  reflections: ReflectionEntry[];
  feedback: FeedbackScore[];
  explanations: IntelligenceExplanation[];
  documentationReviews: DocumentationReview[];
  communications: InternCommunication[];
  educationMaterials: PatientEducationMaterial[];
  research: InternResearch[];
  wellness: InternWellness[];
  analytics: InternAnalytics;
  hmis: InternHmisDuties;
  emrNotes: InternEmrNote[];
  tutorAdvice: AiTutorAdvice[];
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateInternModelInput {
  organizationId: string;
  facilityId?: string;
  medicalDirectorId?: AmxUid;
  departmentHeadId?: AmxUid;
  consultantId?: AmxUid;
  residentId?: AmxUid;
  medicalOfficerId?: AmxUid;
  departmentId: string;
  specialty: MedicalSpecialty;
  internId: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Constitutional authority / restriction tables ──────────────────────────────

export const INTERN_AUTHORITY: readonly string[] = [
  'take_history', 'examine_patients', 'write_notes', 'order_investigations',
  'prescribe_under_supervision', 'perform_approved_procedures', 'present_patients',
  'teach_students', 'educate_patients', 'participate_in_ward_rounds',
];

export const INTERN_RESTRICTIONS: readonly string[] = [
  'practice_independently', 'discharge_independently', 'approve_operations',
  'approve_consultant_decisions', 'modify_protocols', 'override_constitutional_safeguards',
  'perform_beyond_competency', 'approve_referrals_independently',
];

// ── The Engine ─────────────────────────────────────────────────────────────────

export class InternEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateInternModelInput): InternModel {
    if (!input.organizationId) throw new Error('[IE] organizationId is required');
    if (!input.internId) throw new Error('[IE] internId is required');
    if (!input.departmentId) throw new Error('[IE] departmentId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      medicalDirectorId: input.medicalDirectorId,
      departmentHeadId: input.departmentHeadId,
      consultantId: input.consultantId,
      residentId: input.residentId,
      medicalOfficerId: input.medicalOfficerId,
      departmentId: input.departmentId,
      specialty: input.specialty,
      internId: input.internId,
      patients: [],
      clerking: [],
      problems: [],
      differentials: [],
      lessons: [],
      presentations: [],
      wardRounds: [],
      procedures: [],
      competencies: [],
      logbook: [],
      learningItems: [],
      quizzes: [],
      reflections: [],
      feedback: [],
      explanations: [],
      documentationReviews: [],
      communications: [],
      educationMaterials: [],
      research: [],
      wellness: [],
      analytics: {
        patientsClerked: 0, procedures: 0, competencies: 0, teachingAttended: 0,
        researchActivities: 0, documentationQuality: 0, averageQuizScore: 0,
        averageFeedbackScore: 0, completionProgressPercent: 0,
      },
      hmis: {
        admissions: false, bedsideDocumentation: false, taskCompletion: false, investigationRequests: false,
        procedureScheduling: false, wardRoundPreparation: false, dischargeDrafts: false,
      },
      emrNotes: [],
      tutorAdvice: [],
      auditLog: [{ at: now, actorId: input.internId, action: 'intern_registered' }],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard ─────────────────────────────────────────────────────

  static assertIntern(model: InternModel, actorId: AmxUid): void {
    if (actorId !== model.internId) throw new Error('[IE] Only the Intern may perform this action');
  }

  static canInternPerform(action: string): { allowed: boolean; reason?: string } {
    if (INTERN_AUTHORITY.includes(action)) return { allowed: true };
    if (INTERN_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        practice_independently: 'Interns always function under supervision.',
        discharge_independently: 'Discharge requires supervising clinician approval.',
        approve_operations: 'Operations are approved by consultants.',
        approve_consultant_decisions: 'Consultant decisions are beyond intern authority.',
        modify_protocols: 'Protocols may not be modified by interns.',
        override_constitutional_safeguards: 'Constitutional safeguards may not be overridden.',
        perform_beyond_competency: 'Procedures require verified competency and supervisor approval.',
        approve_referrals_independently: 'Referrals require supervising clinician review.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Intern authority.` };
  }

  static guard(model: InternModel, actorId: AmxUid, action: string): void {
    InternEngine.assertIntern(model, actorId);
    const verdict = InternEngine.canInternPerform(action);
    if (!verdict.allowed) throw new Error(`[IE] ${verdict.reason}`);
  }

  static audit(model: InternModel, actorId: AmxUid, action: string, detail?: string): InternModel {
    const now = Date.now();
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId, action, detail }], updatedAt: now };
  }

  // ── Today's assignment ───────────────────────────────────────────────────────

  static setTodayAssignment(model: InternModel, actorId: AmxUid, assignment: TodayAssignment): InternModel {
    InternEngine.guard(model, actorId, 'participate_in_ward_rounds');
    return { ...InternEngine.audit(model, actorId, 'today_assignment_set', assignment.ward), todayAssignment: assignment, updatedAt: Date.now() };
  }

  static getTodayAssignment(model: InternModel): TodayAssignment | undefined {
    return model.todayAssignment ? { ...model.todayAssignment } : undefined;
  }

  // ── Patient list ─────────────────────────────────────────────────────────────

  static assignPatient(model: InternModel, actorId: AmxUid, patient: Omit<InternPatient, 'assignedAt' | 'status'>): { model: InternModel; patient: InternPatient } {
    InternEngine.guard(model, actorId, 'take_history');
    const created: InternPatient = { ...patient, status: 'active', assignedAt: Date.now() };
    const patients = [...model.patients.filter(p => p.patientId !== created.patientId), created];
    return { model: { ...InternEngine.audit(model, actorId, 'patient_assigned', created.patientId), patients, updatedAt: Date.now() }, patient: created };
  }

  static getMyPatients(model: InternModel, group?: InternPatientGroup): InternPatient[] {
    return model.patients.filter(p => p.status === 'active' && (!group || p.group === group));
  }

  // ── Constitutional clerking engine ───────────────────────────────────────────

  static clerkPatient(model: InternModel, actorId: AmxUid, patientId: string, sections: Partial<Record<ClerkingSection, string>>): { model: InternModel; clerking: ClerkingRecord } {
    InternEngine.guard(model, actorId, 'take_history');
    const missingSections = CLERKING_SECTIONS.filter(s => !sections[s]?.trim());
    const completenessPercent = Math.round(((CLERKING_SECTIONS.length - missingSections.length) / CLERKING_SECTIONS.length) * 100);
    const now = Date.now();
    const clerking: ClerkingRecord = { id: nextId('clk'), patientId, sections, completenessPercent, missingSections, clerkedBy: actorId, clerkedAt: now };
    const logbookEntry: InternLogbookEntry = { id: nextId('log'), category: 'admissions', title: `Clerking — ${patientId}`, date: now, patientId };
    return {
      model: {
        ...InternEngine.audit(model, actorId, 'patient_clerked', patientId),
        clerking: [...model.clerking, clerking],
        logbook: [...model.logbook, logbookEntry],
        analytics: { ...model.analytics, patientsClerked: model.analytics.patientsClerked + 1 },
        updatedAt: now,
      },
      clerking,
    };
  }

  static assessClerkingCompleteness(model: InternModel, clerkingId: string): { completenessPercent: number; missingSections: ClerkingSection[] } {
    const clerking = model.clerking.find(c => c.id === clerkingId);
    if (!clerking) return { completenessPercent: 0, missingSections: [...CLERKING_SECTIONS] };
    return { completenessPercent: clerking.completenessPercent, missingSections: [...clerking.missingSections] };
  }

  // ── Intelligent history assistant ────────────────────────────────────────────

  static historyPromptsForComplaint(complaint: string): HistoryAssistantPrompt {
    const c = complaint.toLowerCase();
    const questionsToAsk: { question: string; reason: string }[] = [];
    if (c.includes('chest pain') || c.includes('chest')) {
      questionsToAsk.push(
        { question: 'Does the pain radiate anywhere (arm, jaw, back)?', reason: 'Radiation suggests ischaemic or aortic pathology' },
        { question: 'Describe the character — crushing, burning, sharp, tearing?', reason: 'Character differentiates ACS, dissection, and musculoskeletal pain' },
        { question: 'How long does it last and is it continuous?', reason: 'Duration and persistence influence urgency' },
        { question: 'Any associated sweating, nausea, or breathlessness?', reason: 'Autonomic symptoms accompany ischaemia' },
        { question: 'What are the cardiac risk factors?', reason: 'Risk stratification' },
        { question: 'Any prior cardiac history?', reason: 'Recurrent presentation changes management' },
        { question: 'Any cough, fever, or respiratory symptoms?', reason: 'Pulmonary causes' },
        { question: 'Any recent trauma?', reason: 'Trauma changes the differential' },
        { question: 'Any current medication or drug history?', reason: 'Drug effects and interactions' },
      );
    }
    return { complaint, questionsToAsk };
  }

  // ── Examination assistant ────────────────────────────────────────────────────

  static examinationChecklistForSystem(system: string): ExaminationChecklist {
    const s = system.toLowerCase();
    if (s.includes('abdom')) {
      return {
        system,
        steps: ['Inspection', 'Auscultation', 'Percussion', 'Palpation', 'Special tests'],
        importantNegatives: ['No guarding', 'No rigidity', 'No masses', 'No organomegaly', 'Bowel sounds present'],
        redFlags: ['Peritonism', 'Distension with shock', 'Blood in stool', 'Persistent vomiting'],
      };
    }
    return { system, steps: ['Inspection', 'Palpation', 'Percussion', 'Auscultation'], importantNegatives: [], redFlags: [] };
  }

  // ── Problem list builder (medicine becomes reasoning) ───────────────────────

  static addProblem(model: InternModel, actorId: AmxUid, patientId: string, input: Omit<InternProblem, 'id' | 'patientId'>): { model: InternModel; problem: InternProblem } {
    InternEngine.guard(model, actorId, 'write_notes');
    const problem: InternProblem = { ...input, id: nextId('prb'), patientId };
    return { model: { ...InternEngine.audit(model, actorId, 'problem_added', problem.problem), problems: [...model.problems, problem], updatedAt: Date.now() }, problem };
  }

  // ── Differential generator (ranked, explained, linked to evidence) ──────────

  static generateDifferentials(model: InternModel, actorId: AmxUid, input: Omit<DifferentialGeneration, 'generatedAt'>): { model: InternModel; generation: DifferentialGeneration } {
    InternEngine.guard(model, actorId, 'take_history');
    const ranked = [...input.differentials].sort((a, b) => a.rank - b.rank);
    const generation: DifferentialGeneration = { ...input, differentials: ranked, generatedAt: Date.now() };
    return { model: { ...InternEngine.audit(model, actorId, 'differentials_generated', input.patientId), differentials: [...model.differentials.filter(d => d.patientId !== input.patientId), generation], updatedAt: Date.now() }, generation };
  }

  static getDifferentials(model: InternModel, patientId: string): DifferentialGeneration | undefined {
    return model.differentials.find(d => d.patientId === patientId);
  }

  // ── Constitutional teaching mode (the patient becomes the textbook) ─────────

  static createTeachingLesson(model: InternModel, input: TeachingModeLesson): { model: InternModel; lesson: TeachingModeLesson } {
    const lesson: TeachingModeLesson = { ...input };
    return { model: { ...model, lessons: [...model.lessons.filter(l => l.patientId !== input.patientId), lesson], updatedAt: Date.now() }, lesson };
  }

  static getTeachingLesson(model: InternModel, patientId: string): TeachingModeLesson | undefined {
    return model.lessons.find(l => l.patientId === patientId);
  }

  // ── Presentation builder ─────────────────────────────────────────────────────

  static buildPresentation(model: InternModel, actorId: AmxUid, input: PresentationBuilder): { model: InternModel; presentation: PresentationBuilder } {
    InternEngine.guard(model, actorId, 'present_patients');
    return { model: { ...InternEngine.audit(model, actorId, 'presentation_built', input.patientId), presentations: [...model.presentations.filter(p => p.patientId !== input.patientId), input], updatedAt: Date.now() }, presentation: input };
  }

  // ── Ward round engine ────────────────────────────────────────────────────────

  static conductWardRound(model: InternModel, actorId: AmxUid, input: Omit<InternWardRound, 'id' | 'date'>): { model: InternModel; wardRound: InternWardRound } {
    InternEngine.guard(model, actorId, 'participate_in_ward_rounds');
    const now = Date.now();
    const wardRound: InternWardRound = { ...input, id: nextId('wr'), date: now };
    const logbookEntry: InternLogbookEntry = { id: nextId('log'), category: 'ward_rounds', title: `Ward round — ${input.patientId}`, date: now, patientId: input.patientId };
    return { model: { ...InternEngine.audit(model, actorId, 'ward_round_conducted', input.patientId), wardRounds: [...model.wardRounds, wardRound], logbook: [...model.logbook, logbookEntry], updatedAt: now }, wardRound };
  }

  // ── Procedure engine (supervisor, competency, attempts, feedback, approval) ─

  static performProcedure(model: InternModel, actorId: AmxUid, input: Omit<InternProcedure, 'id' | 'approved' | 'date'>): { model: InternModel; procedure: InternProcedure } {
    InternEngine.guard(model, actorId, 'perform_approved_procedures');
    if (!APPROVED_INTERN_PROCEDURES.includes(input.procedureName)) {
      throw new Error(`[IE] Procedure "${input.procedureName}" is not approved for interns`);
    }
    if (!input.supervisorId) throw new Error('[IE] Procedures require a supervisor');
    const procedure: InternProcedure = { ...input, id: nextId('proc'), approved: false, date: Date.now() };
    return { model: { ...InternEngine.audit(model, actorId, 'procedure_performed', input.procedureName), procedures: [...model.procedures, procedure], updatedAt: Date.now() }, procedure };
  }

  static approveProcedure(model: InternModel, supervisorId: AmxUid, procedureId: string): InternModel {
    const procedure = model.procedures.find(p => p.id === procedureId);
    if (!procedure) throw new Error('[IE] Procedure not found');
    if (supervisorId !== procedure.supervisorId) throw new Error('[IE] Only the supervising clinician may approve this procedure');
    const procedures = model.procedures.map(p => p.id === procedureId ? { ...p, approved: true } : p);
    return { ...InternEngine.audit(model, model.internId, 'procedure_approved', procedureId), procedures, updatedAt: Date.now() };
  }

  // ── Competency engine (consultant approves progression) ─────────────────────

  static setCompetency(model: InternModel, consultantId: AmxUid, skill: string, level: InternCompetencyLevel): { model: InternModel; competency: InternCompetency } {
    if (consultantId !== model.consultantId) throw new Error('[IE] Only the supervising Consultant may approve competency progression');
    const now = Date.now();
    const existing = model.competencies.find(c => c.skill === skill);
    const competency: InternCompetency = {
      skill, level,
      approvedBy: consultantId,
      approvedAt: now,
      history: [...(existing?.history ?? []), { at: now, level }],
    };
    const competencies = [...model.competencies.filter(c => c.skill !== skill), competency];
    return { model: { ...InternEngine.audit(model, model.internId, 'competency_approved', skill), competencies, updatedAt: now }, competency };
  }

  static canPerform(model: InternModel, skill: string, required: InternCompetencyLevel): boolean {
    const competency = model.competencies.find(c => c.skill === skill);
    return !!competency && INTERN_LEVEL_ORDER[competency.level] >= INTERN_LEVEL_ORDER[required];
  }

  static getCompetencySummary(model: InternModel): InternCompetency[] {
    return [...model.competencies];
  }

  // ── Logbook engine (automatic, no paperwork) ────────────────────────────────

  static addLogbookEntry(model: InternModel, actorId: AmxUid, entry: Omit<InternLogbookEntry, 'id'>): { model: InternModel; entry: InternLogbookEntry } {
    InternEngine.guard(model, actorId, 'take_history');
    const created: InternLogbookEntry = { ...entry, id: nextId('log') };
    return { model: { ...InternEngine.audit(model, actorId, 'logbook_entry_added', entry.category), logbook: [...model.logbook, created], updatedAt: Date.now() }, entry: created };
  }

  static searchLogbook(model: InternModel, query: string): InternLogbookEntry[] {
    const q = query.toLowerCase();
    return model.logbook.filter(e => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
  }

  static getLogbookCounts(model: InternModel): Partial<Record<InternLogbookCategory, number>> {
    const counts: Partial<Record<InternLogbookCategory, number>> = {};
    for (const e of model.logbook) counts[e.category] = (counts[e.category] ?? 0) + 1;
    return counts;
  }

  // ── Learning dashboard ───────────────────────────────────────────────────────

  static addLearningItem(model: InternModel, input: Omit<LearningItem, 'id' | 'createdAt'>): { model: InternModel; item: LearningItem } {
    const item: LearningItem = { ...input, id: nextId('lrn'), createdAt: Date.now() };
    return { model: { ...model, learningItems: [...model.learningItems, item], updatedAt: Date.now() }, item };
  }

  static getLearningDashboard(model: InternModel): { items: LearningItem[]; byTopic: Record<string, LearningItem[]> } {
    const byTopic: Record<string, LearningItem[]> = {};
    for (const item of model.learningItems) {
      byTopic[item.topic] = [...(byTopic[item.topic] ?? []), item];
    }
    return { items: [...model.learningItems], byTopic };
  }

  // ── Quiz engine (patients become examinations) ───────────────────────────────

  static takeQuiz(model: InternModel, actorId: AmxUid, topic: string, answers: { questionId: string; chosenIndex: number }[], questions: QuizQuestion[]): { model: InternModel; attempt: QuizAttempt } {
    InternEngine.guard(model, actorId, 'take_history');
    const answered = questions.map(q => {
      const chosen = answers.find(a => a.questionId === q.id);
      return { questionId: q.id, chosenIndex: chosen?.chosenIndex ?? -1, correct: chosen?.chosenIndex === q.correctIndex };
    });
    const correctCount = answered.filter(a => a.correct).length;
    const scorePercent = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
    const weaknesses = answered.filter(a => !a.correct).map(a => {
      const q = questions.find(x => x.id === a.questionId);
      return q ? q.topic : 'unknown';
    });
    const attempt: QuizAttempt = { id: nextId('qz'), topic, questions: answered, scorePercent, weaknesses, takenAt: Date.now() };
    const quizzes = [...model.quizzes, attempt];
    const avg = Math.round(quizzes.reduce((a, q) => a + q.scorePercent, 0) / quizzes.length);
    return {
      model: {
        ...InternEngine.audit(model, actorId, 'quiz_taken', topic),
        quizzes,
        analytics: { ...model.analytics, averageQuizScore: avg },
        updatedAt: Date.now(),
      },
      attempt,
    };
  }

  static getQuizProgress(model: InternModel): { attempts: QuizAttempt[]; averageScore: number } {
    const attempts = [...model.quizzes];
    const averageScore = attempts.length ? Math.round(attempts.reduce((a, q) => a + q.scorePercent, 0) / attempts.length) : 0;
    return { attempts, averageScore };
  }

  // ── Reflection engine (portfolio grows automatically) ───────────────────────

  static addReflection(model: InternModel, actorId: AmxUid, input: Omit<ReflectionEntry, 'id' | 'createdAt'>): { model: InternModel; reflection: ReflectionEntry } {
    InternEngine.guard(model, actorId, 'take_history');
    const reflection: ReflectionEntry = { ...input, id: nextId('rfl'), createdAt: Date.now() };
    return { model: { ...InternEngine.audit(model, actorId, 'reflection_added'), reflections: [...model.reflections, reflection], updatedAt: Date.now() }, reflection };
  }

  static addSupervisorComment(model: InternModel, supervisorId: AmxUid, reflectionId: string, comments: string): InternModel {
    const reflection = model.reflections.find(r => r.id === reflectionId);
    if (!reflection) throw new Error('[IE] Reflection not found');
    const reflections = model.reflections.map(r => r.id === reflectionId ? { ...r, supervisorComments: comments } : r);
    return { ...InternEngine.audit(model, model.internId, 'supervisor_comment_added', reflectionId), reflections, updatedAt: Date.now() };
  }

  // ── Feedback engine ──────────────────────────────────────────────────────────

  static recordFeedback(model: InternModel, actorId: AmxUid, input: Omit<FeedbackScore, 'id' | 'at'>): { model: InternModel; feedback: FeedbackScore } {
    const validRoles: FeedbackScore['role'][] = ['consultant', 'resident', 'medical_officer'];
    if (!validRoles.includes(input.role)) throw new Error('[IE] Feedback must come from a supervising clinician role');
    const feedback: FeedbackScore = { ...input, id: nextId('fb'), at: Date.now() };
    const all = [...model.feedback, feedback];
    const allValues = FEEDBACK_DIMENSIONS.flatMap(d => all.map(f => f.scores[d]).filter((v): v is number => typeof v === 'number'));
    const averageFeedbackScore = allValues.length ? Math.round(allValues.reduce((a, v) => a + v, 0) / allValues.length) : 0;
    return { model: { ...InternEngine.audit(model, actorId, 'feedback_recorded', input.role), feedback: all, analytics: { ...model.analytics, averageFeedbackScore }, updatedAt: Date.now() }, feedback };
  }

  static getFeedbackScores(model: InternModel): FeedbackScore[] {
    return [...model.feedback];
  }

  // ── Clinical intelligence (extra explanation) ────────────────────────────────

  static explainTopic(model: InternModel, input: Omit<IntelligenceExplanation, 'id' | 'generatedAt'>): { model: InternModel; explanation: IntelligenceExplanation } {
    const explanation: IntelligenceExplanation = { ...input, id: nextId('exp'), generatedAt: Date.now() };
    return { model: { ...model, explanations: [...model.explanations, explanation], updatedAt: Date.now() }, explanation };
  }

  static getExplanation(model: InternModel, topic: string): IntelligenceExplanation | undefined {
    return model.explanations.find(e => e.topic.toLowerCase() === topic.toLowerCase());
  }

  // ── Documentation assistant ──────────────────────────────────────────────────

  static reviewDocumentation(model: InternModel, actorId: AmxUid, noteId: string, input: Omit<DocumentationReview, 'noteId' | 'qualityScore'>): { model: InternModel; review: DocumentationReview } {
    InternEngine.guard(model, actorId, 'write_notes');
    const issueCount = input.missingHistory.length + input.missingExamination.length + input.contradictions.length + input.drugInteractions.length + input.incorrectTerminology.length + input.incompletePlans.length;
    const qualityScore = Math.max(0, Math.min(100, 100 - issueCount * 8));
    const review: DocumentationReview = { ...input, noteId, qualityScore };
    return { model: { ...InternEngine.audit(model, actorId, 'documentation_reviewed', noteId), documentationReviews: [...model.documentationReviews.filter(r => r.noteId !== noteId), review], updatedAt: Date.now() }, review };
  }

  static getDocumentationQuality(model: InternModel): { reviews: DocumentationReview[]; averageScore: number } {
    const reviews = [...model.documentationReviews];
    const averageScore = reviews.length ? Math.round(reviews.reduce((a, r) => a + r.qualityScore, 0) / reviews.length) : 0;
    return { reviews, averageScore };
  }

  // ── Communication (all secure) ───────────────────────────────────────────────

  static sendCommunication(model: InternModel, actorId: AmxUid, input: Omit<InternCommunication, 'id' | 'publishedBy' | 'publishedAt'>): { model: InternModel; communication: InternCommunication } {
    InternEngine.guard(model, actorId, 'take_history');
    const communication: InternCommunication = { ...input, id: nextId('com'), publishedBy: actorId, publishedAt: Date.now() };
    return { model: { ...InternEngine.audit(model, actorId, 'communication_published', input.title), communications: [...model.communications, communication], updatedAt: Date.now() }, communication };
  }

  // ── Patient education assistant ──────────────────────────────────────────────

  static educatePatient(model: InternModel, actorId: AmxUid, input: Omit<PatientEducationMaterial, 'id' | 'createdAt'>): { model: InternModel; material: PatientEducationMaterial } {
    InternEngine.guard(model, actorId, 'educate_patients');
    const material: PatientEducationMaterial = { ...input, id: nextId('edu'), createdAt: Date.now() };
    return { model: { ...InternEngine.audit(model, actorId, 'patient_educated', input.condition), educationMaterials: [...model.educationMaterials, material], updatedAt: Date.now() }, material };
  }

  // ── Research ─────────────────────────────────────────────────────────────────

  static registerResearch(model: InternModel, actorId: AmxUid, input: Omit<InternResearch, 'id' | 'status'>): { model: InternModel; research: InternResearch } {
    InternEngine.guard(model, actorId, 'take_history');
    const research: InternResearch = { ...input, id: nextId('rsc'), status: 'active' };
    return { model: { ...InternEngine.audit(model, actorId, 'research_registered', input.title), research: [...model.research, research], analytics: { ...model.analytics, researchActivities: model.analytics.researchActivities + 1 }, updatedAt: Date.now() }, research };
  }

  // ── Wellness engine (protects interns) ───────────────────────────────────────

  static CONSTITUTIONAL_INTERN_LIMITS: Readonly<{ maxWeeklyDutyHours: number; minSleepHours: number; burnoutThreshold: number }> = {
    maxWeeklyDutyHours: 72,
    minSleepHours: 6,
    burnoutThreshold: 7,
  };

  static recordWellness(model: InternModel, actorId: AmxUid, input: Omit<InternWellness, 'id' | 'burnoutRisk' | 'recordedAt'>): { model: InternModel; wellness: InternWellness } {
    InternEngine.guard(model, actorId, 'take_history');
    const limits = InternEngine.CONSTITUTIONAL_INTERN_LIMITS;
    const now = Date.now();
    let burnoutRisk: InternWellness['burnoutRisk'] = 'low';
    if (input.dutyHours >= limits.maxWeeklyDutyHours || input.sleepHours <= limits.minSleepHours || input.stressScore >= limits.burnoutThreshold) {
      burnoutRisk = 'high';
    } else if (input.dutyHours >= limits.maxWeeklyDutyHours * 0.85 || input.fatigueScore >= limits.burnoutThreshold * 0.7) {
      burnoutRisk = 'moderate';
    }
    const wellness: InternWellness = { ...input, id: nextId('wl'), burnoutRisk, recordedAt: now };
    return { model: { ...InternEngine.audit(model, actorId, 'wellness_recorded'), wellness: [...model.wellness, wellness], updatedAt: now }, wellness };
  }

  static getBurnoutAlerts(model: InternModel): InternWellness[] {
    return model.wellness.filter(w => w.burnoutRisk === 'high');
  }

  // ── Personal analytics ───────────────────────────────────────────────────────

  static updateAnalytics(model: InternModel, actorId: AmxUid, patch: Partial<InternAnalytics>): InternModel {
    InternEngine.guard(model, actorId, 'take_history');
    const analytics = { ...model.analytics, ...patch };
    return { ...InternEngine.audit(model, actorId, 'analytics_updated'), analytics, updatedAt: Date.now() };
  }

  static getAnalytics(model: InternModel): InternAnalytics {
    return { ...model.analytics };
  }

  // ── HMIS / EMR responsibilities ──────────────────────────────────────────────

  static updateHmisDuties(model: InternModel, actorId: AmxUid, patch: Partial<InternHmisDuties>): InternModel {
    InternEngine.guard(model, actorId, 'take_history');
    const hmis = { ...model.hmis, ...patch };
    return { ...InternEngine.audit(model, actorId, 'hmis_duties_updated'), hmis, updatedAt: Date.now() };
  }

  /** EMR notes are reviewed through constitutional supervision workflows before final approval. */
  static createEmrNote(model: InternModel, actorId: AmxUid, input: Omit<InternEmrNote, 'id' | 'reviewed' | 'qualityScore' | 'suggestions' | 'createdAt'>): { model: InternModel; note: InternEmrNote } {
    InternEngine.guard(model, actorId, 'write_notes');
    const now = Date.now();
    const baseQuality: Record<InternEmrKind, number> = {
      admission_clerking: 80, progress_note: 78, procedure_documentation: 82,
      discharge_draft: 76, patient_education_record: 75, referral_draft: 77,
    };
    const suggestions: string[] = [];
    if (input.kind === 'discharge_draft') suggestions.push('Draft to be reviewed and finalized by supervising clinician');
    if (input.kind === 'referral_draft') suggestions.push('Referral to be reviewed before sending');
    const note: InternEmrNote = {
      ...input, id: nextId('emr'), reviewed: false,
      qualityScore: baseQuality[input.kind],
      suggestions,
      createdAt: now,
    };
    return { model: { ...InternEngine.audit(model, actorId, 'emr_note_created', input.kind), emrNotes: [...model.emrNotes, note], updatedAt: now }, note };
  }

  static reviewEmrNote(model: InternModel, reviewerId: AmxUid, noteId: string): InternModel {
    const note = model.emrNotes.find(n => n.id === noteId);
    if (!note) throw new Error('[IE] EMR note not found');
    const emrNotes = model.emrNotes.map(n => n.id === noteId ? { ...n, reviewed: true, reviewerId } : n);
    return { ...InternEngine.audit(model, model.internId, 'emr_note_reviewed', noteId), emrNotes, updatedAt: Date.now() };
  }

  static getPendingReviews(model: InternModel): InternEmrNote[] {
    return model.emrNotes.filter(n => !n.reviewed);
  }

  // ── AI intern companion (clinical tutor) ─────────────────────────────────────

  static generateTutorAdvice(model: InternModel, input: Omit<AiTutorAdvice, 'id' | 'generatedAt'>): { model: InternModel; advice: AiTutorAdvice } {
    const advice: AiTutorAdvice = { ...input, id: nextId('tut'), generatedAt: Date.now() };
    return { model: { ...model, tutorAdvice: [...model.tutorAdvice, advice], updatedAt: Date.now() }, advice };
  }

  static getTutorAdvice(model: InternModel, patientId?: string): AiTutorAdvice[] {
    return model.tutorAdvice.filter(a => !patientId || a.patientId === patientId);
  }

  // ── Authority actions ────────────────────────────────────────────────────────

  static orderInvestigation(model: InternModel, actorId: AmxUid, patientId: string, investigation: string): InternModel {
    InternEngine.guard(model, actorId, 'order_investigations');
    return InternEngine.audit(model, actorId, 'investigation_ordered', `${patientId}: ${investigation}`);
  }

  static prescribeUnderSupervision(model: InternModel, actorId: AmxUid, patientId: string, medication: string, supervisorId: AmxUid): InternModel {
    InternEngine.guard(model, actorId, 'prescribe_under_supervision');
    return InternEngine.audit(model, actorId, 'medication_prescribed_under_supervision', `${patientId}: ${medication} (supervisor ${supervisorId})`);
  }

  static presentPatient(model: InternModel, actorId: AmxUid, patientId: string): InternModel {
    InternEngine.guard(model, actorId, 'present_patients');
    return InternEngine.audit(model, actorId, 'patient_presented', patientId);
  }

  // ── Constitutional restrictions (enforced) ───────────────────────────────────

  static practiceIndependently(model: InternModel, actorId: AmxUid): InternModel {
    InternEngine.guard(model, actorId, 'practice_independently');
    return model;
  }

  static dischargeIndependently(model: InternModel, actorId: AmxUid): InternModel {
    InternEngine.guard(model, actorId, 'discharge_independently');
    return model;
  }

  static approveOperation(model: InternModel, actorId: AmxUid): InternModel {
    InternEngine.guard(model, actorId, 'approve_operations');
    return model;
  }

  static approveConsultantDecision(model: InternModel, actorId: AmxUid): InternModel {
    InternEngine.guard(model, actorId, 'approve_consultant_decisions');
    return model;
  }

  static modifyProtocol(model: InternModel, actorId: AmxUid): InternModel {
    InternEngine.guard(model, actorId, 'modify_protocols');
    return model;
  }

  static overrideConstitutionalSafeguard(model: InternModel, actorId: AmxUid): InternModel {
    InternEngine.guard(model, actorId, 'override_constitutional_safeguards');
    return model;
  }

  static performBeyondCompetency(model: InternModel, actorId: AmxUid): InternModel {
    InternEngine.guard(model, actorId, 'perform_beyond_competency');
    return model;
  }

  static approveReferralIndependently(model: InternModel, actorId: AmxUid): InternModel {
    InternEngine.guard(model, actorId, 'approve_referrals_independently');
    return model;
  }
}
