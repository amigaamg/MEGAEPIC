export interface ClinicalDocument {
  metadata: DocumentMetadata;
  patient: PatientInfo;
  encounter: EncounterInfo;
  subjective: SubjectiveSection;
  objective: ObjectiveSection;
  assessment: AssessmentSection;
  plan: PlanSection;
  differentials: DifferentialSection;
  investigations: InvestigationSection;
  monitoring: MonitoringSection;
  references: ReferenceSection;
}

export interface DocumentMetadata {
  title: string;
  documentType: 'ddx' | 'soap' | 'admission' | 'discharge' | 'consultation' | 'referral';
  generatedAt: number;
  generatedBy: string;
  version: string;
  facility: string;
  department: string;
}

export interface PatientInfo {
  name: string;
  mrn: string;
  age: number;
  ageUnit: 'years' | 'months' | 'weeks' | 'days';
  gender: string;
  weight?: string;
  height?: string;
  bmi?: string;
  pregnancyStatus?: string;
  codeStatus?: string;
  allergies: string[];
  activeMedications: string[];
  pastMedicalHistory: string[];
}

export interface EncounterInfo {
  date: string;
  time: string;
  location: string;
  encounterType: string;
  chiefComplaint: string;
  duration: string;
  onset: string;
  referringClinician?: string;
}

export interface SubjectiveSection {
  chiefComplaint: string;
  historyOfPresentingIllness: string;
  symptomReview: SymptomReviewItem[];
  pastMedicalHistory?: string;
  drugHistory?: string;
  familyHistory?: string;
  socialHistory?: string;
  travelHistory?: string;
  occupationalHistory?: string;
  reviewOfSystems?: string;
}

export interface SymptomReviewItem {
  symptom: string;
  present: boolean;
  duration?: string;
  character?: string;
  severity?: string;
  notes?: string;
}

export interface ObjectiveSection {
  vitalSigns: VitalSign[];
  physicalExamination: string;
  examinationFindings: ExaminationFinding[];
  investigations: InvestigationResult[];
  scores: ScoreResult[];
}

export interface VitalSign {
  name: string;
  value: string;
  unit: string;
  reference?: string;
  timestamp?: string;
  trend?: 'rising' | 'falling' | 'stable';
}

export interface ExaminationFinding {
  system: string;
  finding: string;
  normal: boolean;
  detail?: string;
}

export interface InvestigationResult {
  id: string;
  name: string;
  indication: string;
  result?: string;
  interpretation?: string;
  timing: 'pending' | 'completed' | 'abnormal';
}

export interface ScoreResult {
  name: string;
  value: number;
  interpretation: string;
}

export interface AssessmentSection {
  summary: string;
  problemList: ProblemItem[];
  workingDiagnosis: DiagnosisItem[];
  differentialDiagnosis: DiagnosisItem[];
  clinicalImpression: string;
}

export interface ProblemItem {
  number: number;
  description: string;
  active: boolean;
  chronic: boolean;
}

export interface DiagnosisItem {
  rank: number;
  diseaseId: string;
  diseaseName: string;
  icd10?: string;
  probability: 'high' | 'moderate' | 'low' | 'considered';
  score: number;
  isRedFlag: boolean;
  supports: string[];
  opposes: string[];
}

export interface PlanSection {
  immediateActions: string[];
  investigations: string[];
  treatments: string[];
  monitoring: string[];
  followUp: string[];
  referrals: string[];
  patientEducation: string[];
  contingencyPlan: string[];
}

export interface DifferentialSection {
  topDiagnoses: DiagnosisItem[];
  ddxNarrative: string;
  reasoningRationale: string;
  category: string;
  uncertaintyScore: number;
}

export interface InvestigationSection {
  recommended: InvestigationRecommendation[];
  results: InvestigationResult[];
  interpretation: string;
}

export interface InvestigationRecommendation {
  investigationId: string;
  name: string;
  purpose: string;
  priority: 'immediate' | 'urgent' | 'routine';
  diseaseIds: string[];
}

export interface MonitoringSection {
  parameters: MonitoringParameter[];
  frequency: string;
  escalationCriteria: EscalationCriteria[];
}

export interface MonitoringParameter {
  parameter: string;
  frequency: string;
  target: string;
  threshold?: string;
}

export interface EscalationCriteria {
  condition: string;
  action: string;
}

export interface ReferenceSection {
  guidelines: GuidelineRef[];
  evidence: EvidenceRef[];
  notes: string;
}

export interface GuidelineRef {
  id: string;
  title: string;
  issuingBody: string;
  year: number;
}

export interface EvidenceRef {
  id: string;
  citation: string;
  level: string;
}

export function createEmptyDocument(): ClinicalDocument {
  return {
    metadata: {
      title: 'Clinical Document',
      documentType: 'ddx',
      generatedAt: Date.now(),
      generatedBy: 'AMEXAN Clinical Intelligence',
      version: '1.0',
      facility: '',
      department: '',
    },
    patient: {
      name: '',
      mrn: '',
      age: 0,
      ageUnit: 'years',
      gender: '',
      allergies: [],
      activeMedications: [],
      pastMedicalHistory: [],
    },
    encounter: {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      location: '',
      encounterType: '',
      chiefComplaint: '',
      duration: '',
      onset: '',
    },
    subjective: {
      chiefComplaint: '',
      historyOfPresentingIllness: '',
      symptomReview: [],
    },
    objective: {
      vitalSigns: [],
      physicalExamination: '',
      examinationFindings: [],
      investigations: [],
      scores: [],
    },
    assessment: {
      summary: '',
      problemList: [],
      workingDiagnosis: [],
      differentialDiagnosis: [],
      clinicalImpression: '',
    },
    plan: {
      immediateActions: [],
      investigations: [],
      treatments: [],
      monitoring: [],
      followUp: [],
      referrals: [],
      patientEducation: [],
      contingencyPlan: [],
    },
    differentials: {
      topDiagnoses: [],
      ddxNarrative: '',
      reasoningRationale: '',
      category: '',
      uncertaintyScore: 0,
    },
    investigations: {
      recommended: [],
      results: [],
      interpretation: '',
    },
    monitoring: {
      parameters: [],
      frequency: 'As per clinical need',
      escalationCriteria: [],
    },
    references: {
      guidelines: [],
      evidence: [],
      notes: '',
    },
  };
}
