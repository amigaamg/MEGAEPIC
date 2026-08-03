// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Constitution — Universal Learning & Competency Engine (Engine X)
// Competencies, evidence, learning modules, and assessment configuration.
// ═══════════════════════════════════════════════════════════════════════════════

export type CompetencyDomain =
  | 'clinical_reasoning'
  | 'procedures'
  | 'medical_knowledge'
  | 'professionalism'
  | 'communication'
  | 'patient_care'
  | 'documentation'
  | 'leadership'
  | 'research'
  | 'practice_based_learning'
  | 'systems_based_practice';

export type CompetencyLevel =
  | 'novice'
  | 'advanced_beginner'
  | 'competent'
  | 'proficient'
  | 'expert';

export type CompetencyEvidenceType =
  | 'case_log'
  | 'osce'
  | 'exam'
  | 'supervisor_review'
  | 'procedure_log'
  | 'simulation'
  | 'workshop'
  | 'peer_review';

export interface CompetencyEvidence {
  id: string;
  type: CompetencyEvidenceType;
  title: string;
  description: string;
  score: number;
  maxScore: number;
  date: number;
  assessor: string;
  link: string | null;
  tags: string[];
  certified: boolean;
}

export interface Competency {
  id: string;
  actorAmxUid: string;
  domain: CompetencyDomain;
  level: CompetencyLevel;
  score: number;
  evidence: CompetencyEvidence[];
  supervisor: string | null;
  lastAssessed: number;
  nextAssessment: number | null;
  createdAt: number;
  updatedAt: number;
}

export type ModuleType = 'case' | 'simulation' | 'workshop' | 'lecture' | 'course' | 'assessment' | 'protocol';

export type AssessmentType = 'knowledge_check' | 'osce' | 'peer_assessment' | 'oral_exam' | 'mcq';

export interface AssessmentConfig {
  type: AssessmentType;
  passingScore: number;
  maxAttempts: number;
  timeLimit: number;
  questions: unknown[];
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  domain: CompetencyDomain;
  level: CompetencyLevel;
  type: ModuleType;
  duration: number;
  prerequisites: string[];
  learningObjectives: string[];
  assessment: AssessmentConfig;
  tags: string[];
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export const COMPETENCY_LEVEL_ORDER: CompetencyLevel[] =
  ['novice', 'advanced_beginner', 'competent', 'proficient', 'expert'];

export function getLevelIndex(level: CompetencyLevel): number {
  return COMPETENCY_LEVEL_ORDER.indexOf(level);
}

export function competencyProgressLevel(score: number): CompetencyLevel {
  if (score >= 90) return 'expert';
  if (score >= 75) return 'proficient';
  if (score >= 60) return 'competent';
  if (score >= 40) return 'advanced_beginner';
  return 'novice';
}

export function isCompetencyCurrent(competency: Competency, at?: number): boolean {
  const now = at ?? Date.now();
  return !competency.nextAssessment || competency.nextAssessment > now;
}