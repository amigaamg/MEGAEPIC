// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN MEDICAL STUDENT ENGINE (BOOK VI-H) — Engine No. 18
//
// "The Engine of Clinical Learning, Competency Development, and Future
// Workforce Formation"
//
// The Medical Student Engine exists to transform a student from someone who
// memorizes medicine into someone who reasons, examines, communicates, and
// thinks clinically. AMEXAN does not merely expose students to patients. It
// teaches them how clinicians think. Every patient becomes a lesson, a
// simulation, a reasoning exercise, an examination station, a research
// opportunity, and a lifelong memory.
//
// Position in the Constitutional Hierarchy:
//   Consultant → Resident → Medical Officer → Intern → Medical Student
//
// Students never function independently. They observe, assist, practice,
// reflect, and gradually become competent. Every level unlocks different
// capabilities, and the AI acts as a tutor — never a replacement clinician.
//
// Constitutional Restrictions (enforced, never commented away):
//   A Medical Student cannot diagnose independently, prescribe, order
//   investigations independently, perform invasive procedures unsupervised,
//   discharge patients, modify EMR records as final documents, approve care
//   plans, or access unauthorized patient records.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type { MedicalSpecialty } from '@/lib/amexan/constitution/types';

// ── Student categories (every level unlocks different capabilities) ───────────

export type StudentCategory =
  | 'preclinical' | 'junior_clinical' | 'senior_clinical'
  | 'elective_student' | 'international_exchange' | 'postgraduate';

export const STUDENT_CATEGORIES: readonly StudentCategory[] = [
  'preclinical', 'junior_clinical', 'senior_clinical',
  'elective_student', 'international_exchange', 'postgraduate',
];

export const STUDENT_CATEGORY_ORDER: Readonly<Record<StudentCategory, number>> = {
  preclinical: 0, junior_clinical: 1, senior_clinical: 2,
  elective_student: 3, international_exchange: 4, postgraduate: 5,
};

export const STUDENT_CATEGORY_LABELS: Readonly<Record<StudentCategory, string>> = {
  preclinical: 'Preclinical', junior_clinical: 'Junior Clinical', senior_clinical: 'Senior Clinical',
  elective_student: 'Elective Student', international_exchange: 'International Exchange Student', postgraduate: 'Postgraduate Student',
};

// ── Today's rotation (the learning dashboard) ─────────────────────────────────

export interface TodayRotation {
  department: string;
  ward: string;
  consultantId?: AmxUid;
  residentId?: AmxUid;
  medicalOfficerId?: AmxUid;
  internId?: AmxUid;
  assignedPatientIds: string[];
  todayObjectives: string[];
  date: number;
}

// ── Assigned patients (students never see all patients) ───────────────────────

export type StudentPatientGroup =
  | 'new_patient' | 'follow_up_patient' | 'interesting_case'
  | 'rare_disease' | 'teaching_case' | 'procedure_today';

export const STUDENT_PATIENT_GROUPS: readonly StudentPatientGroup[] = [
  'new_patient', 'follow_up_patient', 'interesting_case',
  'rare_disease', 'teaching_case', 'procedure_today',
];

export interface StudentPatient {
  patientId: string;
  name?: string;
  group: StudentPatientGroup;
  ward?: string;
  assignedAt: number;
}

// ── Constitutional learning wall (the patient becomes a living textbook) ──────

export type LearningWallSection =
  | 'chief_complaint' | 'history' | 'examination' | 'clinical_findings'
  | 'problem_list' | 'differential_diagnosis' | 'working_diagnosis'
  | 'investigations' | 'treatment' | 'complications'
  | 'learning_objectives' | 'exam_questions' | 'research_links';

export const LEARNING_WALL_SECTIONS: readonly LearningWallSection[] = [
  'chief_complaint', 'history', 'examination', 'clinical_findings',
  'problem_list', 'differential_diagnosis', 'working_diagnosis',
  'investigations', 'treatment', 'complications',
  'learning_objectives', 'exam_questions', 'research_links',
];

export interface LearningWall {
  id: string;
  patientId: string;
  sections: Partial<Record<LearningWallSection, string>>;
  examQuestions: string[];
  researchLinks: string[];
  generatedAt: number;
}

// ── Guided history engine (AMEXAN guides, then explains WHY) ─────────────────

export type HistoryDimension =
  | 'site' | 'onset' | 'character' | 'radiation' | 'associated_symptoms'
  | 'aggravating_factors' | 'relieving_factors' | 'severity' | 'system_review';

export const HISTORY_DIMENSIONS: readonly HistoryDimension[] = [
  'site', 'onset', 'character', 'radiation', 'associated_symptoms',
  'aggravating_factors', 'relieving_factors', 'severity', 'system_review',
];

export interface GuidedHistoryQuestion {
  dimension: HistoryDimension;
  question: string;
  reasonItMatters: string;
}

export interface GuidedHistoryTemplate {
  chiefComplaint: string;
  questions: GuidedHistoryQuestion[];
}

export const ABDOMINAL_PAIN_HISTORY: GuidedHistoryTemplate = {
  chiefComplaint: 'Abdominal Pain',
  questions: [
    { dimension: 'site', question: 'Where exactly is the pain?', reasonItMatters: 'Localizing pain helps separate visceral from somatic origin and directs the differential to the underlying organ.' },
    { dimension: 'onset', question: 'When did it start, and was it sudden or gradual?', reasonItMatters: 'Sudden severe onset raises peritonitis, perforation, or vascular catastrophe; gradual onset favors inflammation.' },
    { dimension: 'character', question: 'Is the pain colicky, burning, dull, or sharp?', reasonItMatters: 'Colicky pain suggests hollow-organ spasm; burning suggests peptic disease; tearing pain suggests dissection or aneurysm.' },
    { dimension: 'radiation', question: 'Does the pain travel anywhere?', reasonItMatters: 'Radiation to the shoulder tip implies diaphragmatic irritation; to the back implies pancreatitis or posterior ulcer.' },
    { dimension: 'associated_symptoms', question: 'Any vomiting, fever, change in bowel habit, urinary symptoms, or vaginal bleeding?', reasonItMatters: 'Associated symptoms triangulate the affected system and expose emergencies such as obstruction or ectopic pregnancy.' },
    { dimension: 'aggravating_factors', question: 'What makes the pain worse?', reasonItMatters: 'Movement-aggravated pain suggests peritoneal inflammation; eating-aggravated pain suggests peptic or biliary disease.' },
    { dimension: 'relieving_factors', question: 'What improves the pain?', reasonItMatters: 'Relieving positions and analgesics give clues to peritonitis (lying still) versus colic (moving).' },
    { dimension: 'severity', question: 'How severe is the pain on a scale of 0 to 10?', reasonItMatters: 'Severity guides urgency and analgesic need; a mismatch between severity and signs warns of acute syndromes.' },
    { dimension: 'system_review', question: 'Any jaundice, weight loss, or night sweats?', reasonItMatters: 'Systemic features unmask malignancy, sepsis, or chronic disease hiding behind the acute complaint.' },
  ],
};

export interface GuidedHistoryRecord {
  id: string;
  patientId: string;
  template: GuidedHistoryTemplate;
  answers: Partial<Record<HistoryDimension, string>>;
  completed: boolean;
  takenAt: number;
}

// ── Examination tutor (every examination teaches reasoning) ───────────────────

export type ExaminationPhase =
  | 'inspection' | 'palpation' | 'percussion' | 'auscultation'
  | 'special_tests' | 'important_negatives' | 'clinical_pearls' | 'common_mistakes';

export const EXAMINATION_PHASES: readonly ExaminationPhase[] = [
  'inspection', 'palpation', 'percussion', 'auscultation',
  'special_tests', 'important_negatives', 'clinical_pearls', 'common_mistakes',
];

export interface ExaminationTutorChecklist {
  system: string;
  steps: Partial<Record<ExaminationPhase, string[]>>;
}

export const CHEST_EXAMINATION_TUTOR: ExaminationTutorChecklist = {
  system: 'Chest',
  steps: {
    inspection: ['Cyanosis', 'Clubbing', 'Accessory muscle use', 'Chest wall deformities', 'Tracheal position'],
    palpation: ['Chest expansion', 'Tactile fremitus', 'Apex beat', 'Chest tenderness'],
    percussion: ['Percuss each zone', 'Compare sides', 'Note dullness vs resonance'],
    auscultation: ['Breath sounds', 'Added sounds (crackles, wheeze)', 'Bronchial breathing', 'Vocal resonance'],
    special_tests: ['Tracheal deviation check', 'Respiratory rate count', 'Percussion for effusion vs consolidation'],
    important_negatives: ['No cyanosis', 'No clubbing', 'No tracheal deviation', 'Equal expansion'],
    clinical_pearls: ['Pleural effusion → dull percussion, reduced breath sounds, stony dull', 'Consolidation → bronchial breathing and increased vocal resonance', 'Pneumothorax → hyper-resonant and reduced breath sounds'],
    common_mistakes: ['Forgetting to expose the chest fully', 'Not counting respiratory rate', 'Failing to percuss the posterior lung', 'Missing the apex beat'],
  },
};

export interface ExaminationTutorSession {
  id: string;
  patientId: string;
  system: string;
  findings: Partial<Record<ExaminationPhase, string>>;
  pearlsLearned: string[];
  mistakesAvoided: string[];
  takenAt: number;
}

// ── Anatomy integration (no separate textbook required) ───────────────────────

export type AnatomyDimension =
  | 'surface_anatomy' | 'blood_supply' | 'nerve_supply' | 'embryology'
  | 'lymphatics' | 'clinical_relevance' | 'operative_anatomy'
  | 'imaging_anatomy' | 'histology' | 'physiology';

export const ANATOMY_DIMENSIONS: readonly AnatomyDimension[] = [
  'surface_anatomy', 'blood_supply', 'nerve_supply', 'embryology',
  'lymphatics', 'clinical_relevance', 'operative_anatomy',
  'imaging_anatomy', 'histology', 'physiology',
];

export interface AnatomyIntegration {
  id: string;
  condition: string;
  content: Partial<Record<AnatomyDimension, string>>;
  patientId?: string;
  createdAt: number;
}

export const APPENDICITIS_ANATOMY: AnatomyIntegration = {
  id: 'ana-appendicitis',
  condition: 'Appendicitis',
  content: {
    surface_anatomy: 'McBurney point lies one-third of the way from the anterior superior iliac spine to the umbilicus — the classic point of maximal tenderness.',
    blood_supply: 'The appendix is supplied by the appendicular artery, a branch of the ileocolic artery, which runs in the mesoappendix; thrombosis causes gangrene in acute appendicitis.',
    nerve_supply: 'Visceral pain is carried by T10 sympathetic fibers — explaining the early periumbilical pain that later localizes to the right iliac fossa as the parietal peritoneum is involved.',
    embryology: 'The appendix is derived from the midgut, which rotates during development; this explains its variable retrocecal, pelvic, or subcecal positions.',
    lymphatics: 'Lymphatic drainage follows the ileocolic chain to the superior mesenteric lymph nodes; the appendix also functions as a gut-associated lymphoid organ.',
    clinical_relevance: 'Retrocecal appendicitis may present with loin pain and psoas irritation rather than classic RIF tenderness.',
    operative_anatomy: 'Appendicectomy requires identifying the cecal taeniae, which converge on the base of the appendix; the mesoappendix must be divided with its vessels controlled.',
    imaging_anatomy: 'On CT, a dilated appendix over 6 mm with wall thickening, stranding, and a fecalith strongly supports acute appendicitis; ultrasound shows a non-compressible blind-ending loop.',
    histology: 'The appendiceal wall shows mucosa with crypts, prominent submucosal lymphoid follicles (more in youth), and muscularis propria — lumen obstruction by fecalith or lymphoid hyperplasia triggers the acute inflammatory sequence.',
    physiology: 'The appendix is a blind-ended tube; obstruction raises intraluminal pressure, causes mucosal ischemia, and permits bacterial invasion — the pathophysiology students must be able to explain.',
  },
  createdAt: 0,
};

// ── Pathophysiology engine (everything connected) ─────────────────────────────

export type PathophysiologySection =
  | 'animated_physiology' | 'pressure_volume_loops' | 'neurohormonal_activation'
  | 'symptoms_explained' | 'signs_explained' | 'drug_mechanisms'
  | 'expected_complications';

export const PATHOPHYSIOLOGY_SECTIONS: readonly PathophysiologySection[] = [
  'animated_physiology', 'pressure_volume_loops', 'neurohormonal_activation',
  'symptoms_explained', 'signs_explained', 'drug_mechanisms',
  'expected_complications',
];

export interface PathophysiologyLesson {
  id: string;
  condition: string;
  content: Partial<Record<PathophysiologySection, string>>;
  patientId?: string;
  createdAt: number;
}

export const HEART_FAILURE_PATHOPHYSIOLOGY: PathophysiologyLesson = {
  id: 'pp-heart-failure',
  condition: 'Heart Failure',
  content: {
    animated_physiology: 'Reduced cardiac output activates compensatory mechanisms that initially support perfusion but eventually worsen the disease — the vicious cycle at the heart of heart failure.',
    pressure_volume_loops: 'The left ventricular PV loop shifts: reduced ejection fraction widens end-diastolic and end-systolic volumes, lowering stroke work and raising filling pressures.',
    neurohormonal_activation: 'RAAS and sympathetic activation cause vasoconstriction, salt and water retention, and adverse ventricular remodeling; blocking these systems is the basis of modern therapy.',
    symptoms_explained: 'Dyspnea arises from elevated pulmonary venous pressure and pulmonary congestion; fatigue reflects reduced cardiac output and skeletal muscle hypoperfusion.',
    signs_explained: 'Edema and elevated JVP follow venous congestion; S3 gallop reflects a failing, volume-loaded ventricle; displaced apex beat indicates cardiomegaly.',
    drug_mechanisms: 'ACE inhibitors reduce afterload and remodeling; beta-blockers reduce myocardial oxygen demand; diuretics relieve congestion; SGLT2 inhibitors improve outcomes independent of glycemia.',
    expected_complications: 'Pulmonary edema, arrhythmias, cardiorenal syndrome, and thromboembolism are the recognized complications students must anticipate.',
  },
  createdAt: 0,
};

// ── Clinical reasoning engine (exactly how consultants think) ─────────────────

export type ReasoningStage =
  | 'symptoms' | 'findings' | 'problems' | 'differentials'
  | 'evidence' | 'tests' | 'diagnosis' | 'management';

export const REASONING_STAGES: readonly ReasoningStage[] = [
  'symptoms', 'findings', 'problems', 'differentials',
  'evidence', 'tests', 'diagnosis', 'management',
];

export interface ClinicalReasoningSession {
  id: string;
  patientId: string;
  stages: Partial<Record<ReasoningStage, string[]>>;
  complete: boolean;
  tutorFeedback?: string;
  createdAt: number;
}

// ── Procedure learning engine (indications → performed?) ──────────────────────

export type ProcedureLearningPhase =
  | 'indications' | 'contraindications' | 'equipment' | 'videos'
  | 'step_by_step' | 'complications' | 'aftercare' | 'quiz';

export const PROCEDURE_LEARNING_PHASES: readonly ProcedureLearningPhase[] = [
  'indications', 'contraindications', 'equipment', 'videos',
  'step_by_step', 'complications', 'aftercare', 'quiz',
];

export type ProcedureParticipation = 'observed' | 'assisted' | 'performed';

export interface ProcedureLearningRecord {
  id: string;
  procedureName: string;
  patientId?: string;
  content: Partial<Record<ProcedureLearningPhase, string[]>>;
  quizScorePercent?: number;
  participation?: ProcedureParticipation;
  supervisorId?: AmxUid;
  date: number;
}

export const LUMBAR_PUNCTURE_GUIDE: Pick<ProcedureLearningRecord, 'procedureName' | 'content'> = {
  procedureName: 'Lumbar puncture',
  content: {
    indications: ['Meningitis suspicion', 'Subarachnoid hemorrhage workup when imaging is negative', 'Malignancy / CSF cytology', 'Measuring opening pressure', 'Intrathecal therapy'],
    contraindications: ['Raised intracranial pressure with focal signs or papilledema', 'Coagulopathy or thrombocytopenia', 'Local skin infection at puncture site', 'Suspected spinal block'],
    equipment: ['Sterile gloves and drape', 'Local anesthetic', 'Spinal needle', 'Manometer', 'CSF collection tubes', 'Plaster and dressing'],
    videos: ['Demonstration of patient positioning', 'Landmark identification (L3/L4)', 'Full procedure walkthrough'],
    step_by_step: ['Position patient in left lateral with knees to chest', 'Palpate the L3/L4 interspace', 'Scrub, drape, and infiltrate local anesthetic', 'Advance needle with bevel parallel to dural fibers', 'Stop on dural puncture and measure opening pressure', 'Collect CSF into numbered tubes', 'Withdraw needle and dress the site'],
    complications: ['Post-dural puncture headache', 'Bleeding or hematoma', 'Infection', 'Nerve root injury', 'Brain herniation when ICP is raised'],
    aftercare: ['Lying flat to reduce post-dural headache', 'Hydration', 'Monitoring for neurological symptoms', 'CSF result follow-up'],
    quiz: ['What position reduces the risk of post-dural puncture headache?', 'Which interspace is safest and why?', 'When must lumbar puncture be deferred?'],
  },
};

// ── Skills logbook (automatically generated, no paperwork) ────────────────────

export type SkillLogbookCategory =
  | 'histories_taken' | 'examinations' | 'presentations' | 'procedures_observed'
  | 'procedures_assisted' | 'procedures_performed' | 'clinics_attended'
  | 'ward_rounds' | 'seminars' | 'conferences' | 'research' | 'osce_preparation';

export const SKILL_LOGBOOK_CATEGORIES: readonly SkillLogbookCategory[] = [
  'histories_taken', 'examinations', 'presentations', 'procedures_observed',
  'procedures_assisted', 'procedures_performed', 'clinics_attended',
  'ward_rounds', 'seminars', 'conferences', 'research', 'osce_preparation',
];

export interface SkillLogbookEntry {
  id: string;
  category: SkillLogbookCategory;
  title: string;
  patientId?: string;
  supervisorId?: AmxUid;
  date: number;
}

// ── Case presentation builder (practice repeatedly) ───────────────────────────

export type PresentationPart =
  | 'identification' | 'chief_complaint' | 'history' | 'examination'
  | 'summary' | 'problem_list' | 'differentials' | 'plan';

export const PRESENTATION_PARTS: readonly PresentationPart[] = [
  'identification', 'chief_complaint', 'history', 'examination',
  'summary', 'problem_list', 'differentials', 'plan',
];

export interface CasePresentation {
  id: string;
  patientId: string;
  parts: Partial<Record<PresentationPart, string>>;
  complete: boolean;
  practiced: number;
  feedback?: string;
  createdAt: number;
}

// ── Teaching engine (attendance automatic) ────────────────────────────────────

export type TeachingProvider =
  | 'consultant_teaching' | 'resident_teaching' | 'intern_teaching' | 'peer_teaching'
  | 'simulation' | 'tutorial' | 'bedside_session' | 'journal_club' | 'grand_round';

export const TEACHING_PROVIDERS: readonly TeachingProvider[] = [
  'consultant_teaching', 'resident_teaching', 'intern_teaching', 'peer_teaching',
  'simulation', 'tutorial', 'bedside_session', 'journal_club', 'grand_round',
];

export interface TeachingRecord {
  id: string;
  provider: TeachingProvider;
  title: string;
  topic: string;
  attended: boolean;
  date: number;
}

// ── Personalized learning (the curriculum grows from experience) ──────────────

export interface PersonalizedLearningItem {
  id: string;
  topic: string;
  derivedFrom: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  suggestedTopics: string[];
  createdAt: number;
}

export const PNEUMONIA_CURRICULUM_ADVANCEMENT: Readonly<{ exposures: number; items: { topic: string; level: 'beginner' | 'intermediate' | 'advanced' }[] }> = {
  exposures: 10,
  items: [
    { topic: 'Complicated pneumonia', level: 'intermediate' },
    { topic: 'Pleural effusion', level: 'intermediate' },
    { topic: 'Empyema', level: 'advanced' },
    { topic: 'Lung abscess', level: 'advanced' },
    { topic: 'ARDS', level: 'advanced' },
    { topic: 'Mechanical ventilation', level: 'advanced' },
  ],
};

// ── Question engine (every patient generates examinations) ────────────────────

export type QuestionType =
  | 'mcq' | 'saq' | 'osce' | 'viva' | 'spot_diagnosis'
  | 'radiology_interpretation' | 'lab_interpretation' | 'clinical_reasoning';

export const QUESTION_TYPES: readonly QuestionType[] = [
  'mcq', 'saq', 'osce', 'viva', 'spot_diagnosis',
  'radiology_interpretation', 'lab_interpretation', 'clinical_reasoning',
];

export interface GeneratedQuestion {
  id: string;
  type: QuestionType;
  topic: string;
  prompt: string;
  modelAnswer: string;
  patientId?: string;
}

export interface QuestionAttempt {
  id: string;
  questionId: string;
  type: QuestionType;
  topic: string;
  chosenAnswer: string;
  correct: boolean;
  attemptedAt: number;
}

// ── OSCE engine (continuous practice) ─────────────────────────────────────────

export type OsceStation =
  | 'history_station' | 'examination_station' | 'counselling_station'
  | 'procedure_station' | 'interpretation_station' | 'communication_station'
  | 'ethics_station' | 'reflection';

export const OSCE_STATIONS: readonly OsceStation[] = [
  'history_station', 'examination_station', 'counselling_station',
  'procedure_station', 'interpretation_station', 'communication_station',
  'ethics_station', 'reflection',
];

export interface OsceAttempt {
  id: string;
  scenario: string;
  stations: Partial<Record<OsceStation, string>>;
  marks: Partial<Record<OsceStation, number>>;
  overallPercent: number;
  feedback?: string;
  attemptedAt: number;
}

// ── Clinical simulation (virtual patient, unlimited practice) ─────────────────

export interface VirtualPatient {
  id: string;
  name?: string;
  age?: number;
  chiefComplaint: string;
  history?: string;
  examination?: string;
  investigations?: string[];
  management?: string[];
  complications?: string[];
  feedback?: string;
  createdAt: number;
}

export interface SimulationAttempt {
  id: string;
  scenario: string;
  virtualPatient: VirtualPatient;
  historyCompleted: boolean;
  examinationCompleted: boolean;
  investigationsChosen: string[];
  managementChosen: string[];
  complicationsIdentified: string[];
  scorePercent: number;
  feedback: string;
  attemptedAt: number;
}

// ── Research engine (students grow into researchers) ──────────────────────────

export type StudentResearchStage =
  | 'join_study' | 'collect_data' | 'write_report' | 'literature_review'
  | 'statistics' | 'case_report' | 'conference_abstract' | 'publication';

export const STUDENT_RESEARCH_STAGES: readonly StudentResearchStage[] = [
  'join_study', 'collect_data', 'write_report', 'literature_review',
  'statistics', 'case_report', 'conference_abstract', 'publication',
];

export interface StudentResearch {
  id: string;
  title: string;
  stage: StudentResearchStage;
  status: 'active' | 'completed';
  supervisorId?: AmxUid;
  joinedAt: number;
}

// ── Competency engine (graphically displayed) ─────────────────────────────────

export type StudentCompetencyDomain =
  | 'communication' | 'history' | 'examination' | 'reasoning'
  | 'documentation' | 'procedures' | 'professionalism'
  | 'leadership' | 'research' | 'teaching';

export const STUDENT_COMPETENCY_DOMAINS: readonly StudentCompetencyDomain[] = [
  'communication', 'history', 'examination', 'reasoning',
  'documentation', 'procedures', 'professionalism',
  'leadership', 'research', 'teaching',
];

export type StudentCompetencyLevel = 'beginner' | 'developing' | 'competent' | 'proficient';

export const STUDENT_COMPETENCY_LEVEL_ORDER: Readonly<Record<StudentCompetencyLevel, number>> = {
  beginner: 0, developing: 1, competent: 2, proficient: 3,
};

export interface StudentCompetency {
  domain: StudentCompetencyDomain;
  level: StudentCompetencyLevel;
  supervisorApproved?: boolean;
  history: { at: number; level: StudentCompetencyLevel }[];
}

// ── Reflection engine (portfolio grows automatically) ─────────────────────────

export interface StudentReflection {
  id: string;
  patientId?: string;
  whatDidILearn: string;
  whatConfusedMe: string;
  whatWillIReadTonight: string;
  supervisorComments?: string;
  aiRecommendations: string[];
  createdAt: number;
}

// ── Portfolio engine (ready for graduation) ───────────────────────────────────

export type PortfolioSection =
  | 'clinical_exposure' | 'competencies' | 'teaching' | 'research'
  | 'leadership' | 'professionalism' | 'reflections'
  | 'certificates' | 'awards' | 'feedback';

export const PORTFOLIO_SECTIONS: readonly PortfolioSection[] = [
  'clinical_exposure', 'competencies', 'teaching', 'research',
  'leadership', 'professionalism', 'reflections',
  'certificates', 'awards', 'feedback',
];

export interface PortfolioEntry {
  id: string;
  section: PortfolioSection;
  title: string;
  description: string;
  awardedAt: number;
}

// ── AI tutor (students receive maximum teaching) ──────────────────────────────

export interface AiTutorLesson {
  id: string;
  topic: string;
  disease: string;
  investigations: string[];
  drugs: string[];
  examinationFindings: string[];
  differentials: string[];
  guidelines: string[];
  anatomy: string;
  physiology: string;
  pathology: string;
  pharmacology: string;
  surgery: string;
  evidenceSources: string[];
  generatedAt: number;
}

// ── Communication (never direct unsecured patient contact) ────────────────────

export type StudentCorrespondent =
  | 'consultant' | 'resident' | 'medical_officer' | 'intern'
  | 'peer' | 'tutor' | 'researcher';

export const STUDENT_CORRESPONDENTS: readonly StudentCorrespondent[] = [
  'consultant', 'resident', 'medical_officer', 'intern',
  'peer', 'tutor', 'researcher',
];

export interface StudentCommunication {
  id: string;
  correspondent: StudentCorrespondent;
  title: string;
  body: string;
  patientId?: string;
  publishedBy: AmxUid;
  publishedAt: number;
}

// ── HMIS responsibilities (students interact minimally) ───────────────────────

export interface StudentHmisAccess {
  viewTeachingSchedules: boolean;
  viewRotations: boolean;
  viewPatientAssignments: boolean;
  viewAttendance: boolean;
  viewSimulationBooking: boolean;
  viewSkillsLab: boolean;
  viewResearchAllocation: boolean;
}

// ── EMR responsibilities (educational artifacts until approved) ───────────────

export type StudentEmrKind =
  | 'draft_history' | 'draft_examination' | 'learning_note'
  | 'case_summary' | 'reflection_note';

export interface StudentEmrDraft {
  id: string;
  kind: StudentEmrKind;
  patientId: string;
  content: string;
  reviewed: boolean;
  reviewerId?: AmxUid;
  approved: boolean;
  createdAt: number;
}

// ── International learning ────────────────────────────────────────────────────

export type InternationalActivityType =
  | 'international_elective' | 'virtual_ward_round' | 'global_lecture'
  | 'international_simulation' | 'shared_grand_round' | 'collaborative_research'
  | 'exchange_program';

export const INTERNATIONAL_ACTIVITY_TYPES: readonly InternationalActivityType[] = [
  'international_elective', 'virtual_ward_round', 'global_lecture',
  'international_simulation', 'shared_grand_round', 'collaborative_research',
  'exchange_program',
];

export interface InternationalLearning {
  id: string;
  type: InternationalActivityType;
  title: string;
  institution?: string;
  country?: string;
  date: number;
}

// ── Student wellness engine ───────────────────────────────────────────────────

export interface StudentWellness {
  id: string;
  rotationLoad: number;
  attendancePercent: number;
  assessmentStress: number;
  fatigue: number;
  learningBalance: number;
  burnoutIndicator: boolean;
  mentorshipAccess: boolean;
  counsellingReferral: boolean;
  recordedAt: number;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface StudentAnalytics {
  patientsSeen: number;
  historiesTaken: number;
  examinationsPerformed: number;
  presentationsGiven: number;
  proceduresObserved: number;
  proceduresAssisted: number;
  proceduresPerformed: number;
  clinicsAttended: number;
  wardRoundsAttended: number;
  teachingAttended: number;
  researchActivities: number;
  questionsAnswered: number;
  averageQuizScore: number;
  osceAveragePercent: number;
  competencyProgressPercent: number;
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface MedicalStudentModel {
  organizationId: string;
  facilityId?: string;
  departmentId: string;
  specialty: MedicalSpecialty;
  studentId: AmxUid;
  category: StudentCategory;
  consultantId?: AmxUid;
  residentId?: AmxUid;
  medicalOfficerId?: AmxUid;
  internId?: AmxUid;
  todayRotation?: TodayRotation;
  patients: StudentPatient[];
  learningWalls: LearningWall[];
  guidedHistories: GuidedHistoryRecord[];
  examinationTutors: ExaminationTutorSession[];
  anatomyLessons: AnatomyIntegration[];
  pathophysiologyLessons: PathophysiologyLesson[];
  reasoningSessions: ClinicalReasoningSession[];
  procedureLearning: ProcedureLearningRecord[];
  logbook: SkillLogbookEntry[];
  presentations: CasePresentation[];
  teaching: TeachingRecord[];
  personalizedLearning: PersonalizedLearningItem[];
  questions: GeneratedQuestion[];
  questionAttempts: QuestionAttempt[];
  osceAttempts: OsceAttempt[];
  simulations: SimulationAttempt[];
  research: StudentResearch[];
  competencies: StudentCompetency[];
  reflections: StudentReflection[];
  portfolio: PortfolioEntry[];
  tutorLessons: AiTutorLesson[];
  communications: StudentCommunication[];
  hmis: StudentHmisAccess;
  emrDrafts: StudentEmrDraft[];
  international: InternationalLearning[];
  wellness: StudentWellness[];
  analytics: StudentAnalytics;
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateMedicalStudentModelInput {
  organizationId: string;
  facilityId?: string;
  departmentId: string;
  specialty: MedicalSpecialty;
  studentId: AmxUid;
  category: StudentCategory;
  consultantId?: AmxUid;
  residentId?: AmxUid;
  medicalOfficerId?: AmxUid;
  internId?: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Constitutional authority / restriction tables ──────────────────────────────

export const MEDICAL_STUDENT_AUTHORITY: readonly string[] = [
  'observe_patients', 'take_histories', 'examine_under_supervision', 'present_cases',
  'assist_procedures', 'document_draft_notes', 'participate_in_teaching',
  'participate_in_research', 'practice_simulations', 'receive_ai_tutoring',
];

export const MEDICAL_STUDENT_RESTRICTIONS: readonly string[] = [
  'diagnose_independently', 'prescribe', 'order_investigations_independently',
  'perform_invasive_procedures_unsupervised', 'discharge_patients',
  'modify_emr_as_final', 'approve_care_plans', 'access_unauthorized_patient_records',
];

// ── The Engine ─────────────────────────────────────────────────────────────────

export class MedicalStudentEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateMedicalStudentModelInput): MedicalStudentModel {
    if (!input.organizationId) throw new Error('[MSE] organizationId is required');
    if (!input.studentId) throw new Error('[MSE] studentId is required');
    if (!input.departmentId) throw new Error('[MSE] departmentId is required');
    if (!STUDENT_CATEGORIES.includes(input.category)) throw new Error('[MSE] Invalid student category');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      departmentId: input.departmentId,
      specialty: input.specialty,
      studentId: input.studentId,
      category: input.category,
      consultantId: input.consultantId,
      residentId: input.residentId,
      medicalOfficerId: input.medicalOfficerId,
      internId: input.internId,
      patients: [],
      learningWalls: [],
      guidedHistories: [],
      examinationTutors: [],
      anatomyLessons: [],
      pathophysiologyLessons: [],
      reasoningSessions: [],
      procedureLearning: [],
      logbook: [],
      presentations: [],
      teaching: [],
      personalizedLearning: [],
      questions: [],
      questionAttempts: [],
      osceAttempts: [],
      simulations: [],
      research: [],
      competencies: STUDENT_COMPETENCY_DOMAINS.map(domain => ({ domain, level: 'beginner' as const, history: [] })),
      reflections: [],
      portfolio: [],
      tutorLessons: [],
      communications: [],
      hmis: {
        viewTeachingSchedules: true, viewRotations: true, viewPatientAssignments: true,
        viewAttendance: true, viewSimulationBooking: true, viewSkillsLab: true,
        viewResearchAllocation: true,
      },
      emrDrafts: [],
      international: [],
      wellness: [],
      analytics: {
        patientsSeen: 0, historiesTaken: 0, examinationsPerformed: 0, presentationsGiven: 0,
        proceduresObserved: 0, proceduresAssisted: 0, proceduresPerformed: 0,
        clinicsAttended: 0, wardRoundsAttended: 0, teachingAttended: 0,
        researchActivities: 0, questionsAnswered: 0, averageQuizScore: 0,
        osceAveragePercent: 0, competencyProgressPercent: 0,
      },
      auditLog: [{ at: now, actorId: input.studentId, action: 'medical_student_registered' }],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard ─────────────────────────────────────────────────────

  static assertStudent(model: MedicalStudentModel, actorId: AmxUid): void {
    if (actorId !== model.studentId) throw new Error('[MSE] Only the Medical Student may perform this action');
  }

  static canStudentPerform(action: string): { allowed: boolean; reason?: string } {
    if (MEDICAL_STUDENT_AUTHORITY.includes(action)) return { allowed: true };
    if (MEDICAL_STUDENT_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        diagnose_independently: 'Students may not diagnose independently — diagnosis requires a supervising clinician.',
        prescribe: 'Students may not prescribe — prescribing is outside student authority.',
        order_investigations_independently: 'Investigations must be ordered by a supervising clinician.',
        perform_invasive_procedures_unsupervised: 'Invasive procedures require supervision and verified competency.',
        discharge_patients: 'Discharge decisions belong to supervising clinicians.',
        modify_emr_as_final: 'Student notes remain educational drafts until reviewed and approved.',
        approve_care_plans: 'Care plan approval is a clinician responsibility.',
        access_unauthorized_patient_records: 'Students may only access assigned patients through constitutional channels.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Medical Student authority.` };
  }

  static guard(model: MedicalStudentModel, actorId: AmxUid, action: string): void {
    MedicalStudentEngine.assertStudent(model, actorId);
    const verdict = MedicalStudentEngine.canStudentPerform(action);
    if (!verdict.allowed) throw new Error(`[MSE] ${verdict.reason}`);
  }

  static audit(model: MedicalStudentModel, actorId: AmxUid, action: string, detail?: string): MedicalStudentModel {
    const now = Date.now();
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId, action, detail }], updatedAt: now };
  }

  // ── Student category (capabilities unlock with level) ───────────────────────

  static setCategory(model: MedicalStudentModel, actorId: AmxUid, category: StudentCategory): MedicalStudentModel {
    MedicalStudentEngine.assertStudent(model, actorId);
    if (!STUDENT_CATEGORIES.includes(category)) throw new Error('[MSE] Invalid student category');
    return { ...MedicalStudentEngine.audit(model, actorId, 'category_updated', category), category, updatedAt: Date.now() };
  }

  static getCapabilities(model: MedicalStudentModel): string[] {
    const level = STUDENT_CATEGORY_ORDER[model.category];
    const capabilities: string[] = ['observe_patients'];
    if (level >= 1) capabilities.push('take_histories', 'participate_in_teaching');
    if (level >= 2) capabilities.push('examine_under_supervision', 'present_cases', 'assist_procedures', 'document_draft_notes');
    if (level >= 3) capabilities.push('participate_in_research', 'practice_simulations');
    if (level >= 4) capabilities.push('receive_ai_tutoring', 'join_international_learning');
    if (level >= 5) capabilities.push('postgraduate_research_leadership');
    return capabilities;
  }

  // ── Today's rotation ─────────────────────────────────────────────────────────

  static setTodayRotation(model: MedicalStudentModel, actorId: AmxUid, rotation: TodayRotation): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'observe_patients');
    return { ...MedicalStudentEngine.audit(model, actorId, 'today_rotation_set', rotation.ward), todayRotation: rotation, updatedAt: Date.now() };
  }

  // ── Assigned patients (never all patients) ──────────────────────────────────

  static assignPatient(model: MedicalStudentModel, actorId: AmxUid, patient: StudentPatient): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'observe_patients');
    if (model.patients.some(p => p.patientId === patient.patientId)) throw new Error('[MSE] Patient already assigned');
    return {
      ...MedicalStudentEngine.audit(model, actorId, 'patient_assigned', patient.patientId),
      patients: [...model.patients, patient],
      analytics: { ...model.analytics, patientsSeen: model.analytics.patientsSeen + 1 },
      updatedAt: Date.now(),
    };
  }

  static getAssignedPatients(model: MedicalStudentModel, group?: StudentPatientGroup): StudentPatient[] {
    return model.patients.filter(p => !group || p.group === group);
  }

  static getPatientsByGroup(model: MedicalStudentModel): Record<StudentPatientGroup, StudentPatient[]> {
    const grouped: Record<StudentPatientGroup, StudentPatient[]> = {
      new_patient: [], follow_up_patient: [], interesting_case: [],
      rare_disease: [], teaching_case: [], procedure_today: [],
    };
    for (const p of model.patients) grouped[p.group].push(p);
    return grouped;
  }

  // ── Constitutional learning wall (patient = living textbook) ────────────────

  static buildLearningWall(model: MedicalStudentModel, actorId: AmxUid, input: Omit<LearningWall, 'id' | 'generatedAt'>): { model: MedicalStudentModel; wall: LearningWall } {
    MedicalStudentEngine.guard(model, actorId, 'observe_patients');
    const wall: LearningWall = { ...input, id: nextId('wall'), generatedAt: Date.now() };
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'learning_wall_built', input.patientId), learningWalls: [...model.learningWalls, wall], updatedAt: Date.now() }, wall };
  }

  static getLearningWall(model: MedicalStudentModel, patientId: string): LearningWall | undefined {
    return model.learningWalls.find(w => w.patientId === patientId);
  }

  static getLearningWallCompleteness(wall: LearningWall): { filled: number; total: number; percent: number; missing: LearningWallSection[] } {
    const missing = LEARNING_WALL_SECTIONS.filter(s => !wall.sections[s]);
    const filled = LEARNING_WALL_SECTIONS.length - missing.length;
    const percent = Math.round((filled / LEARNING_WALL_SECTIONS.length) * 100);
    return { filled, total: LEARNING_WALL_SECTIONS.length, percent, missing };
  }

  // ── Guided history engine ────────────────────────────────────────────────────

  static getHistoryTemplate(chiefComplaint: string): GuidedHistoryTemplate {
    if (chiefComplaint.toLowerCase().includes('abdominal pain') || chiefComplaint.toLowerCase().includes('abdomen')) {
      return ABDOMINAL_PAIN_HISTORY;
    }
    return {
      chiefComplaint,
      questions: HISTORY_DIMENSIONS.map(dimension => ({
        dimension,
        question: `Tell me about the ${dimension.replace(/_/g, ' ')} of the ${chiefComplaint.toLowerCase()}.`,
        reasonItMatters: 'Each guided dimension anchors the clinical picture and drives the differential — no component is gathered without understanding why it matters.',
      })),
    };
  }

  static recordGuidedHistory(model: MedicalStudentModel, actorId: AmxUid, input: Omit<GuidedHistoryRecord, 'id' | 'completed' | 'takenAt'>): { model: MedicalStudentModel; record: GuidedHistoryRecord } {
    MedicalStudentEngine.guard(model, actorId, 'take_histories');
    const completed = HISTORY_DIMENSIONS.every(d => Boolean(input.answers[d]));
    const record: GuidedHistoryRecord = { ...input, id: nextId('gh'), completed, takenAt: Date.now() };
    return {
      model: {
        ...MedicalStudentEngine.audit(model, actorId, 'guided_history_recorded', input.patientId),
        guidedHistories: [...model.guidedHistories, record],
        logbook: [...model.logbook, { id: nextId('lb'), category: 'histories_taken', title: `History: ${input.template.chiefComplaint}`, patientId: input.patientId, date: Date.now() }],
        analytics: { ...model.analytics, historiesTaken: model.analytics.historiesTaken + 1 },
        updatedAt: Date.now(),
      },
      record,
    };
  }

  static getHistoryCompleteness(model: MedicalStudentModel): { completed: number; total: number; percent: number } {
    const total = model.guidedHistories.length;
    const completed = model.guidedHistories.filter(h => h.completed).length;
    return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 };
  }

  // ── Examination tutor ────────────────────────────────────────────────────────

  static getExaminationChecklist(system: string): ExaminationTutorChecklist {
    if (system.toLowerCase() === 'chest' || system.toLowerCase() === 'lungs') return CHEST_EXAMINATION_TUTOR;
    return {
      system,
      steps: {
        inspection: [`Inspect the ${system.toLowerCase()} systematically`],
        palpation: [`Palpate the ${system.toLowerCase()} for tenderness and masses`],
        percussion: ['Percuss relevant regions comparing sides'],
        auscultation: ['Auscultate and note added sounds'],
        special_tests: ['Apply system-specific special tests'],
        important_negatives: ['Record and respect important negatives'],
        clinical_pearls: ['Correlate findings with underlying pathology'],
        common_mistakes: ['Identify and avoid the common examination pitfalls'],
      },
    };
  }

  static recordExaminationTutor(model: MedicalStudentModel, actorId: AmxUid, input: Omit<ExaminationTutorSession, 'id' | 'takenAt'>): { model: MedicalStudentModel; session: ExaminationTutorSession } {
    MedicalStudentEngine.guard(model, actorId, 'examine_under_supervision');
    const session: ExaminationTutorSession = { ...input, id: nextId('exam'), takenAt: Date.now() };
    return {
      model: {
        ...MedicalStudentEngine.audit(model, actorId, 'examination_tutor_recorded', input.system),
        examinationTutors: [...model.examinationTutors, session],
        logbook: [...model.logbook, { id: nextId('lb'), category: 'examinations', title: `Examination: ${input.system}`, patientId: input.patientId, date: Date.now() }],
        analytics: { ...model.analytics, examinationsPerformed: model.analytics.examinationsPerformed + 1 },
        updatedAt: Date.now(),
      },
      session,
    };
  }

  // ── Anatomy integration ──────────────────────────────────────────────────────

  static getAnatomyIntegration(condition: string): AnatomyIntegration {
    if (condition.toLowerCase().includes('appendicitis') || condition.toLowerCase().includes('appendix')) return APPENDICITIS_ANATOMY;
    return {
      id: nextId('ana'),
      condition,
      content: {
        surface_anatomy: `Surface anatomy of ${condition} — map the relevant landmarks and structures.`,
        blood_supply: `Blood supply relevant to ${condition} and its clinical consequences.`,
        nerve_supply: `Nerve supply of ${condition} — including referred pain patterns.`,
        embryology: `Embryological origin relevant to ${condition}.`,
        lymphatics: `Lymphatic drainage relevant to ${condition}.`,
        clinical_relevance: `How the anatomy explains the clinical presentation of ${condition}.`,
        operative_anatomy: `Operative anatomy a surgeon relies on for ${condition}.`,
        imaging_anatomy: `Imaging anatomy of ${condition} on relevant modalities.`,
        histology: `Histology underlying ${condition}.`,
        physiology: `Physiology that explains the presentation of ${condition}.`,
      },
      createdAt: Date.now(),
    };
  }

  static addAnatomyLesson(model: MedicalStudentModel, actorId: AmxUid, lesson: AnatomyIntegration): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'receive_ai_tutoring');
    return { ...MedicalStudentEngine.audit(model, actorId, 'anatomy_lesson_added', lesson.condition), anatomyLessons: [...model.anatomyLessons, lesson], updatedAt: Date.now() };
  }

  // ── Pathophysiology engine ───────────────────────────────────────────────────

  static getPathophysiologyLesson(condition: string): PathophysiologyLesson {
    if (condition.toLowerCase().includes('heart failure') || condition.toLowerCase().includes('cardiac')) return HEART_FAILURE_PATHOPHYSIOLOGY;
    return {
      id: nextId('pp'),
      condition,
      content: {
        animated_physiology: `Animated physiology of ${condition} — how normal function is disrupted.`,
        pressure_volume_loops: `Pressure-volume changes observed in ${condition}.`,
        neurohormonal_activation: `Neurohormonal responses in ${condition} and their consequences.`,
        symptoms_explained: `Why each symptom of ${condition} occurs.`,
        signs_explained: `Why each sign of ${condition} occurs.`,
        drug_mechanisms: `Mechanisms of the drugs used in ${condition}.`,
        expected_complications: `Expected complications of ${condition}.`,
      },
      createdAt: Date.now(),
    };
  }

  static addPathophysiologyLesson(model: MedicalStudentModel, actorId: AmxUid, lesson: PathophysiologyLesson): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'receive_ai_tutoring');
    return { ...MedicalStudentEngine.audit(model, actorId, 'pathophysiology_lesson_added', lesson.condition), pathophysiologyLessons: [...model.pathophysiologyLessons, lesson], updatedAt: Date.now() };
  }

  // ── Clinical reasoning engine ────────────────────────────────────────────────

  static startReasoningSession(model: MedicalStudentModel, actorId: AmxUid, patientId: string): { model: MedicalStudentModel; session: ClinicalReasoningSession } {
    MedicalStudentEngine.guard(model, actorId, 'present_cases');
    const session: ClinicalReasoningSession = { id: nextId('rsn'), patientId, stages: {}, complete: false, createdAt: Date.now() };
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'reasoning_session_started', patientId), reasoningSessions: [...model.reasoningSessions, session], updatedAt: Date.now() }, session };
  }

  static recordReasoningStage(model: MedicalStudentModel, actorId: AmxUid, sessionId: string, stage: ReasoningStage, content: string[]): { model: MedicalStudentModel; session: ClinicalReasoningSession } {
    MedicalStudentEngine.guard(model, actorId, 'present_cases');
    const index = model.reasoningSessions.findIndex(s => s.id === sessionId);
    if (index === -1) throw new Error('[MSE] Reasoning session not found');
    const sessions = [...model.reasoningSessions];
    sessions[index] = { ...sessions[index], stages: { ...sessions[index].stages, [stage]: content }, complete: REASONING_STAGES.every(s => Boolean(sessions[index].stages[s] || stage === s && content.length)) };
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'reasoning_stage_recorded', stage), reasoningSessions: sessions, updatedAt: Date.now() }, session: sessions[index] };
  }

  static giveReasoningFeedback(model: MedicalStudentModel, supervisorId: AmxUid, sessionId: string, feedback: string): MedicalStudentModel {
    const index = model.reasoningSessions.findIndex(s => s.id === sessionId);
    if (index === -1) throw new Error('[MSE] Reasoning session not found');
    const sessions = [...model.reasoningSessions];
    sessions[index] = { ...sessions[index], tutorFeedback: feedback };
    return { ...MedicalStudentEngine.audit(model, model.studentId, 'reasoning_feedback_given', sessionId), reasoningSessions: sessions, updatedAt: Date.now() };
  }

  // ── Procedure learning engine ────────────────────────────────────────────────

  static getProcedureGuide(procedureName: string): Pick<ProcedureLearningRecord, 'procedureName' | 'content'> {
    if (procedureName.toLowerCase().includes('lumbar puncture') || procedureName.toLowerCase().includes('lp')) return LUMBAR_PUNCTURE_GUIDE;
    return {
      procedureName,
      content: {
        indications: [`Indications for ${procedureName}`],
        contraindications: [`Contraindications for ${procedureName}`],
        equipment: [`Equipment required for ${procedureName}`],
        videos: [`Video demonstration of ${procedureName}`],
        step_by_step: [`Step-by-step guide for ${procedureName}`],
        complications: [`Complications of ${procedureName}`],
        aftercare: [`Aftercare following ${procedureName}`],
        quiz: [`Quiz questions on ${procedureName}`],
      },
    };
  }

  static startProcedureLearning(model: MedicalStudentModel, actorId: AmxUid, input: Omit<ProcedureLearningRecord, 'id' | 'date'>): { model: MedicalStudentModel; record: ProcedureLearningRecord } {
    MedicalStudentEngine.guard(model, actorId, 'assist_procedures');
    const record: ProcedureLearningRecord = { ...input, id: nextId('prc'), date: Date.now() };
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'procedure_learning_started', input.procedureName), procedureLearning: [...model.procedureLearning, record], updatedAt: Date.now() }, record };
  }

  static recordProcedureParticipation(model: MedicalStudentModel, actorId: AmxUid, recordId: string, participation: ProcedureParticipation, supervisorId: AmxUid, quizScorePercent?: number): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'assist_procedures');
    const index = model.procedureLearning.findIndex(r => r.id === recordId);
    if (index === -1) throw new Error('[MSE] Procedure learning record not found');
    const records = [...model.procedureLearning];
    records[index] = { ...records[index], participation, supervisorId, quizScorePercent };
    const logbook = [...model.logbook];
    const title = records[index].procedureName;
    if (participation === 'observed') { logbook.push({ id: nextId('lb'), category: 'procedures_observed', title: `Observed: ${title}`, patientId: records[index].patientId, supervisorId, date: Date.now() }); }
    if (participation === 'assisted') { logbook.push({ id: nextId('lb'), category: 'procedures_assisted', title: `Assisted: ${title}`, patientId: records[index].patientId, supervisorId, date: Date.now() }); }
    if (participation === 'performed') { logbook.push({ id: nextId('lb'), category: 'procedures_performed', title: `Performed: ${title}`, patientId: records[index].patientId, supervisorId, date: Date.now() }); }
    return {
      ...MedicalStudentEngine.audit(model, actorId, 'procedure_participation_recorded', `${title}: ${participation}`),
      procedureLearning: records,
      logbook,
      analytics: {
        ...model.analytics,
        proceduresObserved: model.analytics.proceduresObserved + (participation === 'observed' ? 1 : 0),
        proceduresAssisted: model.analytics.proceduresAssisted + (participation === 'assisted' ? 1 : 0),
        proceduresPerformed: model.analytics.proceduresPerformed + (participation === 'performed' ? 1 : 0),
      },
      updatedAt: Date.now(),
    };
  }

  // ── Skills logbook ───────────────────────────────────────────────────────────

  static addLogbookEntry(model: MedicalStudentModel, actorId: AmxUid, input: Omit<SkillLogbookEntry, 'id' | 'date'>): { model: MedicalStudentModel; entry: SkillLogbookEntry } {
    MedicalStudentEngine.guard(model, actorId, 'observe_patients');
    const entry: SkillLogbookEntry = { ...input, id: nextId('lb'), date: Date.now() };
    const analytics = { ...model.analytics };
    if (input.category === 'clinics_attended') analytics.clinicsAttended += 1;
    if (input.category === 'ward_rounds') analytics.wardRoundsAttended += 1;
    if (input.category === 'research') analytics.researchActivities += 1;
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'logbook_entry_added', input.category), logbook: [...model.logbook, entry], analytics, updatedAt: Date.now() }, entry };
  }

  static getLogbookByCategory(model: MedicalStudentModel): Record<SkillLogbookCategory, SkillLogbookEntry[]> {
    const grouped: Record<SkillLogbookCategory, SkillLogbookEntry[]> = {
      histories_taken: [], examinations: [], presentations: [], procedures_observed: [],
      procedures_assisted: [], procedures_performed: [], clinics_attended: [],
      ward_rounds: [], seminars: [], conferences: [], research: [], osce_preparation: [],
    };
    for (const e of model.logbook) grouped[e.category].push(e);
    return grouped;
  }

  static getLogbookSummary(model: MedicalStudentModel): { category: SkillLogbookCategory; count: number }[] {
    return SKILL_LOGBOOK_CATEGORIES.map(category => ({ category, count: model.logbook.filter(e => e.category === category).length }));
  }

  // ── Case presentation builder ────────────────────────────────────────────────

  static buildPresentation(model: MedicalStudentModel, actorId: AmxUid, patientId: string): { model: MedicalStudentModel; presentation: CasePresentation } {
    MedicalStudentEngine.guard(model, actorId, 'present_cases');
    const presentation: CasePresentation = { id: nextId('prs'), patientId, parts: {}, complete: false, practiced: 0, createdAt: Date.now() };
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'presentation_built', patientId), presentations: [...model.presentations, presentation], updatedAt: Date.now() }, presentation };
  }

  static fillPresentationPart(model: MedicalStudentModel, actorId: AmxUid, presentationId: string, part: PresentationPart, content: string): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'present_cases');
    const index = model.presentations.findIndex(p => p.id === presentationId);
    if (index === -1) throw new Error('[MSE] Presentation not found');
    const presentations = [...model.presentations];
    presentations[index] = { ...presentations[index], parts: { ...presentations[index].parts, [part]: content }, complete: PRESENTATION_PARTS.every(p => Boolean(presentations[index].parts[p] || p === part && content)) };
    return { ...MedicalStudentEngine.audit(model, actorId, 'presentation_part_filled', part), presentations, updatedAt: Date.now() };
  }

  static practicePresentation(model: MedicalStudentModel, actorId: AmxUid, presentationId: string): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'present_cases');
    const index = model.presentations.findIndex(p => p.id === presentationId);
    if (index === -1) throw new Error('[MSE] Presentation not found');
    const presentations = [...model.presentations];
    presentations[index] = { ...presentations[index], practiced: presentations[index].practiced + 1 };
    return {
      ...MedicalStudentEngine.audit(model, actorId, 'presentation_practiced', presentationId),
      presentations,
      logbook: [...model.logbook, { id: nextId('lb'), category: 'presentations', title: 'Presentation practice', patientId: presentations[index].patientId, date: Date.now() }],
      analytics: { ...model.analytics, presentationsGiven: model.analytics.presentationsGiven + 1 },
      updatedAt: Date.now(),
    };
  }

  // ── Teaching engine (attendance automatic) ──────────────────────────────────

  static recordTeaching(model: MedicalStudentModel, actorId: AmxUid, input: Omit<TeachingRecord, 'id' | 'attended' | 'date'>): { model: MedicalStudentModel; teaching: TeachingRecord } {
    MedicalStudentEngine.guard(model, actorId, 'participate_in_teaching');
    const teaching: TeachingRecord = { ...input, id: nextId('tch'), attended: true, date: Date.now() };
    return {
      model: {
        ...MedicalStudentEngine.audit(model, actorId, 'teaching_attended', input.provider),
        teaching: [...model.teaching, teaching],
        analytics: { ...model.analytics, teachingAttended: model.analytics.teachingAttended + 1 },
        updatedAt: Date.now(),
      },
      teaching,
    };
  }

  static getTeachingSummary(model: MedicalStudentModel): { provider: TeachingProvider; count: number }[] {
    return TEACHING_PROVIDERS.map(provider => ({ provider, count: model.teaching.filter(t => t.provider === provider && t.attended).length }));
  }

  // ── Personalized learning (curriculum grows from experience) ────────────────

  static recommendPersonalizedLearning(model: MedicalStudentModel, actorId: AmxUid, topic: string, patientIds: string[]): { model: MedicalStudentModel; items: PersonalizedLearningItem[] } {
    MedicalStudentEngine.guard(model, actorId, 'receive_ai_tutoring');
    const exposures = model.personalizedLearning.filter(i => i.topic === topic).length;
    const items: PersonalizedLearningItem[] = [];
    if (topic.toLowerCase().includes('pneumonia') && exposures >= PNEUMONIA_CURRICULUM_ADVANCEMENT.exposures - 1) {
      const existing = new Set(model.personalizedLearning.map(i => i.topic));
      for (const candidate of PNEUMONIA_CURRICULUM_ADVANCEMENT.items) {
        if (existing.has(candidate.topic)) continue;
        items.push({ id: nextId('pl'), topic: candidate.topic, derivedFrom: patientIds, level: candidate.level, suggestedTopics: PNEUMONIA_CURRICULUM_ADVANCEMENT.items.map(i => i.topic).filter(t => t !== candidate.topic), createdAt: Date.now() });
      }
    }
    if (items.length === 0) {
      items.push({ id: nextId('pl'), topic: topic, derivedFrom: patientIds, level: exposures >= 5 ? 'advanced' : exposures >= 2 ? 'intermediate' : 'beginner', suggestedTopics: [], createdAt: Date.now() });
    }
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'personalized_learning_recommended', topic), personalizedLearning: [...model.personalizedLearning, ...items], updatedAt: Date.now() }, items };
  }

  static getPersonalizedLearning(model: MedicalStudentModel): PersonalizedLearningItem[] {
    return [...model.personalizedLearning];
  }

  // ── Question engine ──────────────────────────────────────────────────────────

  static generateQuestion(model: MedicalStudentModel, actorId: AmxUid, input: Omit<GeneratedQuestion, 'id'>): { model: MedicalStudentModel; question: GeneratedQuestion } {
    MedicalStudentEngine.guard(model, actorId, 'receive_ai_tutoring');
    const question: GeneratedQuestion = { ...input, id: nextId('qs') };
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'question_generated', input.type), questions: [...model.questions, question], updatedAt: Date.now() }, question };
  }

  static answerQuestion(model: MedicalStudentModel, actorId: AmxUid, questionId: string, chosenAnswer: string): { model: MedicalStudentModel; attempt: QuestionAttempt } {
    MedicalStudentEngine.guard(model, actorId, 'receive_ai_tutoring');
    const question = model.questions.find(q => q.id === questionId);
    if (!question) throw new Error('[MSE] Question not found');
    const correct = chosenAnswer.toLowerCase().trim() === question.modelAnswer.toLowerCase().trim();
    const attempt: QuestionAttempt = { id: nextId('qa'), questionId, type: question.type, topic: question.topic, chosenAnswer, correct, attemptedAt: Date.now() };
    const attempts = [...model.questionAttempts, attempt];
    const correctCount = attempts.filter(a => a.correct).length;
    const averageQuizScore = attempts.length ? Math.round((correctCount / attempts.length) * 100) : 0;
    return {
      model: {
        ...MedicalStudentEngine.audit(model, actorId, 'question_answered', question.type),
        questionAttempts: attempts,
        analytics: { ...model.analytics, questionsAnswered: model.analytics.questionsAnswered + 1, averageQuizScore },
        updatedAt: Date.now(),
      },
      attempt,
    };
  }

  static getQuestionsByType(model: MedicalStudentModel, type?: QuestionType): GeneratedQuestion[] {
    return model.questions.filter(q => !type || q.type === type);
  }

  // ── OSCE engine ──────────────────────────────────────────────────────────────

  static startOsceAttempt(model: MedicalStudentModel, actorId: AmxUid, scenario: string): { model: MedicalStudentModel; attempt: OsceAttempt } {
    MedicalStudentEngine.guard(model, actorId, 'practice_simulations');
    const attempt: OsceAttempt = { id: nextId('osce'), scenario, stations: {}, marks: {}, overallPercent: 0, attemptedAt: Date.now() };
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'osce_started', scenario), osceAttempts: [...model.osceAttempts, attempt], updatedAt: Date.now() }, attempt };
  }

  static completeOsceStation(model: MedicalStudentModel, actorId: AmxUid, attemptId: string, station: OsceStation, performance: string, mark: number): { model: MedicalStudentModel; attempt: OsceAttempt } {
    MedicalStudentEngine.guard(model, actorId, 'practice_simulations');
    const index = model.osceAttempts.findIndex(a => a.id === attemptId);
    if (index === -1) throw new Error('[MSE] OSCE attempt not found');
    const attempts = [...model.osceAttempts];
    attempts[index] = {
      ...attempts[index],
      stations: { ...attempts[index].stations, [station]: performance },
      marks: { ...attempts[index].marks, [station]: Math.max(0, Math.min(100, mark)) },
    };
    const marks = Object.values(attempts[index].marks ?? {});
    attempts[index].overallPercent = marks.length ? Math.round(marks.reduce((a, m) => a + m, 0) / marks.length) : 0;
    const osceAverage = attempts.reduce((a, x) => a + x.overallPercent, 0) / attempts.length;
    return {
      model: {
        ...MedicalStudentEngine.audit(model, actorId, 'osce_station_completed', station),
        osceAttempts: attempts,
        logbook: [...model.logbook, { id: nextId('lb'), category: 'osce_preparation', title: `OSCE: ${attempts[index].scenario} — ${station.replace(/_/g, ' ')}`, date: Date.now() }],
        analytics: { ...model.analytics, osceAveragePercent: Math.round(osceAverage) },
        updatedAt: Date.now(),
      },
      attempt: attempts[index],
    };
  }

  // ── Clinical simulation (virtual patient, unlimited practice) ───────────────

  static startSimulation(model: MedicalStudentModel, actorId: AmxUid, scenario: string, virtualPatient: VirtualPatient): { model: MedicalStudentModel; attempt: SimulationAttempt } {
    MedicalStudentEngine.guard(model, actorId, 'practice_simulations');
    const attempt: SimulationAttempt = {
      id: nextId('sim'), scenario, virtualPatient,
      historyCompleted: false, examinationCompleted: false,
      investigationsChosen: [], managementChosen: [], complicationsIdentified: [],
      scorePercent: 0, feedback: '', attemptedAt: Date.now(),
    };
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'simulation_started', scenario), simulations: [...model.simulations, attempt], updatedAt: Date.now() }, attempt };
  }

  static advanceSimulation(model: MedicalStudentModel, actorId: AmxUid, attemptId: string, input: Partial<Pick<SimulationAttempt, 'historyCompleted' | 'examinationCompleted' | 'investigationsChosen' | 'managementChosen' | 'complicationsIdentified'>>): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'practice_simulations');
    const index = model.simulations.findIndex(a => a.id === attemptId);
    if (index === -1) throw new Error('[MSE] Simulation attempt not found');
    const simulations = [...model.simulations];
    simulations[index] = { ...simulations[index], ...input };
    return { ...MedicalStudentEngine.audit(model, actorId, 'simulation_advanced', attemptId), simulations, updatedAt: Date.now() };
  }

  static gradeSimulation(model: MedicalStudentModel, actorId: AmxUid, attemptId: string, scorePercent: number, feedback: string): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'practice_simulations');
    const index = model.simulations.findIndex(a => a.id === attemptId);
    if (index === -1) throw new Error('[MSE] Simulation attempt not found');
    const simulations = [...model.simulations];
    simulations[index] = { ...simulations[index], scorePercent: Math.max(0, Math.min(100, scorePercent)), feedback };
    return { ...MedicalStudentEngine.audit(model, actorId, 'simulation_graded', `${scorePercent}%`), simulations, updatedAt: Date.now() };
  }

  static getSimulationAverage(model: MedicalStudentModel): number {
    const attempts = model.simulations.filter(a => a.scorePercent > 0);
    return attempts.length ? Math.round(attempts.reduce((a, s) => a + s.scorePercent, 0) / attempts.length) : 0;
  }

  // ── Research engine ──────────────────────────────────────────────────────────

  static joinResearch(model: MedicalStudentModel, actorId: AmxUid, input: Omit<StudentResearch, 'id' | 'status' | 'joinedAt'>): { model: MedicalStudentModel; research: StudentResearch } {
    MedicalStudentEngine.guard(model, actorId, 'participate_in_research');
    const research: StudentResearch = { ...input, id: nextId('rs'), status: 'active', joinedAt: Date.now() };
    return {
      model: {
        ...MedicalStudentEngine.audit(model, actorId, 'research_joined', input.title),
        research: [...model.research, research],
        logbook: [...model.logbook, { id: nextId('lb'), category: 'research', title: input.title, date: Date.now() }],
        analytics: { ...model.analytics, researchActivities: model.analytics.researchActivities + 1 },
        updatedAt: Date.now(),
      },
      research,
    };
  }

  static advanceResearchStage(model: MedicalStudentModel, actorId: AmxUid, researchId: string, stage: StudentResearchStage): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'participate_in_research');
    const index = model.research.findIndex(r => r.id === researchId);
    if (index === -1) throw new Error('[MSE] Research project not found');
    const research = [...model.research];
    research[index] = { ...research[index], stage };
    return { ...MedicalStudentEngine.audit(model, actorId, 'research_stage_advanced', stage), research, updatedAt: Date.now() };
  }

  static completeResearch(model: MedicalStudentModel, actorId: AmxUid, researchId: string): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'participate_in_research');
    const index = model.research.findIndex(r => r.id === researchId);
    if (index === -1) throw new Error('[MSE] Research project not found');
    const research = [...model.research];
    research[index] = { ...research[index], status: 'completed', stage: 'publication' };
    return { ...MedicalStudentEngine.audit(model, actorId, 'research_completed', researchId), research, updatedAt: Date.now() };
  }

  // ── Competency engine (graphically displayed) ───────────────────────────────

  static setCompetencyLevel(model: MedicalStudentModel, supervisorId: AmxUid, domain: StudentCompetencyDomain, level: StudentCompetencyLevel, approve: boolean): MedicalStudentModel {
    if (!STUDENT_COMPETENCY_DOMAINS.includes(domain)) throw new Error('[MSE] Unknown competency domain');
    const index = model.competencies.findIndex(c => c.domain === domain);
    if (index === -1) throw new Error('[MSE] Competency not initialized');
    const competencies = [...model.competencies];
    const history = [...competencies[index].history, { at: Date.now(), level }];
    competencies[index] = { ...competencies[index], level, supervisorApproved: approve, history };
    const progress = competencies.reduce((a, c) => a + STUDENT_COMPETENCY_LEVEL_ORDER[c.level], 0) / (competencies.length * (Object.keys(STUDENT_COMPETENCY_LEVEL_ORDER).length - 1));
    return {
      ...MedicalStudentEngine.audit(model, model.studentId, 'competency_level_set', domain),
      competencies,
      analytics: { ...model.analytics, competencyProgressPercent: Math.round(progress * 100) },
      updatedAt: Date.now(),
    };
  }

  static getCompetencies(model: MedicalStudentModel): StudentCompetency[] {
    return [...model.competencies];
  }

  static getCompetencyProgress(model: MedicalStudentModel): { domain: StudentCompetencyDomain; level: StudentCompetencyLevel }[] {
    return model.competencies.map(c => ({ domain: c.domain, level: c.level }));
  }

  // ── Reflection engine (portfolio grows automatically) ───────────────────────

  static addReflection(model: MedicalStudentModel, actorId: AmxUid, input: Omit<StudentReflection, 'id' | 'aiRecommendations' | 'createdAt'>): { model: MedicalStudentModel; reflection: StudentReflection } {
    MedicalStudentEngine.guard(model, actorId, 'document_draft_notes');
    const reflection: StudentReflection = { ...input, id: nextId('rfl'), aiRecommendations: ['Review the gaps identified tonight', 'Revise the pathology behind the case tomorrow', 'Present this case to your team for feedback'], createdAt: Date.now() };
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'reflection_added'), reflections: [...model.reflections, reflection], updatedAt: Date.now() }, reflection };
  }

  static addSupervisorComment(model: MedicalStudentModel, supervisorId: AmxUid, reflectionId: string, comments: string): MedicalStudentModel {
    const index = model.reflections.findIndex(r => r.id === reflectionId);
    if (index === -1) throw new Error('[MSE] Reflection not found');
    const reflections = [...model.reflections];
    reflections[index] = { ...reflections[index], supervisorComments: comments };
    return { ...MedicalStudentEngine.audit(model, model.studentId, 'reflection_supervisor_comment', reflectionId), reflections, updatedAt: Date.now() };
  }

  // ── Portfolio engine (ready for graduation) ─────────────────────────────────

  static addPortfolioEntry(model: MedicalStudentModel, actorId: AmxUid, input: Omit<PortfolioEntry, 'id' | 'awardedAt'>): { model: MedicalStudentModel; entry: PortfolioEntry } {
    MedicalStudentEngine.guard(model, actorId, 'observe_patients');
    const entry: PortfolioEntry = { ...input, id: nextId('pf'), awardedAt: Date.now() };
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'portfolio_entry_added', input.section), portfolio: [...model.portfolio, entry], updatedAt: Date.now() }, entry };
  }

  static getPortfolio(model: MedicalStudentModel): PortfolioEntry[] {
    return [...model.portfolio];
  }

  static getPortfolioBySection(model: MedicalStudentModel): Record<PortfolioSection, PortfolioEntry[]> {
    const grouped: Record<PortfolioSection, PortfolioEntry[]> = {
      clinical_exposure: [], competencies: [], teaching: [], research: [],
      leadership: [], professionalism: [], reflections: [],
      certificates: [], awards: [], feedback: [],
    };
    for (const e of model.portfolio) grouped[e.section].push(e);
    return grouped;
  }

  static getPortfolioReadiness(model: MedicalStudentModel): { percent: number; missing: PortfolioSection[] } {
    const withContent = PORTFOLIO_SECTIONS.filter(s => model.portfolio.some(e => e.section === s));
    const missing = PORTFOLIO_SECTIONS.filter(s => !model.portfolio.some(e => e.section === s));
    const percent = Math.round((withContent.length / PORTFOLIO_SECTIONS.length) * 100);
    return { percent, missing };
  }

  // ── AI tutor (maximum teaching, immersive learning) ─────────────────────────

  static generateTutorLesson(model: MedicalStudentModel, input: Omit<AiTutorLesson, 'id' | 'generatedAt'>): { model: MedicalStudentModel; lesson: AiTutorLesson } {
    const lesson: AiTutorLesson = { ...input, id: nextId('tut'), generatedAt: Date.now() };
    return { model: { ...model, tutorLessons: [...model.tutorLessons, lesson], updatedAt: Date.now() }, lesson };
  }

  static getTutorLessons(model: MedicalStudentModel, topic?: string): AiTutorLesson[] {
    return model.tutorLessons.filter(l => !topic || l.topic.toLowerCase().includes(topic.toLowerCase()));
  }

  // ── Communication (never unsecured direct patient contact) ─────────────────

  static sendCommunication(model: MedicalStudentModel, actorId: AmxUid, input: Omit<StudentCommunication, 'id' | 'publishedBy' | 'publishedAt'>): { model: MedicalStudentModel; communication: StudentCommunication } {
    MedicalStudentEngine.guard(model, actorId, 'observe_patients');
    if (!STUDENT_CORRESPONDENTS.includes(input.correspondent)) throw new Error('[MSE] Unauthorized correspondent');
    const communication: StudentCommunication = { ...input, id: nextId('com'), publishedBy: actorId, publishedAt: Date.now() };
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'communication_sent', input.correspondent), communications: [...model.communications, communication], updatedAt: Date.now() }, communication };
  }

  static getCommunications(model: MedicalStudentModel, correspondent?: StudentCorrespondent): StudentCommunication[] {
    return model.communications.filter(c => !correspondent || c.correspondent === correspondent);
  }

  // ── HMIS responsibilities (view-only, minimal interaction) ──────────────────

  static updateHmisAccess(model: MedicalStudentModel, actorId: AmxUid, patch: Partial<StudentHmisAccess>): MedicalStudentModel {
    MedicalStudentEngine.assertStudent(model, actorId);
    const hmis = { ...model.hmis, ...patch };
    return { ...MedicalStudentEngine.audit(model, actorId, 'hmis_access_updated'), hmis, updatedAt: Date.now() };
  }

  static getHmisView(model: MedicalStudentModel): StudentHmisAccess {
    return { ...model.hmis };
  }

  // ── EMR responsibilities (educational artifacts until reviewed/approved) ────

  static createEmrDraft(model: MedicalStudentModel, actorId: AmxUid, input: Omit<StudentEmrDraft, 'id' | 'reviewed' | 'approved' | 'createdAt'>): { model: MedicalStudentModel; draft: StudentEmrDraft } {
    MedicalStudentEngine.guard(model, actorId, 'document_draft_notes');
    const draft: StudentEmrDraft = { ...input, id: nextId('emr'), reviewed: false, approved: false, createdAt: Date.now() };
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'emr_draft_created', input.kind), emrDrafts: [...model.emrDrafts, draft], updatedAt: Date.now() }, draft };
  }

  static reviewEmrDraft(model: MedicalStudentModel, reviewerId: AmxUid, draftId: string, approved: boolean): MedicalStudentModel {
    const index = model.emrDrafts.findIndex(d => d.id === draftId);
    if (index === -1) throw new Error('[MSE] EMR draft not found');
    const emrDrafts = [...model.emrDrafts];
    emrDrafts[index] = { ...emrDrafts[index], reviewed: true, reviewerId, approved };
    return { ...MedicalStudentEngine.audit(model, model.studentId, 'emr_draft_reviewed', draftId), emrDrafts, updatedAt: Date.now() };
  }

  static getPendingEmrDrafts(model: MedicalStudentModel): StudentEmrDraft[] {
    return model.emrDrafts.filter(d => !d.reviewed);
  }

  static getApprovedEmrDrafts(model: MedicalStudentModel): StudentEmrDraft[] {
    return model.emrDrafts.filter(d => d.reviewed && d.approved);
  }

  // ── International learning ───────────────────────────────────────────────────

  static joinInternationalLearning(model: MedicalStudentModel, actorId: AmxUid, input: Omit<InternationalLearning, 'id' | 'date'>): { model: MedicalStudentModel; activity: InternationalLearning } {
    MedicalStudentEngine.guard(model, actorId, 'participate_in_research');
    if (!INTERNATIONAL_ACTIVITY_TYPES.includes(input.type)) throw new Error('[MSE] Unsupported international activity');
    const activity: InternationalLearning = { ...input, id: nextId('int'), date: Date.now() };
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'international_learning_joined', input.type), international: [...model.international, activity], updatedAt: Date.now() }, activity };
  }

  static getInternationalLearning(model: MedicalStudentModel): InternationalLearning[] {
    return [...model.international];
  }

  // ── Student wellness engine (protects students) ─────────────────────────────

  static CONSTITUTIONAL_STUDENT_LIMITS: Readonly<{ burnoutStressThreshold: number; burnoutFatigueThreshold: number; lowAttendanceThreshold: number }> = {
    burnoutStressThreshold: 8,
    burnoutFatigueThreshold: 7,
    lowAttendanceThreshold: 80,
  };

  static recordWellness(model: MedicalStudentModel, actorId: AmxUid, input: Omit<StudentWellness, 'id' | 'burnoutIndicator' | 'recordedAt'>): { model: MedicalStudentModel; wellness: StudentWellness } {
    MedicalStudentEngine.guard(model, actorId, 'observe_patients');
    const limits = MedicalStudentEngine.CONSTITUTIONAL_STUDENT_LIMITS;
    const burnoutIndicator =
      input.assessmentStress >= limits.burnoutStressThreshold ||
      input.fatigue >= limits.burnoutFatigueThreshold ||
      input.attendancePercent < limits.lowAttendanceThreshold;
    const mentorshipAccess = input.mentorshipAccess;
    const counsellingReferral = burnoutIndicator && mentorshipAccess;
    const wellness: StudentWellness = { ...input, id: nextId('wl'), burnoutIndicator, counsellingReferral, recordedAt: Date.now() };
    return { model: { ...MedicalStudentEngine.audit(model, actorId, 'student_wellness_recorded'), wellness: [...model.wellness, wellness], updatedAt: Date.now() }, wellness };
  }

  static getBurnoutAlerts(model: MedicalStudentModel): StudentWellness[] {
    return model.wellness.filter(w => w.burnoutIndicator);
  }

  static getCounsellingReferrals(model: MedicalStudentModel): StudentWellness[] {
    return model.wellness.filter(w => w.counsellingReferral);
  }

  // ── Analytics ───────────────────────────────────────────────────────────────

  static getAnalytics(model: MedicalStudentModel): StudentAnalytics {
    return { ...model.analytics };
  }

  static getLearningSummary(model: MedicalStudentModel): {
    patientsSeen: number; historiesTaken: number; examinations: number; presentations: number;
    procedures: { observed: number; assisted: number; performed: number };
    teachingAttended: number; researchActivities: number; averageQuizScore: number;
    osceAveragePercent: number; competencyProgressPercent: number; portfolioReadiness: number;
  } {
    return {
      patientsSeen: model.analytics.patientsSeen,
      historiesTaken: model.analytics.historiesTaken,
      examinations: model.analytics.examinationsPerformed,
      presentations: model.analytics.presentationsGiven,
      procedures: {
        observed: model.analytics.proceduresObserved,
        assisted: model.analytics.proceduresAssisted,
        performed: model.analytics.proceduresPerformed,
      },
      teachingAttended: model.analytics.teachingAttended,
      researchActivities: model.analytics.researchActivities,
      averageQuizScore: model.analytics.averageQuizScore,
      osceAveragePercent: model.analytics.osceAveragePercent,
      competencyProgressPercent: model.analytics.competencyProgressPercent,
      portfolioReadiness: MedicalStudentEngine.getPortfolioReadiness(model).percent,
    };
  }

  // ── Authority actions (constitutional) ──────────────────────────────────────

  static observePatient(model: MedicalStudentModel, actorId: AmxUid, patientId: string): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'observe_patients');
    if (!model.patients.some(p => p.patientId === patientId)) throw new Error('[MSE] Student may only observe assigned patients');
    return MedicalStudentEngine.audit(model, actorId, 'patient_observed', patientId);
  }

  static presentCase(model: MedicalStudentModel, actorId: AmxUid, patientId: string): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'present_cases');
    if (!model.patients.some(p => p.patientId === patientId)) throw new Error('[MSE] Student may only present assigned patients');
    return MedicalStudentEngine.audit(model, actorId, 'case_presented', patientId);
  }

  static assistProcedure(model: MedicalStudentModel, actorId: AmxUid, patientId: string, procedureName: string, supervisorId: AmxUid): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'assist_procedures');
    if (!supervisorId) throw new Error('[MSE] A supervising clinician is required');
    return MedicalStudentEngine.audit(model, actorId, 'procedure_assisted', `${patientId}: ${procedureName} (supervisor ${supervisorId})`);
  }

  static documentDraftNote(model: MedicalStudentModel, actorId: AmxUid, patientId: string, kind: StudentEmrKind): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'document_draft_notes');
    if (kind === 'reflection_note' || kind === 'learning_note') {
      return MedicalStudentEngine.audit(model, actorId, 'draft_note_documented', `${patientId}: ${kind}`);
    }
    return MedicalStudentEngine.audit(model, actorId, 'draft_note_documented_for_review', `${patientId}: ${kind} (awaiting supervisor review)`);
  }

  static receiveAiTutoring(model: MedicalStudentModel, actorId: AmxUid, topic: string): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'receive_ai_tutoring');
    return MedicalStudentEngine.audit(model, actorId, 'ai_tutoring_received', topic);
  }

  // ── Constitutional restrictions (enforced) ──────────────────────────────────

  static diagnoseIndependently(model: MedicalStudentModel, actorId: AmxUid): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'diagnose_independently');
    return model;
  }

  static prescribe(model: MedicalStudentModel, actorId: AmxUid): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'prescribe');
    return model;
  }

  static orderInvestigationsIndependently(model: MedicalStudentModel, actorId: AmxUid): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'order_investigations_independently');
    return model;
  }

  static performInvasiveProceduresUnsupervised(model: MedicalStudentModel, actorId: AmxUid): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'perform_invasive_procedures_unsupervised');
    return model;
  }

  static dischargePatient(model: MedicalStudentModel, actorId: AmxUid): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'discharge_patients');
    return model;
  }

  static modifyEmrAsFinal(model: MedicalStudentModel, actorId: AmxUid): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'modify_emr_as_final');
    return model;
  }

  static approveCarePlan(model: MedicalStudentModel, actorId: AmxUid): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'approve_care_plans');
    return model;
  }

  static accessUnauthorizedRecords(model: MedicalStudentModel, actorId: AmxUid): MedicalStudentModel {
    MedicalStudentEngine.guard(model, actorId, 'access_unauthorized_patient_records');
    return model;
  }
}
