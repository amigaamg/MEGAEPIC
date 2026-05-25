import { DiseaseId, Severity, Symptom } from './index';

export type BranchCondition = 'present' | 'absent' | 'lt2wk' | 'gt4wk' | 'wet' | 'dry' | 'barking';

export interface BranchRule {
  targetId: string;
  when: Record<string, BranchCondition>;
}

export interface EnhancedQuestionNode {
  id: string;
  text: string;
  type: 'single' | 'multi' | 'number' | 'boolean';
  options?: string[];
  triggerSymptoms?: Symptom[];
  dependsOn?: string;
  branching?: BranchRule[];
  clinicalGuide?: string;
  category?: 'triage' | 'history' | 'exam' | 'vitals' | 'risk' | 'social';
}

export interface VitalsData {
  spo2?: number;
  rr?: number;
  hr?: number;
  temp?: number;
  weight?: number;
  height?: number;
  muac?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  avpu?: 'alert' | 'voice' | 'pain' | 'unresponsive';
  capRefill?: number;
}

export interface ExamFindings {
  chestIndrawing: boolean;
  nasalFlaring: boolean;
  grunting: boolean;
  headNodding: boolean;
  wheeze: boolean;
  crackles: boolean;
  stridor: boolean;
  cyanosis: boolean;
  lymphadenopathy: boolean;
  abdominalDistension: boolean;
  hepatomegaly: boolean;
  splenomegaly: boolean;
  pallor: boolean;
  oedema: boolean;
  rash: boolean;
  meningism: boolean;
}

export interface ClinicalContext {
  patientName: string;
  ageMonths: number;
  sex: 'male' | 'female' | 'unknown';
  symptoms: Symptom[];
  answers: Record<string, string | string[] | boolean | number>;
  askedQuestions: string[];
  vitals: VitalsData;
  exam: ExamFindings;
  riskFactors: string[];
  interviewPhase: 'triage' | 'history' | 'exam' | 'assessment' | 'plan' | 'complete';
  durationDays: number;
}

export interface DdxExplanation {
  diseaseId: DiseaseId;
  diseaseName: string;
  score: number;
  confidence: 'low' | 'medium' | 'high';
  supportingPoints: string[];
  againstPoints: string[];
  keyFindings: string[];
  recommendedAction: string;
}

export type MewsScore = 0 | 1 | 2 | 3;

export interface SeverityScore {
  mews: number;
  qsofa: number;
  sirs: number;
  redFlags: string[];
  level: Severity;
  action: string;
  triagePriority: 'green' | 'yellow' | 'orange' | 'red';
}

export interface NarrativeSection {
  title: string;
  content?: string;
  structured?: Record<string, string>;
}

export interface ClinicalNarrative {
  title: string;
  sections: NarrativeSection[];
  hpi: string;
  assessment: string;
  plan: string;
  timestamp: string;
}

export interface DrugDosingRule {
  drugName: string;
  indication: string;
  weightBased: boolean;
  doseMgPerKg?: number;
  doseMg?: number;
  frequency: string;
  route: string;
  maxDose?: string;
  ageMinMonths?: number;
  ageMaxMonths?: number;
  weightMinKg?: number;
  weightMaxKg?: number;
  duration?: string;
  notes?: string;
}

export interface GuidelineRecommendation {
  diseaseId: DiseaseId;
  severity: Severity | 'all';
  firstLine: DrugDosingRule[];
  secondLine?: DrugDosingRule[];
  admissionCriteria: string[];
  referralCriteria: string[];
  monitoring: string[];
  patientEducation: string[];
  followUp: string;
}
