// ─── AMEXAN — Shared Types ─────────────────────────────────────────────────

export type Symptom =
  | 'cough' | 'fever' | 'wheeze' | 'difficulty_breathing'
  | 'hemoptysis' | 'cyanosis' | 'stridor' | 'chest_pain'
  | 'noisy_breathing' | 'reduced_feeding' | 'lethargy';

export type DiseaseId =
  | 'pneumonia' | 'asthma' | 'bronchiolitis' | 'tb'
  | 'urti' | 'croup' | 'pleural_effusion' | 'pneumothorax' | 'foreign_body_aspiration';

export type Severity = 'mild' | 'moderate' | 'severe' | 'critical';

export interface DiseaseProfile {
  id: DiseaseId;
  name: string;
  supportingSymptoms: Symptom[];
  againstSymptoms: Symptom[];
  redFlags: string[];
  investigations: string[];
  differentials: DiseaseId[];
}

export interface SymptomWeight {
  diseaseId: DiseaseId;
  symptomKey: string;
  weight: number;
}

export interface QuestionNode {
  id: string;
  text: string;
  type: 'single' | 'multi' | 'number' | 'boolean';
  options?: string[];
  triggerSymptoms?: Symptom[];
  next?: Record<string, string>;
}

export interface ConsultationContext {
  patientName?: string;
  age?: number;          // in months
  sex?: 'male' | 'female';
  symptoms: Symptom[];
  answers: Record<string, string | string[] | boolean>;
  askedQuestions: string[];
  vitals: {
    spo2?: number;
    rr?: number;
    hr?: number;
    temp?: number;
    weight?: number;
  };
}

export interface DiseaseScore {
  diseaseId: DiseaseId;
  name: string;
  score: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface SeverityResult {
  level: Severity;
  redFlags: string[];
  action: string;
}

export interface InvestigationRule {
  diseaseId: DiseaseId;
  investigations: {
    name: string;
    rationale: string;
    priority: 'urgent' | 'routine' | 'if_uncertain';
  }[];
}

export interface TreatmentRule {
  diseaseId: DiseaseId;
  severity: Severity | 'all';
  interventions: {
    name: string;
    detail: string;
    condition?: string;
  }[];
}

export interface ClinicalNote {
  hpi: string;
  differentials: DiseaseScore[];
  severity: SeverityResult;
  investigations: string[];
  management: string[];
  summary: string;
  timestamp: Date;
}